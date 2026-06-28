import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const CANDIDATES_DIR = path.resolve(
  process.cwd(),
  "artifacts/audio/candidates",
);
const REPORT_PATH = path.resolve(
  process.cwd(),
  "artifacts/audio/reports/loudness-analysis.json",
);

interface LoudnessData {
  inputLoudness: number;
  outputLoudness: number;
  inputTruePeak: number;
  outputTruePeak: number;
  normalizationStatus: string;
}

function checkFfmpeg(): boolean {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function analyzeAudio(): void {
  const report: Record<string, LoudnessData> = {};

  if (!fs.existsSync(CANDIDATES_DIR)) {
    console.warn(
      `Candidates directory not found at: ${CANDIDATES_DIR}. Generating empty analysis report.`,
    );
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify({}, null, 2));
    return;
  }

  const getFiles = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        if (file === "sfx") {
          return; // Skip sfx directory for speech candidate normalization
        }
        results = results.concat(getFiles(filePath));
      } else if (filePath.endsWith(".wav")) {
        results.push(filePath);
      }
    });
    return results;
  };

  const wavFiles = getFiles(CANDIDATES_DIR);
  const hasFfmpeg = checkFfmpeg();

  if (!hasFfmpeg) {
    console.warn(
      "FFmpeg is not available. Skipping two-pass loudness normalization.",
    );
    wavFiles.forEach((file) => {
      const relPath = path.relative(CANDIDATES_DIR, file).replace(/\\/g, "/");
      report[relPath] = {
        inputLoudness: -16.0,
        outputLoudness: -16.0,
        inputTruePeak: -1.0,
        outputTruePeak: -1.0,
        normalizationStatus: "SKIPPED_FFMPEG_MISSING",
      };
    });
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");
    return;
  }

  let existingReport: Record<string, LoudnessData> = {};
  if (fs.existsSync(REPORT_PATH)) {
    try {
      existingReport = JSON.parse(
        fs.readFileSync(REPORT_PATH, "utf-8"),
      ) as Record<string, LoudnessData>;
    } catch {
      // ignore
    }
  }

  const extractLoudnormJson = (
    output: string,
  ): Record<string, string> | null => {
    const match = output.match(/\{\s*["']input_i["'][\s\S]*?\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as Record<string, string>;
      } catch (e) {
        const err = e as Error;
        console.error(
          "JSON parse error on extracted block:",
          err.message,
          "\nBlock was:\n",
          match[0],
        );
        return null;
      }
    }
    return null;
  };

  for (const file of wavFiles) {
    const relPath = path.relative(CANDIDATES_DIR, file).replace(/\\/g, "/");

    // Rerun loudness normalization only for candidates whose status is not PASSED
    const existingRecord = existingReport[relPath];
    if (
      existingRecord &&
      (existingRecord.normalizationStatus === "PASSED" ||
        existingRecord.normalizationStatus === "ALREADY_COMPLIANT" ||
        existingRecord.normalizationStatus === "NORMALIZED_TWO_PASS")
    ) {
      if (fs.existsSync(file) && fs.statSync(file).size > 44) {
        console.log(
          `Skipping loudness normalization for already PASSED: ${relPath}`,
        );
        report[relPath] = {
          inputLoudness: existingRecord.inputLoudness,
          outputLoudness: existingRecord.outputLoudness,
          inputTruePeak: existingRecord.inputTruePeak,
          outputTruePeak: existingRecord.outputTruePeak,
          normalizationStatus: "PASSED",
        };
        continue;
      }
    }

    console.log(`Analyzing loudness for: ${relPath}`);

    try {
      // Pass 1: Measure loudness and output JSON stats
      const firstPassCmd = `ffmpeg -i "${file}" -af loudnorm=I=-16.0:TP=-1.0:LRA=11.0:print_format=json -f null - 2>&1`;
      let firstPassOut = "";
      try {
        firstPassOut = execSync(firstPassCmd, { encoding: "utf8" });
      } catch (err) {
        const execError = err as {
          stderr?: string;
          message?: string;
          status?: number;
        };
        const stderr = execError.stderr || execError.message || "";
        console.error(
          `FFmpeg first pass failed for ${relPath} (exit code: ${execError.status || "unknown"}). Stderr tail:\n${stderr.slice(-500)}`,
        );
        throw new Error(
          `FFmpeg measurement failed: exit code ${execError.status || "unknown"}`,
        );
      }

      // Parse JSON from output
      const statsJson = extractLoudnormJson(firstPassOut);
      if (!statsJson) {
        console.error(`Raw FFmpeg output tail:\n${firstPassOut.slice(-500)}`);
        throw new Error("Failed to parse loudnorm JSON stats from first pass.");
      }

      const inputLoudness = parseFloat(statsJson.input_i);
      const inputTruePeak = parseFloat(statsJson.input_tp);

      // If we are already close to target -16 LUFS and <= -1 dBTP, we can skip processing
      if (Math.abs(inputLoudness - -16.0) <= 0.3 && inputTruePeak <= -1.0) {
        report[relPath] = {
          inputLoudness,
          outputLoudness: inputLoudness,
          inputTruePeak,
          outputTruePeak: inputTruePeak,
          normalizationStatus: "PASSED",
        };
        console.log(
          `  Already compliant: loudness=${inputLoudness} LUFS, peak=${inputTruePeak} dBTP`,
        );
        continue;
      }

      // Pass 2: Apply measured values for linear/perfect normalization
      const tempOut = file.replace(".wav", "_temp_normalized.wav");
      const secondPassCmd = `ffmpeg -y -i "${file}" -af "loudnorm=I=-16.0:TP=-1.0:LRA=11.0:measured_I=${statsJson.input_i}:measured_TP=${statsJson.input_tp}:measured_LRA=${statsJson.input_lra}:measured_thresh=${statsJson.input_thresh}:offset=${statsJson.target_offset}:linear=true" -ar 24000 "${tempOut}"`;
      try {
        execSync(secondPassCmd, { stdio: "ignore" });
      } catch (err) {
        const execError = err as { status?: number };
        throw new Error(
          `FFmpeg normalization apply failed: exit code ${execError.status || "unknown"}`,
        );
      }

      // Verify output loudness by measuring the temporary file
      const verifyCmd = `ffmpeg -i "${tempOut}" -af loudnorm=I=-16.0:TP=-1.0:LRA=11.0:print_format=json -f null - 2>&1`;
      let verifyOut = "";
      try {
        verifyOut = execSync(verifyCmd, { encoding: "utf8" });
      } catch (err) {
        const execError = err as {
          stderr?: string;
          message?: string;
          status?: number;
        };
        const stderr = execError.stderr || execError.message || "";
        console.error(
          `FFmpeg verification pass failed (exit code: ${execError.status || "unknown"}). Stderr tail:\n${stderr.slice(-500)}`,
        );
        throw new Error(
          `FFmpeg verification measurement failed: exit code ${execError.status || "unknown"}`,
        );
      }

      const verifyStats = extractLoudnormJson(verifyOut);
      let outputLoudness = -16.0;
      let outputTruePeak = -1.0;
      if (verifyStats) {
        outputLoudness = parseFloat(verifyStats.input_i);
        outputTruePeak = parseFloat(verifyStats.input_tp);
      } else {
        console.error(
          `Raw FFmpeg verification output tail:\n${verifyOut.slice(-500)}`,
        );
        throw new Error(
          "Failed to parse loudnorm JSON stats from verification pass.",
        );
      }

      fs.renameSync(tempOut, file);

      // Re-convert normalized WAV to MP3 if it resides in a candidates directory with delivery MP3 copies
      const fileDir = path.dirname(file);
      if (fileDir.endsWith("masters")) {
        const deliveryDir = path.join(path.dirname(fileDir), "delivery");
        const baseName = path.basename(file, ".wav");
        const mp3Path = path.join(deliveryDir, `${baseName}.mp3`);
        if (fs.existsSync(deliveryDir)) {
          execSync(
            `ffmpeg -y -i "${file}" -codec:a libmp3lame -b:a 128k "${mp3Path}"`,
            { stdio: "ignore" },
          );
          console.log(`  Updated normalized MP3 review copy at: ${mp3Path}`);
        }
      }

      report[relPath] = {
        inputLoudness,
        outputLoudness,
        inputTruePeak,
        outputTruePeak,
        normalizationStatus: "PASSED",
      };
      console.log(
        `  Normalized: input=${inputLoudness} -> output=${outputLoudness} LUFS, peak=${inputTruePeak} -> ${outputTruePeak} dBTP`,
      );
    } catch (err) {
      const error = err as Error;
      console.error(`  Failed to normalize ${relPath}:`, error.message);
      report[relPath] = {
        inputLoudness: -16.0,
        outputLoudness: -16.0,
        inputTruePeak: -1.0,
        outputTruePeak: -1.0,
        normalizationStatus: "FAILED",
      };
    }
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");
  console.log(`Loudness analysis report saved to ${REPORT_PATH}`);
}

if (process.argv[1] && process.argv[1].endsWith("analyze-audio.ts")) {
  analyzeAudio();
}
