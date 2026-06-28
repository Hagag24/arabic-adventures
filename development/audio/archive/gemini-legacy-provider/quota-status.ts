import fs from "fs";
import path from "path";

const statusFile = path.resolve(process.cwd(), "development/audio/state/gemini-quota-status.json");

if (!fs.existsSync(statusFile)) {
  console.log("No quota status found.");
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

const reqTime = new Date(status.requestTimestamp);
let nextSafeRetryUtc = new Date(reqTime.getTime() + 60000); // default 1 min
let waitingSolves = "yes";
let recommendedAction = "Wait for the retry delay.";

if (quotaType === "PAID_REQUIRED") {
  waitingSolves = "no";
  recommendedAction = "Enable billing or select an authorized paid project.";
} else if (quotaType === "RPD") {
  const tomorrow = new Date(reqTime);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  // Midnight PT is 07:00 UTC during daylight saving (PDT).
  // We use 07:05 to safely clear the reset window.
  tomorrow.setUTCHours(7, 5, 0, 0);
  nextSafeRetryUtc = tomorrow;
  recommendedAction = "Wait for daily reset at midnight Pacific Time.";
} else if (status.retryDelay) {
  const seconds = parseInt(status.retryDelay.replace("s", "")) || 60;
  nextSafeRetryUtc = new Date(reqTime.getTime() + seconds * 1000 + 5000);
}

const cairoTime = new Date(nextSafeRetryUtc.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
const pacificTime = new Date(nextSafeRetryUtc.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));

console.log(`Gemini TTS quota status`);
console.log(``);
console.log(`Model: ${status.quotaDimensions?.model || "unknown"}`);
console.log(`Quota type: ${quotaType}`);
console.log(`Quota ID: ${qId}`);
console.log(`Quota value: ${qVal}`);
console.log(`Last failure: ${status.requestTimestamp}`);
console.log(`Next safe retry: ${nextSafeRetryUtc.toISOString()}`);
console.log(`Next safe retry in Cairo: ${cairoTime.toLocaleString()}`);
console.log(`Waiting can solve this: ${waitingSolves}`);
console.log(`Recommended action: ${recommendedAction}`);

// Also update the MD
const md = `# Gemini API Quota Status

- **HTTP Status**: ${status.httpStatus}
- **Error Status**: ${status.errorStatus}
- **Quota Metric**: ${status.quotaMetric}
- **Quota ID**: ${status.quotaId}
- **Quota Value**: ${status.quotaValue}
- **Retry Delay**: ${status.retryDelay || "N/A"}

## Analysis
- **Quota Type**: ${quotaType}
- **Waiting can solve this**: ${waitingSolves}
- **Recommended Action**: ${recommendedAction}
- **Next Safe Retry (UTC)**: ${nextSafeRetryUtc.toISOString()}
`;

fs.writeFileSync(path.resolve(process.cwd(), "development/audio/docs/GEMINI_QUOTA_STATUS.md"), md);
