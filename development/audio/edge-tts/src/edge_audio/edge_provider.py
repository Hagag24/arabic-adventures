import asyncio
import edge_tts
from pathlib import Path
from . import config


async def _generate_audio_edge_async(text: str, output_mp3: Path) -> tuple[bool, str]:
    try:
        communicate = edge_tts.Communicate(
            text,
            voice=config.VOICE,
            rate=config.RATE,
            volume=config.VOLUME,
            pitch=config.PITCH,
        )
        await communicate.save(str(output_mp3))
        return True, ""
    except Exception as e:
        error_msg = str(e)
        return False, error_msg


def generate_audio_edge(text: str, output_mp3: Path) -> tuple[bool, str]:
    """
    Generates audio synchronously using edge_tts.
    Returns (success, error_message)
    """
    return asyncio.run(_generate_audio_edge_async(text, output_mp3))
