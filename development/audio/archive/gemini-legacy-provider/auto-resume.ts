import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const statusFile = path.resolve(process.cwd(), "development/audio/state/gemini-quota-status.json");

if (!fs.existsSync(statusFile)) {
  console.log("No quota status found. Nothing to resume automatically.");
  process.exit(0);
}

const status = JSON.parse(fs.readFileSync(statusFile, "utf-8"));

let quotaType = "UNKNOWN";
const qId = status.quotaId || "";
const qVal = parseInt(status.quotaValue || "0", 10);

if (qVal === 0) {
  quotaType = "PAID_REQUIRED";
} else if (qId.toLowerCase().includes("perday") || qId.toLowerCase().includes("rpd")) {
  quotaType = "RPD";
} else if (qId.toLowerCase().includes("perminute") || qId.toLowerCase().includes("rpm") || qId.toLowerCase().includes("tpm")) {
  quotaType = "RPM";
} else {
  quotaType = "TEMPORARY_CAPACITY";
}

if (quotaType === "PAID_REQUIRED") {
  console.error("The current project or model has no usable free TTS quota. Waiting will not resolve this condition. Please enable billing or select a supported TTS model.");
  process.exit(1);
}

const reqTime = new Date(status.requestTimestamp);
let nextSafeRetryUtc = new Date(reqTime.getTime() + 60000); // default 1 min

if (quotaType === "RPD") {
  const tomorrow = new Date(reqTime);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(7, 5, 0, 0);
  nextSafeRetryUtc = tomorrow;
} else if (status.retryDelay) {
  const seconds = parseInt(status.retryDelay.replace("s", "")) || 60;
  nextSafeRetryUtc = new Date(reqTime.getTime() + seconds * 1000 + 5000);
}

function waitAndRun() {
  const now = new Date();
  if (now >= nextSafeRetryUtc) {
    console.log(`\nTime reached. Resuming generation...`);
    try {
      execSync("pnpm.cmd audio:generate:resume", { stdio: "inherit" });
    } catch (e) {
      console.log("Generation process finished (it may have hit the quota again).");
    }
    process.exit(0);
  }

  const diffMs = nextSafeRetryUtc.getTime() - now.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  console.log(`Waiting... ${diffMin} minutes remaining until ${nextSafeRetryUtc.toLocaleString()}`);
  
  // Show countdown at most once every 5 minutes
  const waitMs = Math.min(diffMs, 5 * 60 * 1000);
  setTimeout(waitAndRun, waitMs);
}

console.log(`Auto-resume initialized.`);
console.log(`Next safe retry: ${nextSafeRetryUtc.toLocaleString()}`);
waitAndRun();
