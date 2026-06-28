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
