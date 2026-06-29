import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function prepare() {
  console.log("Preparing test database...");
  const dbPath = path.resolve(process.cwd(), "data/test.db");

  if (fs.existsSync(dbPath)) {
    console.log("Deleting existing test database...");
    fs.unlinkSync(dbPath);
  }

  // Ensure data folder exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log("Running prisma migrate deploy on test database...");
  execSync("pnpm exec prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: "file:./data/test.db",
    },
  });

  console.log("Test database prepared successfully.");
}

prepare().catch((err) => {
  console.error("Test database preparation failed:", err);
  process.exit(1);
});
