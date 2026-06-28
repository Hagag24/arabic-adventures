import os
import json
import asyncio
import hashlib
import wave
import numpy as np
from pathlib import Path
import edge_tts

# Set up PYTHONPATH-like imports
import sys
project_root = Path(__file__).resolve().parent.parent.parent.parent
sys.path.append(str(project_root / "development" / "audio" / "edge-tts" / "src"))

from edge_audio.pronunciation import prepare_arabic_speech_text
from edge_audio.audio_conversion import convert_mp3_to_wav, normalize_wav_volume, trim_silence

TEXTS = {
    "welcome": "أَهْلًا بِكَ يا بَطَل! هَلْ أَنْتَ جاهِزٌ لِنَبْدَأَ رِحْلَتَنا في اللُّغَةِ العَرَبِيَّة؟ هَيَّا بِنَا!",
    "correct": "أَحْسَنْتَ يا بَطَل! الإِجَابَةُ صَحِيحَة.",
    "retry": "وَلا يِهِمَّك يا بَطَل، الحَلّ مِش صَحّ. فَكِّر بِهُدوء وَجَرِّب تاني.",
    "result": "لقد أنهيتَ دَرْسَ المعلّمِ المصريِّ القديمِ بالكاملِ بنجاحٍ وحصلتَ على وسامِ مُستكشِفِ الحضارَةِ!"
}

# Output directory
REVIEW_DIR = project_root / "development" / "audio" / "review" / "phonics-pipeline-comparison"
REVIEW_DIR.mkdir(parents=True, exist_ok=True)

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
    except Exception as e:
        print(f"Error reading peak for {wav_path.name}: {e}")
        return -99.0

def get_duration(wav_path: Path) -> float:
    try:
        with wave.open(str(wav_path), "rb") as w:
            return w.getnframes() / w.getframerate()
    except Exception:
        return 0.0

async def generate_candidate(
    name: str,
    text: str,
    spoken_text: str,
    voice: str,
    rate: str,
    apply_post_processing: bool
) -> dict:
    mp3_path = REVIEW_DIR / f"{name}_tmp.mp3"
    wav_path = REVIEW_DIR / f"{name}.wav"
    
    print(f"Generating {wav_path.name}...")
    
    # Generate MP3
    communicate = edge_tts.Communicate(
        text=spoken_text,
        voice=voice,
        rate=rate,
        volume="+0%",
        pitch="+0Hz"
    )
    await communicate.save(str(mp3_path))
    
    # Convert to WAV
    success = convert_mp3_to_wav(mp3_path, wav_path)
    if mp3_path.exists():
        mp3_path.unlink()
        
    if not success:
        raise RuntimeError(f"Failed to convert {name} to WAV")
        
    normalization_status = "none"
    if apply_post_processing:
        # Trim silence and normalize volume
        trim_silence(wav_path, threshold=100, pad_ms=50)
        normalize_wav_volume(wav_path, target_peak_db=-1.0)
        normalization_status = "peak_normalization_-1dBFS_and_silence_trimmed"
        
    duration = get_duration(wav_path)
    peak_dbfs = get_peak_dbfs(wav_path)
    sha256 = get_file_sha256(wav_path)
    
    return {
        "text": text,
        "spokenText": spoken_text,
        "voice": voice,
        "rate": rate,
        "pitch": "+0Hz",
        "volume": "+0%",
        "provider": "microsoft-edge-online-tts",
        "normalization": normalization_status,
        "durationSeconds": duration,
        "peakDbfs": peak_dbfs,
        "sha256": sha256,
        "filePath": str(wav_path.relative_to(project_root)).replace("\\", "/")
    }

async def main():
    metadata = {}
    
    for key, text in TEXTS.items():
        # 1. Current configuration (Salma, -5%, no waqf, no post-processing)
        current_name = f"{key}_current"
        metadata[f"{current_name}.wav"] = await generate_candidate(
            name=current_name,
            text=text,
            spoken_text=text,  # No waqf normalization
            voice="ar-EG-SalmaNeural",
            rate="-5%",
            apply_post_processing=False
        )
        
        # 2. Source script configuration (Shakir, -20%, with waqf, no post-processing)
        source_name = f"{key}_source-script"
        source_spoken = prepare_arabic_speech_text(text)
        metadata[f"{source_name}.wav"] = await generate_candidate(
            name=source_name,
            text=text,
            spoken_text=source_spoken,
            voice="ar-EG-ShakirNeural",
            rate="-20%",
            apply_post_processing=False
        )
        
        # 3. Adjusted rate / optimized (Salma, -15%, with waqf, with post-processing)
        adjusted_name = f"{key}_adjusted-rate"
        adjusted_spoken = prepare_arabic_speech_text(text)
        metadata[f"{adjusted_name}.wav"] = await generate_candidate(
            name=adjusted_name,
            text=text,
            spoken_text=adjusted_spoken,
            voice="ar-EG-SalmaNeural",
            rate="-15%",
            apply_post_processing=True
        )
        
    # Write metadata.json
    with open(REVIEW_DIR / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
        
    print("Candidates generated successfully under:")
    print(REVIEW_DIR)

if __name__ == "__main__":
    asyncio.run(main())
