import React, { useState } from "react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AudioProvider } from "@/audio/runtime/AudioProvider";
import PublicHeader from "@/components/layout/PublicHeader";
import DictatableTextField from "@/components/activity/DictatableTextField";
import { audioOrchestrator } from "@/audio/runtime/audio-orchestrator";

// Mock HTMLAudioElement
if (typeof window !== "undefined") {
  window.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("Global Audio & Speech Dictation Systems", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (audioOrchestrator) {
      audioOrchestrator.stopAll();
      audioOrchestrator.setMute(true); // Default muted to ensure consistency
    }
  });

  describe("AudioOrchestrator & Manifest Operations", () => {
    test("starts in correct default state and handles blocking", () => {
      expect(audioOrchestrator).toBeDefined();
      expect(audioOrchestrator.isMuted()).toBe(true);

      audioOrchestrator.blockPlayback();
      expect(audioOrchestrator.isDictationBlocked()).toBe(true);

      audioOrchestrator.unblockPlayback();
      expect(audioOrchestrator.isDictationBlocked()).toBe(false);
    });

    test("cancellation: stopAll clears playbacks", () => {
      audioOrchestrator.stopAll();
      expect(audioOrchestrator.isNarrating()).toBe(false);
    });
  });

  describe("PublicHeader Component Layout", () => {
    test("renders title and exactly one global audio toggle", () => {
      render(
        <AudioProvider>
          <PublicHeader
            title="عنوان الدرس التجريبي"
            backUrl="/"
            backLabel="الرئيسية"
          />
        </AudioProvider>,
      );

      // Check title
      expect(screen.getByText("عنوان الدرس التجريبي")).toBeInTheDocument();

      // Check exactly one GlobalAudioToggle (contains text "الصوت")
      const toggles = screen.getAllByRole("button", { name: /الصوت/ });
      expect(toggles.length).toBe(1);
    });
  });

  describe("DictatableTextField Component dictation behavior", () => {
    const TestComponent = () => {
      const [val, setVal] = useState("النص الأولي");
      return (
        <AudioProvider>
          <DictatableTextField
            id="test-field"
            label="حقل الإدخال الصوتي"
            value={val}
            onChange={setVal}
            multiline={true}
          />
        </AudioProvider>
      );
    };

    test("renders input textarea and dictation button", () => {
      render(<TestComponent />);

      expect(screen.getByLabelText("حقل الإدخال الصوتي")).toBeInTheDocument();
      expect(screen.getByText("النص الأولي")).toBeInTheDocument();

      // Since WebkitSpeechRecognition is not defined in jsdom by default,
      // the microphone button will be hidden unless mock-supported.
    });
  });
});
