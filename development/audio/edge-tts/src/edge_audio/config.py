from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent.parent
EDGE_ROOT = PROJECT_ROOT / "development" / "audio" / "edge-tts"

# Audio Config
PROVIDER = "microsoft-edge-online-tts"
LOCALE = "ar-EG"
VOICE = "ar-EG-SalmaNeural"
RATE = "-15%"
VOLUME = "+0%"
PITCH = "+0Hz"
OUTPUT_FORMAT_STR = "PCM 16-bit, 24000 Hz, mono"


# Directories
STAGING_DIR = EDGE_ROOT / "staging"
STAGING_MP3_DIR = STAGING_DIR / "mp3"
STAGING_CATALOG_DIR = STAGING_DIR / "catalog"
STATE_DIR = EDGE_ROOT / "state"
REPORTS_DIR = EDGE_ROOT / "reports"
LOGS_DIR = EDGE_ROOT / "logs"
BACKUPS_DIR = EDGE_ROOT / "backups"
CACHE_DIR = EDGE_ROOT / "cache"

PUBLIC_AUDIO_DIR = PROJECT_ROOT / "public" / "audio" / "v1"
MANIFEST_PATH = PUBLIC_AUDIO_DIR / "audio-manifest.json"
CANDIDATE_MANIFEST_PATH = STAGING_DIR / "audio-manifest.edge.candidate.json"

STATE_FILE = STATE_DIR / "generation-state.json"

for d in [
    STAGING_MP3_DIR,
    STAGING_CATALOG_DIR,
    STATE_DIR,
    REPORTS_DIR,
    LOGS_DIR,
    BACKUPS_DIR,
    CACHE_DIR,
]:
    d.mkdir(parents=True, exist_ok=True)
