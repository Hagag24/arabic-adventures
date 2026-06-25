import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AzureSpeechProvider } from "./azure-speech-provider";

export class SpeechGenerationService {
  private provider = new AzureSpeechProvider();

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
      version: "v1", // Generation version
    });
    return crypto.createHash("sha256").update(data).digest("hex").slice(0, 12);
  }

  async generateItem(
    key: string,
    text: string,
    voice: string,
    speedRate: string,
    outputDir: string,
    prefix: string,
  ): Promise<{
    url: string;
    durationMs: number;
    sha256: string;
    filePath: string;
  }> {
    const payloadHash = this.getPayloadHash(key, text, voice, speedRate);
    const fileName = `${prefix}.${payloadHash}.mp3`;
    const outputPath = path.join(outputDir, fileName);

    // If file already exists, skip generation (idempotent/resumable)
    if (fs.existsSync(outputPath)) {
      const buffer = fs.readFileSync(outputPath);
      const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
      const durationMs = Math.round((buffer.length / 6000) * 1000);
      return {
        url: `/audio/v1/${prefix}/${fileName}`, // placeholder path
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
      url: `/audio/v1/${prefix}/${fileName}`,
      durationMs: result.durationMs,
      sha256: result.sha256,
      filePath: outputPath,
    };
  }
}
