# Script-First Resumable Arabic Audio Generation Pipeline Guide

This guide documents the system architecture, file layouts, script management, validation rules, generation pipeline, and update workflows for the student experience audio assets.

---

## 1. System Purpose & Core Concept

To keep the system deterministic, reproducible, and easy to maintain:
- **Script-First Design**: The authoritative source of truth for all Arabic audio text is a set of raw text files (`.txt`).
- **Paired Naming Rule**: Every semantic key corresponds to a single `.txt` script and a generated `.wav` audio file sharing the same base name and located in the same directory.
- **Website-Only Review**: The real student website is the only audio review environment. No separate review catalog portal exists.
- **Zero Runtime Speech Requests**: Outgoing Google Gemini API requests are performed ONLY during build/generation time. The browser runtime client makes exactly 0 external API calls and resolves WAV paths locally.
- **No Silent Fallbacks**: Silent placeholder audio files are strictly forbidden. If a generation attempt is rate-limited, it marks the status in the machine-readable state and exits safely to resume on next execution.

---

## 2. Directory Layout & file Paths

All production scripts and generated WAV files are physically stored under `public/audio/v1/` and structured cleanly using English directory/file naming conventions:

- **Global Welcome**:
  - Script: `public/audio/v1/global/welcome/01.txt`
  - WAV: `public/audio/v1/global/welcome/01.wav`
- **Global Feedback**:
  - Script: `public/audio/v1/global/feedback/correct/01.txt`
  - WAV: `public/audio/v1/global/feedback/correct/01.wav`
- **Lesson Story**:
  - Script: `public/audio/v1/lessons/<lesson-slug>/story.txt`
  - WAV: `public/audio/v1/lessons/<lesson-slug>/story.wav`
- **Activity Instructions / Prompts / Options**:
  - Script: `public/audio/v1/lessons/<lesson-slug>/<activity-slug>/<purpose>.txt`
  - WAV: `public/audio/v1/lessons/<lesson-slug>/<activity-slug>/<purpose>.wav`
  *(e.g., `prompt.txt`/`prompt.wav`, `instruction.txt`/`instruction.wav`, `option-happy.txt`/`option-happy.wav`)*

---

## 3. Pipeline Commands

### A. Synchronize Scripts from Codebase
Scans the current two-lesson activity definition screens and generates the missing `.txt` files under `public/audio/v1/`. Existing non-empty script files are never overwritten.
```powershell
pnpm audio:scripts:sync
```

### B. Validate Scripts
Verifies that all indexed semantic keys exist as non-empty UTF-8 `.txt` files, contain no English performance cues or null bytes, and that no orphaned `.txt` files exist. Logs Markdown and JSON reports to `artifacts/audio/reports/`.
```powershell
pnpm audio:scripts:validate
```

### C. Resumable Generation
Generates paired `.wav` files by calling Gemini TTS for pending or changed scripts. Automatically detects cached/unchanged assets using SHA-256 hashes of both script contents and configurations.
```powershell
pnpm audio:generate:resume
```

### D. Single-Key Regeneration
Allows targeting a single semantic key for replacement after modifying its `.txt` script.
```powershell
pnpm audio:regenerate:key --key "<semantic-key>"
```

---

## 4. Machine-Readable State and Manifests

- **Audio Generation State (`artifacts/audio/state/audio-generation-state.json`)**:
  Tracks script and config hashes, timestamps, durations, and status per key to determine resume points. Writes changes atomically via temporary files.
- **Runtime Audio Manifest (`public/audio/v1/audio-manifest.json`)**:
  The static JSON file containing only successfully `GENERATED` assets, mapped to their stripped browser paths (beginning with `/audio/v1/`), durations, and SHA-256 hashes.

---

## 5. Review & Correction Workflow

When a voice clip in the student interface is flagged as incorrect (e.g. bad pronunciation, tashkeel mistake):
1. Inspect the element's `data-audio-key` attribute to identify the semantic key.
2. Locate the paired `.txt` script file under `public/audio/v1/`.
3. Edit the Arabic text directly to correct the wording or tashkeel diacritics.
4. Run the single-key regeneration tool:
   ```powershell
   pnpm audio:regenerate:key --key "<semantic-key>"
   ```
5. Reload the browser and listen to the updated clip.
