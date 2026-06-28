import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGeminiSpeechProvider } from "./google-gemini-tts-provider";

export class SpeechGenerationService {
  private provider = new GoogleGeminiSpeechProvider();

  // Create hash based on key, text, voice, speed rate, and generation version to check if rerun is needed
  getPayloadHash(
    key: string,
    text: string,
    voice: string,
    speedRate: string,
  ): string {
    const data = JSON.stringify({
      key,
      text,
      voice,
      speedRate,
      version: "v2-google", // Generation version updated for Google
    });
    return crypto.createHash("sha256").update(data).digest("hex").slice(0, 12);
  }

  async generateItem(
    key: string,
    text: string,
    voice: string,
    speedRate: string, // "normal_educational" | "calm_slow"
    outputDir: string,
    prefix: string,
  ): Promise<{
    url: string;
    durationMs: number;
    sha256: string;
    filePath: string;
  }> {
    const payloadHash = this.getPayloadHash(key, text, voice, speedRate);
    const fileName = `${prefix}.${payloadHash}.wav`; // Save as WAV master first!
    const outputPath = path.join(outputDir, fileName);

    // If file already exists, skip generation (idempotent/resumable)
    if (fs.existsSync(outputPath)) {
      const buffer = fs.readFileSync(outputPath);
      const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
      // Estimate duration: 24kHz 16-bit mono = 48000 bytes/sec
      const pcmBytesLength = Math.max(0, buffer.length - 44);
      const durationMs = Math.round((pcmBytesLength / 48000) * 1000);
      return {
        url: `/audio/candidates/${prefix}/${fileName}`,
        durationMs,
        sha256,
        filePath: outputPath,
      };
    }

    // Ensure output dir exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Invoke provider to synthesize audio
    const result = await this.provider.synthesize(
      text,
      voice,
      speedRate,
      outputPath,
    );

    return {
      url: `/audio/candidates/${prefix}/${fileName}`,
      durationMs: result.durationMs,
      sha256: result.sha256,
      filePath: outputPath,
    };
  }
}
