class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAssetKey: string | null = null;
  private listeners: Set<
    (state: {
      isPlaying: boolean;
      progress: number;
      assetKey: string | null;
    }) => void
  > = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  play(assetKey: string, filePath: string) {
    // If there is an active playing audio, stop it immediately to prevent overlap
    if (this.currentAudio) {
      this.stop();
    }

    this.currentAssetKey = assetKey;
    const audio = new Audio(filePath);
    this.currentAudio = audio;

    audio.addEventListener("play", () => this.notify());
    audio.addEventListener("pause", () => this.notify());
    audio.addEventListener("ended", () => {
      this.stop();
    });

    audio.play().catch((err) => {
      console.warn("Audio playback failed or was interrupted:", err.message);
    });

    this.intervalId = setInterval(() => {
      if (this.currentAudio) {
        this.notify();
      }
    }, 200);
  }

  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.notify();
    }
  }

  resume() {
    if (this.currentAudio) {
      this.currentAudio.play().catch((err) => {
        console.warn("Audio resume failed:", err.message);
      });
      this.notify();
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.currentAssetKey = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.notify();
  }

  isPlaying(assetKey: string): boolean {
    return this.currentAssetKey === assetKey && this.currentAudio
      ? !this.currentAudio.paused
      : false;
  }

  getPlayingAssetKey(): string | null {
    if (this.currentAudio && !this.currentAudio.paused) {
      return this.currentAssetKey;
    }
    return null;
  }

  subscribe(
    listener: (state: {
      isPlaying: boolean;
      progress: number;
      assetKey: string | null;
    }) => void,
  ) {
    this.listeners.add(listener);
    // Initial notification for the subscriber
    const isPlaying = this.currentAudio ? !this.currentAudio.paused : false;
    const progress =
      this.currentAudio && this.currentAudio.duration
        ? (this.currentAudio.currentTime / this.currentAudio.duration) * 100
        : 0;
    listener({ isPlaying, progress, assetKey: this.currentAssetKey });

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const isPlaying = this.currentAudio ? !this.currentAudio.paused : false;
    const progress =
      this.currentAudio && this.currentAudio.duration
        ? (this.currentAudio.currentTime / this.currentAudio.duration) * 100
        : 0;
    const assetKey = this.currentAssetKey;

    for (const listener of this.listeners) {
      listener({ isPlaying, progress, assetKey });
    }
  }
}

export const audioManager =
  typeof window !== "undefined" ? new AudioManager() : null;
