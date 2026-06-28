"use client";

import React, { useEffect, useState } from "react";
import { useAudio } from "./use-audio";
import {
  audioVisualStateMap,
  AudioButtonIcon,
  GlobalAudioVisualState,
} from "./audio-visual-state";

type AudioTestWindow = Window & {
  __AUDIO_TEST_HOOKS_ENABLED__?: boolean;
};

function isAudioTestHooksEnabled(): boolean {
  if (process.env.NODE_ENV === "test") {
    return true;
  }
  if (typeof window === "undefined") {
    return false;
  }
  return (window as AudioTestWindow).__AUDIO_TEST_HOOKS_ENABLED__ === true;
}

export default function GlobalAudioToggle() {
  const { toggleMute, toggleState } = useAudio();
  const [prefReducedMotion, setPrefReducedMotion] = useState(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
    ) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const [overrideState, setOverrideState] =
    useState<GlobalAudioVisualState | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let mediaQuery: MediaQueryList | null = null;
      let listener: ((e: MediaQueryListEvent) => void) | null = null;

      if (typeof window.matchMedia === "function") {
        mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        listener = (e: MediaQueryListEvent) => setPrefReducedMotion(e.matches);
        mediaQuery.addEventListener("change", listener);
      }

      const handleOverride = (e: Event) => {
        const customEvent = e as CustomEvent;
        setOverrideState(customEvent.detail);
      };

      const isTestHooks = isAudioTestHooksEnabled();
      if (isTestHooks) {
        window.addEventListener(
          "audio-toggle-test-override",
          handleOverride as EventListener,
        );
      }

      return () => {
        if (mediaQuery && listener) {
          mediaQuery.removeEventListener("change", listener);
        }
        if (isTestHooks) {
          window.removeEventListener(
            "audio-toggle-test-override",
            handleOverride as EventListener,
          );
        }
      };
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleMute();
    }
  };

  const activeState = overrideState || toggleState;
  const visual =
    audioVisualStateMap[activeState] || audioVisualStateMap["no_assets"];

  // Deriving aria-pressed semantics
  // enabled, ready, loading, buffering or playing -> true
  // muted -> false
  const ariaPressed =
    activeState === "muted" ||
    activeState === "unlock_required" ||
    activeState === "initializing" ||
    activeState === "no_assets"
      ? "false"
      : "true";

  // Check animation override for reduced-motion
  const animation = prefReducedMotion ? "none" : visual.animation;

  // Custom icon map
  const renderIcon = (iconName: AudioButtonIcon) => {
    switch (iconName) {
      case "speakerMuted":
        return "🔇";
      case "play":
        return "▶️";
      case "pause":
        return "⏸️";
      case "spinner":
        return "⏳";
      case "microphone":
        return "🎙️";
      case "check":
        return "✔️";
      case "retry":
        return "🔄";
      case "warning":
        return "⚠️";
      case "equalizer":
        if (animation === "equalizer") {
          return (
            <span
              className="flex items-end gap-0.5 h-3.5 w-3.5 select-none"
              aria-hidden="true"
            >
              <span
                className="w-0.5 bg-current rounded-full animate-[equalizer_0.8s_ease-in-out_infinite_alternate]"
                style={{ height: "60%" }}
              />
              <span
                className="w-0.5 bg-current rounded-full animate-[equalizer_1.2s_ease-in-out_infinite_alternate]"
                style={{ height: "100%", animationDelay: "0.2s" }}
              />
              <span
                className="w-0.5 bg-current rounded-full animate-[equalizer_0.9s_ease-in-out_infinite_alternate]"
                style={{ height: "40%", animationDelay: "0.4s" }}
              />
            </span>
          );
        }
        return "🔊";
      case "speaker":
      default:
        return "🔊";
    }
  };

  // Build animation class
  let animClass = "";
  let iconAnimClass = "";
  if (animation === "spin") {
    iconAnimClass = "animate-spin";
  } else if (animation === "pulseOnce") {
    animClass = "animate-[pulse_1s_ease-in-out_1]";
  } else if (animation === "softGlow") {
    animClass = "animate-[pulse_2s_infinite] shadow-lg";
  }

  return (
    <>
      <style>{`
        @keyframes equalizer {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>

      <button
        onClick={() => !visual.disabled && toggleMute()}
        onKeyDown={handleKeyDown}
        disabled={visual.disabled}
        aria-pressed={ariaPressed as "true" | "false"}
        aria-label={`تفعيل أو كتم الصوت. الحالة الحالية: ${visual.label}`}
        data-state={visual.dataState}
        className={`
          audio-toggle-btn flex items-center justify-between gap-2 px-3 md:px-4 py-2 rounded-full border text-xs font-bold transition-all select-none focus:outline-none focus:ring-2 active:scale-95 touch-target
          min-w-[44px] sm:min-w-[210px] sm:max-w-[210px] sm:w-[210px] h-[46px]
          ${visual.classes.container}
          ${visual.classes.ring}
          ${animClass}
        `}
      >
        {/* Right: Icon (Wired up as standard flex items for zero layout shifting) */}
        <div className="flex items-center gap-2">
          <span
            className={`text-sm shrink-0 flex items-center justify-center ${visual.classes.icon} ${iconAnimClass}`}
            role="img"
            aria-hidden="true"
          >
            {renderIcon(visual.icon)}
          </span>
          {/* Label: visible on desktop, hidden on tiny mobile viewports */}
          <span className="hidden sm:inline whitespace-nowrap text-right text-[11px] leading-tight select-none">
            {visual.label}
          </span>
          {/* Mobile shortLabel: visible only on small mobile viewports when width is restricted */}
          <span className="inline sm:hidden md:hidden lg:hidden xl:hidden text-[10px] leading-tight select-none">
            {visual.shortLabel}
          </span>
        </div>

        {/* Left: Status Dot Indicator */}
        {visual.classes.statusDot !== "hidden" && (
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 border border-white/20 select-none ${visual.classes.statusDot}`}
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );
}
