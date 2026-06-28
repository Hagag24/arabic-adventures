import time
import shutil
import random
from datetime import datetime
from pathlib import Path
from . import config
from . import text_chunking
from . import edge_provider
from . import audio_conversion
from . import wav_validation
from . import state
from . import manifest
from . import reports
from . import file_utils

CHUNK_VERSION = "1.0"
EDGE_TTS_VERSION = "7.2.8"


def generate_catalog(only_key: str | None = None, stop_after_one: bool = False, only_overrides: bool = False):
    from .inventory import get_inventory

    inventory = get_inventory()
    st = state.init_state(inventory)

    reports.write_progress_report(st, inventory)

    cache_map: dict[str, str] = {}

    # Optional sorting if only_key is provided or just filter
    if only_key:
        inventory = [i for i in inventory if i["semanticKey"] == only_key]

    overrides = {}
    overrides_file = config.PROJECT_ROOT / "development" / "audio" / "edge-tts" / "spoken-text-overrides.json"
    if overrides_file.exists():
        import json
        with open(overrides_file, "r", encoding="utf-8") as f:
            overrides = json.load(f)

    if only_overrides:
        inventory = [i for i in inventory if i["semanticKey"] in overrides]

    for idx, item in enumerate(inventory):
        key = item["semanticKey"]
        item_state = st["items"][key]

        script_sha256 = item["scriptSha256"]
        config_hash_input = f"{script_sha256}:{config.PROVIDER}:{config.VOICE}:{config.LOCALE}:{config.RATE}:{config.VOLUME}:{config.PITCH}:{config.OUTPUT_FORMAT_STR}:{CHUNK_VERSION}:{EDGE_TTS_VERSION}"
        if key in overrides:
            config_hash_input += f":override:{file_utils.get_string_sha256(overrides[key])}"
            
        config_sha256 = file_utils.get_string_sha256(config_hash_input)

        if (
            item_state["status"] == "GENERATED"
            and item_state.get("configurationSha256") == config_sha256
            and not (only_overrides and key in overrides)
        ):
            continue

        print(f"[{idx + 1}/{len(inventory)}] Processing {key}...")

        arabic_text = overrides.get(key, item["arabicText"])
        if not arabic_text:
            print(f"  Empty arabic text for {key}, skipping.")
            item_state["status"] = "FAILED_PERMANENT"
            item_state["lastError"] = "Empty arabic text"
            state.save_state(st)
            continue

        item_state["configurationSha256"] = config_sha256
        
        if config_sha256 in cache_map:
            cached_wav = Path(cache_map[config_sha256])
            if cached_wav.exists():
                print(f"  CACHE_REUSED: Identical script configuration found for {key}")
                target_wav = Path(item["stagingWavPath"])
                target_wav.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(cached_wav, target_wav)

                item_state["status"] = "GENERATED"
                item_state["wavSha256"] = file_utils.get_file_sha256(target_wav)
                _, _, duration = wav_validation.validate_wav(target_wav)
                item_state["durationSeconds"] = duration
                item_state["generatedAt"] = datetime.utcnow().isoformat() + "Z"

                manifest_entry = {
                    "src": "/audio/v1/"
                    + target_wav.relative_to(config.STAGING_CATALOG_DIR).as_posix(),
                    "scriptSrc": "/audio/v1/"
                    + Path(item["scriptPath"])
                    .relative_to(config.PUBLIC_AUDIO_DIR)
                    .as_posix(),
                    "category": item["category"],
                    "sha256": item_state["wavSha256"],
                    "scriptSha256": script_sha256,
                    "durationSeconds": duration,
                    "provider": config.PROVIDER,
                    "voice": config.VOICE,
                    "locale": config.LOCALE,
                    "generationConfigHash": config_sha256,
                }
                manifest.update_candidate_manifest_entry(key, manifest_entry)
                state.save_state(st)
                reports.write_progress_report(st, inventory)
                if stop_after_one:
                    return
                continue

        item_state["status"] = "GENERATING"
        state.save_state(st)

        chunks = text_chunking.split_arabic_text(arabic_text)
        chunk_wavs = []
        overall_success = True
        error_msg = ""

        for c_idx, chunk in enumerate(chunks):
            # Try generation with backoff
            max_retries = 10
            chunk_success = False

            for attempt in range(max_retries):
                item_state["attemptCount"] += 1

                chunk_mp3_path = config.STAGING_MP3_DIR / f"{key}_chunk_{c_idx}.mp3"
                chunk_wav_path = (
                    config.STAGING_CATALOG_DIR / f"{key}_chunk_{c_idx}_tmp.wav"
                )
                chunk_mp3_path.parent.mkdir(parents=True, exist_ok=True)
                chunk_wav_path.parent.mkdir(parents=True, exist_ok=True)

                success, msg = edge_provider.generate_audio_edge(chunk, chunk_mp3_path)

                if success:
                    # Convert to WAV
                    if audio_conversion.convert_mp3_to_wav(
                        chunk_mp3_path, chunk_wav_path
                    ):
                        chunk_wavs.append(chunk_wav_path)
                        chunk_success = True
                        break
                    else:
                        msg = "FFmpeg MP3 to WAV conversion failed"

                print(f"  Chunk {c_idx} attempt {attempt + 1} failed: {msg}")
                error_msg = msg

                # Check for rate limit or network issue vs permanent
                if any(
                    x in msg.lower()
                    for x in ["403", "429", "reset", "reject", "forbidden", "too many"]
                ):
                    item_state["status"] = "FAILED_RATE_LIMIT"
                    delay = (2**attempt) + random.uniform(0, 1)
                    print(f"  Rate limited/Forbidden. Waiting {delay:.1f}s...")
                    time.sleep(delay)
                elif "getaddrinfo" in msg.lower():
                    item_state["status"] = "FAILED_NETWORK"
                    print("  DNS error. Retrying immediately...")
                else:
                    item_state["status"] = "FAILED_NETWORK"
                    delay = (2**attempt) + random.uniform(0, 1)
                    print(f"  Network error. Waiting {delay:.1f}s...")
                    time.sleep(delay)

            if not chunk_success:
                overall_success = False
                break

            # Initial pacing between chunks
            time.sleep(0.01)

        if not overall_success:
            item_state["lastError"] = error_msg
            state.save_state(st)

            # Clean up chunks
            for cw in chunk_wavs:
                if cw.exists():
                    cw.unlink()
            print("Stopping generation due to persistent failures.")
            return  # stop safely after bounded retries

        # Concatenate
        target_wav = Path(item["stagingWavPath"])
        target_wav.parent.mkdir(parents=True, exist_ok=True)

        if len(chunk_wavs) == 1:
            shutil.copy2(chunk_wavs[0], target_wav)
        else:
            if not audio_conversion.concatenate_wavs_with_pauses(
                chunk_wavs, target_wav, pause_ms=180
            ):
                item_state["status"] = "FAILED_PERMANENT"
                item_state["lastError"] = "WAV Concatenation failed"
                state.save_state(st)
                continue

        # Validate
        is_valid, val_err, duration = wav_validation.validate_wav(target_wav)
        if not is_valid:
            print(f"  VALIDATION FAILED: {val_err}")
            item_state["status"] = "FAILED_VALIDATION"
            item_state["lastError"] = f"Validation failed: {val_err}"
            state.save_state(st)
            if target_wav.exists():
                target_wav.unlink()
            continue

        # Success
        cache_map[config_sha256] = str(target_wav)
        item_state["status"] = "GENERATED"
        item_state["wavSha256"] = file_utils.get_file_sha256(target_wav)
        item_state["durationSeconds"] = duration
        item_state["generatedAt"] = datetime.utcnow().isoformat() + "Z"
        item_state["lastError"] = None

        manifest_entry = {
            "src": "/audio/v1/"
            + target_wav.relative_to(config.STAGING_CATALOG_DIR).as_posix(),
            "scriptSrc": "/audio/v1/"
            + Path(item["scriptPath"]).relative_to(config.PUBLIC_AUDIO_DIR).as_posix(),
            "category": item["category"],
            "sha256": item_state["wavSha256"],
            "scriptSha256": script_sha256,
            "durationSeconds": duration,
            "provider": config.PROVIDER,
            "voice": config.VOICE,
            "locale": config.LOCALE,
            "generationConfigHash": config_sha256,
        }
        manifest.update_candidate_manifest_entry(key, manifest_entry)
        state.save_state(st)
        reports.write_progress_report(st, inventory)

        print("  GENERATED successfully.")

        # Cleanup tmp
        for c_idx in range(len(chunks)):
            tmp_mp3 = config.STAGING_MP3_DIR / f"{key}_chunk_{c_idx}.mp3"
            tmp_wav = config.STAGING_CATALOG_DIR / f"{key}_chunk_{c_idx}_tmp.wav"
            if tmp_mp3.exists():
                tmp_mp3.unlink()
            if tmp_wav.exists():
                tmp_wav.unlink()

        time.sleep(0.01)  # Initial pacing between distinct keys
        if stop_after_one:
            return
