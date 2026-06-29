# Safe Two-Lesson Rebuild and Cleanup Report

This document records the exact changes, files, database records, and dependencies updated during the transition to the strict two-lesson educational experience.

## 1. Backups and Checkpoints
- **Active Database Path**: `data/arabic-adventures.db`
- **Database Backup Path**: `data/backups/arabic-adventures-initial.db`
- **Initial Git Checkpoint**: Commit `checkpoint before final corrections and cleanup` (hash: `29eac91`)
- **Final Git Checkpoint**: Commit `completed safe two-lesson rebuild, cleanup, formatting and E2E verification` (hash: `d21faba`)

## 2. Files Deleted
- `src/content/activity-seed-builder.ts` (old seeder compiler)
- `public/audio/approved/my-body-is-a-trust-main.mp3` (obsolete third lesson main narration file)

## 3. Files Moved to Archive
- `src/content/workbook-activity-inventory.ts` -> `docs/archive/legacy-workbook-inventory.md` (workbook map analysis)
- `docs/final-activity-map.md` -> `docs/archive/legacy-activity-map.md` (obsolete activity roadmaps)
- Third Lesson content is safely archived in `docs/archive/lesson-3-source-notes.md`.

## 4. Files Refactored
- `src/app/page.tsx` (header wrapping and responsive text sizes to prevent mobile horizontal overflows)
- `src/app/lessons/[lessonSlug]/page.tsx` (responsive header layout, card wrapping and flex shrink fixes to prevent horizontal overflows)
- `src/hooks/use-speech-dictation.ts` (wrapped state setter in a setTimeout hook, added precise TS event declarations, removed unused variables and mock dependencies to satisfy strict ESLint requirements)
- `src/__tests__/activity.test.ts` (removed obsolete audio verification imports and test suite)
- `e2e/smoke.spec.ts` (updated to assert `/lessons/*` routes and 2-lesson titles/counts)
- `e2e/visual-evidence.spec.ts` (updated to take exactly 17 screenshot flows matching the 2 lessons, with Lesson 3 completely removed)

## 5. Routes and Portal Pages Removed
- `src/app/journeys/` (the entire legacy route system including roadmap and play/result files)
- Portal pages under `/student/*`, `/teacher/*`, and `/admin/*` were verified as fully removed in a previous step.

## 6. Redirects Retained (in `next.config.ts`)
Temporary redirects (with `permanent: false`) are configured for:
- `/journeys/ancient-egyptian-teacher` -> `/lessons/ancient-egyptian-teacher`
- `/journeys/king-of-hearts` -> `/lessons/magdi-yacoub`
- `/journeys/ancient-egyptian-teacher/play/:activitySlug` -> `/lessons/ancient-egyptian-teacher/activities/:activitySlug`
- `/journeys/king-of-hearts/play/:activitySlug` -> `/lessons/magdi-yacoub/activities/:activitySlug`
- `/student/:path*` -> `/`
- `/teacher/:path*` -> `/`
- `/admin/:path*` -> `/`

## 7. Third-Lesson and Obsolete Records Removed
The seed process executes inside a transaction. Cascading foreign keys drop all associated records for:
- Obsolete Journey: `my-body-is-a-trust` (Lesson 3)
- Obsolete Journey: `king-of-hearts` (replaced by `magdi-yacoub`)
- Obsolete activities: all 30 activities belonging to deleted lessons or obsolete stages.
- Cascade drops: stages, attempts, options, answer keys, progress records, and source mappings.

## 8. Components and Player Shells Consolidated
- **Single Shared Player**: `src/components/activity/ActivityPlayerClient.tsx`
- **Centralized Microphone**: `src/hooks/use-speech-dictation.ts` and `src/components/activity/MicrophoneButton.tsx`
- **Composition Renderer**: `src/components/activity/renderers/MultiRoundRenderer.tsx` composing multiple question types.
- The duplicated player shell `src/app/journeys/[journeySlug]/play/[activitySlug]/ActivityPlayerClient.tsx` has been deleted.

## 9. Audio Placeholders Removed
- Silent or fake voice narrations under `/public/audio/approved/` were pruned.
- Manifest entries in `public/audio/approved/audio_manifest.json` for Lesson 3 (`my-body-is-a-trust-main`) were removed.
- Future audio narration keys remain populated in `src/content/lesson-activity-definitions.ts` for future readiness.

## 10. Packages and Scripts Removed
- **Unused Dependency**: `edge-tts-ts` removed from `package.json`
- **Obsolete Scripts**: `scripts/generate-audio.js` and `scripts/verify-audio.ts` deleted.

## 11. Old Screenshots Removed
- Obsolete visual evidence screenshots for Journey 3 (`journey3-*`) were deleted from `artifacts/`.

## 12. Metrics & Counts Comparison

### Database Counts
| Entity | Before Cleanup | After Cleanup | Difference |
| :--- | :--- | :--- | :--- |
| **Journeys (Lessons)** | 3 | 2 | -1 |
| **Lesson 1 Activities** | 19 | 19 | 0 |
| **Lesson 2 Activities** | 28 | 28 | 0 |
| **Lesson 3 Activities** | 25 | 0 | -25 |
| **Total Activities** | 77 | 47 | -30 |

### Dependencies (package.json)
| Dependency Type | Before | After | Difference |
| :--- | :--- | :--- | :--- |
| **Production** | 10 | 10 | 0 |
| **DevDependencies** | 21 | 20 | -1 (`edge-tts-ts`) |
| **Total Packages** | 31 | 30 | -1 |

### Source Files (under src/)
- **Total Source Files (including test & definition files)**: Reduced from 52 to 47.

### Active Routes
- **Production Routes**:
  - `/` (landing page)
  - `/lessons/[lessonSlug]` (lesson roadmap)
  - `/lessons/[lessonSlug]/activities/[activitySlug]` (shared play player)
  - `/lessons/[lessonSlug]/result` (achievement certificate)
- **Journey routes (`/journeys/...`)**: 0 (all deleted).

## 13. Verification Results
- **Seed Idempotency**: Successfully verified. Multiple seed runs maintain exactly 2 lessons and 47 activities without duplication or constraint conflicts.
- **Cleanup Verification Script (`pnpm cleanup:verify`)**: Passed successfully.
- **Unit Tests (`pnpm test`)**: 17/17 tests passed successfully.
- **E2E Playwright Tests (`pnpm test:e2e`)**: 12/12 tests passed successfully, including viewport checks for narrow mobile viewports.
- **Next.js Production Build**: Compiled successfully in Turbopack optimized mode.

## 14. Intentionally Retained Legacy References
- `sourceItemKey`: Retained in `schema.prisma` and `prisma/seed.ts` but populated directly with `sourceKey` to satisfy database migration compatibility without dropping data schema indexes.
- Old journey redirect source definitions: Retained strictly in `next.config.ts` redirects list.
