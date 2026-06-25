import { audioPreferences } from "./audio-preferences";

export interface AudioAsset {
  url: string;
  durationMs: number;
  sha256: string;
  purpose: string;
}

export interface AudioManifest {
  version: string;
  assets: Record<string, AudioAsset>;
}

class AudioOrchestrator {
  private voiceAudio: HTMLAudioElement | null = null;
  private sfxAudio: HTMLAudioElement | null = null;
  private manifest: AudioManifest | null = null;
  private manifestLoaded = false;
  private manifestError = false;

  private isMutedState = false;
  private volumeVal = 0.7;

  private activePlaybackToken = 0;
  private currentActivityScopeId: string | null = null;

  // Dictation blocking state
  private dictationBlocked = false;

  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const prefs = audioPreferences.getPreferences();
      this.isMutedState = !prefs.enabled;
      this.volumeVal = prefs.volume;
      this.loadManifest();
    }
  }

  private async loadManifest() {
    try {
      let manifestUrl = "/audio/v1/audio-manifest.json";
      if (
        typeof window !== "undefined" &&
        window.location &&
        window.location.origin
      ) {
        manifestUrl = window.location.origin + "/audio/v1/audio-manifest.json";
      }
      const res = await fetch(manifestUrl);
      if (!res.ok) {
        throw new Error("Manifest not found or failed to load");
      }
      const data = await res.json();
      if (data && data.assets) {
        this.manifest = data as AudioManifest;
        this.manifestLoaded = true;
      } else {
        throw new Error("Invalid manifest schema");
      }
    } catch (e) {
      console.warn(
        "Audio manifest failed to load, falling back to silent operations:",
        e,
      );
      this.manifestError = true;
    }
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  isManifestLoaded() {
    return this.manifestLoaded;
  }

  isManifestError() {
    return this.manifestError;
  }

  isMuted() {
    return this.isMutedState;
  }

  getVolume() {
    return this.volumeVal;
  }

  isDictationBlocked() {
    return this.dictationBlocked;
  }

  setMute(muted: boolean) {
    this.isMutedState = muted;
    audioPreferences.setPreferences({ enabled: !muted });
    if (muted) {
      this.stopAll();
    }
    this.notify();
  }

  setVolume(vol: number) {
    this.volumeVal = Math.max(0, Math.min(1, vol));
    audioPreferences.setPreferences({ volume: this.volumeVal });
    if (this.voiceAudio) this.voiceAudio.volume = this.volumeVal;
    if (this.sfxAudio) this.sfxAudio.volume = this.volumeVal;
    this.notify();
  }

  setActivityScope(activityId: string) {
    if (this.currentActivityScopeId !== activityId) {
      this.currentActivityScopeId = activityId;
      this.stopAll();
    }
  }

  // Dictation integration block
  blockPlayback() {
    this.dictationBlocked = true;
    this.stopAll();
    this.notify();
  }

  unblockPlayback() {
    this.dictationBlocked = false;
    this.notify();
  }

  pauseVoice() {
    if (this.voiceAudio) {
      this.voiceAudio.pause();
      this.notify();
    }
  }

  resumeVoice() {
    if (this.voiceAudio && !this.isMutedState && !this.dictationBlocked) {
      this.voiceAudio.play().catch((err) => {
        console.warn("Failed to resume voice:", err);
      });
      this.notify();
    }
  }

  stopAll() {
    this.activePlaybackToken++;
    if (this.voiceAudio) {
      this.voiceAudio.pause();
      this.voiceAudio = null;
    }
    if (this.sfxAudio) {
      this.sfxAudio.pause();
      this.sfxAudio = null;
    }
    this.notify();
  }

  playKey(key: string): Promise<void> {
    if (this.isMutedState || this.dictationBlocked) {
      return Promise.resolve();
    }

    if (!this.manifest || !this.manifest.assets[key]) {
      console.warn(`Audio key not found in manifest: ${key}`);
      return Promise.resolve();
    }

    const asset = this.manifest.assets[key];
    return this.playUrl(asset.url, "voice");
  }

  playSFX(key: string): Promise<void> {
    if (this.isMutedState || this.dictationBlocked) {
      return Promise.resolve();
    }

    if (!this.manifest || !this.manifest.assets[key]) {
      console.warn(`SFX key not found in manifest: ${key}`);
      return Promise.resolve();
    }

    const asset = this.manifest.assets[key];
    return this.playUrl(asset.url, "sfx");
  }

  // Safe Sequence: Plays sound effect, pauses briefly, then triggers feedback voice narration
  async playFeedbackSequence(
    sfxKey: string,
    voiceKey: string | null,
  ): Promise<void> {
    if (this.isMutedState || this.dictationBlocked) {
      return;
    }

    this.stopAll();
    const token = this.activePlaybackToken;

    await this.playSFX(sfxKey);

    // Controlled delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (token === this.activePlaybackToken && voiceKey) {
      await this.playKey(voiceKey);
    }
  }

  private playUrl(url: string, channel: "voice" | "sfx"): Promise<void> {
    this.activePlaybackToken++;
    const currentToken = this.activePlaybackToken;

    return new Promise((resolve) => {
      try {
        const audio = new Audio(url);
        audio.volume = this.volumeVal;

        if (channel === "voice") {
          if (this.voiceAudio) {
            this.voiceAudio.pause();
          }
          this.voiceAudio = audio;
        } else {
          if (this.sfxAudio) {
            this.sfxAudio.pause();
          }
          this.sfxAudio = audio;
        }

        audio.addEventListener("ended", () => {
          if (currentToken === this.activePlaybackToken) {
            if (channel === "voice") this.voiceAudio = null;
            else this.sfxAudio = null;
            this.notify();
          }
          resolve();
        });

        audio.addEventListener("error", (e) => {
          console.warn(`Audio playback error on url: ${url}`, e);
          if (currentToken === this.activePlaybackToken) {
            if (channel === "voice") this.voiceAudio = null;
            else this.sfxAudio = null;
            this.notify();
          }
          resolve(); // Resolve anyway to avoid blocking execution flow
        });

        audio.play().catch((err) => {
          console.warn(`Play failed or was cancelled: ${url}`, err.message);
          resolve();
        });

        this.notify();
      } catch (err) {
        console.warn("Failed to instantiate Audio object:", err);
        resolve();
      }
    });
  }

  // Helper check for active playing narration
  isNarrating(): boolean {
    return this.voiceAudio ? !this.voiceAudio.paused : false;
  }

  hasPlayableAssets(): boolean {
    if (!this.manifest || !this.manifest.assets) return false;
    return Object.keys(this.manifest.assets).length > 0;
  }
}

export const audioOrchestrator =
  typeof window !== "undefined"
    ? new AudioOrchestrator()
    : (null as unknown as AudioOrchestrator);
