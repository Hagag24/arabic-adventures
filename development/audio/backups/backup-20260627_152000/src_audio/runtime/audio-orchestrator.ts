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

export type AudioBroadcastMessage =
  | {
      type: "PLAY_STARTED";
      tabId: string;
      playbackToken: string;
    }
  | {
      type: "STOP_ALL";
      tabId: string;
    };

const tabId =
  typeof window !== "undefined"
    ? Math.random().toString(36).slice(2, 9)
    : "server";
let channel: BroadcastChannel | null = null;

class AudioOrchestrator {
  private voiceAudio: HTMLAudioElement | null = null;
  private sfxAudio: HTMLAudioElement | null = null;
  private manifest: AudioManifest | null = null;
  private manifestLoaded = false;
  private manifestError = false;

  private isMutedState = false;
  private volumeVal = 0.7;
  private unlockedVal = false;

  private activePlaybackToken = 0;
  private currentActivityScopeId: string | null = null;
  private activeKey: string | null = null;

  // Playback state derived facts
  private playbackStatus:
    | "idle"
    | "buffering"
    | "playing"
    | "paused"
    | "switching"
    | "error" = "idle";
  private activePurpose:
    | "instruction"
    | "prompt"
    | "option"
    | "correct_feedback"
    | "retry_feedback"
    | "completion"
    | null = null;

  // Dictation blocking state
  private dictationBlocked = false;

  private listeners: Set<() => void> = new Set();
  private optionPlayTimeout: NodeJS.Timeout | null = null;

  // Visual state timings
  private bufferTimeout: NodeJS.Timeout | null = null;
  private switchTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const prefs = audioPreferences.getPreferences();
      this.isMutedState = !prefs.enabled;
      this.volumeVal = prefs.volume;
      this.loadManifest();
      this.setupBroadcastChannel();
    }
  }

  private setupBroadcastChannel() {
    if (
      typeof window !== "undefined" &&
      typeof BroadcastChannel !== "undefined"
    ) {
      try {
        channel = new BroadcastChannel("ArabicAdventures.Audio");
        channel.onmessage = (event) => {
          const msg = event.data as AudioBroadcastMessage;
          if (msg && msg.tabId !== tabId) {
            if (msg.type === "PLAY_STARTED" || msg.type === "STOP_ALL") {
              this.stopAllLocally();
            }
          }
        };
      } catch (err) {
        console.warn("Failed to initialize BroadcastChannel:", err);
      }
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
      } else if (data && typeof data === "object") {
        const assets: Record<string, AudioAsset> = {};
        for (const [key, value] of Object.entries(data)) {
          const val = value as any;
          if (key === "version") continue;
          assets[key] = {
            url: val.src || val.url || "",
            durationMs: (val.durationSeconds || val.durationMs || 0) * (val.durationSeconds ? 1000 : 1),
            sha256: val.sha256 || "",
            purpose: val.category || val.purpose || "",
          };
        }
        this.manifest = {
          version: data.version ? String(data.version) : "1",
          assets,
        };
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

  getActiveKey() {
    return this.activeKey;
  }

  getVolume() {
    return this.volumeVal;
  }

  isDictationBlocked() {
    return this.dictationBlocked;
  }

  isUnlocked() {
    return this.unlockedVal;
  }

  getPlaybackStatus() {
    return this.playbackStatus;
  }

  getActivePurpose() {
    return this.activePurpose;
  }

  setMute(muted: boolean) {
    this.unlockedVal = true; // User interaction unlocks audio context
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
      this.playbackStatus = "paused";
      this.notify();
    }
  }

  resumeVoice() {
    this.unlockedVal = true;
    if (this.voiceAudio && !this.isMutedState && !this.dictationBlocked) {
      this.playbackStatus = "playing";
      this.voiceAudio.play().catch((err) => {
        console.warn("Failed to resume voice:", err);
      });
      this.notify();
    }
  }

  private fadeAndStop(audio: HTMLAudioElement | null) {
    if (!audio) return;
    const startVolume = audio.volume;
    const duration = 80; // 80 ms fade
    const steps = 8;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (audio) {
        audio.volume = Math.max(0, startVolume * (1 - currentStep / steps));
      }
      if (currentStep >= steps) {
        clearInterval(timer);
        try {
          audio?.pause();
        } catch {}
      }
    }, interval);
  }

  stopAll() {
    this.stopAllLocally();
    if (channel) {
      try {
        channel.postMessage({
          type: "STOP_ALL",
          tabId,
        });
      } catch (err) {
        console.warn("PostMessage failed:", err);
      }
    }
  }

  stopAllLocally() {
    this.activePlaybackToken++;
    if (this.voiceAudio) {
      this.fadeAndStop(this.voiceAudio);
      this.voiceAudio = null;
    }
    if (this.sfxAudio) {
      this.fadeAndStop(this.sfxAudio);
      this.sfxAudio = null;
    }
    this.activeKey = null;
    this.playbackStatus = "idle";
    this.activePurpose = null;
    this.notify();
  }

  playKey(key: string): Promise<void> {
    console.log(`[AUDIO] Playing: ${key}`);
    this.activeKey = key;
    if (this.isMutedState || this.dictationBlocked) {
      return Promise.resolve();
    }

    if (!this.manifest || !this.manifest.assets[key]) {
      console.warn(`Audio key not found in manifest: ${key}`);
      return Promise.resolve();
    }

    const asset = this.manifest.assets[key];

    // Handle debouncing for rapid option selections (130 ms)
    if (asset.purpose === "option") {
      if (this.optionPlayTimeout) {
        clearTimeout(this.optionPlayTimeout);
      }
      return new Promise((resolve) => {
        this.optionPlayTimeout = setTimeout(() => {
          this.playUrl(asset.url, "voice", "option").then(resolve);
        }, 130);
      });
    }

    // Determine visual state purpose
    let purpose:
      | "instruction"
      | "prompt"
      | "option"
      | "correct_feedback"
      | "retry_feedback"
      | "completion" = "prompt";
    if (asset.purpose === "instruction") purpose = "instruction";
    if (asset.purpose === "correct_feedback") purpose = "correct_feedback";
    if (asset.purpose === "retry_feedback") purpose = "retry_feedback";
    if (asset.purpose === "completion_feedback") purpose = "completion";

    return this.playUrl(asset.url, "voice", purpose);
  }

  playSFX(key: string): Promise<void> {
    console.log(`[AUDIO] Playing: ${key}`);
    if (this.isMutedState || this.dictationBlocked) {
      return Promise.resolve();
    }

    if (!this.manifest || !this.manifest.assets[key]) {
      console.warn(`SFX key not found in manifest: ${key}`);
      return Promise.resolve();
    }

    const asset = this.manifest.assets[key];
    return this.playUrl(asset.url, "sfx", null);
  }

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

    // 120-180 ms pause between SFX and voice feedback
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (token === this.activePlaybackToken && voiceKey) {
      await this.playKey(voiceKey);
    }
  }

  private playUrl(
    url: string,
    channelType: "voice" | "sfx",
    purpose:
      | "instruction"
      | "prompt"
      | "option"
      | "correct_feedback"
      | "retry_feedback"
      | "completion"
      | null,
  ): Promise<void> {
    this.unlockedVal = true;
    this.activePlaybackToken++;
    const currentToken = this.activePlaybackToken;

    // Broadcast tab playback event
    if (channel && channelType === "voice") {
      try {
        channel.postMessage({
          type: "PLAY_STARTED",
          tabId,
          playbackToken: String(currentToken),
        });
      } catch (err) {
        console.warn("PostMessage failed:", err);
      }
    }

    // Timer management for visual states
    if (channelType === "voice") {
      if (this.bufferTimeout) clearTimeout(this.bufferTimeout);
      if (this.switchTimeout) clearTimeout(this.switchTimeout);

      // Switching state only if take longer than 200 ms
      this.switchTimeout = setTimeout(() => {
        if (
          currentToken === this.activePlaybackToken &&
          this.playbackStatus === "idle"
        ) {
          this.playbackStatus = "switching";
          this.notify();
        }
      }, 200);

      // Buffering state shown only after 150 ms
      this.bufferTimeout = setTimeout(() => {
        if (
          currentToken === this.activePlaybackToken &&
          (this.playbackStatus === "idle" ||
            this.playbackStatus === "switching")
        ) {
          this.playbackStatus = "buffering";
          this.notify();
        }
      }, 150);
    }

    return new Promise((resolve) => {
      try {
        const audio = new Audio(url);
        audio.volume = this.volumeVal;

        if (channelType === "voice") {
          if (this.voiceAudio) {
            this.fadeAndStop(this.voiceAudio);
          }
          this.voiceAudio = audio;
        } else {
          if (this.sfxAudio) {
            this.fadeAndStop(this.sfxAudio);
          }
          this.sfxAudio = audio;
        }

        audio.addEventListener("canplaythrough", () => {
          if (
            currentToken === this.activePlaybackToken &&
            channelType === "voice"
          ) {
            if (this.bufferTimeout) clearTimeout(this.bufferTimeout);
            if (this.switchTimeout) clearTimeout(this.switchTimeout);
            this.playbackStatus = "playing";
            this.activePurpose = purpose;
            this.notify();
          }
        });

        audio.addEventListener("ended", () => {
          if (currentToken === this.activePlaybackToken) {
            if (channelType === "voice") {
              this.voiceAudio = null;
              // visual state remains visible for 800-1400 ms on feedback completion
              if (
                purpose === "correct_feedback" ||
                purpose === "retry_feedback" ||
                purpose === "completion"
              ) {
                setTimeout(() => {
                  if (currentToken === this.activePlaybackToken) {
                    this.playbackStatus = "idle";
                    this.activePurpose = null;
                    this.notify();
                  }
                }, 1000);
              } else {
                this.playbackStatus = "idle";
                this.activePurpose = null;
                this.notify();
              }
            } else {
              this.sfxAudio = null;
            }
          }
          resolve();
        });

        audio.addEventListener("error", (e) => {
          console.warn(`Audio playback error on url: ${url}`, e);
          if (currentToken === this.activePlaybackToken) {
            if (channelType === "voice") {
              this.voiceAudio = null;
              this.playbackStatus = "error";
              this.activePurpose = null;
              this.notify();
            } else {
              this.sfxAudio = null;
            }
          }
          resolve(); // Resolve to avoid blocking execution flow
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

  isNarrating(): boolean {
    return this.voiceAudio ? !this.voiceAudio.paused : false;
  }

  hasPlayableAssets(): boolean {
    if (!this.manifest || !this.manifest.assets) return false;
    return Object.keys(this.manifest.assets).length > 0;
  }

  hasKey(key: string): boolean {
    if (!this.manifest || !this.manifest.assets) return false;
    return !!this.manifest.assets[key];
  }

  dispose() {
    if (channel) {
      try {
        channel.close();
      } catch {}
    }
  }
}

export const audioOrchestrator =
  typeof window !== "undefined"
    ? new AudioOrchestrator()
    : (null as unknown as AudioOrchestrator);

if (typeof window !== "undefined" && audioOrchestrator) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (
    process.env.NODE_ENV === "test" ||
    win.__AUDIO_TEST_HOOKS_ENABLED__ === true
  ) {
    win.__audioOrchestrator = audioOrchestrator;
  }
}
