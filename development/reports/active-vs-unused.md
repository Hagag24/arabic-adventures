# Active vs. Unused Files Report

This report classifies every directory and file group within the project, detailing their runtime status, build role, or cleanup decision.

---

## Taxographical Summary

### 1. Active Production Files (`PRODUCTION_RUNTIME`, `APPLICATION_SOURCE`, `PRODUCTION_ASSET`)
These files are required at runtime to run the web application:
- **`src/` (excluding tests)**: Core Next.js application source code, components, hooks, and services.
- **`prisma/schema.prisma` & `prisma/migrations/`**: Schema definition and migrations for the SQLite database.
- **`data/arabic-adventures.db`**: The active local SQLite database.
- **`public/audio/v1/`**: The authoritative production audio catalog (254 speech assets + 4 SFX files).
- **`public/audio/v1/audio-manifest.json`**: The authoritative manifest mapping semantic keys to physical WAV files.

### 2. Active Build & Project Configuration (`BUILD_CONFIGURATION`)
These files are required to configure the compiler, bundler, and package manager:
- **`package.json` & `pnpm-lock.yaml` & `pnpm-workspace.yaml`**: Node package definitions and lock files.
- **`tsconfig.json`**: TypeScript compiler configuration.
- **`next.config.ts` & `postcss.config.mjs` & `eslint.config.mjs`**: Next.js, PostCSS, and ESLint configurations.
- **`.gitignore` & `.env.example` & `.env`**: Version control and environment configurations.

### 3. Active Development Tools (`DEVELOPMENT_TOOL`)
These scripts are used during development, testing, or audio generation:
- **`development/audio/edge-tts/`**: Python-based synthesis CLI and codebase.
- **`development/audio/tools/vocalize_catalog.py`**: Vocalization compiler.
- **`development/audio/tools/validate_vocalization.py`**: Vocalization auditor.
- **`development/audio/tools/generate_narrator_comparison.py`**: Side-by-side comparison generator.
- **`development/audio/tools/word_vocalizations.json`**: Word-level vocalization database.
- **`development/scripts/` (moved from root and `scripts/`)**:
  - `audit-all-runtime-audio.ts` (Active runtime audio auditor)
  - `audit-lesson1-runtime-audio.ts` (Lesson 1 audio auditor)
  - `verify-db.ts` (Prisma database verifier)
  - `verify-cleanup.ts` (Code cleanliness verifier)
  - `prepare-test-db.ts` & `cleanup-test-db.ts` (Test database setup/teardown)
  - `.bat` / `.ps1` files (Application setup and dev tools launchers)

### 4. Active Test Files (`TEST_SOURCE`)
Required to run automated tests:
- **`src/__tests__/`**: Vitest unit and integration tests.
- **`e2e/`**: Playwright end-to-end tests.
- **`playwright.config.ts` & `vitest.config.ts`**: Test runner configurations.

### 5. Generated Reproducible Files (`GENERATED_CACHE`, `GENERATED_BUILD_OUTPUT`)
These directories contain generated output and are excluded from version control and source archives:
- **`node_modules/`**: Restored via `pnpm install`.
- **`.next/`**: Created via `pnpm build`.
- **`development/audio/edge-tts/.venv/`**: Created via `pnpm run audio:edge:setup`.
- **`development/audio/staging/`**: Temporary review WAV files generated on-demand.

---

## Deleted and Archived Files

| Path | Size (Bytes) | Role | Reason for Action | Action Taken |
| --- | --- | --- | --- | --- |
| `development/audio/backups/` | 1,110,223,872 | `BACKUP` | Large historical audio backups before voice unification. | Moved to `D:\arabic-adventures-archives\audio-backups\` |
| `development/audio/quarantine/` | 308,822,016 | `LEGACY` | Quarantined scripts and obsolete playbooks. | Moved to `D:\arabic-adventures-archives\audio-quarantine\` |
| `data/backups/` | 8,597,504 | `BACKUP` | 14 historical SQLite database backups. | Moved to `D:\arabic-adventures-archives\database-backups\` |
| `development/audio/review/phonics-pipeline-comparison/` | 15,938,560 | `LEGACY` | Historical Google TTS comparison WAV files. | Moved to `D:\arabic-adventures-archives\phonics-pipeline-comparison\` |
| `backups/` (root) | 0 | `LEGACY` | Empty legacy backups directory in the root. | Deleted |
| `error-screenshot.png` | 46,496 | `TEMPORARY` | Temporary screenshot from a failed CI/CD run. | Deleted |
| `scripts/failure-screenshot.png` | 46,328 | `TEMPORARY` | Temporary screenshot from a failed CI/CD run. | Deleted |
| `verbs.json` | 4,600 | `UNUSED` | Temporary JSON file from a previous verb extraction script. | Deleted |
| `verbs_decoded.json` | 4,604 | `UNUSED` | Temporary JSON file from a previous verb extraction script. | Deleted |
| `verbs_extracted.json` | 2 | `UNUSED` | Empty temporary JSON file from verb extraction. | Deleted |
| `verbs_output.txt` | 0 | `UNUSED` | Empty temporary text output. | Deleted |
| `verbs_output2.txt` | 0 | `UNUSED` | Empty temporary text output. | Deleted |
| `tsconfig.tsbuildinfo` | 211,940 | `GENERATED_CACHE` | TypeScript compiler build cache (automatically recreated). | Deleted |
| `development/audio/tsconfig.tsbuildinfo` | 57,821 | `GENERATED_CACHE` | TypeScript compiler build cache (automatically recreated). | Deleted |
| `development/audio/state/audio-generation-state.json.tmp` | 149,803 | `TEMPORARY` | Leftover temporary state file from a crashed generation. | Deleted |

---

## Status Verification
- **UNKNOWN_FILES**: `0`
- All remaining files have been verified, classified, and confirmed as active.
