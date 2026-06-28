import { describe, test, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  selectGlobalAudioVisualState,
  audioVisualStateMap,
  AudioRuntimeFacts,
  GlobalAudioVisualState,
} from "../audio/runtime/audio-visual-state";
import GlobalAudioToggle from "../audio/runtime/GlobalAudioToggle";
import { useAudio } from "../audio/runtime/use-audio";

// Mock the useAudio hook
vi.mock("../audio/runtime/use-audio", () => ({
  useAudio: vi.fn(),
}));

describe("Audio Button 16-State Visual & Transition Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("State Selector Facts Mapping", () => {
    const baseFacts: AudioRuntimeFacts = {
      initialized: true,
      hasApprovedAssets: true,
      enabled: true,
      unlocked: true,
      playbackStatus: "idle",
      activePurpose: null,
      dictationActive: false,
    };

    test("selector: initializing", () => {
      const facts: AudioRuntimeFacts = { ...baseFacts, initialized: false };
      expect(selectGlobalAudioVisualState(facts)).toBe("initializing");
    });

    test("selector: no_assets", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        hasApprovedAssets: false,
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("no_assets");
    });

    test("selector: dictation_active", () => {
      const facts: AudioRuntimeFacts = { ...baseFacts, dictationActive: true };
      expect(selectGlobalAudioVisualState(facts)).toBe("dictation_active");
    });

    test("selector: unlock_required", () => {
      const facts: AudioRuntimeFacts = { ...baseFacts, unlocked: false };
      expect(selectGlobalAudioVisualState(facts)).toBe("unlock_required");
    });

    test("selector: muted", () => {
      const facts: AudioRuntimeFacts = { ...baseFacts, enabled: false };
      expect(selectGlobalAudioVisualState(facts)).toBe("muted");
    });

    test("selector: switching", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "switching",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("switching");
    });

    test("selector: buffering", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "buffering",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("buffering");
    });

    test("selector: paused", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "paused",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("paused");
    });

    test("selector: recoverable_error", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "error",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("recoverable_error");
    });

    test("selector: playing_instruction", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "playing",
        activePurpose: "instruction",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_instruction");
    });

    test("selector: playing_prompt", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "playing",
        activePurpose: "prompt",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_prompt");
    });

    test("selector: playing_option", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "playing",
        activePurpose: "option",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_option");
    });

    test("selector: playing_correct_feedback", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "playing",
        activePurpose: "correct_feedback",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe(
        "playing_correct_feedback",
      );
    });

    test("selector: playing_retry_feedback", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "playing",
        activePurpose: "retry_feedback",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe(
        "playing_retry_feedback",
      );
    });

    test("selector: playing_completion", () => {
      const facts: AudioRuntimeFacts = {
        ...baseFacts,
        playbackStatus: "playing",
        activePurpose: "completion",
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_completion");
    });

    test("selector: ready (default)", () => {
      expect(selectGlobalAudioVisualState(baseFacts)).toBe("ready");
    });
  });

  describe("Button Rendering & Attributes Matrix", () => {
    const states: GlobalAudioVisualState[] = [
      "initializing",
      "no_assets",
      "unlock_required",
      "ready",
      "buffering",
      "playing_instruction",
      "playing_prompt",
      "playing_option",
      "playing_correct_feedback",
      "playing_retry_feedback",
      "playing_completion",
      "switching",
      "paused",
      "muted",
      "dictation_active",
      "recoverable_error",
    ];

    states.forEach((state) => {
      test(`renders state: ${state}`, () => {
        vi.mocked(useAudio).mockReturnValue({
          toggleMute: vi.fn(),
          playKey: vi.fn(),
          playSFX: vi.fn(),
          playFeedbackSequence: vi.fn(),
          playSequence: vi.fn().mockResolvedValue({ status: "completed" }),
          stop: vi.fn(),
          pauseVoice: vi.fn(),
          resumeVoice: vi.fn(),
          isMuted: state === "muted",
          volume: 0.7,
          setVolume: vi.fn(),
          toggleState: state,
          manifestLoaded: true,
          manifestError: false,
          isNarrating: state.startsWith("playing_"),
          dictationActive: state === "dictation_active",
          setDictationActive: vi.fn(),
          setActivityScope: vi.fn(),
          activeKey: null,
          isKeyPlayable: () => true,
          unlock: vi.fn().mockResolvedValue(undefined),
          setEntryIdentity: vi.fn(),
          requestEntryNarration: vi.fn().mockResolvedValue({ status: "completed" }),
          playCelebrationSequence: vi.fn().mockResolvedValue({ status: "completed" }),
        });

        render(<GlobalAudioToggle />);

        const btn = screen.getByRole("button");
        const visual = audioVisualStateMap[state];

        expect(btn).toHaveAttribute("data-state", state);
        expect(btn).toHaveAttribute(
          "aria-label",
          `تفعيل أو كتم الصوت. الحالة الحالية: ${visual.label}`,
        );

        if (visual.disabled) {
          expect(btn).toBeDisabled();
        } else {
          expect(btn).not.toBeDisabled();
        }

        // Check aria-pressed semantics
        const ariaPressed =
          state === "muted" ||
          state === "unlock_required" ||
          state === "initializing" ||
          state === "no_assets"
            ? "false"
            : "true";
        expect(btn).toHaveAttribute("aria-pressed", ariaPressed);

        // Check label content (desktop vs mobile labels)
        expect(screen.getByText(visual.label)).toBeInTheDocument();
        expect(screen.getByText(visual.shortLabel)).toBeInTheDocument();
      });
    });
  });

  describe("Flicker Timing & Transition Sequences", () => {
    // Tests logical sequences that simulate transitions of orchestrator properties
    test("transition flow: initializing -> no_assets", () => {
      const facts: AudioRuntimeFacts = {
        initialized: false,
        hasApprovedAssets: false,
        enabled: true,
        unlocked: false,
        playbackStatus: "idle",
        activePurpose: null,
        dictationActive: false,
      };

      expect(selectGlobalAudioVisualState(facts)).toBe("initializing");

      // Asset loading completes but manifests are empty
      facts.initialized = true;
      expect(selectGlobalAudioVisualState(facts)).toBe("no_assets");
    });

    test("transition flow: initializing -> unlock_required -> ready", () => {
      const facts: AudioRuntimeFacts = {
        initialized: false,
        hasApprovedAssets: true,
        enabled: true,
        unlocked: false,
        playbackStatus: "idle",
        activePurpose: null,
        dictationActive: false,
      };

      expect(selectGlobalAudioVisualState(facts)).toBe("initializing");

      facts.initialized = true;
      expect(selectGlobalAudioVisualState(facts)).toBe("unlock_required");

      facts.unlocked = true;
      expect(selectGlobalAudioVisualState(facts)).toBe("ready");
    });

    test("transition flow: ready -> buffering -> playing_prompt -> ready", () => {
      const facts: AudioRuntimeFacts = {
        initialized: true,
        hasApprovedAssets: true,
        enabled: true,
        unlocked: true,
        playbackStatus: "idle",
        activePurpose: null,
        dictationActive: false,
      };

      expect(selectGlobalAudioVisualState(facts)).toBe("ready");

      facts.playbackStatus = "buffering";
      expect(selectGlobalAudioVisualState(facts)).toBe("buffering");

      facts.playbackStatus = "playing";
      facts.activePurpose = "prompt";
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_prompt");

      facts.playbackStatus = "idle";
      facts.activePurpose = null;
      expect(selectGlobalAudioVisualState(facts)).toBe("ready");
    });

    test("transition flow: playing_prompt -> playing_option", () => {
      const facts: AudioRuntimeFacts = {
        initialized: true,
        hasApprovedAssets: true,
        enabled: true,
        unlocked: true,
        playbackStatus: "playing",
        activePurpose: "prompt",
        dictationActive: false,
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_prompt");

      // Switch to option play
      facts.activePurpose = "option";
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_option");
    });

    test("transition flow: playing_option -> feedback correct/retry", () => {
      const facts: AudioRuntimeFacts = {
        initialized: true,
        hasApprovedAssets: true,
        enabled: true,
        unlocked: true,
        playbackStatus: "playing",
        activePurpose: "option",
        dictationActive: false,
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_option");

      facts.activePurpose = "correct_feedback";
      expect(selectGlobalAudioVisualState(facts)).toBe(
        "playing_correct_feedback",
      );

      facts.activePurpose = "retry_feedback";
      expect(selectGlobalAudioVisualState(facts)).toBe(
        "playing_retry_feedback",
      );
    });

    test("transition flow: playing_prompt -> muted -> ready", () => {
      const facts: AudioRuntimeFacts = {
        initialized: true,
        hasApprovedAssets: true,
        enabled: true,
        unlocked: true,
        playbackStatus: "playing",
        activePurpose: "prompt",
        dictationActive: false,
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_prompt");

      // Mute applied
      facts.enabled = false;
      expect(selectGlobalAudioVisualState(facts)).toBe("muted");

      // Unmuted
      facts.enabled = true;
      facts.playbackStatus = "idle";
      facts.activePurpose = null;
      expect(selectGlobalAudioVisualState(facts)).toBe("ready");
    });

    test("transition flow: playing_prompt -> dictation_active", () => {
      const facts: AudioRuntimeFacts = {
        initialized: true,
        hasApprovedAssets: true,
        enabled: true,
        unlocked: true,
        playbackStatus: "playing",
        activePurpose: "prompt",
        dictationActive: false,
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("playing_prompt");

      // Dictation activated
      facts.dictationActive = true;
      expect(selectGlobalAudioVisualState(facts)).toBe("dictation_active");
    });

    test("transition flow: buffering -> recoverable_error", () => {
      const facts: AudioRuntimeFacts = {
        initialized: true,
        hasApprovedAssets: true,
        enabled: true,
        unlocked: true,
        playbackStatus: "buffering",
        activePurpose: null,
        dictationActive: false,
      };
      expect(selectGlobalAudioVisualState(facts)).toBe("buffering");

      // Media loading fails
      facts.playbackStatus = "error";
      expect(selectGlobalAudioVisualState(facts)).toBe("recoverable_error");
    });
  });
});
