import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { GoogleGeminiSpeechProvider } from "../../src/audio/generation/google-gemini-tts-provider";
import { AUDITION_PHRASES } from "./audition-definition";
import { analyzeAudio } from "./analyze-audio";

dotenv.config();

const AUDIT_JSON = path.resolve(
  process.cwd(),
  "artifacts/audio/reports/candidate-integrity-audit.json",
);

interface AuditReport {
  summary: unknown;
  candidates: Array<{
    candidateId: string;
    semanticKey: string;
    voice: string;
    style: string;
    expectedWavPath: string;
    expectedMp3Path: string;
    wavExists: boolean;
    mp3Exists: boolean;
    wavSize: number;
    mp3Size: number;
    status: string;
    details: string;
  }>;
}

function checkFfmpeg(): boolean {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function resolveModel(
  provider: GoogleGeminiSpeechProvider,
): Promise<string> {
  const model = process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview";
  // Verify model endpoint
  const ok = await provider.verifyModelEndpoint(model);
  if (!ok) {
    console.warn(
      `Warning: Model verification failed for ${model}. Proceeding anyway...`,
    );
  }
  return model;
}

async function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.error(
      `❌ Audit report not found at ${AUDIT_JSON}. Run audit first: pnpm audio:audit:candidates`,
    );
    process.exit(1);
  }

  const report: AuditReport = JSON.parse(fs.readFileSync(AUDIT_JSON, "utf-8"));
  const invalidCandidates = report.candidates.filter(
    (c) =>
      c.status === "MISSING" ||
      c.status === "CORRUPT" ||
      c.status === "WRONG_MAPPING" ||
      c.status === "METADATA_TEXT_MISMATCH" ||
      c.status === "DUPLICATE_AUDIO_HASH" ||
      c.status === "UNSUPPORTED_METADATA",
  );

  if (invalidCandidates.length === 0) {
    console.log(
      "✔ No candidates require repair. All speech candidates are valid.",
    );
    return;
  }

  console.log(`Found ${invalidCandidates.length} candidates requiring repair.`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not defined in the environment.");
    process.exit(1);
  }

  const provider = new GoogleGeminiSpeechProvider();
  const model = await resolveModel(provider);

  const minIntervalMs = process.env.GEMINI_MIN_INTERVAL_MS
    ? parseInt(process.env.GEMINI_MIN_INTERVAL_MS, 10)
    : 22000; // Default to 22s for Gemini free tier (3 RPM)

  console.log(`Using model: ${model}`);
  console.log(`Minimum request interval: ${minIntervalMs}ms`);

  let lastRequestTime = 0;

  for (const candidate of invalidCandidates) {
    console.log(
      `Repairing candidate: ${candidate.candidateId} (Status: ${candidate.status})`,
    );

    const phrase = AUDITION_PHRASES.find(
      (p) => p.semanticKey === candidate.semanticKey,
    );
    if (!phrase) {
      console.error(
        `❌ Semantic key definition not found for: ${candidate.semanticKey}`,
      );
      continue;
    }

    const mastersDir = path.dirname(candidate.expectedWavPath);
    const deliveryDir = path.dirname(candidate.expectedMp3Path);
    fs.mkdirSync(mastersDir, { recursive: true });
    fs.mkdirSync(deliveryDir, { recursive: true });

    // Enforce request pacing
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < minIntervalMs) {
      const waitTime = minIntervalMs - timeSinceLast;
      console.log(`Pacing: waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    let success = false;
    let attempt = 0;
    const maxRetries = 5;

    while (!success && attempt < maxRetries) {
      attempt++;
      try {
        lastRequestTime = Date.now();
        console.log(
          `Calling Gemini TTS API for: "${phrase.spokenText.substring(0, 30)}..." (Attempt ${attempt}/${maxRetries})`,
        );

        // We synthesize directly to the expected WAV path
        await provider.synthesize(
          phrase.spokenText,
          candidate.voice,
          candidate.style,
          candidate.expectedWavPath,
          model,
          phrase.category as "educational" | "feedback",
        );

        if (
          fs.existsSync(candidate.expectedWavPath) &&
          fs.statSync(candidate.expectedWavPath).size > 44
        ) {
          success = true;
          console.log(
            `Successfully generated WAV master: ${candidate.expectedWavPath}`,
          );
        } else {
          throw new Error("Generated file is missing or empty.");
        }
      } catch (err) {
        const error = err as Error;
        console.error(`Error on attempt ${attempt}:`, error.message);

        let delay = 3000;
        const retryDelayMatch = error.message.match(
          /"retryDelay"\s*:\s*"(\d+)s"/,
        );

        if (retryDelayMatch) {
          const retrySeconds = parseInt(retryDelayMatch[1], 10);
          delay = (retrySeconds + 2) * 1000;
          console.warn(
            `Rate limit (429) hit. Parsing API retryDelay hint: waiting ${retrySeconds} seconds...`,
          );
        } else if (error.message.includes("429")) {
          delay = 25000; // default 429 wait
          console.warn("Rate limit (429) hit. Waiting 25 seconds...");
        } else {
          // Exponential backoff with jitter (bounded to 60s)
          delay =
            Math.min(60000, 2000 * Math.pow(2, attempt)) + Math.random() * 1000;
        }

        if (attempt < maxRetries) {
          console.log(`Waiting ${Math.round(delay)}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (!success) {
      console.error(
        `❌ Failed to repair candidate ${candidate.candidateId} after ${maxRetries} attempts.`,
      );
    }
  }

  // After repair, run loudness normalization/conversion and the audit suite
  console.log(
    "Repair finished. Running loudness normalization and audit suite...",
  );

  if (checkFfmpeg()) {
    analyzeAudio();
  } else {
    console.warn("FFmpeg is missing. Skipping loudness normalization.");
  }

  // Rerun the audit to verify repaired state
  console.log("Rerunning candidate integrity audit...");
  try {
    execSync("tsx scripts/audio/audit-candidates.ts", { stdio: "inherit" });
  } catch (err) {
    console.error("Failed to rerun audit script:", (err as Error).message);
  }
}

main().catch((err) => {
  console.error("Repair script crashed:", err);
  process.exit(1);
});
