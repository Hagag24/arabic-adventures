import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(os.getcwd())
AZURE_ROOT = PROJECT_ROOT / "development" / "audio" / "azure"
LOCAL_ENV_PATH = AZURE_ROOT / ".env.azure.local"

# Load environment variables
load_dotenv(LOCAL_ENV_PATH)

AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")

# Audio Config
PROVIDER = "azure-speech"
LOCALE = "ar-EG"
VOICE = "ar-EG-SalmaNeural"
OUTPUT_FORMAT_STR = "RIFF 24kHz 16-bit Mono PCM WAV"
RATE = "-5%"
PITCH = "0%"
VOLUME = "0dB"

# Directories
STAGING_DIR = AZURE_ROOT / "staging"
STATE_DIR = AZURE_ROOT / "state"
REPORTS_DIR = AZURE_ROOT / "reports"
LOGS_DIR = AZURE_ROOT / "logs"
BACKUPS_DIR = AZURE_ROOT / "backups"
CACHE_DIR = AZURE_ROOT / "cache"

PUBLIC_AUDIO_DIR = PROJECT_ROOT / "public" / "audio" / "v1"
MANIFEST_PATH = PUBLIC_AUDIO_DIR / "audio-manifest.json"

STATE_FILE = STATE_DIR / "azure-generation-state.json"

# Create directories if they don't exist
for d in [STAGING_DIR, STATE_DIR, REPORTS_DIR, LOGS_DIR, BACKUPS_DIR, CACHE_DIR]:
    d.mkdir(parents=True, exist_ok=True)
