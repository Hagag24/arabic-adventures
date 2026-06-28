import fs from "fs";
import path from "path";
import crypto from "crypto";
import { audioScripts } from "../../../src/audio/content/audio-script-index";
import { analyzeAudioSignal } from "./generate-audio-from-scripts";

const publicAudioDir = path.resolve(process.cwd(), "public/audio/v1");
const mastersDir = path.resolve(process.cwd(), "artifacts/audio/production/masters");
const stateFilePath = path.resolve(process.cwd(), "artifacts/audio/state/audio-generation-state.json");
const manifestPath = path.resolve(publicAudioDir, "audio-manifest.json");

const reportJsonPath = path.resolve(process.cwd(), "development/audio/reports/fake-tone-audit.json");
const reportMdPath = path.resolve(process.cwd(), "development/audio/reports/fake-tone-audit.md");

const timestamp = "20260627_192004";
const quarantineDir = path.resolve(process.cwd(), `development/audio/quarantine/fake-placeholders-${timestamp}`);

type AuditRecord = {
  semanticKey: string;
  classification:
    | "REAL_GEMINI_SPEECH"
    | "INTENTIONAL_SFX"
    | "FAKE_TONE_PLACEHOLDER"
    | "SILENT_PLACEHOLDER"
    | "NEAR_SILENT_INVALID"
    | "MISSING"
    | "CORRUPT"
    | "UNKNOWN_REQUIRES_INSPECTION";
  scriptPath: string;
  wavPath: string;
  durationSeconds: number;
  sizeBytes: number;
  sha256: string;
  maximumAmplitude: number;
  rmsLevel: number;
  dominantFrequency: number;
  spectralPurity: number;
  manifestEntryPresent: boolean;
  generationStatus: string;
  classificationReasons: string[];
};



function sha256File(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

async function runAudit() {
  console.log("🔍 Starting Fake Asset Audit...");

  // Load state and manifest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let state: { items: Record<string, any> } = { items: {} };
  if (fs.existsSync(stateFilePath)) {
    state = JSON.parse(fs.readFileSync(stateFilePath, "utf-8"));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let manifest: { assets: Record<string, any> } = { assets: {} };
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  }
  const assets = manifest.assets || manifest;

  const records: AuditRecord[] = [];
  const sfxKeys = [
    "global.sfx.correct",
    "global.sfx.incorrect",
    "global.sfx.completion",
    "global.sfx.selection",
    "global.sfx.transition",
    "global.sfx.lesson-complete.01",
  ];

  // 1. Audit Canonical Speech keys (250 items)
  for (const scriptDef of audioScripts) {
    const relativeBasePath = scriptDef.relativeBasePath;
    const txtPath = `public/audio/v1/${relativeBasePath}.txt`;
    const wavPath = `public/audio/v1/${relativeBasePath}.wav`;

    const fullWavPath = path.resolve(process.cwd(), wavPath);
    const masterWavPath = path.join(mastersDir, `${scriptDef.semanticKey}.wav`);

    const manifestEntryPresent = !!assets[scriptDef.semanticKey];
    const itemState = state.items[scriptDef.semanticKey];
    const generationStatus = itemState ? itemState.status : "PENDING";

    // Locate active wav file (public path first, then master path)
    let activeWavPath = "";
    if (fs.existsSync(fullWavPath)) {
      activeWavPath = fullWavPath;
    } else if (fs.existsSync(masterWavPath)) {
      activeWavPath = masterWavPath;
    }

    if (!activeWavPath) {
      records.push({
        semanticKey: scriptDef.semanticKey,
        classification: "MISSING",
        scriptPath: txtPath,
        wavPath: wavPath,
        durationSeconds: 0,
        sizeBytes: 0,
        sha256: "",
        maximumAmplitude: 0,
        rmsLevel: 0,
        dominantFrequency: 0,
        spectralPurity: 0,
        manifestEntryPresent,
        generationStatus,
        classificationReasons: ["No WAV file found in public directory or masters directory"],
      });
      continue;
    }

    try {
      const buffer = fs.readFileSync(activeWavPath);
      const sizeBytes = buffer.length;
      const fileHash = sha256File(activeWavPath);

      // Read sample rate from WAV header (offset 24)
      const sampleRate = buffer.readUInt32LE(24);

      // Perform signal analysis
      const analysis = analyzeAudioSignal(buffer, sampleRate);
      let classification: AuditRecord["classification"] = "REAL_GEMINI_SPEECH";
      const reasons: string[] = [];

      if (analysis.isSilence) {
        classification = "SILENT_PLACEHOLDER";
        reasons.push("Signal analysis detected 100% silence (amplitude < 100)");
      } else if (analysis.isTone) {
        classification = "FAKE_TONE_PLACEHOLDER";
        reasons.push(...analysis.reasons);
      } else if (analysis.maxAmplitude < 150) {
        classification = "NEAR_SILENT_INVALID";
        reasons.push(`Amplitude is very low (${analysis.maxAmplitude} < 150)`);
      } else {
        reasons.push("Valid dynamic audio signal");
      }

      // Check state failure history
      if (itemState && itemState.status === "FAILED_QUOTA") {
        reasons.push("State history recorded a quota limit failure for this key");
      }

      // Extract duration from header
      const dataSize = buffer.readUInt32LE(40);
      const durationSeconds = dataSize / (sampleRate * 1 * 2); // mono 16-bit

      records.push({
        semanticKey: scriptDef.semanticKey,
        classification,
        scriptPath: txtPath,
        wavPath: activeWavPath.replace(process.cwd() + path.sep, "").replace(/\\/g, "/"),
        durationSeconds: parseFloat(durationSeconds.toFixed(3)),
        sizeBytes,
        sha256: fileHash,
        maximumAmplitude: analysis.maxAmplitude,
        rmsLevel: parseFloat(analysis.rmsLevel.toFixed(3)),
        dominantFrequency: analysis.dominantFrequency,
        spectralPurity: parseFloat(analysis.spectralPurity.toFixed(3)),
        manifestEntryPresent,
        generationStatus,
        classificationReasons: reasons,
      });
    } catch (err: unknown) {
      records.push({
        semanticKey: scriptDef.semanticKey,
        classification: "CORRUPT",
        scriptPath: txtPath,
        wavPath: activeWavPath.replace(process.cwd() + path.sep, "").replace(/\\/g, "/"),
        durationSeconds: 0,
        sizeBytes: 0,
        sha256: "",
        maximumAmplitude: 0,
        rmsLevel: 0,
        dominantFrequency: 0,
        spectralPurity: 0,
        manifestEntryPresent,
        generationStatus,
        classificationReasons: [`Failed to parse WAV header or analyze buffer: ${(err as any).message}`],
      });
    }
  }

  // 2. Audit intentional SFX keys (5 items)
  for (const sfxKey of sfxKeys) {
    const sfxMapping: Record<string, string> = {
      "global.sfx.correct": "correct.wav",
      "global.sfx.incorrect": "retry.wav",
      "global.sfx.completion": "completion.wav",
      "global.sfx.selection": "selection.wav",
      "global.sfx.transition": "transition.wav",
      "global.sfx.lesson-complete.01": "lesson-complete.01.wav",
    };
    const fileName = sfxMapping[sfxKey];
    const sfxPath = `public/audio/v1/sfx/${fileName}`;
    const fullSfxPath = path.resolve(process.cwd(), sfxPath);
    const manifestEntryPresent = !!assets[sfxKey];

    if (!fs.existsSync(fullSfxPath)) {
      records.push({
        semanticKey: sfxKey,
        classification: "MISSING",
        scriptPath: "SFX (No script text)",
        wavPath: sfxPath,
        durationSeconds: 0,
        sizeBytes: 0,
        sha256: "",
        maximumAmplitude: 0,
        rmsLevel: 0,
        dominantFrequency: 0,
        spectralPurity: 0,
        manifestEntryPresent,
        generationStatus: "SFX",
        classificationReasons: ["SFX audio file is missing on disk"],
      });
      continue;
    }

    const buffer = fs.readFileSync(fullSfxPath);
    const sampleRate = buffer.readUInt32LE(24);
    const analysis = analyzeAudioSignal(buffer, sampleRate);

    records.push({
      semanticKey: sfxKey,
      classification: "INTENTIONAL_SFX",
      scriptPath: "SFX (No script text)",
      wavPath: sfxPath,
      durationSeconds: parseFloat((buffer.length / (sampleRate * 2)).toFixed(3)),
      sizeBytes: buffer.length,
      sha256: sha256File(fullSfxPath),
      maximumAmplitude: analysis.maxAmplitude,
      rmsLevel: analysis.rmsLevel,
      dominantFrequency: analysis.dominantFrequency,
      spectralPurity: 1.0,
      manifestEntryPresent,
      generationStatus: "SFX",
      classificationReasons: ["Intentional UI sound effect"],
    });
  }

  // 3. Perform Quarantine of confirmed invalid files
  let quarantinedCount = 0;
  const quarantinedKeys: string[] = [];

  for (const record of records) {
    if (
      record.classification === "FAKE_TONE_PLACEHOLDER" ||
      record.classification === "SILENT_PLACEHOLDER" ||
      record.classification === "NEAR_SILENT_INVALID"
    ) {
      const fullPath = path.resolve(process.cwd(), record.wavPath);
      const masterPath = path.join(mastersDir, `${record.semanticKey}.wav`);

      // Create quarantine dir
      fs.mkdirSync(quarantineDir, { recursive: true });

      // Move public WAV file if exists
      if (fs.existsSync(fullPath)) {
        const dest = path.join(quarantineDir, path.basename(fullPath));
        fs.renameSync(fullPath, dest);
      }
      // Move master WAV file if exists
      if (fs.existsSync(masterPath)) {
        const dest = path.join(quarantineDir, path.basename(masterPath));
        fs.renameSync(masterPath, dest);
      }

      // Remove from manifest
      if (assets[record.semanticKey]) {
        delete assets[record.semanticKey];
      }

      // Update state file to FAILED_QUOTA
      state.items[record.semanticKey] = {
        semanticKey: record.semanticKey,
        scriptPath: record.scriptPath,
        wavPath: `public/audio/v1/${record.wavPath.replace("public/audio/v1/", "")}`,
        scriptSha256: state.items[record.semanticKey]?.scriptSha256 || "",
        generationConfigSha256: state.items[record.semanticKey]?.generationConfigSha256 || "",
        status: "FAILED_QUOTA",
        lastError: "Quarantined: file was classified as a fake tone placeholder during audit.",
      };

      quarantinedCount++;
      quarantinedKeys.push(record.semanticKey);
    }
  }

  // Save manifest and state
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), "utf-8");

  // Rebuild the progress progress report md as well
  let progressMd = `# Audio Generation Progress Report\n\n`;
  progressMd += `*Updated at: ${new Date().toISOString()}*\n\n`;
  progressMd += `| # | Semantic Key | Script Path | WAV Path | Status | Script Hash | Generated At | Last Error |\n`;
  progressMd += `|---|---|---|---|---|---|---|---|\n`;

  Object.values(state.items as Record<string, Record<string, string>>).forEach((item, idx: number) => {
    const errorStr = item.lastError ? item.lastError.replace(/\r?\n/g, " ") : "";
    progressMd += `| ${idx + 1} | \`${item.semanticKey}\` | \`${item.scriptPath}\` | \`${item.wavPath}\` | **${item.status}** | \`${item.scriptSha256.substring(0, 8)}\` | ${item.lastGeneratedAt || "N/A"} | ${errorStr} |\n`;
  });
  const progressPath = path.resolve(process.cwd(), "docs/AUDIO_GENERATION_PROGRESS.md");
  fs.writeFileSync(progressPath, progressMd, "utf-8");

  // 4. Generate Reports
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, JSON.stringify(records, null, 2), "utf-8");

  // Markdown Report
  let md = `# Fake Audio Asset Audit Report\n\n`;
  md += `*Audit execution date: ${new Date().toISOString()}*\n`;
  md += `*Quarantine Folder: \`development/audio/quarantine/fake-placeholders-${timestamp}/\`*\n\n`;

  md += `### Audit Summary\n`;
  const summary: Record<string, number> = {};
  records.forEach((r) => {
    summary[r.classification] = (summary[r.classification] || 0) + 1;
  });

  md += `| Classification | Count |\n`;
  md += `|---|---|\n`;
  Object.entries(summary).forEach(([key, val]) => {
    md += `| **${key}** | ${val} |\n`;
  });

  md += `\n### Detailed Records\n\n`;
  md += `| Semantic Key | Classification | Size (bytes) | Max Amp | Dominant Freq | Status | Reasons |\n`;
  md += `|---|---|---|---|---|---|---|\n`;

  records.forEach((r) => {
    md += `| \`${r.semanticKey}\` | **${r.classification}** | ${r.sizeBytes} | ${r.maximumAmplitude} | ${r.dominantFrequency} Hz | \`${r.generationStatus}\` | ${r.classificationReasons.join("; ")} |\n`;
  });

  fs.writeFileSync(reportMdPath, md, "utf-8");

  console.log(`\n🎉 Audit completed!`);
  console.log(`- Inspected keys: ${records.length}`);
  console.log(`- Quarantined: ${quarantinedCount} fake placeholders`);
  console.log(`- Reports written to:`);
  console.log(`  -> JSON: ${reportJsonPath}`);
  console.log(`  -> Markdown: ${reportMdPath}`);
}

runAudit().catch((err) => {
  console.error("❌ Audit failed:", err);
  process.exit(1);
});
