/* eslint-disable */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import {
  audioScripts,
  AudioScriptDefinition,
} from "../../../src/audio/content/audio-script-index";
import { GoogleGeminiSpeechProvider } from "../../../src/audio/generation/google-gemini-tts-provider";

dotenv.config();

const publicAudioDir = path.resolve(process.cwd(), "public/audio/v1");
const stateDir = path.resolve(process.cwd(), "development/audio/state");
const stateFilePath = path.join(stateDir, "audio-generation-state.json");
const progressFilePath = path.resolve(
  process.cwd(),
  "docs/AUDIO_GENERATION_PROGRESS.md",
);
const oldMastersDir = path.resolve(
  process.cwd(),
  "artifacts/audio/production/masters",
);

type AudioGenerationItem = {
  semanticKey: string;
  scriptPath: string;
  wavPath: string;
  scriptSha256: string;
  generationConfigSha256: string;
  wavSha256?: string;
  status:
    | "PENDING_SCRIPT"
    | "SCRIPT_READY"
    | "GENERATING"
    | "GENERATED"
    | "FAILED_QUOTA"
    | "FAILED_TRANSIENT"
    | "FAILED_PERMANENT"
    | "REGENERATION_REQUIRED";
  model?: string;
  voice?: string;
  durationSeconds?: number;
  lastGeneratedAt?: string;
  lastError?: string;
};

type AudioGenerationState = {
  version: number;
  updatedAt: string;
  items: Record<string, AudioGenerationItem>;
};

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
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function analyzeAudioSignal(buffer: Buffer, sampleRate: number): {
  isTone: boolean;
  isSilence: boolean;
  maxAmplitude: number;
  rmsLevel: number;
  dominantFrequency: number;
  spectralPurity: number;
  reasons: string[];
} {
  const dataOffset = 44; // Standard WAV PCM data start
  const bytesPerSample = 2; // 16-bit
  const numSamples = Math.floor((buffer.length - dataOffset) / bytesPerSample);

  if (numSamples <= 0) {
    return {
      isTone: false,
      isSilence: true,
      maxAmplitude: 0,
      rmsLevel: 0,
      dominantFrequency: 0,
      spectralPurity: 0,
      reasons: ["Empty file"],
    };
  }

  const samples: number[] = [];
  let maxAmp = 0;
  let sumSq = 0;

  for (let i = 0; i < numSamples; i++) {
    const idx = dataOffset + i * bytesPerSample;
    if (idx + 1 < buffer.length) {
      const val = buffer.readInt16LE(idx);
      samples.push(val);
      const absVal = Math.abs(val);
      if (absVal > maxAmp) {
        maxAmp = absVal;
      }
      sumSq += val * val;
    }
  }

  const overallRms = Math.sqrt(sumSq / numSamples);

  if (maxAmp < 100) {
    return {
      isTone: false,
      isSilence: true,
      maxAmplitude: maxAmp,
      rmsLevel: overallRms,
      dominantFrequency: 0,
      spectralPurity: 0,
      reasons: ["Maximum amplitude is below silence threshold (100)"],
    };
  }

  const windowSize = Math.floor(sampleRate * 0.1);
  const numWindows = Math.floor(samples.length / windowSize);

  if (numWindows <= 0) {
    return {
      isTone: false,
      isSilence: false,
      maxAmplitude: maxAmp,
      rmsLevel: overallRms,
      dominantFrequency: 0,
      spectralPurity: 0,
      reasons: ["File too short to divide into windows"],
    };
  }

  const windowRms: number[] = [];
  const windowFreqs: number[] = [];

  for (let w = 0; w < numWindows; w++) {
    const start = w * windowSize;
    let wSumSq = 0;
    let zeroCrossings = 0;
    let prevSample = 0;

    for (let i = 0; i < windowSize; i++) {
      const sample = samples[start + i];
      wSumSq += sample * sample;

      if (i > 0 && ((prevSample >= 0 && sample < 0) || (prevSample < 0 && sample >= 0))) {
        zeroCrossings++;
      }
      prevSample = sample;
    }

    const wRms = Math.sqrt(wSumSq / windowSize);
    windowRms.push(wRms);

    const freq = (zeroCrossings / 2) / 0.1;
    windowFreqs.push(freq);
  }

  const meanRms = windowRms.reduce((a, b) => a + b, 0) / numWindows;
  const varianceRms = windowRms.reduce((a, b) => a + Math.pow(b - meanRms, 2), 0) / numWindows;
  const stdDevRms = Math.sqrt(varianceRms);
  const coefVarRms = meanRms > 0 ? stdDevRms / meanRms : 0;

  const meanFreq = windowFreqs.reduce((a, b) => a + b, 0) / numWindows;
  const varianceFreq = windowFreqs.reduce((a, b) => a + Math.pow(b - meanFreq, 2), 0) / numWindows;
  const stdDevFreq = Math.sqrt(varianceFreq);

  const reasons: string[] = [];
  let isTone = false;

  const hasConstantEnvelope = coefVarRms < 0.12;
  const hasStableFrequency = stdDevFreq < 15;

  if (hasConstantEnvelope && hasStableFrequency && meanFreq > 50) {
    isTone = true;
    reasons.push(
      `Detected constant amplitude envelope (CV of RMS: ${(coefVarRms * 100).toFixed(1)}% < 12%) and stable dominant frequency of ${Math.round(meanFreq)}Hz (standard deviation: ${stdDevFreq.toFixed(1)}Hz)`
    );
  }

  const spectralPurity = isTone ? Math.max(0, 1 - (stdDevFreq / 100)) : 0;

  return {
    isTone,
    isSilence: false,
    maxAmplitude: maxAmp,
    rmsLevel: overallRms,
    dominantFrequency: Math.round(meanFreq),
    spectralPurity,
    reasons,
  };
}

// WAV Header Validation without external dependencies
export function validateWavFile(filePath: string): {
  valid: boolean;
  error?: string;
  durationSeconds?: number;
} {
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: "File does not exist" };
  }
  const stats = statsCache[filePath] || fs.statSync(filePath);
  statsCache[filePath] = stats;
  if (stats.size <= 44) {
    return {
      valid: false,
      error: "File is empty or too small to contain a WAV header",
    };
  }

  const buffer = bufferCache[filePath] || fs.readFileSync(filePath);
  bufferCache[filePath] = buffer;

  if (
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WAVE"
  ) {
    return { valid: false, error: "Invalid RIFF/WAVE container format" };
  }

  let fmtOffset = -1;
  for (let i = 12; i < buffer.length - 8; i++) {
    if (buffer.toString("ascii", i, i + 4) === "fmt ") {
      fmtOffset = i;
      break;
    }
  }

  if (fmtOffset === -1) {
    return { valid: false, error: "Missing fmt chunk in WAV file" };
  }

  const audioFormat = buffer.readUInt16LE(fmtOffset + 8);
  const numChannels = buffer.readUInt16LE(fmtOffset + 10);
  const sampleRate = buffer.readUInt32LE(fmtOffset + 12);
  const bitsPerSample = buffer.readUInt16LE(fmtOffset + 22);

  if (audioFormat !== 1) {
    return {
      valid: false,
      error: `Unsupported audio format: ${audioFormat} (expected 1 for PCM)`,
    };
  }

  if (numChannels !== 1) {
    return {
      valid: false,
      error: `Unsupported channels: ${numChannels} (expected 1 for Mono)`,
    };
  }

  if (
    sampleRate !== 24000 &&
    sampleRate !== 16000 &&
    sampleRate !== 48000 &&
    sampleRate !== 8000 &&
    sampleRate !== 44100
  ) {
    return { valid: false, error: `Unusual sample rate: ${sampleRate}` };
  }

  let dataOffset = -1;
  for (let i = 12; i < buffer.length - 8; i++) {
    if (buffer.toString("ascii", i, i + 4) === "data") {
      dataOffset = i;
      break;
    }
  }

  if (dataOffset === -1) {
    return { valid: false, error: "Missing data chunk in WAV file" };
  }

  const dataSize = buffer.readUInt32LE(dataOffset + 4);
  if (dataSize <= 0) {
    return { valid: false, error: "WAV data size is zero or negative" };
  }

  const durationSeconds =
    dataSize / (sampleRate * numChannels * (bitsPerSample / 8));
  if (durationSeconds <= 0) {
    return { valid: false, error: "Invalid duration <= 0" };
  }

  const analysis = analyzeAudioSignal(buffer, sampleRate);
  if (analysis.isSilence) {
    return { valid: false, error: "WAV file contains only silence" };
  }
  if (analysis.isTone) {
    return {
      valid: false,
      error: `WAV file is a detected sine tone placeholder: ${analysis.reasons.join(", ")}`,
    };
  }

  return { valid: true, durationSeconds };
}

// Caches for file stats and buffers to speed up repeated checks
const statsCache: Record<string, fs.Stats> = {};
const bufferCache: Record<string, Buffer> = {};

function updateProgressMarkdown(state: AudioGenerationState) {
  let md = `# Audio Generation Progress Report\n\n`;
  md += `*Updated at: ${state.updatedAt}*\n\n`;
  md += `| # | Semantic Key | Script Path | WAV Path | Status | Script Hash | Generated At | Last Error |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;

  const items = Object.values(state.items);
  items.forEach((item, idx) => {
    const errorStr = item.lastError
      ? item.lastError.replace(/\r?\n/g, " ")
      : "";
    md += `| ${idx + 1} | \`${item.semanticKey}\` | \`${item.scriptPath}\` | \`${item.wavPath}\` | **${item.status}** | \`${item.scriptSha256.substring(0, 8)}\` | ${item.lastGeneratedAt || "N/A"} | ${errorStr} |\n`;
  });

  fs.mkdirSync(path.dirname(progressFilePath), { recursive: true });
  fs.writeFileSync(progressFilePath, md, "utf-8");
}

function updateManifest(state: AudioGenerationState) {
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

  // Copy and register SFX files
  const sfxSrcDir = path.resolve(
    process.cwd(),
    "artifacts/audio/candidates/sfx",
  );
  const sfxDestDir = path.join(publicAudioDir, "sfx");
  const sfxMappings = [
    { key: "global.sfx.correct", file: "correct.wav" },
    { key: "global.sfx.incorrect", file: "retry.wav" },
    { key: "global.sfx.completion", file: "completion.wav" },
    { key: "global.sfx.selection", file: "selection.wav" },
    { key: "global.sfx.transition", file: "transition.wav" },
  ];

  if (fs.existsSync(sfxSrcDir)) {
    fs.mkdirSync(sfxDestDir, { recursive: true });
    for (const mapping of sfxMappings) {
      const srcPath = path.join(sfxSrcDir, mapping.file);
      const destPath = path.join(sfxDestDir, mapping.file);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        const validation = validateWavFile(destPath);
        if (validation.valid) {
          assets[mapping.key] = {
            src: `/audio/v1/sfx/${mapping.file}`,
            category: "sfx",
            sha256: sha256File(destPath),
            durationSeconds: parseFloat(
              (validation.durationSeconds || 0).toFixed(3),
            ),
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

function isQuotaError(err: any): boolean {
  const errMsg = err.message || "";
  return (
    errMsg.includes("429") ||
    errMsg.includes("Quota exceeded") ||
    errMsg.includes("rateLimitExceeded")
  );
}

async function main() {
  console.log("🎙️ Initializing Script-First Resumable Audio Generation...");

  const model = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
  const voice = "Kore";

  // Load or Initialize State
  let state: AudioGenerationState = {
    version: 1,
    updatedAt: new Date().toISOString(),
    items: {},
  };
  if (fs.existsSync(stateFilePath)) {
    try {
      state = JSON.parse(fs.readFileSync(stateFilePath, "utf-8"));
    } catch {
      console.warn(
        "⚠️ Failed to parse existing state file, initializing fresh.",
      );
    }
  }

  // 1. Sync & Index Validation Phase (checks existing files for reuse/cache invalidation)
  let reusedCount = 0;
  for (const scriptDef of audioScripts) {
    const relativeBasePath = scriptDef.relativeBasePath;
    const txtPath = `public/audio/v1/${relativeBasePath}.txt`;
    const wavPath = `public/audio/v1/${relativeBasePath}.wav`;

    const fullTxtPath = path.resolve(process.cwd(), txtPath);
    const fullWavPath = path.resolve(process.cwd(), wavPath);

    if (!fs.existsSync(fullTxtPath)) {
      console.error(
        `❌ Script file missing for semantic key: ${scriptDef.semanticKey}. Run pnpm audio:scripts:sync first.`,
      );
      process.exit(1);
    }

    const scriptText = fs
      .readFileSync(fullTxtPath, "utf-8")
      .replace(/\r\n/g, "\n");
    const scriptSha = sha256(scriptText);
    const configSha = sha256(model + voice + scriptDef.deliveryProfile + "1");

    let existingItem = state.items[scriptDef.semanticKey];

    // Check if expected WAV is already valid and matching hashes
    let expectedWavValid = false;
    let duration = 0;
    if (fs.existsSync(fullWavPath)) {
      const validation = validateWavFile(fullWavPath);
      if (validation.valid) {
        expectedWavValid = true;
        duration = validation.durationSeconds || 0;
      }
    }

    if (
      expectedWavValid &&
      existingItem &&
      existingItem.status === "GENERATED" &&
      existingItem.scriptSha256 === scriptSha &&
      existingItem.generationConfigSha256 === configSha
    ) {
      // Perfect match, skip
      continue;
    }

    // Try to recover a valid WAV from the previous masters directory
    const oldWavName = `${scriptDef.semanticKey}.wav`;
    const oldWavPath = path.join(oldMastersDir, oldWavName);

    if (fs.existsSync(oldWavPath) && fs.statSync(oldWavPath).size >= 44) {
      // Reusable non-silent WAV found! Let's copy it to the new path
      fs.mkdirSync(path.dirname(fullWavPath), { recursive: true });
      fs.copyFileSync(oldWavPath, fullWavPath);

      const validation = validateWavFile(fullWavPath);
      if (validation.valid) {
        const fileHash = sha256File(fullWavPath);
        state.items[scriptDef.semanticKey] = {
          semanticKey: scriptDef.semanticKey,
          scriptPath: txtPath,
          wavPath: wavPath,
          scriptSha256: scriptSha,
          generationConfigSha256: configSha,
          wavSha256: fileHash,
          status: "GENERATED",
          model,
          voice,
          durationSeconds: parseFloat(
            (validation.durationSeconds || 0).toFixed(3),
          ),
          lastGeneratedAt: new Date().toISOString(),
        };
        reusedCount++;
        continue;
      }
    }

    // Otherwise, mark as SCRIPT_READY for fresh synthesis
    state.items[scriptDef.semanticKey] = {
      semanticKey: scriptDef.semanticKey,
      scriptPath: txtPath,
      wavPath: wavPath,
      scriptSha256: scriptSha,
      generationConfigSha256: configSha,
      status:
        existingItem && existingItem.status === "REGENERATION_REQUIRED"
          ? "REGENERATION_REQUIRED"
          : "SCRIPT_READY",
    };
  }

  state.updatedAt = new Date().toISOString();
  writeJsonAtomic(stateFilePath, state);
  updateProgressMarkdown(state);
  updateManifest(state);

  if (reusedCount > 0) {
    console.log(
      `♻️ Successfully migrated and reused ${reusedCount} existing WAV files!`,
    );
  }

  // 2. Generation Loop
  const provider = new GoogleGeminiSpeechProvider();
  const itemsToGenerate = Object.values(state.items).filter(
    (item) => item.status !== "GENERATED",
  );

  if (itemsToGenerate.length === 0) {
    console.log("⭐ All audio files are up to date! Nothing to generate.");
    return;
  }

  console.log(
    `🔊 Starting generation for ${itemsToGenerate.length} pending audio items...`,
  );

  for (let idx = 0; idx < itemsToGenerate.length; idx++) {
    const item = itemsToGenerate[idx];
    const scriptDef = audioScripts.find(
      (s) => s.semanticKey === item.semanticKey,
    )!;

    const fullTxtPath = path.resolve(process.cwd(), item.scriptPath);
    const fullWavPath = path.resolve(process.cwd(), item.wavPath);
    const tempWavPath = fullWavPath + ".tmp";

    const scriptText = fs.readFileSync(fullTxtPath, "utf-8");

    console.log(
      `[${idx + 1}/${itemsToGenerate.length}] Synthesizing key: ${item.semanticKey}...`,
    );

    // Set state to GENERATING
    item.status = "GENERATING";
    state.updatedAt = new Date().toISOString();
    writeJsonAtomic(stateFilePath, state);

    const contentKind = scriptDef.category.endsWith("feedback")
      ? "feedback"
      : "educational";

    try {
      // Call Google Gemini TTS synthesis
      await provider.synthesize(
        scriptText,
        voice,
        "normal_educational", // SpeedRate parameter
        tempWavPath,
        model,
        contentKind,
      );

      // Validate temporary WAV
      const validation = validateWavFile(tempWavPath);
      if (!validation.valid) {
        throw new Error(`WAV validation failed: ${validation.error}`);
      }

      // Atomic replace
      if (fs.existsSync(fullWavPath)) {
        fs.unlinkSync(fullWavPath);
      }
      fs.renameSync(tempWavPath, fullWavPath);

      // Update state
      const finalHash = sha256File(fullWavPath);
      item.status = "GENERATED";
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
      updateProgressMarkdown(state);
      updateManifest(state);

      console.log(`  -> Success! Duration: ${item.durationSeconds}s`);

      // Throttle to respect API rate limits
      const intervalMs = process.env.GEMINI_MIN_INTERVAL_MS
        ? parseInt(process.env.GEMINI_MIN_INTERVAL_MS)
        : 10000;
      console.log(`  -> Pacing: sleeping for ${intervalMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    } catch (err: any) {
      if (fs.existsSync(tempWavPath)) {
        fs.unlinkSync(tempWavPath);
      }

      console.error(
        `  ❌ Failed to generate key "${item.semanticKey}". Error: ${err.message}`,
      );

      if (isQuotaError(err) || err.message.includes("429")) {
        item.status = "FAILED_QUOTA";
        item.lastError = `Quota limit hit: ${err.message}`;
        state.updatedAt = new Date().toISOString();
        writeJsonAtomic(stateFilePath, state);
        updateProgressMarkdown(state);

        console.warn(
          "\n⚠️ Quota Limit Exceeded. Saved state and progress. Exiting safely.",
        );
        process.exitCode = 1;
        return;
      } else {
        // Transient/Permanent failures
        item.status = "FAILED_PERMANENT";
        item.lastError = err.message;
        state.updatedAt = new Date().toISOString();
        writeJsonAtomic(stateFilePath, state);
        updateProgressMarkdown(state);
      }
    }
  }

  updateManifest(state);
  console.log("🎉 Resumable generation run completed!");
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("generate-audio-from-scripts.ts")
) {
  main().catch((err) => {
    console.error("❌ Process failed:", err);
    process.exit(1);
  });
}
