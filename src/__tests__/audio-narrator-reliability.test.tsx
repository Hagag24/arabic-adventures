/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, test, expect, beforeEach } from "vitest";

// Hoist the Audio mock so it runs before imports
vi.hoisted(() => {
  if (typeof window !== "undefined") {
    (globalThis as any).mockPlayRejectReason = null;
    (globalThis as any).mockPlayPromise = Promise.resolve();

    (window as any).Audio = vi.fn().mockImplementation(function () {
      const listeners: Record<string, ((...args: any[]) => void)[]> = {};
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
          .mockImplementation((event: string, callback: (...args: any[]) => void) => {
            listeners[event] = listeners[event] || [];
            listeners[event].push(callback);
          }),
        removeEventListener: vi
          .fn()
          .mockImplementation((event: string, callback: (...args: any[]) => void) => {
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

describe("Audio Narrator Reliability & Lesson Completion Celebration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).mockPlayPromise = Promise.resolve();
    (globalThis as any).mockPlayRejectReason = null;

    if (audioOrchestrator) {
      audioOrchestrator.stopAll();
      audioOrchestrator.setMute(false);
      audioOrchestrator.setUnlocked(false);
      
      // Setup mock manifest
      (audioOrchestrator as any).manifest = {
        version: "1",
        assets: {
          "global.sfx.lesson-complete.01": {
            src: "/audio/v1/sfx/lesson-complete.01.wav",
            durationMs: 3500,
            sha256: "complete-sfx-hash",
            purpose: "sfx",
          },
          "lessons.ancient-egyptian-teacher.result": {
            src: "/audio/v1/lessons/ancient-egyptian-teacher/result.wav",
            durationMs: 8136,
            sha256: "result-hash",
            purpose: "result",
          },
          "ancient-egyptian-teacher-arabic-feelings-j1-instruction": {
            src: "/audio/v1/instruction.wav",
            durationMs: 1500,
            sha256: "inst-hash",
            purpose: "instruction",
          },
          "ancient-egyptian-teacher-arabic-feelings-j1-prompt": {
            src: "/audio/v1/prompt.wav",
            durationMs: 2000,
            sha256: "prompt-hash",
            purpose: "prompt",
          },
        },
      };
    }
  });

  test("requestEntryNarration plays instruction then question sequentially", async () => {
    const voiceAudio = (audioOrchestrator as any).voiceAudio;

    const onStartMock = vi.fn();

    const promise = audioOrchestrator.requestEntryNarration({
      ownerId: "activity-1",
      entryId: "lesson:activity:1",
      instructionKey: "ancient-egyptian-teacher-arabic-feelings-j1-instruction",
      questionKey: "ancient-egyptian-teacher-arabic-feelings-j1-prompt",
      onPlaybackStart: onStartMock,
    });

    // Let playUrl initialize
    await Promise.resolve();
    await Promise.resolve();

    // Verify instruction started playing
    expect(voiceAudio.src).toContain("/audio/v1/instruction.wav");
    
    // Simulate playing event for instruction
    voiceAudio._trigger("playing");
    expect(onStartMock).toHaveBeenCalledTimes(1);

    // Simulate ended event for instruction
    voiceAudio._trigger("ended");
    await Promise.resolve();
    await Promise.resolve();

    // Verify question started playing after instruction ended
    expect(voiceAudio.src).toContain("/audio/v1/prompt.wav");

    // Simulate ended event for question
    voiceAudio._trigger("ended");

    const result = await promise;
    expect(result.status).toBe("completed");
  });

  test("old owner cleanup cannot cancel new owner playback", async () => {
    const voiceAudio = (audioOrchestrator as any).voiceAudio;

    // Start playback for owner-1
    const p1 = audioOrchestrator.requestEntryNarration({
      ownerId: "owner-1",
      entryId: "entry-1",
      instructionKey: "ancient-egyptian-teacher-arabic-feelings-j1-instruction",
      questionKey: null,
    });

    await Promise.resolve();
    expect(voiceAudio.src).toContain("/audio/v1/instruction.wav");

    // Start playback for owner-2 (simulating fast navigation/remount)
    const p2 = audioOrchestrator.requestEntryNarration({
      ownerId: "owner-2",
      entryId: "entry-2",
      instructionKey: "ancient-egyptian-teacher-arabic-feelings-j1-prompt",
      questionKey: null,
    });

    await Promise.resolve();
    expect(voiceAudio.src).toContain("/audio/v1/prompt.wav");

    // Clear mock history before the stopAll call
    voiceAudio.pause.mockClear();

    // Old owner cleanup calls stop
    audioOrchestrator.stopAll("activity-player-unmounted", "owner-1");

    // Verify that owner-2's playback is NOT stopped
    expect(voiceAudio.pause).not.toHaveBeenCalled();

    // Simulate ended for owner-2
    voiceAudio._trigger("ended");
    
    const r1 = await p1;
    const r2 = await p2;

    expect(r1.status).toBe("cancelled");
    expect(r2.status).toBe("completed");
  });

  test("playCelebrationSequence plays children SFX then teacher congratulations sequentially", async () => {
    const sfxAudio = (audioOrchestrator as any).sfxAudio;
    const voiceAudio = (audioOrchestrator as any).voiceAudio;

    const onStartMock = vi.fn();

    const promise = audioOrchestrator.playCelebrationSequence(
      "global.sfx.lesson-complete.01",
      "lessons.ancient-egyptian-teacher.result",
      "celebration-1",
      onStartMock,
    );

    // Let playUrl initialize
    await Promise.resolve();
    await Promise.resolve();

    // 1. Verify children SFX started playing on sfxAudio channel
    expect(sfxAudio.src).toContain("/audio/v1/sfx/lesson-complete.01.wav");

    // Trigger playing for SFX
    sfxAudio._trigger("playing");
    expect(onStartMock).toHaveBeenCalledTimes(1);

    // Trigger ended for SFX
    sfxAudio._trigger("ended");
    await Promise.resolve();
    await Promise.resolve();

    // Wait for the 150ms delay between SFX and voice
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 2. Verify teacher congratulations started playing on voiceAudio channel
    expect(voiceAudio.src).toContain("/audio/v1/lessons/ancient-egyptian-teacher/result.wav");

    // Trigger ended for voice
    voiceAudio._trigger("ended");

    const result = await promise;
    expect(result.status).toBe("completed");
  });

  test("playCelebrationSequence handles NotAllowedError by returning blocked status and preserving sequence", async () => {
    const notAllowedError = new DOMException("Autoplay blocked", "NotAllowedError");
    (globalThis as any).mockPlayRejectReason = notAllowedError;

    const result = await audioOrchestrator.playCelebrationSequence(
      "global.sfx.lesson-complete.01",
      "lessons.ancient-egyptian-teacher.result",
      "celebration-1",
    );

    expect(result.status).toBe("blocked");
    if (result.status === "blocked") {
      expect(result.errorName).toBe("NotAllowedError");
    }
    expect(audioOrchestrator.isUnlocked()).toBe(false);
  });
});
