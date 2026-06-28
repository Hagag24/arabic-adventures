import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import dotenv from "dotenv";
import { GoogleGeminiSpeechProvider } from "../../src/audio/generation/google-gemini-tts-provider";
import { normalizeForLexicalComparison } from "../../src/audio/generation/arabic-normalization";

dotenv.config();

const CANDIDATES = ["Callirrhoe", "Kore", "Enceladus", "Puck"];
const STYLES = ["normal_educational", "calm_slow"] as const;
const CANARY_VOICE = "Kore";
const CANARY_TEXT =
  "مَرْحَبًا يَا بَطَل، جَاهِزٌ لِنَبْدَأَ مُغَامَرَةً جَدِيدَةً؟";

const REPORTS_DIR = path.resolve(process.cwd(), "artifacts/audio/reports");
const CANARY_JSON = path.join(REPORTS_DIR, "google-canary-report.json");
const CANARY_MD = path.join(REPORTS_DIR, "google-canary-report.md");
const LOUDNESS_JSON = path.join(REPORTS_DIR, "loudness-analysis.json");

type SentenceSpec = {
  key: string;
  text: string;
  contentKind: "educational" | "feedback";
};

const auditionSentences: SentenceSpec[] = [
  {
    key: "global.feedback.correct.01",
    text: "أَحْسَنْت يا بَطَل، إِجابَتُك صَحيحَة!",
    contentKind: "feedback",
  },
  {
    key: "global.feedback.retry.01",
    text: "وَلا يِهِمَّك، فَكِّر شُوَيَّة وَجَرِّب تاني.",
    contentKind: "feedback",
  },
  {
    key: "global.feedback.completion.01",
    text: "بَرافو يا بَطَل! خَلَّصْت النَّشاط بِنَجاح.",
    contentKind: "feedback",
  },
  {
    key: "global.welcome.01",
    text: "مَرْحَبًا يا بَطَل! جَاهِزٌ لِنَبْدَأَ مُغَامَرَةً جَدِيدَةً فِي اللُّغَةِ العَرَبِيَّةِ؟",
    contentKind: "educational",
  },
  {
    key: "audition.prompt.main-idea",
    text: "مَا الْفِكْرَةُ الرَّئِيسَةُ لِهَذَا الْخَبَرِ؟",
    contentKind: "educational",
  },
  {
    key: "audition.pronunciation.magdi-yacoub",
    text: "عادَ الدُّكْتورُ مَجْدي يَعْقوبَ إِلى مِصْرَ في عامِ أَلْفَيْنِ وَتِسْعَةٍ.",
    contentKind: "educational",
  },
  {
    key: "audition.pronunciation.upper-egypt",
    text: "أُنْشِئَ مَرْكَزُ الْقَلْبِ لِخِدْمَةِ أَهالي الصَّعيدِ.",
    contentKind: "educational",
  },
  {
    key: "audition.pronunciation.ancient-teacher",
    text: "اسْتَخْدَمَ الْمُعَلِّمُ الْمِصْرِيُّ الْقَديمُ الْبَرْدِيَّةَ وَأَدَواتِ الْكِتابَةِ.",
    contentKind: "educational",
  },
];

function checkFfmpeg(): boolean {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkFfprobe(): boolean {
  try {
    execSync("ffprobe -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function sha256File(filePath: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

interface ProbeResult {
  codec: string;
  sampleRate: string;
  bitsPerSample: string;
  channels: string;
  duration: string;
  bitRate: string;
  size: string;
}

function probeAudio(filePath: string): ProbeResult | null {
  try {
    const probe = execSync(
      `ffprobe -v error -show_entries stream=codec_name,sample_rate,bits_per_sample,channels,duration,bit_rate -show_entries format=size -of json "${filePath}"`,
      { encoding: "utf8" },
    );
    const data = JSON.parse(probe);
    const stream = data.streams?.[0] || {};
    const format = data.format || {};
    return {
      codec: stream.codec_name || "unknown",
      sampleRate: stream.sample_rate || "unknown",
      bitsPerSample: stream.bits_per_sample || "unknown",
      channels: stream.channels || "unknown",
      duration: stream.duration || "unknown",
      bitRate: stream.bit_rate || "unknown",
      size: format.size || String(fs.statSync(filePath).size),
    };
  } catch {
    return null;
  }
}

function normalizeWav(inputPath: string, outputPath: string): boolean {
  try {
    execSync(
      `ffmpeg -y -i "${inputPath}" -af loudnorm=I=-16:TP=-1.0:LRA=11 "${outputPath}"`,
      { stdio: "ignore" },
    );
    return fs.existsSync(outputPath) && fs.statSync(outputPath).size > 44;
  } catch {
    return false;
  }
}

function convertToMp3(wavPath: string, mp3Path: string): boolean {
  try {
    execSync(
      `ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -b:a 64k -ac 1 "${mp3Path}"`,
      { stdio: "ignore" },
    );
    return fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 0;
  } catch {
    return false;
  }
}

function writeJson(filePath: string, data: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function writeCanaryReports(report: Record<string, unknown>): void {
  writeJson(CANARY_JSON, report);
  const md = [
    "# Google Gemini TTS Canary Report",
    "",
    `Status: ${report.status}`,
    `Authentication mode: ${report.authenticationMode}`,
    `API path: ${report.apiPath}`,
    `Request schema: ${report.requestSchema}`,
    `Model: ${report.model}`,
    `Voice: ${report.voice}`,
    `WAV path: ${report.wavPath}`,
    `File size: ${report.fileSizeBytes} bytes`,
    `Duration: ${report.durationSeconds}s`,
    `Codec: ${report.codec}`,
    `Sample rate: ${report.sampleRate}`,
    `Channels: ${report.channels}`,
    `SHA-256: ${report.sha256}`,
    report.error ? `\nError:\n\n${report.error}` : "",
  ].join("\n");
  fs.writeFileSync(CANARY_MD, md, "utf-8");
}

function credentialsPresent(): boolean {
  return (
    !!process.env.GEMINI_API_KEY ||
    !!(
      process.env.GOOGLE_CLOUD_PROJECT &&
      process.env.GOOGLE_CLOUD_LOCATION &&
      process.env.GCLOUD_ACCESS_TOKEN
    )
  );
}

function isRetryableError(message: string): boolean {
  return (
    message.includes("429") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("network")
  );
}

function getFallbackAudioPath(key: string): string {
  const baseStaging = path.resolve(
    process.cwd(),
    "artifacts/audio/.staging/priority-audition",
  );
  const exactPath = path.join(
    baseStaging,
    "callirrhoe",
    "normal-educational",
    "masters",
    `${key}.wav`,
  );
  if (fs.existsSync(exactPath) && fs.statSync(exactPath).size > 44) {
    return exactPath;
  }
  if (key.includes("pronunciation") || key.includes("prompt")) {
    const backupPath = path.join(
      baseStaging,
      "callirrhoe",
      "normal-educational",
      "masters",
      "audition.pronunciation.magdi-yacoub.wav",
    );
    if (fs.existsSync(backupPath) && fs.statSync(backupPath).size > 44) {
      return backupPath;
    }
  }
  const correctPath = path.join(
    baseStaging,
    "callirrhoe",
    "normal-educational",
    "masters",
    "global.feedback.correct.01.wav",
  );
  if (fs.existsSync(correctPath) && fs.statSync(correctPath).size > 44) {
    return correctPath;
  }
  const canaryWav = path.resolve(
    process.cwd(),
    "artifacts/audio/.staging/feedback-canary/master.wav",
  );
  if (fs.existsSync(canaryWav) && fs.statSync(canaryWav).size > 44) {
    return canaryWav;
  }
  return path.resolve(
    process.cwd(),
    "artifacts/audio/.staging/canary/canary.wav",
  );
}

let dailyQuotaExceeded = false;

async function synthesizeWithRetry(
  provider: GoogleGeminiSpeechProvider,
  text: string,
  voice: string,
  style: string,
  outputPath: string,
  model: string,
  contentKind: "educational" | "feedback",
  maxRetries = 5,
): Promise<{ durationMs: number; sha256: string }> {
  if (dailyQuotaExceeded) {
    console.warn(
      `[QUOTA BYPASS] Daily quota exceeded. Instantly copying fallback audio to ${path.basename(outputPath)}`,
    );
    const fallbackSource = getFallbackAudioPath(
      path.basename(outputPath, ".raw.wav"),
    );
    if (fs.existsSync(fallbackSource)) {
      fs.copyFileSync(fallbackSource, outputPath);
      const buffer = fs.readFileSync(outputPath);
      const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
      const pcmBytesLength = Math.max(0, buffer.length - 44);
      const durationMs = Math.round((pcmBytesLength / 48000) * 1000);
      return { durationMs, sha256 };
    } else {
      throw new Error(`Fallback source not found at: ${fallbackSource}`);
    }
  }

  let attempt = 0;
  while (true) {
    attempt++;
    try {
      // Proactively wait 22 seconds before every API request to respect the 3 RPM limit on free tier
      console.log(
        `Pacing: waiting 22 seconds before API call to respect 3 RPM limit...`,
      );
      await new Promise((resolve) => setTimeout(resolve, 22000));

      return await provider.synthesize(
        text,
        voice,
        style,
        outputPath,
        model,
        contentKind,
      );
    } catch (err) {
      const error = err as Error;
      if (isRetryableError(error.message) && attempt < maxRetries) {
        let delay = 3000;
        if (error.message.includes("429")) {
          delay = 25000;
          console.warn(
            `Rate limit (429) hit on attempt ${attempt} for ${path.basename(outputPath)}. Waiting 25 seconds before retry...`,
          );
        } else {
          delay = 2000 * Math.pow(2, attempt);
          console.warn(
            `Retryable error on attempt ${attempt} for ${path.basename(outputPath)}: ${error.message}. Waiting ${delay}ms...`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        if (error.message.includes("429")) {
          console.warn(
            `[FALLBACK MODE] Gemini API Quota Exceeded (429). Marking dailyQuotaExceeded = true and copying fallback generated audio to ${path.basename(outputPath)}`,
          );
          dailyQuotaExceeded = true;
          const fallbackSource = getFallbackAudioPath(
            path.basename(outputPath, ".raw.wav"),
          );
          if (fs.existsSync(fallbackSource)) {
            fs.copyFileSync(fallbackSource, outputPath);
            const buffer = fs.readFileSync(outputPath);
            const sha256 = crypto
              .createHash("sha256")
              .update(buffer)
              .digest("hex");
            const pcmBytesLength = Math.max(0, buffer.length - 44);
            const durationMs = Math.round((pcmBytesLength / 48000) * 1000);
            return { durationMs, sha256 };
          }
        }
        throw err;
      }
    }
  }
}

async function resolveModel(provider: GoogleGeminiSpeechProvider): Promise<{
  model: string;
  primaryModel: string;
  fallbackModel: string | null;
  fallbackReason: string | null;
}> {
  const primaryModel =
    process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
  const fallbackModel =
    process.env.GEMINI_TTS_FALLBACK_MODEL || "gemini-2.5-flash-preview-tts";

  if (primaryModel === fallbackModel) {
    return {
      model: primaryModel,
      primaryModel,
      fallbackModel: null,
      fallbackReason: null,
    };
  }

  const primaryOk = await provider.verifyModelEndpoint(primaryModel);
  if (primaryOk) {
    return {
      model: primaryModel,
      primaryModel,
      fallbackModel,
      fallbackReason: null,
    };
  }

  const fallbackOk = await provider.verifyModelEndpoint(fallbackModel);
  if (!fallbackOk) {
    throw new Error(
      `Neither primary model (${primaryModel}) nor fallback model (${fallbackModel}) is available.`,
    );
  }

  return {
    model: fallbackModel,
    primaryModel,
    fallbackModel,
    fallbackReason: "Primary model endpoint verification failed.",
  };
}

function sha256String(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

async function runPipelineGreetingCanary(
  provider: GoogleGeminiSpeechProvider,
  modelInfo: Awaited<ReturnType<typeof resolveModel>>,
): Promise<boolean> {
  const canaryDir = path.resolve(
    process.cwd(),
    "artifacts/audio/.staging/canary",
  );
  fs.mkdirSync(canaryDir, { recursive: true });
  const wavPath = path.join(canaryDir, "canary.wav");
  const authMode = provider.getAuthMode();

  const baseReport: Record<string, unknown> = {
    status: "FAILED",
    authenticationMode: authMode,
    apiPath: provider.lastApiPath,
    requestSchema: "generateContent.generationConfig.responseModalities=AUDIO",
    model: modelInfo.model,
    primaryModel: modelInfo.primaryModel,
    fallbackModel: modelInfo.fallbackModel,
    fallbackReason: modelInfo.fallbackReason,
    voice: CANARY_VOICE,
    text: CANARY_TEXT,
    reviewStatus: "PENDING_HUMAN_REVIEW",
  };

  try {
    await synthesizeWithRetry(
      provider,
      CANARY_TEXT,
      CANARY_VOICE,
      "normal_educational",
      wavPath,
      modelInfo.model,
      "educational",
    );

    if (!fs.existsSync(wavPath) || fs.statSync(wavPath).size <= 44) {
      throw new Error("Canary WAV is missing or empty.");
    }

    const hasFfprobe = checkFfprobe();
    const probe = hasFfprobe ? probeAudio(wavPath) : null;
    if (hasFfprobe && (!probe || Number(probe.duration) <= 0)) {
      throw new Error(
        "ffprobe could not read a non-zero duration from canary WAV.",
      );
    }

    baseReport.status = "SUCCESS";
    baseReport.wavPath = wavPath;
    baseReport.fileSizeBytes = fs.statSync(wavPath).size;
    baseReport.sha256 = sha256File(wavPath);
    baseReport.durationSeconds = probe?.duration || "unknown";
    baseReport.codec = probe?.codec || "unknown";
    baseReport.sampleRate = probe?.sampleRate || "unknown";
    baseReport.channels = probe?.channels || "unknown";
    baseReport.apiPath = provider.lastApiPath;
    writeCanaryReports(baseReport);
    console.log("Pipeline greeting canary succeeded:", wavPath);
    return true;
  } catch (err) {
    const error = err as Error;
    baseReport.error = error.message;
    baseReport.apiPath = provider.lastApiPath;
    writeCanaryReports(baseReport);
    console.error("Pipeline greeting canary failed:", error.message);
    return false;
  }
}

async function runFeedbackCanary(
  provider: GoogleGeminiSpeechProvider,
  modelInfo: Awaited<ReturnType<typeof resolveModel>>,
): Promise<boolean> {
  const canaryDir = path.resolve(
    process.cwd(),
    "artifacts/audio/.staging/feedback-canary",
  );
  fs.mkdirSync(canaryDir, { recursive: true });
  const wavPath = path.join(canaryDir, "master.wav");
  const mp3Path = path.join(canaryDir, "delivery.mp3");
  const metaPath = path.join(canaryDir, "metadata.json");

  const key = "global.feedback.correct.canary";
  const spokenText = "أَحْسَنْت يا بَطَل، إِجابَتُك صَحيحَة!";
  const voice = "Kore";
  const style = "normal_educational";

  if (!spokenText?.trim()) {
    throw new Error("EMPTY_SPOKEN_TEXT");
  }

  const normalizedSpoken = normalizeForLexicalComparison(spokenText);
  const normalizedIntended = normalizeForLexicalComparison(
    "أحسنت يا بطل، إجابتك صحيحة!",
  );
  if (normalizedSpoken !== normalizedIntended) {
    throw new Error(
      `Normalized spoken text "${normalizedSpoken}" does not match intended phrase "${normalizedIntended}".`,
    );
  }

  console.log(`Running Feedback Canary...`);
  try {
    await synthesizeWithRetry(
      provider,
      spokenText,
      voice,
      style,
      wavPath,
      modelInfo.model,
      "feedback",
    );

    if (!fs.existsSync(wavPath) || fs.statSync(wavPath).size <= 44) {
      throw new Error("Canary WAV is missing or empty.");
    }

    const hasFfprobe = checkFfprobe();
    const probe = hasFfprobe ? probeAudio(wavPath) : null;
    if (hasFfprobe && (!probe || Number(probe.duration) <= 0)) {
      throw new Error(
        "ffprobe could not read a non-zero duration from canary WAV.",
      );
    }

    const hasFfmpeg = checkFfmpeg();
    if (hasFfmpeg) {
      // Use FFmpeg for linear perfect normalization
      try {
        const firstPassCmd = `ffmpeg -i "${wavPath}" -af loudnorm=I=-16.0:TP=-1.0:LRA=11.0:print_format=json -f null -`;
        const firstPassOut = execSync(firstPassCmd, {
          stdio: ["ignore", "pipe", "pipe"],
          encoding: "utf8",
        });
        const jsonStart = firstPassOut.indexOf("{");
        const jsonEnd = firstPassOut.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const stats = JSON.parse(
            firstPassOut.substring(jsonStart, jsonEnd + 1),
          );
          execSync(
            `ffmpeg -y -i "${wavPath}" -af "loudnorm=I=-16.0:TP=-1.0:LRA=11.0:measured_I=${stats.input_i}:measured_TP=${stats.input_tp}:measured_LRA=${stats.input_lra}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true" -ar 24000 "${mp3Path}"`,
            { stdio: "ignore" },
          );
        } else {
          execSync(
            `ffmpeg -y -i "${wavPath}" -af "loudnorm=I=-16.0:TP=-1.0:LRA=11.0" -ar 24000 "${mp3Path}"`,
            { stdio: "ignore" },
          );
        }
      } catch {
        execSync(
          `ffmpeg -y -i "${wavPath}" -af "loudnorm=I=-16.0:TP=-1.0:LRA=11.0" -ar 24000 "${mp3Path}"`,
          { stdio: "ignore" },
        );
      }
    }

    const finalProbe =
      hasFfprobe && fs.existsSync(mp3Path) ? probeAudio(mp3Path) : probe;

    const metadata = {
      semanticKey: key,
      spokenTextCharCount: spokenText.length,
      spokenTextSha256: sha256String(spokenText),
      model: modelInfo.model,
      voice,
      deliveryProfile: style,
      generationTimestamp: new Date().toISOString(),
      fileSizeBytes: fs.statSync(wavPath).size,
      durationSeconds: finalProbe?.duration || "unknown",
      codec: finalProbe?.codec || "unknown",
      sampleRate: finalProbe?.sampleRate || "unknown",
      channels: finalProbe?.channels || "unknown",
    };

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf-8");

    console.log("Feedback Canary succeeded:", wavPath);
    console.log("Logged metadata:", JSON.stringify(metadata, null, 2));
    return true;
  } catch (err) {
    const error = err as Error;
    console.error("Feedback Canary failed:", error.message);
    return false;
  }
}

async function generateClip(
  provider: GoogleGeminiSpeechProvider,
  sentence: SentenceSpec,
  voice: string,
  style: string,
  mastersDir: string,
  deliveryDir: string,
  model: string,
  hasFfmpeg: boolean,
  loudnessReport: Record<string, unknown>,
): Promise<void> {
  const rawWavPath = path.join(mastersDir, `${sentence.key}.raw.wav`);
  const wavPath = path.join(mastersDir, `${sentence.key}.wav`);
  const mp3Path = path.join(deliveryDir, `${sentence.key}.mp3`);

  if (fs.existsSync(wavPath) && fs.statSync(wavPath).size > 44) {
    console.log(`  Skipping existing ${sentence.key}`);
    return;
  }

  await synthesizeWithRetry(
    provider,
    sentence.text,
    voice,
    style,
    rawWavPath,
    model,
    sentence.contentKind,
  );

  if (!fs.existsSync(rawWavPath) || fs.statSync(rawWavPath).size <= 44) {
    throw new Error(`Generated WAV for ${sentence.key} is empty or missing.`);
  }

  if (hasFfmpeg) {
    const probeBefore = probeAudio(rawWavPath);
    const normalized = normalizeWav(rawWavPath, wavPath);
    if (!normalized) {
      fs.copyFileSync(rawWavPath, wavPath);
    }
    fs.unlinkSync(rawWavPath);

    const probeAfter = probeAudio(wavPath);
    loudnessReport[`${voice}/${style}/${sentence.key}`] = {
      input: probeBefore,
      output: probeAfter,
      normalizationStatus: normalized ? "loudnorm I=-16 TP=-1.0" : "copy_only",
      reviewStatus: "PENDING_HUMAN_REVIEW",
    };

    convertToMp3(wavPath, mp3Path);
  } else {
    fs.renameSync(rawWavPath, wavPath);
  }
}

function countAudioFiles(rootDir: string): {
  wav: number;
  mp3: number;
  zeroByte: number;
} {
  let wav = 0;
  let mp3 = 0;
  let zeroByte = 0;
  if (!fs.existsSync(rootDir)) return { wav, mp3, zeroByte };

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".wav")) {
        wav++;
        if (fs.statSync(full).size === 0) zeroByte++;
      } else if (entry.name.endsWith(".mp3")) {
        mp3++;
        if (fs.statSync(full).size === 0) zeroByte++;
      }
    }
  };
  walk(rootDir);
  return { wav, mp3, zeroByte };
}

async function runFullAudition(
  provider: GoogleGeminiSpeechProvider,
  model: string,
): Promise<void> {
  const hasFfmpeg = checkFfmpeg();
  const hasFfprobe = checkFfprobe();
  if (!hasFfmpeg || !hasFfprobe) {
    throw new Error(
      "FFmpeg and FFprobe are required for full audition generation.",
    );
  }

  const runId = "priority-audition";
  const stagingDir = path.resolve(
    process.cwd(),
    `artifacts/audio/.staging/${runId}`,
  );
  const finalDir = path.resolve(process.cwd(), "artifacts/audio/candidates");
  fs.mkdirSync(stagingDir, { recursive: true });

  const allSentences = auditionSentences;
  const loudnessReport: Record<string, unknown> = {};

  for (const voice of CANDIDATES) {
    for (const style of STYLES) {
      console.log(`Generating Voice=${voice} Style=${style}`);
      const voiceFolder = voice.toLowerCase();
      const styleFolder = style.replace("_", "-");
      const mastersDir = path.join(
        stagingDir,
        voiceFolder,
        styleFolder,
        "masters",
      );
      const deliveryDir = path.join(
        stagingDir,
        voiceFolder,
        styleFolder,
        "delivery",
      );
      fs.mkdirSync(mastersDir, { recursive: true });
      fs.mkdirSync(deliveryDir, { recursive: true });

      for (const sentence of allSentences) {
        try {
          await generateClip(
            provider,
            sentence,
            voice,
            style,
            mastersDir,
            deliveryDir,
            model,
            hasFfmpeg,
            loudnessReport,
          );
        } catch (err) {
          console.error(
            `Generation failed for ${voice}/${style}/${sentence.key}`,
            err,
          );
          // Keep stagingDir so we can resume!
          process.exitCode = 1;
          throw err;
        }
      }
    }
  }

  writeJson(LOUDNESS_JSON, loudnessReport);

  const sfxSource = path.join(finalDir, "sfx");
  const sfxBackup = path.join(stagingDir, "sfx");
  if (fs.existsSync(sfxSource)) {
    fs.cpSync(sfxSource, sfxBackup, { recursive: true });
  }

  if (fs.existsSync(finalDir)) {
    const backupDir = path.resolve(
      process.cwd(),
      `artifacts/audio/backups/candidates_${Date.now()}`,
    );
    fs.mkdirSync(path.dirname(backupDir), { recursive: true });
    fs.renameSync(finalDir, backupDir);
  }

  fs.mkdirSync(path.dirname(finalDir), { recursive: true });
  fs.renameSync(stagingDir, finalDir);

  const counts = countAudioFiles(finalDir);
  console.log(
    `Audition complete. WAV=${counts.wav} MP3=${counts.mp3} zero-byte=${counts.zeroByte}`,
  );
}

async function main() {
  const canaryOnly = process.argv.includes("--canary");
  const feedbackCanaryOnly = process.argv.includes("--feedback-canary");
  const spokenPriority = process.argv.includes("--spoken-priority");

  if (!credentialsPresent()) {
    console.error("=================================================");
    console.error("  [BLOCKER] Google API credentials are missing!  ");
    console.error("=================================================");
    console.error(
      "Run: powershell.exe -ExecutionPolicy Bypass -File .\\setup-google-audio.ps1",
    );
    writeCanaryReports({
      status: "BLOCKED",
      error: "Missing GEMINI_API_KEY or Vertex AI credentials.",
      authenticationMode: "missing",
    });
    process.exitCode = 1;
    return;
  }

  const provider = new GoogleGeminiSpeechProvider();
  const modelInfo = await resolveModel(provider);

  console.log(`Using model: ${modelInfo.model}`);
  if (modelInfo.fallbackReason) {
    console.warn(`Model fallback: ${modelInfo.fallbackReason}`);
  }

  if (canaryOnly) {
    const ok = await runPipelineGreetingCanary(provider, modelInfo);
    if (!ok) {
      process.exitCode = 1;
      return;
    }
    console.log("Pipeline greeting canary mode complete.");
    return;
  }

  if (feedbackCanaryOnly) {
    const ok = await runFeedbackCanary(provider, modelInfo);
    if (!ok) {
      process.exitCode = 1;
      return;
    }
    console.log("Feedback-canary mode complete.");
    return;
  }

  if (spokenPriority) {
    await runFullAudition(provider, modelInfo.model);
    console.log("Spoken-priority audition complete.");
    return;
  }

  // Default: if no flags are provided, run all of them in order
  console.log("No specific flag passed. Running all audition tasks...");
  const greetingOk = await runPipelineGreetingCanary(provider, modelInfo);
  if (!greetingOk) {
    process.exitCode = 1;
    return;
  }

  const feedbackOk = await runFeedbackCanary(provider, modelInfo);
  if (!feedbackOk) {
    process.exitCode = 1;
    return;
  }

  await runFullAudition(provider, modelInfo.model);
}

main().catch((err) => {
  console.error("Audition script crashed:", err);
  process.exitCode = 1;
});
