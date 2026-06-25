import fs from "fs";
import crypto from "crypto";
import { SpeechProvider } from "./speech-provider";

export class AzureSpeechProvider implements SpeechProvider {
  name = "azure";

  async synthesize(
    text: string,
    voice: string,
    speedRate: string,
    outputPath: string,
  ): Promise<{ durationMs: number; sha256: string }> {
    const key = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || "eastus";

    if (!key) {
      throw new Error(
        "Missing required developer credential: AZURE_SPEECH_KEY",
      );
    }

    const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const ssml = `<speak version='1.0' xml:lang='ar-EG'><voice name='${voice}'><prosody rate='${speedRate}'>${text}</prosody></voice></speak>`;

    const headers = {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "ArabicAdventuresTTS",
    };

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: ssml,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `Azure TTS request failed status=${res.status}: ${errText}`,
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate sha256 checksum
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

    // Estimate duration: 48kbps = 6000 bytes/sec
    const durationMs = Math.round((buffer.length / 6000) * 1000);

    // Write file to output location
    fs.writeFileSync(outputPath, buffer);

    return { durationMs, sha256 };
  }
}
