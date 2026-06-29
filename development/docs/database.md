# Database Documentation - Phase 00

This document describes the schema design, configurations, and migration workflows for the SQLite database.

---

## 1. Schema Design

In Phase 00, only the foundational structural models (`Journey` and `JourneyStage`) are defined.

### User Roles / Authentication
* Authentication, users, students, and attempts are deferred to later phases. No login tables exist in Phase 00.

### Journey Model
* **Fields**:
  * `id` (String @id @default(uuid()))
  * `slug` (String @unique) - Stable URL locator.
  * `title` (String) - Arabic name of the journey.
  * `shortDescription` (String) - Engaging overview description.
  * `themeKey` (String) - Key used to select layout theme styles (e.g. `ancient-egypt`, `safety`, `humanity`).
  * `achievementTitle` (String) - Title awarded upon completion (e.g. `مستكشف الحضارة`).
  * `estimatedMinutes` (Int) - Estimated time investment.
  * `status` (Enum: `DRAFT`, `PUBLISHED`, `ARCHIVED`) - Publishing lifecycle state.
  * `displayOrder` (Int) - Global sorting index.
  * `createdAt` / `updatedAt` (DateTime) - Audit timestamps.
* **Indexes**:
  * Index on `[status, displayOrder]` to optimize dynamic filtering of list routes.

### JourneyStage Model
* **Fields**:
  * `id` (String @id @default(uuid()))
  * `journeyId` (String) - Foreign key referencing the parent Journey.
  * `slug` (String) - Stage locator (e.g. `prepare`, `predict`, `listen`).
  * `title` (String) - Arabic stage title (e.g. `استعد`).
  * `shortDescription` (String) - Activity summary.
  * `displayOrder` (Int) - Order index within the parent journey.
  * `createdAt` / `updatedAt` (DateTime) - Audit timestamps.
* **Relations**:
  * `journey` (Relation to `Journey` with `onDelete: Cascade` to ensure child stages are deleted when a journey is deleted).
* **Unique Constraints & Indexes**:
  * Unique constraint on `[journeyId, slug]` (stage slug must be unique within a journey).
  * Unique constraint on `[journeyId, displayOrder]` (display order must be unique within a journey).
  * Index on `[journeyId]` for foreign key performance.

---

## 2. Configuration & ESM Setup

* **ESM Requirements**: Since Next.js and Prisma 7 run in ESM mode, we specify `"type": "module"` in `package.json`.
* **Prisma 7 Configuration (`prisma.config.ts`)**:
  * Contains the SQLite database file path (`file:./data/arabic-adventures.db`).
  * Configures migration seeding script execution using `tsx prisma/seed.ts`.
* **SQLite Driver Adapter**:
  * To connect to the database, we employ `@prisma/adapter-better-sqlite3` and the native `better-sqlite3` driver.
* **Generated Client**:
  * The generator client generates client bindings into `src/generated/prisma/` which is ignored from Git.

---

## 3. Database Location

The SQLite file is located in a project-root persistent directory:

```text
D:\arabic-adventures\data\arabic-adventures.db
```

This location remains strictly outside public or client bundle areas. All runtime journal files (`*.db-journal`, `*.db-shm`, `*.db-wal`) are ignored by Git.
