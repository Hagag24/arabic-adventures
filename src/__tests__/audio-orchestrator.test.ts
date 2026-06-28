/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type */
import { vi, describe, test, expect, beforeEach } from "vitest";

vi.hoisted(() => {
  if (typeof window !== "undefined") {
    (globalThis as any).mockPlayRejectReason = null;
    (globalThis as any).mockPlayPromise = Promise.resolve();

    (window as any).Audio = vi.fn().mockImplementation(function () {
      const listeners: Record<string, Function[]> = {};
      const instance = {
        src: "",
        volume: 1,
        duration: 1.5,
        currentTime: 0,
        load: vi.fn(),
        play: vi.fn().mockImplementation(() => {
          const rejectReason = (globalThis as any).mockPlayRejectReason;
          if (rejectReason) {
            return Promise.reject(rejectReason);
          }
          return (globalThis as any).mockPlayPromise;
        }),
        pause: vi.fn(),
        addEventListener: vi
          .fn()
          .mockImplementation((event: string, callback: Function) => {
            listeners[event] = listeners[event] || [];
            listeners[event].push(callback);
          }),
        removeEventListener: vi
          .fn()
          .mockImplementation((event: string, callback: Function) => {
            if (listeners[event]) {
              listeners[event] = listeners[event].filter(
                (cb) => cb !== callback,
              );
            }
          }),
        _trigger: (event: string, ...args: any[]) => {
          if (listeners[event]) {
            listeners[event].forEach((cb) => cb(...args));
          }
        },
      };
      return instance;
    });
  }
});

import { audioOrchestrator } from "../audio/runtime/audio-orchestrator";

describe("AudioOrchestrator Core Runtime Operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).mockPlayPromise = Promise.resolve();
    (globalThis as any).mockPlayRejectReason = null;

    // Reset orchestrator state
    if (audioOrchestrator) {
      audioOrchestrator.stopAll();
      audioOrchestrator.setMute(false);
      audioOrchestrator.setUnlocked(false);
    }
  });

  test("NotAllowedError correctly changes state to unlock required and does not throw", async () => {
    // Mock NotAllowedError (autoplay blocked)
    const notAllowedError = new DOMException(
      "Autoplay blocked",
      "NotAllowedError",
    );
    (globalThis as any).mockPlayRejectReason = notAllowedError;

    // Mock manifest setup
    (audioOrchestrator as any).manifest = {
      version: "1",
      assets: {
        "global.welcome.01": {
          src: "/audio/v1/welcome.wav",
          durationMs: 1000,
          sha256: "hash",
          purpose: "welcome",
        },
      },
    };

    await audioOrchestrator.playKey("global.welcome.01");

    expect(audioOrchestrator.isUnlocked()).toBe(false);
    expect(audioOrchestrator.getPlaybackStatus()).toBe("idle");
  });

  test("Successful playKey sets unlocked to true", async () => {
    (globalThis as any).mockPlayRejectReason = null;
    (globalThis as any).mockPlayPromise = Promise.resolve();

    (audioOrchestrator as any).manifest = {
      version: "1",
      assets: {
        "global.welcome.01": {
          src: "/audio/v1/welcome.wav",
          durationMs: 1000,
          sha256: "hash",
          purpose: "welcome",
        },
      },
    };

    const playPromise = audioOrchestrator.playKey("global.welcome.01");

    // Simulate audio playback starting successfully by triggering canplaythrough and ended
    setTimeout(() => {
      const activeInstance = (audioOrchestrator as any).voiceAudio;
      if (activeInstance) {
        activeInstance._trigger("canplaythrough");
        setTimeout(() => {
          activeInstance._trigger("ended");
        }, 10);
      }
    }, 10);

    await playPromise;
    expect(audioOrchestrator.isUnlocked()).toBe(true);
  });

  test("New playback request cancels the previous operation", async () => {
    (audioOrchestrator as any).manifest = {
      version: "1",
      assets: {
        "audio-1": {
          src: "/audio/v1/1.wav",
          durationMs: 1000,
          sha256: "hash",
          purpose: "instruction",
        },
        "audio-2": {
          src: "/audio/v1/2.wav",
          durationMs: 1000,
          sha256: "hash",
          purpose: "prompt",
        },
      },
    };

    const firstPlay = audioOrchestrator.playKey("audio-1");
    const secondPlay = audioOrchestrator.playKey("audio-2");

    // The first playback should be aborted or ignored when the second starts
    expect((audioOrchestrator as any).activePlaybackToken).toBeGreaterThan(1);

    // Trigger events on the voiceAudio instance
    setTimeout(() => {
      const activeInstance = (audioOrchestrator as any).voiceAudio;
      if (activeInstance) {
        activeInstance._trigger("canplaythrough");
        activeInstance._trigger("ended");
      }
    }, 10);

    await Promise.all([firstPlay, secondPlay]);
  });

  test("playSequence plays items sequentially and handles cancellations", async () => {
    (audioOrchestrator as any).manifest = {
      version: "1",
      assets: {
        "seq-1": {
          src: "/audio/v1/s1.wav",
          durationMs: 500,
          sha256: "h",
          purpose: "instruction",
        },
        "seq-2": {
          src: "/audio/v1/s2.wav",
          durationMs: 500,
          sha256: "h",
          purpose: "prompt",
        },
      },
    };

    const seqPromise = audioOrchestrator.playSequence(["seq-1", "seq-2"]);

    // Trigger loaded for the first key in sequence
    setTimeout(() => {
      const activeInstance = (audioOrchestrator as any).voiceAudio;
      if (activeInstance) {
        activeInstance._trigger("canplaythrough");
      }
    }, 10);

    // Cancel sequence mid-play
    setTimeout(() => {
      audioOrchestrator.stopAll();
    }, 30);

    const result = await seqPromise;
    expect(result).toEqual({ status: "cancelled", reason: "stop-called" });
  });

  test("playFeedbackSequence plays SFX and waits for it to end before playing the voice", async () => {
    (audioOrchestrator as any).manifest = {
      version: "1",
      assets: {
        "global.sfx.correct": {
          src: "/audio/v1/correct.wav",
          durationMs: 400,
          sha256: "sfx-hash",
          purpose: "sfx",
        },
        "global.feedback.correct.01": {
          src: "/audio/v1/correct_feedback.wav",
          durationMs: 1500,
          sha256: "feedback-hash",
          purpose: "correct_feedback",
        },
      },
    };

    const sfxAudio = (audioOrchestrator as any).sfxAudio;
    const voiceAudio = (audioOrchestrator as any).voiceAudio;

    let sfxEnded = false;
    let voicePlayed = false;

    // Monitor play calls
    const originalSfxPlay = sfxAudio.play;
    sfxAudio.play = vi.fn().mockImplementation(() => {
      return Promise.resolve();
    });

    const originalVoicePlay = voiceAudio.play;
    voiceAudio.play = vi.fn().mockImplementation(() => {
      expect(sfxEnded).toBe(true); // Ensure SFX has ended before voice plays
      voicePlayed = true;
      return Promise.resolve();
    });

    const seqPromise = audioOrchestrator.playFeedbackSequence(
      "global.sfx.correct",
      "global.feedback.correct.01"
    );

    // Simulate SFX ending after 20ms
    setTimeout(() => {
      sfxEnded = true;
      sfxAudio._trigger("ended");
    }, 20);

    // Simulate voice audio loaded
    setTimeout(() => {
      voiceAudio._trigger("canplaythrough");
      voiceAudio._trigger("ended");
    }, 200);

    await seqPromise;

    expect(sfxAudio.play).toHaveBeenCalled();
    expect(voiceAudio.play).toHaveBeenCalled();
    expect(voicePlayed).toBe(true);

    // Restore original functions
    sfxAudio.play = originalSfxPlay;
    voiceAudio.play = originalVoicePlay;
  });

  test("playFeedbackSequence does not play voice if cancelled during SFX", async () => {
    (audioOrchestrator as any).manifest = {
      version: "1",
      assets: {
        "global.sfx.correct": {
          src: "/audio/v1/correct.wav",
          durationMs: 400,
          sha256: "sfx-hash",
          purpose: "sfx",
        },
        "global.feedback.correct.01": {
          src: "/audio/v1/correct_feedback.wav",
          durationMs: 1500,
          sha256: "feedback-hash",
          purpose: "correct_feedback",
        },
      },
    };

    const sfxAudio = (audioOrchestrator as any).sfxAudio;
    const voiceAudio = (audioOrchestrator as any).voiceAudio;

    const originalSfxPlay = sfxAudio.play;
    sfxAudio.play = vi.fn().mockImplementation(() => {
      return Promise.resolve();
    });

    const originalVoicePlay = voiceAudio.play;
    voiceAudio.play = vi.fn().mockImplementation(() => {
      return Promise.resolve();
    });

    const seqPromise = audioOrchestrator.playFeedbackSequence(
      "global.sfx.correct",
      "global.feedback.correct.01"
    );

    // Yield to let playSFX and playUrl set up
    await Promise.resolve();
    await Promise.resolve();

    // Cancel during SFX play
    audioOrchestrator.stopAll();
    sfxAudio._trigger("ended");

    await seqPromise;

    expect(voiceAudio.play).not.toHaveBeenCalled();

    // Restore
    sfxAudio.play = originalSfxPlay;
    voiceAudio.play = originalVoicePlay;
  });

  test("playFeedbackSequence does not play voice if cancelled during the 150ms timeout", async () => {
    (audioOrchestrator as any).manifest = {
      version: "1",
      assets: {
        "global.sfx.correct": {
          src: "/audio/v1/correct.wav",
          durationMs: 400,
          sha256: "sfx-hash",
          purpose: "sfx",
        },
        "global.feedback.correct.01": {
          src: "/audio/v1/correct_feedback.wav",
          durationMs: 1500,
          sha256: "feedback-hash",
          purpose: "correct_feedback",
        },
      },
    };

    const sfxAudio = (audioOrchestrator as any).sfxAudio;
    const voiceAudio = (audioOrchestrator as any).voiceAudio;

    const originalVoicePlay = voiceAudio.play;
    voiceAudio.play = vi.fn().mockImplementation(() => {
      return Promise.resolve();
    });

    const seqPromise = audioOrchestrator.playFeedbackSequence(
      "global.sfx.correct",
      "global.feedback.correct.01"
    );

    // End SFX
    setTimeout(() => {
      sfxAudio._trigger("ended");
    }, 10);

    // Cancel during the 150ms pause (e.g. at 50ms)
    setTimeout(() => {
      audioOrchestrator.stopAll();
    }, 50);

    await seqPromise;

    expect(voiceAudio.play).not.toHaveBeenCalled();

    // Restore
    voiceAudio.play = originalVoicePlay;
  });
});

