# Final Report - Phase 00 (Foundation)

This document contains the final report of the foundation setup of **Arabic Adventures (`مغامرات العربية`)**.

---

## 1. Environment Preflight Results

Before beginning, environment requirements were validated using powershell:

* **Node.js**: `v24.18.0` (Satisfies Node 20.9+ / Node 22 LTS preference)
* **npm**: `11.16.0`
* **pnpm**: `11.9.0`
* **Git**: `2.54.0.windows.1`
* **Working Directory**: `D:\arabic-adventures`

---

## 2. Exact Installed Versions

The dependencies resolved in `package.json` are:

```json
{
  "dependencies": {
    "@prisma/adapter-better-sqlite3": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "better-sqlite3": "^12.11.1",
    "dotenv": "^17.4.2",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "server-only": "^0.0.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.61.0",
    "@tailwindcss/postcss": "^4",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/better-sqlite3": "^7.6.13",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.0.3",
    "cross-env": "^10.1.0",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "jsdom": "^29.1.1",
    "postcss.config.mjs": "^0.0.1",
    "prettier": "^3.8.4",
    "prisma": "^7.8.0",
    "tailwindcss": "^4",
    "tsx": "^4.22.4",
    "typescript": "^5",
    "vitest": "^4.1.9"
  }
}
```

---

## 3. Next.js Bootstrap Result

* **Status**: Success.
* **Configuration**: Bootstrapped in root directory (`D:\arabic-adventures`). Created with TypeScript strict mode, ESLint, Tailwind CSS (v4), App Router, and `src/` directory.

---

## 4. Prisma and SQLite Setup

* **Status**: Success.
* **Driver configuration**: Uses `better-sqlite3` and the official `@prisma/adapter-better-sqlite3` adapter.
* **Schema Generator**: Generates output client files into `src/generated/prisma`.
* **Prisma config**: Centralized configurations managed via `prisma.config.ts`.

---

## 5. Actual Database File Path

The runtime database file resides at:

```text
D:\arabic-adventures\data\arabic-adventures.db
```

This remains completely isolated from public directories and Git commits.

---

## 6. Folder Structure

The structural layout of the application is:

```text
D:\arabic-adventures
├── docs/                      # Technical reports & specifications
├── e2e/                       # Playwright test specs
├── prisma/                    # Schema, migrations, seed script
├── scripts/                   # Setup/verify database tools
├── src/
│   ├── app/                   # App Router pages and health Route Handler
│   ├── generated/prisma/      # Generated Prisma client binding files
│   ├── lib/
│   │   ├── db/                # Reusable Prisma clients and factory
│   │   └── validation/        # Zod input schema validators
│   ├── server/
│   │   ├── repositories/      # Server-only database logic
│   │   └── services/          # Server-only business mappings
│   └── __tests__/             # Vitest unit suites and setup configurations
```

---

## 7. Database Schema

Defined two primary SQLite models with relations:
1. `Journey` (id, slug [unique], title, shortDescription, themeKey, achievementTitle, estimatedMinutes, status [Enum], displayOrder, timestamps)
2. `JourneyStage` (id, journeyId, slug, title, shortDescription, displayOrder, timestamps)
* **Relations**: Cascade delete configured for `JourneyStage` -> `Journey` foreign key.
* **Indexes**: Optimal index on `Journey(status, displayOrder)`, `JourneyStage(journeyId)`. Unique constraints on `JourneyStage(journeyId, slug)` and `JourneyStage(journeyId, displayOrder)`.

---

## 8. Migration Created

Created and applied the initial database migration:

* **Migration Folder**: `prisma/migrations/20260624133548_initial_journeys/`
* **Content**: SQLite SQL creating the tables, enums, checks, and unique indexes.

---

## 9. Seed Result

Successfully inserted exactly three journeys with status `PUBLISHED`:
1. **أسرار المعلم المصري القديم** (`ancient-egyptian-teacher`)
2. **ملك القلوب** (`king-of-hearts`)
3. **جسدي أمانة** (`my-body-is-a-trust`)

Each journey is seeded with exactly 8 stages using stable English slugs: `prepare`, `predict`, `listen`, `understand`, `word-play`, `sequence-events`, `think-and-create`, `review-achievement`.

---

## 10. Seed Idempotency Verification

* Seeding logic uses `upsert` and transactions.
* Deletes old stages that do not belong to the approved list of 8 stages.
* Re-running `pnpm db:seed` executes correctly with no duplicate key errors or record inflation.

---

## 11. Repository and Service Architecture

* Enforces `import "server-only";` in both repositories and services to restrict database details.
* `journey-repository`: Pure queries targeting `status = PUBLISHED` ordered by `displayOrder`.
* `journey-service`: Validates slugs using Zod and maps models into UI-safe `JourneyViewModel` and `StageViewModel` instances (stripping database IDs and timestamps).

---

## 12. Routes Implemented

* `/` (Landing page with previews and CTAs)
* `/student` (Student workspace dashboard)
* `/student/journeys` (Dynamic journey list loaded from SQLite)
* `/student/journeys/[journeySlug]` (Dynamic stage maps loaded from SQLite)
* `/teacher` (Simple coming soon layout)
* `/admin` (Simple coming soon layout)
* `/api/health` (Health Route Handler checking SQLite connection)

---

## 13. Arabic RTL Validation

* Root layout sets `<html lang="ar" dir="rtl">` on first server response.
* Loads `Noto Sans Arabic` font applied as custom Tailwind `font-sans`.
* Responsive properties are styled using CSS logical properties (`ps-`, `pe-`, `ms-`, `me-`).
* Confirmed E2E checks show zero horizontal scrolls or overflows at 320px.

---

## 14. One-Click Launcher Implementation

Created three functional `.bat` scripts in the root directory:
1. `setup-app.bat`: Full project setup (install, generate, migrate, seed, verify, build) using call commands and error checking.
2. `start-app.bat`: Verifies builds/databases, checks port 3000, starts production server, polls health route, and launches Chrome or default browser.
3. `start-dev.bat`: Starts dev environment and launches browser.

---

## 15. Files Created & Modified

All newly created files and code edits were tracked and verified.

---

## 16. Unit and Database Test Results

Ran 6 automated tests using isolated test database `data/test.db`:

```text
✓ src/__tests__/journey.test.ts (6 tests)
    ✓ Seed creates exactly three PUBLISHED journeys with 8 stages each
    ✓ Seed is idempotent
    ✓ Published journeys are returned in displayOrder and Draft/Archived are excluded
    ✓ Service filters out Draft and Archived journeys from lists
    ✓ Valid published journey slug works
    ✓ Invalid or unpublished journey slug returns null
```

---

## 17. Playwright E2E Results

Ran 9 E2E integration tests against the live running production build:

```text
✓ e2e\smoke.spec.ts (9 tests)
    ✓ Root HTML uses Arabic and RTL
    ✓ Landing page renders title and CTA button
    ✓ Teacher and Admin portal coming-soon placeholders work
    ✓ Journey list renders dynamic SQLite database content
    ✓ Valid journey details page renders stages correctly
    ✓ Invalid journey slug displays custom Arabic not found page
    ✓ API Health route returns OK
    ✓ No horizontal overflow at 320px width
    ✓ Keyboard navigation works
```

---

## 18. Production Build Result

Next.js build was compiled with Turbopack and completed successfully.
Verified SQLite-backed routes (`/student/journeys` and `/student/journeys/[journeySlug]`) are flagged as **Dynamic (ƒ)** server-rendered on demand.

---

## 19. Known Limitations & Deferred Work

* **No authentication**: Access controls and user profiles are not implemented yet.
* **No interactive activities**: Interactive cards, workbook questions, attempts, and responses are placeholders.
* **No audio**: Sound engines and text-to-speech features are deferred.
* **Teacher/Admin controls**: Pages contain preview coming-soon placeholders only.

---

## 20. Recommended Next Phase

* **Phase 01: Activity Engine & Attempt Logs**
  * Establish schemas for `Activity` (e.g. choice, matching, ordering types), `Attempt`, and `StudentResponse`.
  * Build services to log student attempts and fetch workbook keys.
  * Render initial static choice cards and interactive sorting sequences for the Egyptian Teacher journey.
