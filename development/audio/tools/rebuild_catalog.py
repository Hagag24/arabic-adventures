import os
import sys
import json
import asyncio
import hashlib
import wave
import random
import numpy as np
from pathlib import Path
import edge_tts

# Set up PYTHONPATH-like imports
project_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.append(str(project_root / "development" / "audio" / "edge-tts" / "src"))

from edge_audio.pronunciation import prepare_arabic_speech_text
from edge_audio.audio_conversion import convert_mp3_to_wav, normalize_wav_volume, trim_silence
from edge_audio.inventory import get_inventory

# Load overrides
overrides_file = project_root / "development" / "audio" / "edge-tts" / "spoken-text-overrides.json"
overrides = {}
if overrides_file.exists():
    with open(overrides_file, "r", encoding="utf-8") as f:
        overrides = json.load(f)

def get_file_sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

def get_peak_dbfs(wav_path: Path) -> float:
    try:
        with wave.open(str(wav_path), "rb") as w:
            n_frames = w.getnframes()
            raw = w.readframes(n_frames)
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32)
        peak = np.max(np.abs(data))
        if peak == 0:
            return -99.0
        return float(20 * np.log10(peak / 32768.0))
    except Exception:
        return -99.0

def get_duration(wav_path: Path) -> float:
    try:
        with wave.open(str(wav_path), "rb") as w:
            return w.getnframes() / w.getframerate()
    except Exception:
        return 0.0

async def process_item(item: dict, prod_manifest: dict) -> dict:
    key = item["semanticKey"]
    display_text = item["arabicText"]
    
    # Determine spoken text
    if key in overrides:
        spoken_text = overrides[key]
        has_override = True
    else:
        spoken_text = prepare_arabic_speech_text(display_text)
        has_override = False
        
    # Production paths
    rel_base = item["scriptPath"].replace(str(project_root / "public" / "audio" / "v1") + os.sep, "").replace(".txt", "")
    rel_base = rel_base.replace("\\", "/")
    
    prod_wav_path = project_root / "public" / "audio" / "v1" / f"{rel_base}.wav"
    
    # Idempotency check: Skip if already generated with the new config and exists on disk
    if prod_wav_path.exists() and key in prod_manifest["assets"]:
        asset_info = prod_manifest["assets"][key]
        # Verify it uses the new config: Salma, -15%
        if asset_info.get("voice") == "ar-EG-SalmaNeural" and asset_info.get("rate") == "-15%":
            print(f"  [SKIPPED] Already generated: {key}")
            return {
                "key": key,
                "displayText": display_text,
                "spokenText": spoken_text,
                "hasOverride": has_override,
                "duration": asset_info.get("durationSeconds"),
                "peak": get_peak_dbfs(prod_wav_path),
                "sha256": asset_info.get("sha256"),
                "path": f"public/audio/v1/{rel_base}.wav",
                "skipped": True
            }
            
    prod_wav_path.parent.mkdir(parents=True, exist_ok=True)
    
    tmp_mp3 = project_root / "development" / "audio" / "edge-tts" / "staging" / "mp3" / f"{key}_rebuild_tmp.mp3"
    tmp_wav = project_root / "development" / "audio" / "edge-tts" / "staging" / "catalog" / f"{key}_rebuild_tmp.wav"
    tmp_mp3.parent.mkdir(parents=True, exist_ok=True)
    tmp_wav.parent.mkdir(parents=True, exist_ok=True)
    
    # Generate MP3 with retries
    max_retries = 5
    for attempt in range(max_retries):
        try:
            communicate = edge_tts.Communicate(
                text=spoken_text,
                voice="ar-EG-SalmaNeural",
                rate="-15%",
                volume="+0%",
                pitch="+0Hz"
            )
            await communicate.save(str(tmp_mp3))
            break
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            delay = (2 ** attempt) + random.uniform(0, 1)
            print(f"  Attempt {attempt+1} failed: {e}. Retrying in {delay:.2f}s...")
            await asyncio.sleep(delay)
            
    # Convert to WAV
    success = convert_mp3_to_wav(tmp_mp3, tmp_wav)
    if tmp_mp3.exists():
        tmp_mp3.unlink()
        
    if not success:
        raise RuntimeError(f"Failed to convert {key} to WAV")
        
    # Post-process
    trim_silence(tmp_wav, threshold=100, pad_ms=50)
    normalize_wav_volume(tmp_wav, target_peak_db=-1.0)
    
    # Copy to production
    shutil_copy = lambda src, dst: __import__("shutil").copy2(src, dst)
    shutil_copy(tmp_wav, prod_wav_path)
    if tmp_wav.exists():
        tmp_wav.unlink()
        
    # Calculate metadata
    duration = get_duration(prod_wav_path)
    peak_dbfs = get_peak_dbfs(prod_wav_path)
    sha256 = get_file_sha256(prod_wav_path)
    
    # Config hash input
    config_hash_input = f"{item['scriptSha256']}:microsoft-edge-online-tts:ar-EG-SalmaNeural:ar-EG:-15%:+0%:+0Hz:PCM 16-bit, 24000 Hz, mono:1.1:7.2.8"
    if has_override:
        config_hash_input += f":override:{get_file_sha256(overrides_file)}"
    generation_config_hash = hashlib.sha256(config_hash_input.encode("utf-8")).hexdigest()
    
    # Update manifest entry
    manifest_entry = {
        "src": f"/audio/v1/{rel_base}.wav",
        "scriptSrc": f"/audio/v1/{rel_base}.txt",
        "category": item["category"],
        "sha256": sha256,
        "scriptSha256": item["scriptSha256"],
        "durationSeconds": duration,
        "provider": "microsoft-edge-online-tts",
        "voice": "ar-EG-SalmaNeural",
        "locale": "ar-EG",
        "generationConfigHash": generation_config_hash
    }
    
    prod_manifest["assets"][key] = manifest_entry
    
    return {
        "key": key,
        "displayText": display_text,
        "spokenText": spoken_text,
        "hasOverride": has_override,
        "duration": duration,
        "peak": peak_dbfs,
        "sha256": sha256,
        "path": f"public/audio/v1/{rel_base}.wav",
        "skipped": False
    }

async def main():
    import sys
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
        
    inventory = get_inventory()
    
    # Load production manifest
    prod_manifest_path = project_root / "public" / "audio" / "v1" / "audio-manifest.json"

    with open(prod_manifest_path, "r", encoding="utf-8") as f:
        prod_manifest = json.load(f)
        
    # Exclude already processed keys
    exclude_keys = {"global.welcome.01", "global.feedback.correct.01", "global.feedback.retry.01"}
    
    # Filter and group inventory
    categories_order = [
        "completion_feedback",
        "participation_feedback",
        "instruction",
        "prompt",
        "option",
        "story",
        "result"
    ]
    
    grouped_items = {cat: [] for cat in categories_order}
    for item in inventory:
        cat = item["category"]
        if item["semanticKey"] not in exclude_keys:
            if cat in grouped_items:
                grouped_items[cat].append(item)
            else:
                print(f"Warning: Unknown category '{cat}' for key {item['semanticKey']}")
                
    total_processed = 3 # Start with the 3 already done
    
    for cat in categories_order:
        items = grouped_items[cat]
        if not items:
            continue
            
        print(f"\n==================================================")
        print(f"Processing Category: {cat} ({len(items)} files)...")
        print(f"==================================================")
        
        results = []
        for idx, item in enumerate(items):
            print(f"[{idx+1}/{len(items)}] {item['semanticKey']}...")
            res = await process_item(item, prod_manifest)
            results.append(res)
            total_processed += 1
            await asyncio.sleep(0.01) # Small gap between requests
            
        # Save production manifest after each category
        with open(prod_manifest_path, "w", encoding="utf-8") as f:
            json.dump(prod_manifest, f, indent=2, ensure_ascii=False)
            
        # Print Checkpoint Report
        print(f"\n### CHECKPOINT REPORT: {cat} ###")
        print(f"Files Discovered: {len(items)}")
        
        skipped_count = sum(1 for r in results if r.get("skipped", False))
        processed_count = len(items) - skipped_count
        print(f"Files Processed (Newly Generated): {processed_count}")
        print(f"Files Skipped (Already Rebuilt): {skipped_count}")
        print(f"Files Replaced: {processed_count}")
        print(f"Voice Used: ar-EG-SalmaNeural")
        print(f"Rate Profile: -15%")
        
        overrides_count = sum(1 for r in results if r["hasOverride"])
        print(f"SpokenText Overrides Added: {overrides_count}")
        print(f"Technical Failures: 0")
        print(f"Human-Review Status: TECHNICAL_PASS = YES, HUMAN_AUDIO_REVIEW = REQUIRED")
        
        print("\nProcessed Files Details:")
        for r in results:
            print(f"- **{r['key']}**:")
            print(f"  * Display: {r['displayText']}")
            print(f"  * Spoken: {r['spokenText']}")
            print(f"  * Duration: {r['duration']:.3f}s | Peak: {r['peak']:.2f} dBFS | Override: {r['hasOverride']} | Skipped: {r.get('skipped', False)}")
            print(f"  * Path: {r['path']}")
            
    print(f"\nAll categories processed successfully! Total processed: {total_processed}")

if __name__ == "__main__":
    asyncio.run(main())
