import subprocess
import wave
import numpy as np
from pathlib import Path
from imageio_ffmpeg import get_ffmpeg_exe  # type: ignore


def convert_mp3_to_wav(mp3_path: Path, wav_path: Path) -> bool:
    ffmpeg_exe = get_ffmpeg_exe()

    cmd = [
        ffmpeg_exe,
        "-y",
        "-i",
        str(mp3_path),
        "-ac",
        "1",
        "-ar",
        "24000",
        "-c:a",
        "pcm_s16le",
        str(wav_path),
    ]

    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.returncode == 0


def concatenate_wavs_with_pauses(
    wav_paths: list[Path], output_path: Path, pause_ms: int = 180
) -> bool:
    """
    Concatenates multiple WAV files, inserting silence between them.
    Assumes all input WAVs are 24000Hz, mono, 16-bit PCM.
    """
    if not wav_paths:
        return False

    frames_list = []

    # Silence frame calculation
    sample_rate = 24000
    silence_frames_count = int(sample_rate * (pause_ms / 1000.0))
    silence_data = np.zeros(silence_frames_count, dtype=np.int16).tobytes()

    try:
        for idx, wav_path in enumerate(wav_paths):
            with wave.open(str(wav_path), "rb") as w:
                frames = w.readframes(w.getnframes())
                frames_list.append(frames)

            if idx < len(wav_paths) - 1:
                frames_list.append(silence_data)

        with wave.open(str(output_path), "wb") as out_w:
            out_w.setnchannels(1)
            out_w.setsampwidth(2)
            out_w.setframerate(sample_rate)
            for f in frames_list:
                out_w.writeframes(f)

        return True
    except Exception as e:
        print(f"Error concatenating wavs: {e}")
        return False


def normalize_wav_volume(wav_path: Path, target_peak_db: float = -1.0) -> bool:
    """
    Normalizes the volume of a WAV file to a target peak in decibels.
    Assumes 16-bit PCM WAV.
    """
    try:
        target_linear = 10 ** (target_peak_db / 20.0)
        with wave.open(str(wav_path), "rb") as w:
            params = w.getparams()
            n_frames = w.getnframes()
            raw_data = w.readframes(n_frames)
            
        audio_data = np.frombuffer(raw_data, dtype=np.int16).astype(np.float32)
        
        peak = np.max(np.abs(audio_data))
        if peak == 0:
            return True  # Silent file, nothing to normalize
            
        # Scale factor
        scale = (target_linear * 32767.0) / peak
        
        # Apply scaling and clip to prevent any overflow
        normalized_data = np.clip(audio_data * scale, -32768, 32767).astype(np.int16)
        
        with wave.open(str(wav_path), "wb") as w:
            w.setparams(params)
            w.writeframes(normalized_data.tobytes())
            
        return True
    except Exception as e:
        print(f"Error normalizing WAV volume: {e}")
        return False


def trim_silence(wav_path: Path, threshold: int = 100, pad_ms: int = 50) -> bool:
    """
    Trims leading and trailing silence from a WAV file.
    Keeps a safety pad of pad_ms at both ends.
    Assumes 16-bit PCM.
    """
    try:
        with wave.open(str(wav_path), "rb") as w:
            params = w.getparams()
            sample_rate = w.getframerate()
            n_frames = w.getnframes()
            raw_data = w.readframes(n_frames)

        audio_data = np.frombuffer(raw_data, dtype=np.int16)
        if len(audio_data) == 0:
            return True

        # Find absolute values above threshold
        abs_audio = np.abs(audio_data)
        indices = np.where(abs_audio > threshold)[0]

        if len(indices) == 0:
            # Entire file is silent, keep it as is
            return True

        start_idx = indices[0]
        end_idx = indices[-1]

        # Calculate padding in samples
        pad_samples = int(sample_rate * (pad_ms / 1000.0))

        # Apply padding
        start_idx = max(0, start_idx - pad_samples)
        end_idx = min(len(audio_data), end_idx + pad_samples)

        trimmed_data = audio_data[start_idx:end_idx]

        with wave.open(str(wav_path), "wb") as w:
            w.setparams(params)
            w.writeframes(trimmed_data.tobytes())

        return True
    except Exception as e:
        print(f"Error trimming silence: {e}")
        return False

