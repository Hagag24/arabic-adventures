import { audioPreferences } from "./audio-preferences";

export type PlaybackResult =
  | { status: "completed" }
  | { status: "cancelled"; reason: string }
  | { status: "blocked"; errorName: "NotAllowedError" }
  | { status: "failed"; error: unknown };

export interface AudioAsset {
  src: string;
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
      reason?: string;
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
  private currentSequenceId = 0;
  private currentActivityScopeId: string | null = null;
  private activeKey: string | null = null;
  private activeResolve: ((res: PlaybackResult) => void) | null = null;
  private activeSfxResolve: ((res: PlaybackResult) => void) | null = null;
  private activeOwnerId: string | null = null;
  private activeEntryIdentity: string | null = null;

  // Active event listeners for cleanup
  private activeListeners: {
    canplaythrough?: () => void;
    ended?: () => void;
    error?: (e: Event) => void;
  } = {};

  private activeSfxListeners: {
    ended?: () => void;
    error?: (e: Event) => void;
  } = {};

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
      this.voiceAudio = new Audio();
      this.sfxAudio = new Audio();
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
      if (data && typeof data === "object") {
        const assets: Record<string, AudioAsset> = {};
        const rawAssets = data.assets || data;
        for (const [key, value] of Object.entries(rawAssets)) {
          if (key === "version") continue;
          const val = value as {
            src?: string;
            url?: string;
            durationSeconds?: number;
            durationMs?: number;
            sha256?: string;
            category?: string;
            purpose?: string;
          };
          assets[key] = {
            src: val.src || val.url || "",
            durationMs:
              (val.durationSeconds || val.durationMs || 0) *
              (val.durationSeconds ? 1000 : 1),
            sha256: val.sha256 || "",
            purpose: val.category || val.purpose || "",
          };
        }
        this.manifest = {
          version: data.version ? String(data.version) : "1",
          assets,
        };
        this.manifestLoaded = true;
        console.assert(
          Object.keys(assets).length >= 253,
          `Incomplete production audio manifest loaded: expected at least 253, got ${Object.keys(assets).length}`,
        );
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

  async unlock(): Promise<void> {
    this.unlockedVal = true;
    if (this.voiceAudio) {
      try {
        await this.voiceAudio.play();
      } catch {}
    }
    this.notify();
  }

  hasAsset(key: string) {
    return !!this.manifest?.assets?.[key];
  }

  setUnlocked(unlocked: boolean) {
    this.unlockedVal = unlocked;
    this.notify();
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
      try {
        this.voiceAudio.pause();
      } catch {}
      this.playbackStatus = "paused";
      this.notify();
    }
  }

  resumeVoice() {
    if (this.voiceAudio && !this.isMutedState && !this.dictationBlocked) {
      this.playbackStatus = "playing";
      const token = this.activePlaybackToken;
      this.voiceAudio
        .play()
        .then(() => {
          this.unlockedVal = true;
          this.notify();
        })
        .catch((err) => {
          if (token === this.activePlaybackToken) {
            if (err.name === "NotAllowedError") {
              this.unlockedVal = false;
              this.playbackStatus = "idle";
              this.notify();
            } else if (err.name !== "AbortError") {
              console.warn("[AUDIO] Failed to resume voice:", err);
            }
          }
        });
      this.notify();
    }
  }

  setEntryIdentity(id: string) {
    this.activeEntryIdentity = id;
    console.log(`[AUDIO_LOG] entry-identity-changed | entryIdentity=${id} | timestamp=${Date.now()}`);
  }

  stopAll(reason?: string, ownerId?: string | null) {
    if (ownerId && this.activeOwnerId && this.activeOwnerId !== ownerId) {
      console.log(`[AUDIO_LOG] stopAll-ignored | ownerId=${ownerId} | activeOwnerId=${this.activeOwnerId} | reason=${reason}`);
      return;
    }
    this.stopAllLocally(reason);
    if (channel) {
      try {
        channel.postMessage({
          type: "STOP_ALL",
          tabId,
          reason,
        } as AudioBroadcastMessage);
      } catch (err) {
        console.warn("PostMessage failed:", err);
      }
    }
  }

  stopAllLocally(reason?: string) {
    const oldToken = this.activePlaybackToken;
    this.activePlaybackToken++;
    this.currentSequenceId++;
    this.activeOwnerId = null;
    
    if (this.activeResolve) {
      this.activeResolve({ status: "cancelled", reason: reason || "stop-called" });
      this.activeResolve = null;
    }
    if (this.activeSfxResolve) {
      this.activeSfxResolve({ status: "cancelled", reason: reason || "stop-called" });
      this.activeSfxResolve = null;
    }

    if (this.activeKey) {
      console.log(
        `[AUDIO_LOG] cancelled | reason=${reason || "stop-called"} | opToken=${oldToken} | key=${this.activeKey} | timestamp=${Date.now()}`
      );
    }

    if (this.voiceAudio) {
      if (this.activeListeners.canplaythrough) {
        this.voiceAudio.removeEventListener(
          "canplaythrough",
          this.activeListeners.canplaythrough,
        );
      }
      if (this.activeListeners.ended) {
        this.voiceAudio.removeEventListener(
          "ended",
          this.activeListeners.ended,
        );
      }
      if (this.activeListeners.error) {
        this.voiceAudio.removeEventListener(
          "error",
          this.activeListeners.error,
        );
      }
      try {
        this.voiceAudio.pause();
        if (this.voiceAudio.duration && !isNaN(this.voiceAudio.duration)) {
          this.voiceAudio.currentTime = 0;
        }
      } catch {}
    }

    if (this.sfxAudio) {
      if (this.activeSfxListeners.ended) {
        this.sfxAudio.removeEventListener(
          "ended",
          this.activeSfxListeners.ended,
        );
      }
      if (this.activeSfxListeners.error) {
        this.sfxAudio.removeEventListener(
          "error",
          this.activeSfxListeners.error,
        );
      }
      try {
        this.sfxAudio.pause();
        if (this.sfxAudio.duration && !isNaN(this.sfxAudio.duration)) {
          this.sfxAudio.currentTime = 0;
        }
      } catch {}
    }

    this.activeKey = null;
    this.playbackStatus = "idle";
    this.activePurpose = null;
    this.notify();
  }

  playKey(
    key: string,
    ownerId?: string | null,
    overridePurpose?: "instruction" | "prompt" | "option" | "correct_feedback" | "retry_feedback" | "completion" | null,
    onStart?: () => void,
  ): Promise<PlaybackResult> {
    console.log(`[AUDIO_LOG] requested | key=${key} | timestamp=${Date.now()}`);
    this.activeKey = key;
    if (this.isMutedState || this.dictationBlocked) {
      return Promise.resolve({ status: "cancelled", reason: "sound-disabled" });
    }

    const asset = this.manifest?.assets?.[key];
    const isValid =
      asset &&
      typeof asset.src === "string" &&
      asset.src.trim().length > 0 &&
      asset.src.startsWith("/audio/v1/");

    if (!isValid) {
      const reason = !asset
        ? "missing-entry"
        : !asset.src
          ? "missing-src"
          : "invalid-src";
      console.warn(`[AUDIO] missing asset\nkey=${key}\nreason=${reason}`);
      this.playbackStatus = "idle";
      this.notify();
      return Promise.resolve({ status: "failed", error: new Error(`Missing asset key: ${key}, reason: ${reason}`) });
    }

    this.activeKey = key;

    if (asset.purpose === "option") {
      if (this.optionPlayTimeout) {
        clearTimeout(this.optionPlayTimeout);
      }
      return new Promise<PlaybackResult>((resolve) => {
        this.optionPlayTimeout = setTimeout(() => {
          this.playUrl(asset.src, "voice", "option", ownerId, onStart).then(resolve);
        }, 130);
      });
    }

    let purpose:
      | "instruction"
      | "prompt"
      | "option"
      | "correct_feedback"
      | "retry_feedback"
      | "completion" = overridePurpose || "prompt";
    if (!overridePurpose) {
      if (asset.purpose === "instruction") purpose = "instruction";
      if (asset.purpose === "correct_feedback") purpose = "correct_feedback";
      if (asset.purpose === "retry_feedback") purpose = "retry_feedback";
      if (asset.purpose === "completion_feedback") purpose = "completion";
    }

    return this.playUrl(asset.src, "voice", purpose, ownerId, onStart);
  }

  playSFX(key: string, ownerId?: string | null, onStart?: () => void): Promise<PlaybackResult> {
    console.log(`[AUDIO_LOG] requested | key=${key} | timestamp=${Date.now()}`);
    if (this.isMutedState || this.dictationBlocked) {
      return Promise.resolve({ status: "cancelled", reason: "sound-disabled" });
    }

    const asset = this.manifest?.assets?.[key];
    const isValid =
      asset &&
      typeof asset.src === "string" &&
      asset.src.trim().length > 0 &&
      asset.src.startsWith("/audio/v1/");

    if (!isValid) {
      const reason = !asset
        ? "missing-entry"
        : !asset.src
          ? "missing-src"
          : "invalid-src";
      console.warn(`[AUDIO] missing asset\nkey=${key}\nreason=${reason}`);
      return Promise.resolve({ status: "failed", error: new Error(`Missing asset key: ${key}, reason: ${reason}`) });
    }

    return this.playUrl(asset.src, "sfx", null, ownerId, onStart);
  }

  async playFeedbackSequence(
    sfxKey: string,
    voiceKey: string | null,
  ): Promise<void> {
    if (this.isMutedState || this.dictationBlocked) {
      return;
    }

    this.stopAll("feedback-sequence-started");
    const token = this.activePlaybackToken;

    await this.playSFX(sfxKey);

    if (this.activePlaybackToken === token + 1 && voiceKey) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (this.activePlaybackToken === token + 1) {
        await this.playKey(voiceKey);
      }
    }
  }

  async playSequence(
    keys: string[],
    ownerId?: string | null,
    onStart?: () => void,
  ): Promise<PlaybackResult> {
    const seqId = ++this.currentSequenceId;
    const entryIdentity = this.activeEntryIdentity || "unknown";
    console.log(
      `[AUDIO_LOG] entry-sequence-requested | seqId=${seqId} | keys=${keys.join(", ")} | entryIdentity=${entryIdentity} | timestamp=${Date.now()}`,
    );

    const playableKeys = keys.filter((k) => this.hasKey(k));
    if (playableKeys.length === 0) {
      return { status: "completed" };
    }

    for (let i = 0; i < playableKeys.length; i++) {
      const key = playableKeys[i];
      if (this.currentSequenceId !== seqId) {
        console.log(`[AUDIO_LOG] cancelled | reason=new-playback-request | seqId=${seqId} | timestamp=${Date.now()}`);
        return { status: "cancelled", reason: "new-playback-request" };
      }

      console.log(`[AUDIO_LOG] sequence-step-start | seqId=${seqId} | key=${key} | step=${i + 1}/${playableKeys.length} | timestamp=${Date.now()}`);
      
      const result = await this.playKey(key, ownerId, null, i === 0 ? onStart : undefined);

      console.log(`[AUDIO_LOG] sequence-step-ended | seqId=${seqId} | key=${key} | status=${result.status} | timestamp=${Date.now()}`);

      if (result.status === "blocked") {
        return result;
      }
      if (result.status === "cancelled") {
        return result;
      }
      if (result.status === "failed") {
        return result;
      }

      if (this.currentSequenceId !== seqId) {
        console.log(`[AUDIO_LOG] cancelled | reason=new-playback-request | seqId=${seqId} | timestamp=${Date.now()}`);
        return { status: "cancelled", reason: "new-playback-request" };
      }

      if (i < playableKeys.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    return { status: "completed" };
  }

  async requestEntryNarration(params: {
    ownerId: string;
    entryId: string;
    instructionKey: string | null;
    questionKey: string | null;
    onPlaybackStart?: () => void;
  }): Promise<PlaybackResult> {
    if (this.isMutedState || this.dictationBlocked) {
      return { status: "cancelled", reason: "sound-disabled" };
    }

    this.stopAll("new-entry-narration-started");
    this.activeOwnerId = params.ownerId;
    this.activeEntryIdentity = params.entryId;
    const token = this.activePlaybackToken;

    // Reset status
    this.playbackStatus = "idle";

    // Play instruction if present and playable
    if (params.instructionKey && this.hasKey(params.instructionKey)) {
      const result = await this.playKey(params.instructionKey, params.ownerId, "instruction", params.onPlaybackStart);
      if (this.activePlaybackToken !== token + 1) {
        return { status: "cancelled", reason: "new-playback-started" };
      }
      if (result.status === "blocked") {
        return result;
      }
      if (result.status !== "completed") {
        return result;
      }
    }

    // Play question if present and playable
    if (params.questionKey && this.hasKey(params.questionKey)) {
      return this.playKey(params.questionKey, params.ownerId, "prompt", params.onPlaybackStart);
    }

    return { status: "completed" };
  }

  async playCelebrationSequence(
    sfxKey: string,
    voiceKey: string,
    ownerId: string,
    onStart?: () => void,
  ): Promise<PlaybackResult> {
    if (this.isMutedState || this.dictationBlocked) {
      return { status: "cancelled", reason: "sound-disabled" };
    }

    this.stopAll("celebration-sequence-started");
    this.activeOwnerId = ownerId;
    const token = this.activePlaybackToken;

    // 1. Play children celebration SFX
    const sfxResult = await this.playSFX(sfxKey, ownerId, onStart);
    
    if (this.activePlaybackToken !== token + 1) {
      return { status: "cancelled", reason: "new-playback-started" };
    }

    if (sfxResult.status === "blocked") {
      return sfxResult;
    }

    // 2. Play teacher congratulations
    if (voiceKey) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (this.activePlaybackToken === token + 1) {
        return this.playKey(voiceKey, ownerId, "completion", onStart);
      }
    }

    return { status: "completed" };
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
    ownerId?: string | null,
    onStart?: () => void,
  ): Promise<PlaybackResult> {
    const isValid =
      typeof url === "string" &&
      url.trim().length > 0 &&
      url.startsWith("/audio/v1/");

    if (!isValid) {
      const reason = !url ? "missing-src" : "invalid-src";
      console.warn(
        `[AUDIO] missing asset\nkey=${this.activeKey || "unknown"}\nreason=${reason}`,
      );
      return Promise.resolve({ status: "failed", error: new Error(`Invalid audio URL: ${url}, reason: ${reason}`) });
    }
    this.activePlaybackToken++;
    const currentToken = this.activePlaybackToken;

    if (channelType === "voice") {
      this.activeOwnerId = ownerId || null;
    }

    if (channelType === "voice" && this.activeResolve) {
      this.activeResolve({ status: "cancelled", reason: "new-playback-request" });
      this.activeResolve = null;
    }
    if (channelType === "sfx" && this.activeSfxResolve) {
      this.activeSfxResolve({ status: "cancelled", reason: "new-playback-request" });
      this.activeSfxResolve = null;
    }

    const audio = channelType === "voice" ? this.voiceAudio : this.sfxAudio;
    if (!audio) {
      return Promise.resolve({ status: "failed", error: new Error("Audio element not initialized") });
    }

    if (channelType === "voice") {
      this.currentSequenceId++;
    }

    // Remove previous event listeners
    if (channelType === "voice") {
      if (this.activeListeners.canplaythrough) {
        audio.removeEventListener(
          "canplaythrough",
          this.activeListeners.canplaythrough,
        );
      }
      if (this.activeListeners.ended) {
        audio.removeEventListener("ended", this.activeListeners.ended);
      }
      if (this.activeListeners.error) {
        audio.removeEventListener("error", this.activeListeners.error);
      }
    } else {
      if (this.activeSfxListeners.ended) {
        audio.removeEventListener("ended", this.activeSfxListeners.ended);
      }
      if (this.activeSfxListeners.error) {
        audio.removeEventListener("error", this.activeSfxListeners.error);
      }
    }

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

    // Safe transition: pause current element, reset currentTime and src
    try {
      audio.pause();
    } catch {}

    try {
      if (audio.duration && !isNaN(audio.duration)) {
        audio.currentTime = 0;
      }
    } catch {}

    audio.src = url;
    audio.load();
    audio.volume = this.volumeVal;

    if (channelType === "voice") {
      if (this.bufferTimeout) clearTimeout(this.bufferTimeout);
      if (this.switchTimeout) clearTimeout(this.switchTimeout);

      this.switchTimeout = setTimeout(() => {
        if (
          currentToken === this.activePlaybackToken &&
          this.playbackStatus === "idle"
        ) {
          this.playbackStatus = "switching";
          this.notify();
        }
      }, 200);

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

    return new Promise<PlaybackResult>((resolve) => {
      if (channelType === "voice") {
        this.activeResolve = resolve;
      } else {
        this.activeSfxResolve = resolve;
      }

      let started = false;
      const triggerStart = () => {
        if (!started) {
          started = true;
          if (onStart) {
            onStart();
          }
        }
      };

      const onCanPlayThrough = () => {
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
      };

      const onPlaying = () => {
        if (currentToken === this.activePlaybackToken) {
          console.log(`[AUDIO_LOG] playing | opToken=${currentToken} | key=${this.activeKey} | timestamp=${Date.now()}`);
          triggerStart();
        }
      };

      let hasLoggedTime = false;
      const onTimeUpdate = () => {
        if (
          currentToken === this.activePlaybackToken &&
          !hasLoggedTime &&
          audio.currentTime > 0
        ) {
          hasLoggedTime = true;
          console.log(`[AUDIO_LOG] timeupdate | opToken=${currentToken} | key=${this.activeKey} | currentTime=${audio.currentTime} | timestamp=${Date.now()}`);
        }
      };

      const cleanupListeners = () => {
        audio.removeEventListener("canplaythrough", onCanPlayThrough);
        audio.removeEventListener("playing", onPlaying);
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
      };

      const onEnded = () => {
        console.log(`[AUDIO_LOG] ended | opToken=${currentToken} | key=${this.activeKey} | timestamp=${Date.now()}`);
        cleanupListeners();
        if (currentToken === this.activePlaybackToken) {
          if (channelType === "voice") {
            if (this.activeResolve === resolve) {
              this.activeResolve = null;
            }
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
            if (this.activeSfxResolve === resolve) {
              this.activeSfxResolve = null;
            }
          }
        }
        resolve({ status: "completed" });
      };

      const onError = (e: Event) => {
        console.warn(`[AUDIO_LOG] media error: failed loading url: ${url}`, e);
        cleanupListeners();
        if (currentToken === this.activePlaybackToken) {
          if (channelType === "voice") {
            if (this.activeResolve === resolve) {
              this.activeResolve = null;
            }
            this.playbackStatus = "error";
            this.activePurpose = null;
            this.notify();
          } else {
            if (this.activeSfxResolve === resolve) {
              this.activeSfxResolve = null;
            }
          }
        }
        resolve({ status: "failed", error: e });
      };

      if (channelType === "voice") {
        this.activeListeners = {
          canplaythrough: onCanPlayThrough,
          ended: onEnded,
          error: onError,
        };
        audio.addEventListener("canplaythrough", onCanPlayThrough);
        audio.addEventListener("playing", onPlaying);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);
      } else {
        this.activeSfxListeners = {
          ended: onEnded,
          error: onError,
        };
        audio.addEventListener("playing", onPlaying);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("error", onError);
      }

      console.log(
        `[AUDIO_LOG] play-call | opToken=${currentToken} | key=${this.activeKey} | url=${url} | timestamp=${Date.now()}`,
      );
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (currentToken === this.activePlaybackToken) {
              this.unlockedVal = true;
              this.notify();
              triggerStart();
            }
          })
          .catch((err) => {
            cleanupListeners();
            if (currentToken !== this.activePlaybackToken) {
              console.log(
                `[AUDIO_LOG] cancelled | reason=new-playback-request | opToken=${currentToken} | key=${this.activeKey} | timestamp=${Date.now()}`,
              );
              resolve({ status: "cancelled", reason: "new-playback-request" });
              return;
            }

            if (channelType === "voice") {
              if (this.activeResolve === resolve) {
                this.activeResolve = null;
              }
            } else {
              if (this.activeSfxResolve === resolve) {
                this.activeSfxResolve = null;
              }
            }

            if (err.name === "NotAllowedError") {
              console.log(
                `[AUDIO_LOG] NotAllowedError | opToken=${currentToken} | key=${this.activeKey} | timestamp=${Date.now()}`,
              );
              this.unlockedVal = false;
              this.playbackStatus = "idle";
              this.notify();
              resolve({ status: "blocked", errorName: "NotAllowedError" });
              return;
            }

            if (err.name === "AbortError") {
              console.log(
                `[AUDIO_LOG] AbortError | opToken=${currentToken} | key=${this.activeKey} | timestamp=${Date.now()}`,
              );
              resolve({ status: "cancelled", reason: "abort-error" });
              return;
            }

            console.warn(
              `[AUDIO] media error: Play failed on ${url}. Error: ${err.message}`,
            );
            resolve({ status: "failed", error: err });
          });
      } else {
        if (
          currentToken === this.activePlaybackToken &&
          channelType === "voice"
        ) {
          if (this.activeResolve === resolve) {
            this.activeResolve = null;
          }
          this.unlockedVal = true;
          this.notify();
        } else if (
          currentToken === this.activePlaybackToken &&
          channelType === "sfx"
        ) {
          if (this.activeSfxResolve === resolve) {
            this.activeSfxResolve = null;
          }
        }
        resolve({ status: "completed" });
      }

      this.notify();
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
    const asset = this.manifest.assets[key];
    return !!(
      asset &&
      typeof asset.src === "string" &&
      asset.src.trim().length > 0 &&
      asset.src.startsWith("/audio/v1/")
    );
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
