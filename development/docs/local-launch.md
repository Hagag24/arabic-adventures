# Local Launch Documentation - Phase 00

This document explains how to set up, launch, and manage the **Arabic Adventures (`مغامرات العربية`)** application locally.

---

## 1. Prerequisites

To run this application locally, your system must have:
* **Node.js**: Version 20.9 or later (Node.js 22 LTS or newer is preferred. Node 24 is fully supported).
* **pnpm**: Dependency manager.
* **Google Chrome**: Web browser (optional, the script will fall back to your default browser if Chrome is unavailable).

*Note: You cannot run this application by double-clicking `index.html`. Database querying and routing operations require a running Next.js Node.js server.*

---

## 2. Setup (First-Time Only)

To install dependencies, deploy database migrations, run seed data, and build the Next.js production app, run the setup script:

1. Double-click the **`setup-app.bat`** file in the project root directory.
2. The terminal will open and display the progress of each step:
   * `pnpm install`
   * `pnpm db:generate`
   * `pnpm db:migrate:deploy`
   * `pnpm db:seed`
   * `pnpm db:verify`
   * `pnpm build`
3. Wait until you see the success message: `SUCCESS: Setup completed successfully!`.

If any step fails, the setup stops and displays the error clearly.

---

## 3. Launching the Application

For normal local usage:

1. Double-click the **`start-app.bat`** file.
2. This script:
   * Checks that Node, pnpm, build output, and the database file exist.
   * Verifies port 3000 is unoccupied (stops with an error if another server is running).
   * Spawns the production server in a separate window called **"Arabic Adventures Server"**.
   * Polls `/api/health` until the database connection responds successfully.
   * Automatically opens `http://127.0.0.1:3000` in Google Chrome (or your default browser).
3. Keep the server window open while using the application.

To stop the application, simply close the **"Arabic Adventures Server"** terminal window.

---

## 4. Development Mode

If you are modifying the code:

1. Double-click the **`start-dev.bat`** file.
2. This will spin up the development hot-reloaded server in a separate window and open your browser automatically when ready.

---

## 5. Database Management

* **Location**: The SQLite database file is located at `data/arabic-adventures.db`.
* **Backups**: You can safely back up the database by copying `data/arabic-adventures.db` to another directory when the application is stopped.
* **Data Verification**: To manually verify database counts and constraints at any time, run:
  ```powershell
  pnpm db:verify
  ```
* **Database Studio**: To open a visual database editor in your browser, run:
  ```powershell
  pnpm db:studio
  ```
