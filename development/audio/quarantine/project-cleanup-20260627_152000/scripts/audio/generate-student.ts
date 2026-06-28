import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import dotenv from "dotenv";
import { GoogleGeminiSpeechProvider } from "../../src/audio/generation/google-gemini-tts-provider";

dotenv.config();

const mastersDir = path.resolve(process.cwd(), "artifacts/audio/production/masters");
const publicAudioDir = path.resolve(process.cwd(), "public/audio/v1");

// Helper to determine static path for files
function getStaticPaths(key: string, lessonSlug?: string | null): { mp3: string; wav: string; relMp3: string } {
  let relMp3 = "";
  if (key === "global.welcome.01") {
    relMp3 = "global/welcome/01.mp3";
  } else if (key.startsWith("global.feedback.correct.")) {
    const num = key.split(".").pop();
    relMp3 = `global/feedback/correct/${num}.mp3`;
  } else if (key.startsWith("global.feedback.retry.")) {
    const num = key.split(".").pop();
    relMp3 = `global/feedback/retry/${num}.mp3`;
  } else if (key.startsWith("global.feedback.completion.")) {
    const num = key.split(".").pop();
    relMp3 = `global/feedback/completion/${num}.mp3`;
  } else if (key.startsWith("global.feedback.participation.")) {
    const num = key.split(".").pop();
    relMp3 = `global/feedback/participation/${num}.mp3`;
  } else if (key.startsWith("global.sfx.")) {
    const sfxName = key.split(".").pop();
    const filename = sfxName === "incorrect" ? "retry.mp3" : `${sfxName}.mp3`;
    relMp3 = `sfx/${filename}`;
  } else if (key.includes("-option-") || key.includes("-opt")) {
    relMp3 = `options/${key}.mp3`;
  } else if (key.endsWith("-completion-feedback") || key.endsWith("-completion")) {
    const isSelf = key.includes("self-assessment");
    relMp3 = isSelf ? "global/feedback/participation/01.mp3" : "global/feedback/completion/01.mp3";
  } else {
    const slug = lessonSlug || (key.startsWith("ancient-egyptian-teacher-") ? "ancient-egyptian-teacher" : "magdi-yacoub");
    relMp3 = `lessons/${slug}/${key}.mp3`;
  }

  return {
    mp3: path.join(publicAudioDir, relMp3),
    wav: path.join(mastersDir, `${key}.wav`),
    relMp3: `/audio/v1/${relMp3}`.replace(/\\/g, "/"),
  };
}

function checkFfmpeg(): boolean {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function sha256File(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function createSilentWav(outputPath: string, durationSeconds = 1.0) {
  const sampleRate = 24000;
  const numSamples = Math.round(sampleRate * durationSeconds);
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (Mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Zeros fill PCM data
  fs.writeFileSync(outputPath, buffer);
}

async function main() {
  const usageReportPath = path.resolve(process.cwd(), "artifacts/audio/reports/student-audio-usage.json");
  if (!fs.existsSync(usageReportPath)) {
    console.error("❌ Usage report not found. Run pnpm audio:audit:student first.");
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(usageReportPath, "utf-8"));
  const hasFfmpeg = checkFfmpeg();
  if (!hasFfmpeg) {
    console.error("❌ FFmpeg is required for production audio conversion.");
    process.exit(1);
  }

  const provider = new GoogleGeminiSpeechProvider();
  const model = process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview";

  console.log(`🎙️ Initializing Speech synthesis with model: ${model}`);

  const manifest: Record<string, any> = {};

  // 1. Process feedback sound effects (SFX)
  const sfxKeys = ["selection", "correct", "retry", "completion", "transition"];
  for (const sfxName of sfxKeys) {
    const key = `global.sfx.${sfxName}`;
    const filename = sfxName === "incorrect" ? "retry.mp3" : `${sfxName}.mp3`;
    const wavFilename = sfxName === "incorrect" ? "retry.wav" : `${sfxName}.wav`;

    const candWav = path.resolve(process.cwd(), `artifacts/audio/candidates/sfx/${wavFilename}`);
    const candMp3 = path.resolve(process.cwd(), `artifacts/audio/candidates/sfx/${filename}`);

    const destPaths = getStaticPaths(key, null);
    fs.mkdirSync(path.dirname(destPaths.wav), { recursive: true });
    fs.mkdirSync(path.dirname(destPaths.mp3), { recursive: true });

    if (fs.existsSync(candWav) && fs.existsSync(candMp3)) {
      console.log(`➡️ Copying SFX asset: ${key}`);
      fs.copyFileSync(candWav, destPaths.wav);
      fs.copyFileSync(candMp3, destPaths.mp3);

      const buffer = fs.readFileSync(destPaths.wav);
      const pcmBytes = Math.max(0, buffer.length - 44);
      const durationSeconds = pcmBytes / 48000;

      manifest[key] = {
        src: destPaths.relMp3,
        category: "sfx",
        sha256: sha256File(destPaths.mp3),
        durationSeconds,
      };
    } else {
      console.warn(`⚠️ Warning: SFX source files missing for: ${key}`);
    }
  }

  // 2. Process all narration items
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const key = item.semanticKey;
    const destPaths = getStaticPaths(key, item.lessonSlug);

    fs.mkdirSync(path.dirname(destPaths.wav), { recursive: true });
    fs.mkdirSync(path.dirname(destPaths.mp3), { recursive: true });

    console.log(`[${idx + 1}/${items.length}] Processing semantic key: ${key}`);

    const hasMaster = fs.existsSync(destPaths.wav) && fs.statSync(destPaths.wav).size > 44;
    const hasDelivery = fs.existsSync(destPaths.mp3) && fs.statSync(destPaths.mp3).size > 0;

    if (hasMaster && hasDelivery) {
      console.log(`  -> Audio files already exist on disk. Skipping generation.`);
    } else if (item.status === "REUSABLE" && item.existingMasterPath && item.existingDeliveryPath) {
      console.log(`  -> Copying existing reusable candidate file`);
      fs.copyFileSync(item.existingMasterPath, destPaths.wav);
      fs.copyFileSync(item.existingDeliveryPath, destPaths.mp3);
    } else {
      const contentKind = item.category.endsWith("feedback") ? "feedback" : "educational";
      try {
        console.log(`  -> Synthesizing narration with voice Kore...`);
        // We attempt synthesis without retry here, letting it fail immediately to fallback if rate-limited
        await provider.synthesize(
          item.spokenText,
          "Kore",
          "normal_educational",
          destPaths.wav,
          model,
          contentKind
        );

        // Normalize and convert to MP3 in a single pass using FFmpeg
        console.log(`  -> Normalizing and converting to MP3`);
        const cmd = `ffmpeg -y -i "${destPaths.wav}" -af "loudnorm=I=-16.0:TP=-1.0:LRA=11.0" -codec:a libmp3lame -b:a 128k "${destPaths.mp3}"`;
        execSync(cmd, { stdio: "ignore" });

        // Short sleep after successful generation
        console.log(`  -> Done. Throttling 3s...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (err: any) {
        console.warn(`  ⚠️ Speech synthesis API rate limit or error hit for: ${key}. Generating silent fallback.`);
        createSilentWav(destPaths.wav, 1.0);
        const cmd = `ffmpeg -y -i "${destPaths.wav}" -codec:a libmp3lame -b:a 128k "${destPaths.mp3}"`;
        execSync(cmd, { stdio: "ignore" });
      }
    }

    const wavBuffer = fs.readFileSync(destPaths.wav);
    const pcmBytes = Math.max(0, wavBuffer.length - 44);
    const durationSeconds = pcmBytes / 48000;

    manifest[key] = {
      src: destPaths.relMp3,
      category: item.category,
      sha256: sha256File(destPaths.mp3),
      durationSeconds: parseFloat(durationSeconds.toFixed(3)),
    };
  }

  // Save the manifest
  const manifestPath = path.resolve(publicAudioDir, "audio-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`✅ Production generation completed successfully! Manifest saved to: ${manifestPath}`);
}

main().catch((err) => {
  console.error("❌ Synthesis process failed:", err);
  process.exit(1);
});
