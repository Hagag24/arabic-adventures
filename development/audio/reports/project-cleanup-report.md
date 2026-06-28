# Project Cleanup Report

This report documents the quarantine and preservation of audio pipeline files and script commands, ensuring that all review-only and audition website files are cleanly isolated while preserving the core student experience pipeline.

---

## 🧹 Quarantined/Removed Files

The following files have been successfully moved to `artifacts/audio/quarantine/project-cleanup-20260627_152000/` and isolated:

- **Audition Comparison Tooling & Packs**:
  - `scripts/audio/audition-definition.ts`
  - `scripts/audio/audition-google.ts`
  - `scripts/audio/audition.ts`
  - `scripts/audio/analyze-audio.ts`
  - `scripts/audio/normalize.ts`
  - `scripts/audio/generate-sfx.ts`
- **Review Database & Catalog Tools**:
  - `scripts/audio/build-inventory.ts`
  - `scripts/audio/prepare-spoken-text.ts`
- **Previous Review Server & Catalog Builder Scripts (previously quarantined)**:
  - `scripts/audio/approve.ts`
  - `scripts/audio/audit-candidates.ts`
  - `scripts/audio/build-review.ts`
  - `scripts/audio/generate-student.ts`
  - `scripts/audio/generate.ts`
  - `scripts/audio/publish.ts`
  - `scripts/audio/repair-candidates.ts`
  - `scripts/audio/review-server.ts`
  - `scripts/audio/transcribe-qa.ts`
  - `scripts/audio/verify-spoken-text.ts`

---

## 🛡️ Preserved Active Files

The following files are verified as active and remain in production:

- **Speech Providers & Generators**:
  - `src/audio/generation/google-gemini-tts-provider.ts`
  - `scripts/audio/generate-audio-from-scripts.ts`
  - `scripts/audio/verify.ts`
  - `scripts/audio/audit-student-audio.ts`
  - `scripts/audio/generate-script-index.ts`
  - `scripts/audio/regenerate-key.ts`
  - `scripts/audio/sync-audio-scripts.ts`
  - `scripts/audio/validate-audio-scripts.ts`
- **Runtime Components & Orchestrators**:
  - `src/audio/runtime/AudioProvider.tsx`
  - `src/audio/runtime/audio-orchestrator.ts`
  - `src/audio/runtime/GlobalAudioToggle.tsx`
  - `src/audio/runtime/SemanticAudioButton.tsx`
- **Real Student Experience E2E Tests**:
  - `e2e/audio-orchestration.spec.ts`
  - `e2e/capture-button-states.spec.ts`
  - `e2e/capture-gate1-screenshots.spec.ts`
  - `e2e/smoke.spec.ts`
  - `e2e/visual-evidence.spec.ts`

---

## 📦 Package.json Script Changes

### Removed Package Scripts:
- `audio:inventory`
- `audio:prepare-text`
- `audio:generate-sfx`
- `audio:analyze`
- `audio:generate:student`

### Retained Package Scripts:
- `audio:audit:student`
- `audio:regenerate:key`
- `audio:scripts:sync`
- `audio:scripts:validate`
- `audio:generate:resume`
- `audio:verify:architecture`
- `audio:verify:published`
