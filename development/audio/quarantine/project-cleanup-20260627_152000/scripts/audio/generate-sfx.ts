import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { writePcmAsWav } from "../../src/audio/generation/pcm-wave-writer";

const SFX_DIR = "D:\\arabic-adventures\\artifacts\\audio\\candidates\\sfx";

function checkFfmpeg(): boolean {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function generateSineWave(
  frequency: number,
  durationSeconds: number,
  sampleRate = 44100,
): Buffer {
  const numSamples = Math.floor(durationSeconds * sampleRate);
  const buffer = Buffer.alloc(numSamples * 2); // 16-bit = 2 bytes per sample
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Linear decay envelope
    const envelope = 1 - i / numSamples;
    const value = Math.floor(
      Math.sin(2 * Math.PI * frequency * t) * 32767 * envelope * 0.3,
    );
    buffer.writeInt16LE(value, i * 2);
  }
  return buffer;
}

function generateTwoNoteRise(
  f1: number,
  f2: number,
  d1: number,
  d2: number,
  sampleRate = 44100,
): Buffer {
  const b1 = generateSineWave(f1, d1, sampleRate);
  const b2 = generateSineWave(f2, d2, sampleRate);
  return Buffer.concat([b1, b2]);
}

function generateThreeNoteSequence(
  f1: number,
  f2: number,
  f3: number,
  d1: number,
  d2: number,
  d3: number,
  sampleRate = 44100,
): Buffer {
  const b1 = generateSineWave(f1, d1, sampleRate);
  const b2 = generateSineWave(f2, d2, sampleRate);
  const b3 = generateSineWave(f3, d3, sampleRate);
  return Buffer.concat([b1, b2, b3]);
}

function generateSweep(
  startFreq: number,
  endFreq: number,
  durationSeconds: number,
  sampleRate = 44100,
): Buffer {
  const numSamples = Math.floor(durationSeconds * sampleRate);
  const buffer = Buffer.alloc(numSamples * 2);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const progress = i / numSamples;
    const freq = startFreq + (endFreq - startFreq) * progress;
    // Sine envelope (fade-in and fade-out)
    const envelope = Math.sin(Math.PI * progress);
    const value = Math.floor(
      Math.sin(2 * Math.PI * freq * t) * 32767 * envelope * 0.2,
    );
    buffer.writeInt16LE(value, i * 2);
  }
  return buffer;
}

export function generateSfxFiles(): void {
  fs.mkdirSync(SFX_DIR, { recursive: true });

  const sampleRate = 44100;

  // 1. selection: 80–140 ms, 400Hz sine
  const selectionBuffer = generateSineWave(400, 0.1, sampleRate);
  writePcmAsWav(
    selectionBuffer,
    path.join(SFX_DIR, "selection.wav"),
    sampleRate,
    1,
    16,
  );

  // 2. correct: warm two-note rise (C5 to E5)
  const correctBuffer = generateTwoNoteRise(
    523.25,
    659.25,
    0.15,
    0.25,
    sampleRate,
  );
  writePcmAsWav(
    correctBuffer,
    path.join(SFX_DIR, "correct.wav"),
    sampleRate,
    1,
    16,
  );

  // 3. retry: soft neutral tone (300Hz sine)
  const retryBuffer = generateSineWave(300, 0.3, sampleRate);
  writePcmAsWav(
    retryBuffer,
    path.join(SFX_DIR, "retry.wav"),
    sampleRate,
    1,
    16,
  );

  // 4. completion: positive three-note sequence (C5 -> E5 -> G5)
  const completionBuffer = generateThreeNoteSequence(
    523.25,
    659.25,
    783.99,
    0.1,
    0.1,
    0.25,
    sampleRate,
  );
  writePcmAsWav(
    completionBuffer,
    path.join(SFX_DIR, "completion.wav"),
    sampleRate,
    1,
    16,
  );

  // 5. transition: subtle soft sweep (300Hz to 500Hz)
  const transitionBuffer = generateSweep(300, 500, 0.15, sampleRate);
  writePcmAsWav(
    transitionBuffer,
    path.join(SFX_DIR, "transition.wav"),
    sampleRate,
    1,
    16,
  );

  console.log(
    "Synthesized sound effects successfully under artifacts/audio/candidates/sfx/",
  );

  const hasFfmpeg = checkFfmpeg();
  if (hasFfmpeg) {
    const sfxKeys = [
      "selection",
      "correct",
      "retry",
      "completion",
      "transition",
    ];
    sfxKeys.forEach((key) => {
      const wavPath = path.join(SFX_DIR, `${key}.wav`);
      const mp3Path = path.join(SFX_DIR, `${key}.mp3`);
      try {
        execSync(
          `ffmpeg -y -i "${wavPath}" -codec:a libmp3lame -b:a 128k "${mp3Path}"`,
          { stdio: "ignore" },
        );
        console.log(`Converted SFX ${key} to MP3.`);
      } catch (err) {
        console.warn(`Failed to convert SFX ${key} to MP3`, err);
      }
    });
  } else {
    console.warn("FFmpeg missing. Skipping SFX MP3 generation.");
  }
}

if (process.argv[1] && process.argv[1].endsWith("generate-sfx.ts")) {
  generateSfxFiles();
}
