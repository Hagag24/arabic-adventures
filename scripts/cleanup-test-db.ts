import fs from "fs";
import path from "path";

async function cleanup() {
  console.log("Cleaning up test database...");
  const dbPath = path.resolve(process.cwd(), "data/test.db");
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
      console.log("Test database file deleted.");
    } catch (err) {
      console.warn("Could not delete test database file:", err);
    }
  }
}

cleanup().catch((err) => {
  console.error("Test database cleanup failed:", err);
  process.exit(1);
});
