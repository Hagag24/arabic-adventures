/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { audioScripts } from "../../../src/audio/content/audio-script-index";

const publicAudioDir = path.resolve(process.cwd(), "public/audio/v1");
const reportsDir = path.resolve(process.cwd(), "development/audio/reports");

// Helper to recursively find all files in a directory
function getAllFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

function hasNullBytes(str: string): boolean {
  return str.includes("\0");
}

function hasEnglishPerformanceInstructions(str: string): boolean {
  // Checks for performance cues like [happy], (excited), voice: etc.
  return (
    /[\(\[][a-zA-Z\s]+[\)\]]/g.test(str) ||
    /\bvoice\b/i.test(str) ||
    /\bspeaker\b/i.test(str)
  );
}

function main() {
  console.log("🔍 Running Audio Script Validation...");
  fs.mkdirSync(reportsDir, { recursive: true });

  const errors: string[] = [];
  const warnings: string[] = [];

  const seenKeys = new Set<string>();
  const seenPaths = new Set<string>();

  // 1. Validate Canonical Index
  for (const scriptDef of audioScripts) {
    // Duplicate Key
    if (seenKeys.has(scriptDef.semanticKey)) {
      errors.push(
        `Duplicate semantic key in index: "${scriptDef.semanticKey}"`,
      );
    }
    seenKeys.add(scriptDef.semanticKey);

    // Conflicting Relative Path
    const relPath = scriptDef.relativeBasePath.toLowerCase();
    if (seenPaths.has(relPath)) {
      errors.push(
        `Conflicting relative path in index: "${scriptDef.relativeBasePath}"`,
      );
    }
    seenPaths.add(relPath);

    // No review or audition variant in production index
    if (
      scriptDef.semanticKey.includes("review") ||
      scriptDef.semanticKey.includes("audition")
    ) {
      errors.push(
        `Production index contains review/audition key: "${scriptDef.semanticKey}"`,
      );
    }

    // Check TXT File
    const txtPath = path.join(
      publicAudioDir,
      `${scriptDef.relativeBasePath}.txt`,
    );
    if (!fs.existsSync(txtPath)) {
      errors.push(
        `Missing TXT file for key "${scriptDef.semanticKey}": expected at "${txtPath}"`,
      );
      continue;
    }

    try {
      const content = fs.readFileSync(txtPath, "utf-8");

      // Non-empty check
      if (content.trim().length === 0) {
        errors.push(`Empty TXT file: "${txtPath}"`);
      }

      // Null bytes check
      if (hasNullBytes(content)) {
        errors.push(`Null bytes detected in TXT: "${txtPath}"`);
      }

      // Control characters check (except standard line endings \r, \n, \t)
      const hasControlChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g.test(content);
      if (hasControlChars) {
        errors.push(`Control characters detected in TXT: "${txtPath}"`);
      }

      // English performance instructions check
      if (hasEnglishPerformanceInstructions(content)) {
        errors.push(
          `English performance instructions detected in TXT: "${txtPath}" ("${content}")`,
        );
      }
    } catch (err: any) {
      errors.push(
        `Failed to read TXT file: "${txtPath}". Error: ${err.message}`,
      );
    }
  }

  // 2. Validate Filesystem vs Index
  const allFilesInV1 = getAllFiles(publicAudioDir);
  const indexedPaths = new Set(
    audioScripts.map((s) =>
      path.join(publicAudioDir, `${s.relativeBasePath}.txt`).toLowerCase(),
    ),
  );
  const indexedWavPaths = new Set(
    audioScripts.map((s) =>
      path.join(publicAudioDir, `${s.relativeBasePath}.wav`).toLowerCase(),
    ),
  );

  for (const filePath of allFilesInV1) {
    const ext = path.extname(filePath).toLowerCase();
    const relativePathFromV1 = path
      .relative(publicAudioDir, filePath)
      .replace(/\\/g, "/");

    // Skip manifest file
    if (relativePathFromV1 === "audio-manifest.json") continue;

    // WAV without a known script / Script outside canonical index
    if (ext === ".txt") {
      if (!indexedPaths.has(filePath.toLowerCase())) {
        errors.push(
          `TXT script outside canonical index: "${relativePathFromV1}"`,
        );
      }
    } else if (ext === ".wav") {
      if (!indexedWavPaths.has(filePath.toLowerCase())) {
        warnings.push(
          `Orphan WAV file (no matching script in index): "${relativePathFromV1}"`,
        );
      }
    } else {
      // Non-txt, non-wav files (like old mp3 files, we can just warn about them)
      warnings.push(
        `Extraneous file type in production audio dir: "${relativePathFromV1}"`,
      );
    }
  }

  // Compile JSON Report
  const jsonReport = {
    timestamp: new Date().toISOString(),
    valid: errors.length === 0,
    stats: {
      totalIndexedScripts: audioScripts.length,
      errorsCount: errors.length,
      warningsCount: warnings.length,
    },
    errors,
    warnings,
  };

  const jsonPath = path.join(reportsDir, "audio-script-validation.json");
  fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2), "utf-8");

  // Compile Markdown Report
  let mdReport = `# Audio Script Validation Report\n\n`;
  mdReport += `- **Timestamp**: ${jsonReport.timestamp}\n`;
  mdReport += `- **Status**: ${jsonReport.valid ? "✅ PASSED" : "❌ FAILED"}\n`;
  mdReport += `- **Total Indexed Scripts**: ${jsonReport.stats.totalIndexedScripts}\n`;
  mdReport += `- **Errors**: ${jsonReport.stats.errorsCount}\n`;
  mdReport += `- **Warnings**: ${jsonReport.stats.warningsCount}\n\n`;

  if (errors.length > 0) {
    mdReport += `## ❌ Critical Validation Errors (${errors.length})\n\n`;
    for (const err of errors) {
      mdReport += `- ${err}\n`;
    }
    mdReport += `\n`;
  } else {
    mdReport += `## ✅ No Critical Errors Found\n\n`;
  }

  if (warnings.length > 0) {
    mdReport += `## ⚠️ Warnings (${warnings.length})\n\n`;
    for (const warn of warnings) {
      mdReport += `- ${warn}\n`;
    }
  }

  const mdPath = path.join(reportsDir, "audio-script-validation.md");
  fs.writeFileSync(mdPath, mdReport, "utf-8");

  console.log(`\n📊 VALIDATION REPORT SUMMARY:`);
  console.log(`- Errors: ${errors.length}`);
  console.log(`- Warnings: ${warnings.length}`);
  console.log(`- JSON report saved to: ${jsonPath}`);
  console.log(`- Markdown report saved to: ${mdPath}`);

  if (errors.length > 0) {
    console.error("❌ Audio script validation failed!");
    process.exit(1);
  } else {
    console.log("⭐ Audio script validation passed successfully!");
  }
}

main();
