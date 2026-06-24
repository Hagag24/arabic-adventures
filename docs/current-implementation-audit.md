# Current Implementation Audit

This document classifies every important item of the current repository state into standard categories following the Track A requirements.

---

## 1. Safety Checkpoint
* **Backup Location**: `D:\arabic-adventures\data\arabic-adventures.db.bak`
* **Original Database Hash/Size**: `57,344 bytes`
* **Git Status**: Project folder is not initialized as a git repository. The workspace was backed up locally by duplicating the DB.

---

## 2. Command Verification Results

Executing baseline commands from Command Prompt (`cmd.exe`) in the workspace:

* **`pnpm db:verify`**: **PASSED**
  - Database reachable at `./data/arabic-adventures.db`.
  - Exactly three journeys exist with status `PUBLISHED`.
  - 8 stages exist per journey.
  - Slug and order constraints are verified.
* **`pnpm lint`**: **PASSED** (with 16 warnings for unused variables in test utility scripts, 0 errors).
* **`pnpm typecheck`**: **PASSED** (0 errors).
* **`pnpm format:check`**: **PASSED** (all files match Prettier styling).
* **`pnpm test`**: **PASSED** (6 unit tests passed in `journey.test.ts`).
* **`pnpm test:e2e`**: **PASSED** (9 Playwright E2E tests passed against the compiled production build).
* **`pnpm build`**: **PASSED** (successful compilation with App Router dynamic routing markers).

---

## 3. Implementation Classification

| Component / Feature | Current Status | Description | Action Required |
| :--- | :--- | :--- | :--- |
| **Home Page** (`/`) | Implemented and verified | Renders brand introduction and the 3 journey previews. | Retain visual styling but remove mock links and add journey cards linking to dynamic playing experience. |
| **Journey list** (`/student/journeys`) | Implemented and verified | Dynamically loads journeys from SQLite. | Retire route; student choosing happens on the homepage `/`. |
| **Journey Detail** (`/student/journeys/[slug]`) | Implemented and verified | Renders dynamic stages from SQLite. | Redirect to `/journeys/[journeySlug]` and make it student-only (remove references to portals). |
| **SQLite Integration & Prisma Schema** | Implemented and verified | Setup with `better-sqlite3` and ESM modules. Schema defines `Journey` and `JourneyStage`. | Keep schema but add new tables for `Activity`, `ActivityOption`, `ActivityAnswerKey`, `AudioAsset`, `PlayerSession`, `ActivityAttempt`, and `JourneyProgress`. |
| **RTL & Responsive Behavior** | Implemented and verified | Supports Arabic lang/dir, Noto Sans Arabic, and CSS logical properties. Confirmed no horizontal scroll. | Retain as the foundation for the new Activity Engine views. |
| **Launch Scripts** | Implemented and verified | Launcher scripts (`setup-app.bat`, `start-app.bat`, `start-dev.bat`) exist in workspace root. | Retain. |
| **Health Endpoint** (`/api/health`) | Implemented and verified | Handled in Node runtime. Queries DB. | Retain. |
| **Teacher Route** (`/teacher`) | Visual-only / Mock | Renders a "coming soon" page. | **REMOVE** or redirect to home page `/`. |
| **Admin Route** (`/admin`) | Visual-only / Mock | Renders a "coming soon" page. | **REMOVE** or redirect to home page `/`. |
| **Student Dashboard** (`/student`) | Visual-only / Mock | Renders a static dashboard. | **REMOVE** or redirect to home page `/`. |
| **Activity Gameplay** | Missing | No screens render dynamic questions, choice cards, sorting lists, or audio player. | **IMPLEMENT** under `/journeys/[journeySlug]/play/[activitySlug]`. |
| **Persistence of Attempts / Progress** | Missing | No logs exist for student responses or completed states. | **IMPLEMENT** SQLite persistence linked to cookie sessions. |
| **Audio Narration Engine** | Missing | No central audio controller or pre-recorded Egyptian Arabic files. | **IMPLEMENT** public audio structure. |

---

## 4. Summary of Planned Structure

* **Preserve**: RTL logical styles, Noto Sans font configuration, Next.js 16 core setup, test infrastructure (`test.db` and Vitest scripts), health API, database verification, and launcher scripts.
* **Remove / Retire**: `/teacher`, `/admin`, `/student`, `/student/journeys`, `/student/journeys/[slug]`.
* **Introduce**:
  - `/` (Home page / Journey Selector)
  - `/journeys/[journeySlug]` (Dynamic stage maps with locked/unlocked progress states)
  - `/journeys/[journeySlug]/play/[activitySlug]` (Reusable activity player page)
  - `/journeys/[journeySlug]/result` (Journey completion congratulations & badge display)
