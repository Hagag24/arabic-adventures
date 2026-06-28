import fs from "fs";
import crypto from "crypto";
import path from "path";
import { SpeechProvider } from "./speech-provider";
import { decodeAndSaveAudio } from "./audio-response-decoder";

export type GoogleAudioAuthMode = "gemini_api_key" | "vertex_ai";
export type GoogleSpeechContentKind = "educational" | "feedback";

interface GenerateContentRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig: {
    responseModalities: ["AUDIO"];
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: string;
        };
      };
    };
  };
}

export class GenerateContentAdapter {
  async generate(
    apiKey: string,
    model: string,
    voice: string,
    prompt: string,
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const request: GenerateContentRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(
        `Generate Content API returned status ${res.status}: ${await res.text()}`,
      );
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  }
}

export class VertexAIAdapter {
  async generate(
    project: string,
    location: string,
    accessToken: string,
    model: string,
    voice: string,
    prompt: string,
  ): Promise<string> {
    const url = `https://${location}-aiplatform.googleapis.com/v1beta/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`;
    const request: GenerateContentRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(
        `Vertex AI Generate Content API returned status ${res.status}: ${await res.text()}`,
      );
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  }
}

const EDUCATIONAL_PERFORMANCE = `You are a professional Egyptian Arabic educational narrator speaking to a child between 8 and 13 years old.
Use a natural Egyptian vocal identity with very clear Arabic pronunciation.
Sound like a calm, warm, friendly Egyptian teacher.
Preserve formal Arabic wording exactly for lesson content.
Do not rewrite formal Arabic into slang.
Speak at a comfortable educational pace.
Keep consonants, hamza, shadda, long vowels, and taa marbuta clear.
Avoid robotic rhythm, exaggerated radio delivery, theatrical acting, Gulf pronunciation, Levantine pronunciation, or Maghrebi pronunciation.
Do not add words, delete words, explain the sentence, repeat the sentence, or announce the performance instructions.
Read only the Arabic text supplied under TEXT TO SPEAK VERBATIM.`;

const FEEDBACK_PERFORMANCE = `Use warm natural Egyptian Arabic.
Sound encouraging, friendly, and happy.
Do not shout. Do not exaggerate. Never sound disappointed or harsh.
Do not add words, delete words, explain the sentence, repeat the sentence, or announce the performance instructions.
Read only the Arabic text supplied under TEXT TO SPEAK VERBATIM.`;

export class GoogleGeminiSpeechProvider implements SpeechProvider {
  name = "google-gemini";
  lastApiPath: "generate_content" | "vertex_generate_content" =
    "generate_content";
  private generateContentAdapter = new GenerateContentAdapter();
  private vertexAIAdapter = new VertexAIAdapter();

  getAuthMode(): GoogleAudioAuthMode {
    if (process.env.GEMINI_API_KEY) {
      return "gemini_api_key";
    }
    if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_LOCATION) {
      return "vertex_ai";
    }
    throw new Error(
      "Missing Google authentication credentials. Please set GEMINI_API_KEY in your .env file, or configure GOOGLE_CLOUD_PROJECT and GOOGLE_CLOUD_LOCATION for Vertex AI mode.",
    );
  }

  async verifyModelEndpoint(modelName: string): Promise<boolean> {
    const authMode = this.getAuthMode();
    if (authMode === "gemini_api_key") {
      const apiKey = process.env.GEMINI_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}?key=${apiKey}`;
      try {
        const res = await fetch(url);
        return res.ok;
      } catch {
        return false;
      }
    }
    return true;
  }

  buildPrompt(
    text: string,
    speedRate: string,
    contentKind: GoogleSpeechContentKind,
  ): string {
    const paceInstruction =
      speedRate === "calm_slow"
        ? "Delivery Style: calm_slow — speak slightly slower with extra clarity and gentle pacing."
        : "Delivery Style: normal_educational — speak at a natural educational pace.";

    const performanceInstructions =
      contentKind === "feedback"
        ? FEEDBACK_PERFORMANCE
        : EDUCATIONAL_PERFORMANCE;

    return `${performanceInstructions}\n\n${paceInstruction}\n\nTEXT TO SPEAK VERBATIM:\n${text}`;
  }

  async synthesize(
    text: string,
    voice: string,
    speedRate: string,
    outputPath: string,
    overrideModel?: string,
    contentKind: GoogleSpeechContentKind = "educational",
  ): Promise<{ durationMs: number; sha256: string }> {
    const authMode = this.getAuthMode();
    const model =
      overrideModel ||
      process.env.GEMINI_TTS_MODEL ||
      "gemini-2.5-flash-preview-tts";

    const finalPrompt = this.buildPrompt(text, speedRate, contentKind);

    let audioBase64 = "";

    if (authMode === "gemini_api_key") {
      this.lastApiPath = "generate_content";
      const apiKey = process.env.GEMINI_API_KEY!;
      audioBase64 = await this.generateContentAdapter.generate(
        apiKey,
        model,
        voice,
        finalPrompt,
      );
    } else {
      this.lastApiPath = "vertex_generate_content";
      const project = process.env.GOOGLE_CLOUD_PROJECT!;
      const location = process.env.GOOGLE_CLOUD_LOCATION!;
      const accessToken = process.env.GCLOUD_ACCESS_TOKEN || "";
      if (!accessToken) {
        throw new Error(
          "Vertex AI authentication requires GCLOUD_ACCESS_TOKEN environment variable to be set.",
        );
      }

      audioBase64 = await this.vertexAIAdapter.generate(
        project,
        location,
        accessToken,
        model,
        voice,
        finalPrompt,
      );
    }

    if (!audioBase64) {
      throw new Error("No audio payload returned from Gemini API");
    }

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    decodeAndSaveAudio(audioBase64, outputPath, 24000);

    const buffer = fs.readFileSync(outputPath);
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const pcmBytesLength = Math.max(0, buffer.length - 44);
    const durationMs = Math.round((pcmBytesLength / 48000) * 1000);

    return { durationMs, sha256 };
  }
}
