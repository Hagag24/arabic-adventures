import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import {
  AUDITION_PHRASES,
  VOICES,
  STYLES,
  SFX_KEYS,
} from "./audition-definition";

const CANDIDATES_DIR = path.resolve(
  process.cwd(),
  "artifacts/audio/candidates",
);
const STAGING_DIR = path.resolve(process.cwd(), "artifacts/audio/.staging");
const REVIEW_DIR = path.resolve(process.cwd(), "artifacts/audio/review");
const REPORTS_DIR = path.resolve(process.cwd(), "artifacts/audio/reports");
const BACKUPS_DIR = path.resolve(process.cwd(), "artifacts/audio/backups");
const QUARANTINE_DIR = path.resolve(
  process.cwd(),
  "artifacts/audio/quarantine",
);

const AUDIT_JSON = path.join(REPORTS_DIR, "candidate-integrity-audit.json");
const AUDIT_MD = path.join(REPORTS_DIR, "candidate-integrity-audit.md");
const QUARANTINE_JSON = path.join(REPORTS_DIR, "quarantine-report.json");
const LOUDNESS_JSON = path.join(REPORTS_DIR, "loudness-analysis.json");

interface AuditItem {
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
  wavHash: string;
  mp3Hash: string;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  codecWav: string;
  codecMp3: string;
  normalizationStatus: "PASSED" | "FAILED" | "NOT_RUN";
  status:
    | "VALID"
    | "MISSING"
    | "CORRUPT"
    | "WRONG_MAPPING"
    | "METADATA_TEXT_MISMATCH"
    | "DUPLICATE_AUDIO_HASH"
    | "UNSUPPORTED_METADATA"
    | "REQUIRES_HUMAN_LISTENING";
  details?: string;
}

// 1. RECURSIVE BACKUP FUNCTION
function countFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(fullPath);
    } else {
      count++;
    }
  }
  return count;
}

function copyDirRecursive(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function performBackup(timestamp: string) {
  const backupName = `review-cleanup-${timestamp}`;
  const destBase = path.join(BACKUPS_DIR, backupName);

  console.log(`Starting backup under ${destBase}...`);
  const dirsToBackup = [
    { name: "candidates", path: CANDIDATES_DIR },
    { name: ".staging", path: STAGING_DIR },
    { name: "review", path: REVIEW_DIR },
    { name: "reports", path: REPORTS_DIR },
  ];

  let totalFiles = 0;
  const reportDetails: Record<string, number> = {};

  for (const item of dirsToBackup) {
    if (fs.existsSync(item.path)) {
      const fileCount = countFiles(item.path);
      console.log(`Backing up ${item.name} (${fileCount} files)...`);
      copyDirRecursive(item.path, path.join(destBase, item.name));
      reportDetails[item.name] = fileCount;
      totalFiles += fileCount;
    }
  }

  console.log(`Backup completed. Total files backed up: ${totalFiles}`);
  return { destBase, totalFiles, reportDetails };
}

// 2. FFPROBE UTILITY
function probeAudio(filePath: string) {
  try {
    const probe = execSync(
      `ffprobe -v error -show_entries stream=codec_name,sample_rate,channels,duration -of json "${filePath}"`,
      { encoding: "utf8" },
    );
    const data = JSON.parse(probe);
    const stream = data.streams?.[0] || {};
    return {
      codec: stream.codec_name || "unknown",
      sampleRate: parseInt(stream.sample_rate || "0", 10),
      channels: parseInt(stream.channels || "0", 10),
      duration: parseFloat(stream.duration || "0"),
    };
  } catch {
    return null;
  }
}

function getSha256(filePath: string): string {
  if (!fs.existsSync(filePath)) return "";
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // 1. Perform safe backup
  const backupInfo = performBackup(timestamp);

  // 2. Load existing loudness normalization analysis report if present
  let loudnessAnalysis: Record<string, Record<string, unknown>> = {};
  if (fs.existsSync(LOUDNESS_JSON)) {
    try {
      loudnessAnalysis = JSON.parse(
        fs.readFileSync(LOUDNESS_JSON, "utf-8"),
      ) as Record<string, Record<string, unknown>>;
    } catch {
      console.warn("Could not parse loudness-analysis.json");
    }
  }

  // 3. Build expected candidate list (64 total)
  const auditItems: AuditItem[] = [];
  const expectedFilePaths = new Set<string>();

  for (const phrase of AUDITION_PHRASES) {
    for (const voice of VOICES) {
      for (const style of STYLES) {
        const candidateId = `${phrase.semanticKey}::${voice}::${style}`;
        const relativeWav = `${voice}/${style}/masters/${phrase.semanticKey}.wav`;
        const relativeMp3 = `${voice}/${style}/delivery/${phrase.semanticKey}.mp3`;
        const expectedWavPath = path.join(CANDIDATES_DIR, relativeWav);
        const expectedMp3Path = path.join(CANDIDATES_DIR, relativeMp3);

        expectedFilePaths.add(path.normalize(expectedWavPath));
        expectedFilePaths.add(path.normalize(expectedMp3Path));

        const wavExists = fs.existsSync(expectedWavPath);
        const mp3Exists = fs.existsSync(expectedMp3Path);

        const wavSize = wavExists ? fs.statSync(expectedWavPath).size : 0;
        const mp3Size = mp3Exists ? fs.statSync(expectedMp3Path).size : 0;

        let wavHash = "";
        let mp3Hash = "";
        let durationSeconds = 0;
        let sampleRate = 0;
        let channels = 0;
        let codecWav = "";
        let codecMp3 = "";

        let status: AuditItem["status"] = "VALID";
        let details = "";

        if (!wavExists || !mp3Exists) {
          status = "MISSING";
          details =
            `Missing: ${!wavExists ? "WAV" : ""} ${!mp3Exists ? "MP3" : ""}`.trim();
        } else if (wavSize <= 44 || mp3Size === 0) {
          status = "CORRUPT";
          details = "Empty or corrupted file size.";
        } else {
          // Probe files
          const wavProbe = probeAudio(expectedWavPath);
          const mp3Probe = probeAudio(expectedMp3Path);

          if (
            !wavProbe ||
            !mp3Probe ||
            wavProbe.duration <= 0 ||
            mp3Probe.duration <= 0
          ) {
            status = "CORRUPT";
            details = "Failed to probe file properties or duration is zero.";
          } else {
            durationSeconds = mp3Probe.duration;
            sampleRate = mp3Probe.sampleRate;
            channels = mp3Probe.channels;
            codecWav = wavProbe.codec;
            codecMp3 = mp3Probe.codec;

            // Validate codecs
            if (codecWav !== "pcm_s16le" && codecWav !== "pcm") {
              status = "CORRUPT";
              details = `Unsupported WAV codec: ${codecWav}`;
            } else if (codecMp3 !== "mp3" && codecMp3 !== "mpegaudio") {
              status = "CORRUPT";
              details = `Unsupported MP3 codec: ${codecMp3}`;
            }

            wavHash = getSha256(expectedWavPath);
            mp3Hash = getSha256(expectedMp3Path);
          }
        }

        // Normalization status lookup
        let normStatus: AuditItem["normalizationStatus"] = "NOT_RUN";
        const keyInReport = `${voice}/${style}/${phrase.semanticKey}.wav`;
        const relativeKeyInReport = `${voice}/${style}/masters/${phrase.semanticKey}.wav`;
        const loudnessRecord =
          loudnessAnalysis[keyInReport] ||
          loudnessAnalysis[relativeKeyInReport];
        if (loudnessRecord) {
          if (
            loudnessRecord.normalizationStatus === "ALREADY_COMPLIANT" ||
            loudnessRecord.normalizationStatus === "NORMALIZED_TWO_PASS" ||
            loudnessRecord.normalizationStatus === "PASSED"
          ) {
            normStatus = "PASSED";
          } else if (
            loudnessRecord.normalizationStatus ===
              "ERROR_DURING_NORMALIZATION" ||
            loudnessRecord.normalizationStatus === "FAILED"
          ) {
            normStatus = "FAILED";
          }
        }

        auditItems.push({
          candidateId,
          semanticKey: phrase.semanticKey,
          voice,
          style,
          expectedWavPath,
          expectedMp3Path,
          wavExists,
          mp3Exists,
          wavSize,
          mp3Size,
          wavHash,
          mp3Hash,
          durationSeconds,
          sampleRate,
          channels,
          codecWav,
          codecMp3,
          normalizationStatus: normStatus,
          status,
          details,
        });
      }
    }
  }

  // 4. Verify SFX (5 expected keys)
  interface SfxAuditItem {
    key: string;
    wavExists: boolean;
    mp3Exists: boolean;
    wavSize: number;
    mp3Size: number;
    duration: number;
    status: "VALID" | "INVALID";
  }
  const sfxAudit: SfxAuditItem[] = [];
  for (const sfxKey of SFX_KEYS) {
    const wavPath = path.join(CANDIDATES_DIR, "sfx", `${sfxKey}.wav`);
    const mp3Path = path.join(CANDIDATES_DIR, "sfx", `${sfxKey}.mp3`);
    expectedFilePaths.add(path.normalize(wavPath));
    expectedFilePaths.add(path.normalize(mp3Path));

    const wavExists = fs.existsSync(wavPath);
    const mp3Exists = fs.existsSync(mp3Path);
    const wavSize = wavExists ? fs.statSync(wavPath).size : 0;
    const mp3Size = mp3Exists ? fs.statSync(mp3Path).size : 0;

    let duration = 0;
    if (mp3Exists) {
      const probe = probeAudio(mp3Path);
      if (probe) duration = probe.duration;
    }

    sfxAudit.push({
      key: sfxKey,
      wavExists,
      mp3Exists,
      wavSize,
      mp3Size,
      duration,
      status:
        wavExists && mp3Exists && wavSize > 44 && mp3Size > 0
          ? "VALID"
          : "INVALID",
    });
  }

  // 5. Detect duplicate audio hashes across candidates
  const wavHashMap: Record<string, AuditItem[]> = {};
  for (const item of auditItems) {
    if (item.status === "VALID" && item.wavHash) {
      if (!wavHashMap[item.wavHash]) {
        wavHashMap[item.wavHash] = [];
      }
      wavHashMap[item.wavHash].push(item);
    }
  }

  const duplicateGroups: Array<{ hash: string; items: AuditItem[] }> = [];
  for (const hash of Object.keys(wavHashMap)) {
    if (wavHashMap[hash].length > 1) {
      duplicateGroups.push({ hash, items: wavHashMap[hash] });
      // Mark all of them as DUPLICATE_AUDIO_HASH initially
      for (const item of wavHashMap[hash]) {
        item.status = "DUPLICATE_AUDIO_HASH";
        item.details = "Audio hash matches another candidate file.";
      }
    }
  }

  // Quarantine lists
  const quarantineList: Array<{
    originalPath: string;
    quarantinePath: string;
    reason: string;
    size: number;
    sha256: string;
    timestamp: string;
  }> = [];

  // 6. Scan candidates directory for unexpected files (to quarantine)
  const unexpectedFiles: string[] = [];
  const walkCandidates = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkCandidates(fullPath);
      } else {
        const normPath = path.normalize(fullPath);
        if (!expectedFilePaths.has(normPath)) {
          unexpectedFiles.push(fullPath);
        }
      }
    }
  };
  walkCandidates(CANDIDATES_DIR);

  // 5. Resolve duplicate groups
  for (const group of duplicateGroups) {
    console.log(
      `Duplicate hash detected [${group.hash.substring(0, 8)}...] for candidates:`,
    );
    group.items.forEach((it) => console.log(`  - ${it.candidateId}`));

    // Identify the canonical item: voice = callirrhoe, style = normal-educational, and matches semantic key
    const canonical = group.items.find(
      (item) =>
        item.voice === "callirrhoe" &&
        item.style === "normal-educational" &&
        item.semanticKey === group.items[0].semanticKey,
    );

    for (const item of group.items) {
      if (canonical && item.candidateId === canonical.candidateId) {
        item.status = "VALID";
        item.details = "Canonical original candidate for this audio hash.";
      } else {
        item.status = "DUPLICATE_AUDIO_HASH";
        item.details = `Duplicate copy of audio from ${canonical ? canonical.candidateId : "fallback source"}.`;

        // Add duplicate files to unexpectedFiles so they get quarantined
        if (item.wavExists) {
          const normPath = path.normalize(item.expectedWavPath);
          if (!unexpectedFiles.includes(normPath)) {
            unexpectedFiles.push(item.expectedWavPath);
          }
          item.wavExists = false;
        }
        if (item.mp3Exists) {
          const normPath = path.normalize(item.expectedMp3Path);
          if (!unexpectedFiles.includes(normPath)) {
            unexpectedFiles.push(item.expectedMp3Path);
          }
          item.mp3Exists = false;
        }
      }
    }
  }

  // 7. Perform quarantine of unexpected files
  if (unexpectedFiles.length > 0) {
    const qDir = path.join(QUARANTINE_DIR, timestamp);
    fs.mkdirSync(qDir, { recursive: true });
    console.log(
      `Found ${unexpectedFiles.length} unexpected/orphaned files in candidates directory. Moving to quarantine...`,
    );

    for (const file of unexpectedFiles) {
      const relative = path.relative(CANDIDATES_DIR, file);
      const dest = path.join(qDir, relative);
      fs.mkdirSync(path.dirname(dest), { recursive: true });

      const size = fs.statSync(file).size;
      const sha256 = getSha256(file);

      fs.renameSync(file, dest);

      quarantineList.push({
        originalPath: file,
        quarantinePath: dest,
        reason: "Orphaned/unexpected file in candidates root.",
        size,
        sha256,
        timestamp: new Date().toISOString(),
      });
    }

    // Write quarantine report
    fs.writeFileSync(
      QUARANTINE_JSON,
      JSON.stringify(quarantineList, null, 2),
      "utf-8",
    );
    console.log(`Quarantine report saved to ${QUARANTINE_JSON}`);
  }

  // 8. Write Audit results
  const summary = {
    timestamp: new Date().toISOString(),
    backupDirectory: backupInfo.destBase,
    backupFileCount: backupInfo.totalFiles,
    quarantineCount: quarantineList.length,
    expectedSpeechCandidates: 64,
    actualSpeechCandidates: auditItems.length,
    validSpeechCandidates: auditItems.filter((i) => i.status === "VALID")
      .length,
    missingSpeechCandidates: auditItems.filter((i) => i.status === "MISSING")
      .length,
    corruptSpeechCandidates: auditItems.filter((i) => i.status === "CORRUPT")
      .length,
    wrongMappingSpeechCandidates: auditItems.filter(
      (i) => i.status === "WRONG_MAPPING",
    ).length,
    duplicateHashSpeechCandidates: auditItems.filter(
      (i) =>
        i.status === "DUPLICATE_AUDIO_HASH" ||
        i.status === "REQUIRES_HUMAN_LISTENING",
    ).length,
    sfxCount: sfxAudit.length,
    sfxValidCount: sfxAudit.filter((s) => s.status === "VALID").length,
  };

  const auditReport = {
    summary,
    candidates: auditItems,
    sfx: sfxAudit,
  };

  fs.mkdirSync(path.dirname(AUDIT_JSON), { recursive: true });
  fs.writeFileSync(AUDIT_JSON, JSON.stringify(auditReport, null, 2), "utf-8");
  console.log(`Audit report JSON saved to ${AUDIT_JSON}`);

  // Generate markdown report
  const mdLines = [
    "# Candidate Audio Integrity Audit Report",
    "",
    `Generated at: \`${summary.timestamp}\``,
    `Backup path: \`${summary.backupDirectory}\` (${summary.backupFileCount} files)`,
    `Quarantined files count: \`${summary.quarantineCount}\``,
    "",
    "## Summary Stats",
    "",
    `| Metric | Expected | Actual | Status |`,
    `| --- | --- | --- | --- |`,
    `| Speech Candidates | 64 | ${summary.actualSpeechCandidates} | ${summary.validSpeechCandidates === 64 ? "✔ PASS" : "❌ FAIL"} |`,
    `| Valid Candidates | 64 | ${summary.validSpeechCandidates} | - |`,
    `| Missing Candidates | 0 | ${summary.missingSpeechCandidates} | - |`,
    `| Corrupt Candidates | 0 | ${summary.corruptSpeechCandidates} | - |`,
    `| Duplicate Hash Candidates | 0 | ${summary.duplicateHashSpeechCandidates} | - |`,
    `| Sound Effects (SFX) | 5 | ${summary.sfxCount} | ${summary.sfxValidCount === 5 ? "✔ PASS" : "❌ FAIL"} |`,
    "",
    "## Detailed Candidates Breakdown",
    "",
    "| Candidate ID | WAV | MP3 | Status | Normalization | Details |",
    "| --- | --- | --- | --- | --- | --- |",
    ...auditItems.map(
      (item) =>
        `| \`${item.candidateId}\` | ${item.wavExists ? "✔" : "❌"} | ${item.mp3Exists ? "✔" : "❌"} | \`${item.status}\` | \`${item.normalizationStatus}\` | ${item.details || "-"} |`,
    ),
    "",
    "## Sound Effects Breakdown",
    "",
    "| SFX Key | WAV | MP3 | Duration | Status |",
    "| --- | --- | --- | --- | --- |",
    ...sfxAudit.map(
      (s) =>
        `| \`${s.key}\` | ${s.wavExists ? "✔" : "❌"} | ${s.mp3Exists ? "✔" : "❌"} | ${s.duration.toFixed(2)}s | \`${s.status}\` |`,
    ),
  ];

  fs.writeFileSync(AUDIT_MD, mdLines.join("\n"), "utf-8");
  console.log(`Audit report Markdown saved to ${AUDIT_MD}`);
}

main();
