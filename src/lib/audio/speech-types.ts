export interface VoiceProfile {
  id: string;
  name: string;
  locale: string; // e.g. "ar-EG"
  gender: "male" | "female";
  description: string;
}

export interface PronunciationOverride {
  word: string;
  ipa?: string;
  diacritics?: string;
  pauseAfterMs?: number;
}

export interface AudioGenerationRequest {
  assetKey: string;
  spokenText: string;
  ssmlText?: string;
  voiceProfile: VoiceProfile;
  pronunciationOverrides?: PronunciationOverride[];
}

export interface GeneratedAudioAsset {
  assetKey: string;
  provider: string;
  providerVoiceId: string;
  locale: string;
  spokenText: string;
  ssmlText?: string;
  durationSeconds: number;
  fileHash: string;
  generationVersion: string;
  filePath: string;
}

export interface ArabicSpeechProvider {
  name: string;
  getAvailableVoices(): Promise<VoiceProfile[]>;
  generateSpeech(request: AudioGenerationRequest): Promise<GeneratedAudioAsset>;
}
