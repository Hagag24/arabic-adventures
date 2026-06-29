# Architecture Documentation - Phase 00

This document outlines the architectural boundaries, layers, directory structure, and UI layout patterns of the **Arabic Adventures (`مغامرات العربية`)** application.

---

## 1. Directory Structure

The codebase is organized into features, server components, database access layers, and client-facing pages:

```text
D:\arabic-adventures
├── docs/                      # Architectural and feature documentation
├── e2e/                       # Playwright E2E integration test suites
├── prisma/                    # Prisma 7 schemas, migrations, and seed scripts
├── scripts/                   # Workspace helper scripts (db:verify, test prep)
├── src/
│   ├── app/                   # App Router pages and Route Handlers
│   │   ├── api/health/        # Route Handler checking SQLite connectivity
│   │   ├── student/           # Student portal pages
│   │   ├── teacher/           # Teacher "coming-soon" page
│   │   ├── admin/             # Admin "coming-soon" page
│   │   └── layout.tsx         # Root document (ar/rtl with Noto Sans Arabic)
│   ├── generated/prisma/      # Generated Prisma 7 Client files (git ignored)
│   ├── lib/
│   │   ├── db/                # Prisma client factory and application singleton
│   │   └── validation/        # Zod input validation schemas
│   ├── server/
│   │   ├── repositories/      # Database queries only (server-only)
│   │   └── services/          # Mapping to UI view models (server-only)
│   └── __tests__/             # Vitest unit and integration test suites
```

---

## 2. Layers and Boundaries

To enforce a clean separation of concerns and protect database access patterns, three strict layers are established:

### A. Repository Layer (`src/server/repositories/`)
* **Responsibilities**: Executes direct Prisma Client operations against the SQLite database.
* **Scope**: Only this layer queries Prisma. No client code or UI layers should touch Prisma directly.
* **Safety**: Files are guarded with `import "server-only";` to prevent leaks into Client Component bundles.

### B. Service Layer (`src/server/services/`)
* **Responsibilities**: Maps raw database records into UI-safe view models. Excludes raw IDs, database metadata, and security fields. Employs error boundaries and logging.
* **Scope**: Calls repository methods. Validates inputs using Zod schemas.
* **Safety**: Files are guarded with `import "server-only";`.

### C. UI Page / Routing Layer (`src/app/`)
* **Responsibilities**: Resolves URLs, handles metadata, parses request parameters, and renders UI components.
* **Scope**: Calls methods from the Service Layer to fetch data. Never imports from repositories or instantiates Prisma client directly.
* **Safety**: Pages are rendered dynamically on demand using Next.js `connection()`.

---

## 3. Logical RTL CSS Styling

To fully support the right-to-left layout required for the Arabic language, we employ CSS Logical Properties through Tailwind CSS utility classes:

* Direction-independent margins and paddings:
  * Use `ps-*` (padding-inline-start) and `pe-*` (padding-inline-end) instead of `pl-*` / `pr-*`.
  * Use `ms-*` (margin-inline-start) and `me-*` (margin-inline-end) instead of `ml-*` / `mr-*`.
* Logical border properties:
  * Use `border-s` (border-inline-start) and `border-e` (border-inline-end) for vertical divider lines.
* Inset properties:
  * Use logical start/end for positioning absolute children (e.g. `start-*` and `end-*` instead of `left-*` and `right-*`).

This guarantees the design remains perfectly aligned, responsive, and natural to read from right-to-left on all viewports without global horizontal scroll suppression.
