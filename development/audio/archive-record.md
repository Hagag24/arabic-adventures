# External Archive Record

To keep the active development repository clean, lightweight, and under 50 MB (excluding dependencies), all large historical backups, quarantine directories, and comparison audio batches have been moved to an external sibling directory.

## Archive Path
All archived assets are stored at:
`D:\arabic-adventures-archives`

---

## Archived Directories

### 1. Audio Backups
- **Source Path**: `development/audio/backups`
- **Archive Path**: `D:\arabic-adventures-archives\audio-backups`
- **Size**: ~1.06 GB (1,110,223,872 bytes)
- **Description**: Contains historical WAV/MP3 files, developer audio backups, and previous iteration candidates generated prior to the June 2026 voice unification.
- **Retained**: Yes (For recovery and historical reference).

### 2. Audio Pipeline Quarantine
- **Source Path**: `development/audio/quarantine`
- **Archive Path**: `D:\arabic-adventures-archives\audio-quarantine`
- **Size**: ~294.52 MB (308,822,016 bytes)
- **Description**: Contains quarantined scripts, old assets, and temporary playbooks from the initial audio pipeline cleanup on 2026-06-27.
- **Retained**: Yes.

### 3. Database Backups
- **Source Path**: `data/backups`
- **Archive Path**: `D:\arabic-adventures-archives\database-backups`
- **Size**: ~8.2 MB (8,597,504 bytes)
- **Description**: Contains 14 historical SQLite database backups (`.db` and `.bak` files) captured during migrations and schema updates.
- **Retained**: Yes.

### 4. Phonics Pipeline Comparison
- **Source Path**: `development/audio/review/phonics-pipeline-comparison`
- **Archive Path**: `D:\arabic-adventures-archives\phonics-pipeline-comparison`
- **Size**: ~15.2 MB (15,938,560 bytes)
- **Description**: Contains previous comparison WAV files comparing the old Google TTS output with the newer Microsoft Edge TTS voice candidates.
- **Retained**: Yes.

---

## Archive Verification
The integrity of these files can be validated against the baseline file inventory:
- [project-file-inventory.csv](file:///D:/arabic-adventures/development/reports/project-file-inventory.csv)
- [storage-before-cleanup.csv](file:///D:/arabic-adventures/development/reports/storage-before-cleanup.csv)
