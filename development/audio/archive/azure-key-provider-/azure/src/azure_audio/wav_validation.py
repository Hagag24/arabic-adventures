import wave
import numpy as np
from pathlib import Path
from . import file_utils

MIN_DURATION_SECONDS = 0.5
SILENCE_RMS_THRESHOLD = 0.001
MAX_CLIPPING_PERCENTAGE = 0.05
MAX_DC_OFFSET = 0.1

KNOWN_PLACEHOLDER_HASHES = {
    # Add any known placeholder hashes if they exist
}

def validate_wav(wav_path: Path) -> tuple[bool, str, float]:
    """
    Validates a WAV file and returns (is_valid, error_message, duration_seconds).
    """
    if not wav_path.exists():
        return False, "File does not exist", 0.0

    if wav_path.stat().st_size == 0:
        return False, "File is empty", 0.0

    file_hash = file_utils.get_file_sha256(wav_path)
    if file_hash in KNOWN_PLACEHOLDER_HASHES:
        return False, "File is a known placeholder", 0.0

    try:
        with wave.open(str(wav_path), "rb") as w:
            if w.getnchannels() != 1:
                return False, f"Expected mono, got {w.getnchannels()} channels", 0.0
            if w.getsampwidth() != 2:
                return False, f"Expected 16-bit PCM, got {w.getsampwidth()*8}-bit", 0.0
            if w.getframerate() != 24000:
                return False, f"Expected 24000 Hz, got {w.getframerate()} Hz", 0.0
            if w.getcomptype() != "NONE":
                return False, "File is compressed, expected PCM", 0.0
            
            n_frames = w.getnframes()
            if n_frames == 0:
                return False, "File has no audio frames", 0.0

            duration = n_frames / w.getframerate()
            if duration < MIN_DURATION_SECONDS:
                return False, f"Duration {duration:.2f}s is less than minimum {MIN_DURATION_SECONDS}s", duration

            # Read frames for analysis
            raw_data = w.readframes(n_frames)
            audio_data = np.frombuffer(raw_data, dtype=np.int16)

            # Normalize to -1.0 to 1.0
            audio_norm = audio_data.astype(np.float32) / 32768.0

            # DC Offset
            dc_offset = np.mean(audio_norm)
            if abs(dc_offset) > MAX_DC_OFFSET:
                return False, f"DC offset {dc_offset:.4f} exceeds limit {MAX_DC_OFFSET}", duration

            # Remove DC offset for RMS and peak calculation
            audio_norm -= dc_offset

            # RMS
            rms = np.sqrt(np.mean(audio_norm**2))
            if rms < SILENCE_RMS_THRESHOLD:
                return False, f"RMS {rms:.4f} is below silence threshold {SILENCE_RMS_THRESHOLD}", duration

            # Clipping
            peak = np.max(np.abs(audio_norm))
            clipping_ratio = np.sum(np.abs(audio_norm) >= 0.99) / len(audio_norm)
            if clipping_ratio > MAX_CLIPPING_PERCENTAGE:
                return False, f"Clipping percentage {clipping_ratio*100:.2f}% exceeds limit {MAX_CLIPPING_PERCENTAGE*100}%", duration

            # Pure sine tone detection (basic heuristic: very low variance in zero crossings diffs)
            zero_crossings = np.where(np.diff(np.sign(audio_norm)))[0]
            if len(zero_crossings) > 100:
                diffs = np.diff(zero_crossings)
                variance = np.var(diffs)
                if variance < 1.0: # A pure tone has almost perfectly regular zero crossings
                    return False, "File appears to be a pure sine tone placeholder", duration

    except wave.Error as e:
        return False, f"Wave format error: {str(e)}", 0.0
    except Exception as e:
        return False, f"Validation error: {str(e)}", 0.0

    return True, "", duration
