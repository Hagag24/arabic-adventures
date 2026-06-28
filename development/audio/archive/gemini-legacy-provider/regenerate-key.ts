/* eslint-disable */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { audioScripts } from "../../../src/audio/content/audio-script-index";
import { GoogleGeminiSpeechProvider } from "../../../src/audio/generation/google-gemini-tts-provider";
import { validateWavFile } from "./generate-audio-from-scripts";

dotenv.config();

const publicAudioDir = path.resolve(process.cwd(), "public/audio/v1");
const stateFilePath = path.resolve(
  process.cwd(),
  "artifacts/audio/state/audio-generation-state.json",
);
const progressFilePath = path.resolve(
  process.cwd(),
  "docs/AUDIO_GENERATION_PROGRESS.md",
);

function sha256(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

function sha256File(filePath: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

function writeJsonAtomic(filePath: string, data: any) {
  const tempPath = filePath + ".tmp";
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, filePath);
}

function updateProgressMarkdown(state: any) {
  let md = `# Audio Generation Progress Report\n\n`;
  md += `*Updated at: ${state.updatedAt}*\n\n`;
  md += `| # | Semantic Key | Script Path | WAV Path | Status | Script Hash | Generated At | Last Error |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;

  const items = Object.values(state.items);
  items.forEach((item: any, idx: number) => {
    const errorStr = item.lastError
      ? item.lastError.replace(/\r?\n/g, " ")
      : "";
    md += `| ${idx + 1} | \`${item.semanticKey}\` | \`${item.scriptPath}\` | \`${item.wavPath}\` | **${item.status}** | \`${item.scriptSha256.substring(0, 8)}\` | ${item.lastGeneratedAt || "N/A"} | ${errorStr} |\n`;
  });

  fs.mkdirSync(path.dirname(progressFilePath), { recursive: true });
  fs.writeFileSync(progressFilePath, md, "utf-8");
}

function updateManifest(state: any) {
  const manifestPath = path.resolve(publicAudioDir, "audio-manifest.json");
  const assets: Record<string, any> = {};

  for (const scriptDef of audioScripts) {
    const item = state.items[scriptDef.semanticKey];
    if (item && item.status === "GENERATED") {
      const fullWavPath = path.resolve(process.cwd(), item.wavPath);
      if (fs.existsSync(fullWavPath)) {
        const validation = validateWavFile(fullWavPath);
        if (validation.valid) {
          const browserUrl = `/${item.wavPath.replace(/^public\//, "").replace(/\\/g, "/")}`;
          const browserTxtUrl = `/${item.scriptPath.replace(/^public\//, "").replace(/\\/g, "/")}`;
          assets[scriptDef.semanticKey] = {
            src: browserUrl,
            scriptSrc: browserTxtUrl,
            category: scriptDef.category,
            sha256: item.wavSha256,
            scriptSha256: item.scriptSha256,
            durationSeconds: item.durationSeconds,
          };
        }
      }
    }
  }

  const manifestData = {
    version: 1,
    assets,
  };

  writeJsonAtomic(manifestPath, manifestData);
  console.log(
    `📋 Manifest updated: ${Object.keys(assets).length} items registered.`,
  );
}

async function main() {
  const args = process.argv.slice(2);
  const keyIndex = args.indexOf("--key");
  if (keyIndex === -1 || !args[keyIndex + 1]) {
    console.error("❌ Usage: pnpm audio:regenerate:key --key <semanticKey>");
    process.exit(1);
  }

  const targetKey = args[keyIndex + 1];
  console.log(`🎙️ Single-Key Regeneration requested for: ${targetKey}`);

  // Locate in Index
  const scriptDef = audioScripts.find((s) => s.semanticKey === targetKey);
  if (!scriptDef) {
    console.error(
      `❌ Key "${targetKey}" is not a valid production semantic key in the script index.`,
    );
    process.exitCode = 1;
    return;
  }

  // Load state
  if (!fs.existsSync(stateFilePath)) {
    console.error(
      "❌ State file not found. Run pnpm audio:generate:resume first.",
    );
    process.exitCode = 1;
    return;
  }

  const state = JSON.parse(fs.readFileSync(stateFilePath, "utf-8"));
  let item = state.items[targetKey];

  const txtPath = `public/audio/v1/${scriptDef.relativeBasePath}.txt`;
  const wavPath = `public/audio/v1/${scriptDef.relativeBasePath}.wav`;
  const fullTxtPath = path.resolve(process.cwd(), txtPath);
  const fullWavPath = path.resolve(process.cwd(), wavPath);

  if (!fs.existsSync(fullTxtPath)) {
    console.error(`❌ Script file missing at: ${fullTxtPath}`);
    process.exitCode = 1;
    return;
  }

  const scriptText = fs.readFileSync(fullTxtPath, "utf-8");
  const scriptSha = sha256(scriptText);
  const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
  const voice = "Kore";
  const configSha = sha256(model + voice + scriptDef.deliveryProfile + "1");

  if (!item) {
    item = {
      semanticKey: targetKey,
      scriptPath: txtPath,
      wavPath: wavPath,
      scriptSha256: scriptSha,
      generationConfigSha256: configSha,
    };
    state.items[targetKey] = item;
  }

  const oldEntry = { ...item };

  // 1. Mark REGENERATION_REQUIRED
  item.status = "REGENERATION_REQUIRED";
  state.updatedAt = new Date().toISOString();
  writeJsonAtomic(stateFilePath, state);

  // 2. Synthesize to temporary WAV
  const provider = new GoogleGeminiSpeechProvider();
  const tempWavPath = fullWavPath + ".tmp";
  const contentKind = scriptDef.category.endsWith("feedback")
    ? "feedback"
    : "educational";

  console.log(
    `  -> Synthesizing "${scriptText.substring(0, 30)}..." using voice Kore...`,
  );

  try {
    await provider.synthesize(
      scriptText,
      voice,
      "normal_educational",
      tempWavPath,
      model,
      contentKind,
    );

    // 3. Validate
    const validation = validateWavFile(tempWavPath);
    if (!validation.valid) {
      throw new Error(`WAV Validation failed: ${validation.error}`);
    }

    // 4. Atomic replace
    if (fs.existsSync(fullWavPath)) {
      fs.unlinkSync(fullWavPath);
    }
    fs.renameSync(tempWavPath, fullWavPath);

    // 5. Update State
    const finalHash = sha256File(fullWavPath);
    item.status = "GENERATED";
    item.scriptSha256 = scriptSha;
    item.generationConfigSha256 = configSha;
    item.wavSha256 = finalHash;
    item.durationSeconds = parseFloat(
      (validation.durationSeconds || 0).toFixed(3),
    );
    item.lastGeneratedAt = new Date().toISOString();
    item.model = model;
    item.voice = voice;
    delete item.lastError;

    state.updatedAt = new Date().toISOString();
    writeJsonAtomic(stateFilePath, state);

    // 6. Update Progress and Manifest
    updateProgressMarkdown(state);
    updateManifest(state);

    console.log(`\n✅ Success! Overwrote manifest entry.`);
    console.log("\n📈 COMPARISON REPORT:");
    if (oldEntry && oldEntry.status === "GENERATED") {
      console.log(
        `Duration (s):   Old: ${oldEntry.durationSeconds}  ->  New: ${item.durationSeconds}`,
      );
      console.log(
        `SHA-256 Hash:   Old: ${oldEntry.wavSha256}  ->  New: ${finalHash}`,
      );
    } else {
      console.log(
        `Duration (s):   New: ${item.durationSeconds} (previously unrecorded)`,
      );
      console.log(`SHA-256 Hash:   New: ${finalHash} (previously unrecorded)`);
    }
  } catch (err: any) {
    if (fs.existsSync(tempWavPath)) {
      fs.unlinkSync(tempWavPath);
    }
    console.error(`❌ Single-key regeneration failed. Error: ${err.message}`);

    const isQuota = err.message.includes("429") || err.message.includes("Quota") || err.message.includes("rateLimitExceeded");
    item.status = isQuota ? "FAILED_QUOTA" : "FAILED_PERMANENT";
    item.lastError = err.message;
    state.updatedAt = new Date().toISOString();
    writeJsonAtomic(stateFilePath, state);
    updateProgressMarkdown(state);
    process.exitCode = 1;
    return;
  }
}

main().catch((err) => {
  console.error("❌ Key regeneration failed:", err);
  process.exitCode = 1;
});
