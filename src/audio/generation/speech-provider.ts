export interface VoiceProfile {
  id: string;
  name: string;
  locale: string;
  gender: "male" | "female";
  description: string;
}

export interface SpeechProvider {
  name: string;
  synthesize(
    text: string,
    voice: string,
    speedRate: string, // e.g. "0%", "-8%"
    outputPath: string,
  ): Promise<{ durationMs: number; sha256: string }>;
}
