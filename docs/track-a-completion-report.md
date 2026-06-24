# Track A Completion Report

This document summarizes the findings from Track A (Audit and Inventory) before starting the implementation phase (Track B).

---

## 1. Audit Summary

* **Existing Working Features**:
  - Home Page layout (RTL logic, responsive, Google Arabic Font).
  - Dynamic Journeys page loading from SQLite using Prisma.
  - Verification scripts (`scripts/verify-db.ts`) and launcher batch files.
  - Test suites configured for Vitest and Playwright.
* **Existing Visual-Only / Mock Features**:
  - Portal pages: `/teacher`, `/admin`, `/student`.
  - Stages locking/unlocking displays (placeholder locking).
* **Existing Broken / Missing Features**:
  - Missing dynamic activity play routes (`/journeys/[journeySlug]/play/[activitySlug]`).
  - Missing student persistence models (attempts, anonymous session cookies, journey progress).
  - Missing audio engine (centralized audios, Egyptian Arabic pre-recorded lessons).

---

## 2. Structural Adjustments for Track B

* **Routes to Retain & Redirect**:
  - `/` ➔ Dynamic Home Page displaying Journeys.
  - `/student` ➔ Redirect to `/`.
  - `/student/journeys` ➔ Redirect to `/`.
  - `/student/journeys/[journeySlug]` ➔ Redirect to `/journeys/[journeySlug]`.
* **Routes to Remove / Retire**:
  - `/teacher` ➔ Redirect to `/` (Student-only experience, no visual teacher indicators).
  - `/admin` ➔ Redirect to `/` (Student-only experience, no visual admin indicators).
* **Database Models to Add**:
  - `Activity` (Activity definition)
  - `ActivityOption` (Possible answers/cards)
  - `ActivityAnswerKey` (Server-only validation key)
  - `AudioAsset` (Narrations, instructions, overrides)
  - `PlayerSession` (Cookie session linking)
  - `ActivityAttempt` (Detailed student answers & scores)
  - `JourneyProgress` (Dynamic tracking of current stage/score)

---

## 3. Workbook and Content Mapping Statistics

* **Total Workbook Activities Found**: **60 activities/prompts** mapping pages 1–24.
* **Total Planned Website Activities**: **60 activities/prompts** distributed across the 8 stages of the three journeys:
  - Journey 1: **16 activities**
  - Journey 2: **24 activities**
  - Journey 3: **20 activities**
* **Total Audio Assets Required**: **3 primary narrations** (Egyptian voice MSA style, voice actors, reassuring tone, pronunciation overrides).
* **Total Content Corrections**: **6 major categories corrected** (opinion grading removal, incomplete paragraphs completed, title normalizations, inclusive gender adjustments, numbering typos).
* **Sensitive Safeguarding Rules**: Journey 3 activities mapped to `COMPLETION_ONLY` storage policies; personal disclosure input forms are prohibited; no student name or school information is gathered.
