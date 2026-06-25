# Two-Lesson Rebuild & Cleanup Audit

This document classifies every relevant file and feature in the repository for the transition to the two-lesson structure.

## 1. Directory & File Classification

| Path | Classification | Rationale / Action Plan |
| :--- | :--- | :--- |
| **`src/app/journeys/`** | `REMOVE` | Obsolete routing structure. Pages will be replaced by `/lessons/*` and redirected. |
| **`src/app/student/`** | `REMOVE` | Obsolete directory (unused or empty). |
| **`src/app/teacher/`** | `REMOVE` | Obsolete directory (unused or empty). |
| **`src/app/admin/`** | `REMOVE` | Obsolete directory (unused or empty). |
| **`src/content/workbook-activity-inventory.ts`** | `REMOVE` | Contains obsolete 77-item system. Archived as documentation to `docs/archive/workbook-activity-inventory.md`. |
| **`src/content/activity-seed-builder.ts`** | `REMOVE` | Contains obsolete 77-item definitions. Replaced by `src/content/lesson-activity-definitions.ts`. |
| **`src/content/lessons/`** | `NEW` | Authoritative runtime source for Lesson 1 and Lesson 2 activity definitions. |
| **`src/content/archive/`** | `NEW` | Archive directory for non-runtime resources (e.g. Lesson 3 sources) that must not be imported by production code. |
| **`src/components/activity/ActivityPlayerClient.tsx`** | `NEW` | Shared player client component, replacing route-specific duplicates. |
| **`src/components/activity/ActivityRenderer.tsx`** | `REFACTOR` | Update to dispatch only to the generic `MultiRoundRenderer` or standard sub-renderers. |
| **`src/components/activity/renderers/`** | `REFACTOR` | Consolidate and clean up sub-renderers to support `MultiRoundRenderer` stages. |
| **`src/components/activity/MicrophoneButton.tsx`** | `NEW` | Reusable Speech-to-Text input button with Webkit SpeechRecognition. |
| **`src/hooks/use-speech-dictation.ts`** | `NEW` | Unified speech dictation hook managing state, cleanup, and browser APIs. |
| **`src/components/audio/`** | `REMOVE` | Audited. Remove obsolete playback buttons and audio triggers. Narration keys remain in code configuration but speaker UI hidden. |
| **`src/lib/audio/`** | `REMOVE` | Audited. Remove obsolete audio-manager logic and speech types. |
| **`src/server/services/activity-service.ts`** | `REFACTOR` | Update queries to use the simplified schema and two-lesson structure. |
| **`src/server/services/journey-service.ts`** | `REMOVE` | Replaced by `src/server/services/lesson-service.ts`. |
| **`src/__tests__/activity.test.ts`** | `REFACTOR` | Update unit tests to verify 47-screen setup, evaluation correctness, and new schemas. |
| **`src/__tests__/journey.test.ts`** | `REMOVE` | Replaced by `src/__tests__/lesson.test.ts`. |
| **`e2e/smoke.spec.ts`** | `REFACTOR` | Assert new route paths `/lessons/*` and redirect logic. |
| **`e2e/visual-evidence.spec.ts`** | `REFACTOR` | Capture only approved two-lesson screenshots, deleting old ones from `artifacts/`. |
| **`public/audio/`** | `REMOVE` | Remove fake MP3 placeholders, generated voice clips, and manifest files. |
| **`scripts/generate-audio.js`** | `REMOVE` | Remove unused speech synthesis script. |
| **`scripts/verify-audio.ts`** | `REMOVE` | Remove unused verification helper. |
| **`scripts/verify-db.ts`** | `REFACTOR` | Assert exactly 2 published lessons, 47 total activities, and 0 third-lesson records. |
| **`prisma/schema.prisma`** | `REFACTOR` | Remove `ActivitySourceMapping` model and add direct fields `sourceLessonNumber`, `sourceActivityNumber`, and `sourceKey` to `Activity`. |
| **`prisma/seed.ts`** | `REFACTOR` | Clean up obsolete stages/activities in a transaction, seed 2 lessons (19 and 28 activities), idempotent. |
| **`package.json`** | `REFACTOR` | Remove `edge-tts-ts` and perform pnpm prune. |

---

## 2. Retention Commitments
* **Prisma migration history** (`prisma/migrations/*`): `KEEP` (must remain untouched).
* **Current SQLite database backup**: `KEEP` (stored in `data/` or root).
* **Original workbook documents** (`docs/*.docx`, `docs/*.txt`): `KEEP` (required for traceability).
* **Secure session logic**: `KEEP` (retained and verified).
* **Server-side evaluation**: `KEEP` (updated to support new configurations).
