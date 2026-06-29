# Developer Documentation & Audio Pipeline Guide

Welcome to the **Arabic Adventures** development folder. This directory contains all the tools, scripts, reports, and assets used for developing and maintaining the application, with a particular focus on the automated audio-generation pipeline.

---

## Directory Structure

```text
development/
├── audio/
│   ├── edge-tts/          # Active Microsoft Edge TTS generation environment
│   │   ├── src/           # Python synthesis & CLI codebase
│   │   ├── tests/         # Python unit tests
│   │   ├── pyproject.toml # Python dependencies and tool configs
│   │   └── spoken-text-overrides.json # Authoritative vocalized spoken text catalog (254 keys)
│   ├── tools/             # Active and legacy audio helper tools
│   │   ├── vocalize_catalog.py               # Active: Vocalization compiler
│   │   ├── validate_vocalization.py          # Active: Vocalization auditor
│   │   ├── generate_narrator_comparison.py   # Active: Side-by-side comparison generator
│   │   └── word_vocalizations.json           # Active: Word-level vocalization database
│   ├── staging/           # Temporary staging folder (ignored by Git)
│   │   └── narrator_comparison/ # Staged WAVs and comparison.html for review
│   ├── docs/              # Historical and architectural audio documentation
│   └── README.md          # This file
├── scripts/               # General project scripts (moved from root)
│   ├── prepare-test-db.ts  # Prepares SQLite database for testing
│   ├── cleanup-test-db.ts  # Cleans up SQLite database after testing
│   ├── verify-db.ts        # Database schema verification
│   ├── verify-cleanup.ts   # Project cleanliness verification
│   ├── audit-all-runtime-audio.ts # Runtime audio coverage audit
│   └── audit-lesson1-runtime-audio.ts # Lesson 1 audio coverage audit
└── reports/               # Project reports (storage audits, before/after cleanup)
```

---

## Active vs. Legacy Tools

### Active Tools
1. **Edge TTS Generation (`development/audio/edge-tts`)**: Active Python-based pipeline utilizing `edge-tts` to generate high-quality Egyptian Arabic voice files.
2. **Vocalization Compiler (`vocalize_catalog.py`)**: Merges sentence-level overrides with the word-level dictionary to compile `spoken-text-overrides.json`.
3. **Vocalization Auditor (`validate_vocalization.py`)**: Assures 100% vocalization across the entire catalog.
4. **Narrator Comparison (`generate_narrator_comparison.py`)**: Generates comparison sets and an HTML preview page to lock down the voice profile.
5. **Runtime Audio Audits (`scripts/audit-all-runtime-audio.ts` & `scripts/audit-lesson1-runtime-audio.ts`)**: Static verification of audio file bindings.

### Legacy/Obsolete Tools (Archived)
* **Google Cloud TTS Pipeline (`development/audio/archive/gemini-legacy-provider`)**: The old Google Cloud Text-to-Speech pipeline. Obsolete due to unnatural and robotic phrasing. Archived.
* **Azure TTS Pipeline (`development/audio/archive/azure-key-provider-`)**: Legacy Azure-based experiments. Obsolete and archived.

---

## Recreating the Environments

### 1. Node.js Dependencies
Ensure you have `pnpm` installed globally, then run:
```powershell
pnpm install --frozen-lockfile
```
This restores all packages defined in `package.json` into `node_modules/`.

### 2. Python Environment (for Edge TTS)
The Python virtual environment is ignored by Git and must be recreated locally:
```powershell
# Create venv and install dependencies
pnpm run audio:edge:setup
```
This runs the equivalent of:
```powershell
py -m venv development/audio/edge-tts/.venv
.\development\audio\edge-tts\.venv\Scripts\python.exe -m pip install -r development/audio/edge-tts/requirements.txt
```
To verify the environment, run:
```powershell
pnpm run audio:edge:lint
pnpm run audio:edge:typecheck
```

---

## Audio Pipeline Operations

### 1. Rebuilding the Audio Catalog
If you make changes to the word-level dictionary `word_vocalizations.json` or the sentence-level overrides in `vocalize_catalog.py`, compile the overrides:
```powershell
.\development\audio\edge-tts\.venv\Scripts\python.exe development\audio\tools\vocalize_catalog.py
```
To verify that all 254 keys are fully vocalized:
```powershell
.\development\audio\edge-tts\.venv\Scripts\python.exe development\audio\tools\validate_vocalization.py
```

### 2. Generating the Voice Comparison Playlist
To generate the 54 side-by-side comparison WAVs (Salma vs. Shakir at -5%, -10%, -15% rates) and their HTML player:
```powershell
.\development\audio\edge-tts\.venv\Scripts\python.exe development\audio\tools\generate_narrator_comparison.py
```
Open [comparison.html](file:///D:/arabic-adventures/development/audio/staging/narrator_comparison/comparison.html) in your browser to play the files.

### 3. Generating a Single Audio Key
To generate or regenerate a single audio key (e.g., `global.welcome.01`):
```powershell
pnpm run audio:edge:regenerate:key --key global.welcome.01
```

### 4. Publishing the Staged Audio
Once the narrator profile is locked and the full regeneration is executed, you can publish the staged files to the production catalog:
```powershell
pnpm run audio:edge:publish
```
This copies the validated WAV files to `public/audio/v1` and updates the manifest.

### 5. Running Audio Audits
To verify that all production files are correctly referenced by the application and that there are no orphans:
```powershell
pnpm run audio:runtime:audit
pnpm run audio:verify:published
```

---

## Git and Packaging Exclusions
The following generated and reproducible folders **must not** be committed to Git or included in source ZIP archives:
* `node_modules/` (Restored via `pnpm install`)
* `.next/` (Recreated via `pnpm build`)
* `development/audio/edge-tts/.venv/` (Recreated via `pnpm run audio:edge:setup`)
* `development/audio/staging/` (Temporary review WAV files)
* `coverage/` / `test-results/` (Generated by test runners)
* `__pycache__` / `.pytest_cache` / `.mypy_cache` / `.ruff_cache` (Python tool caches)
