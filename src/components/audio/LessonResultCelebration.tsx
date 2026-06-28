"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAudio } from "@/audio/runtime/use-audio";

interface LessonResultCelebrationProps {
  lessonSlug: string;
}

export function LessonResultCelebration({
  lessonSlug,
}: LessonResultCelebrationProps) {
  const {
    playCelebrationSequence,
    stop,
    unlock,
    isNarrating,
    activeKey,
    toggleState,
    isKeyPlayable,
  } = useAudio();

  const [showUnlockButton, setShowUnlockButton] = useState(false);
  const ownerId = `celebration:${lessonSlug}`;
  const hasTriggered = useRef(false);

  const sfxKey = "global.sfx.lesson-complete.01";
  const voiceKey = `lessons.${lessonSlug}.result`;

  const isPlaying = isNarrating && (activeKey === voiceKey || activeKey === sfxKey);

  const runSequence = React.useCallback(async (forceUnlock = false) => {
    setShowUnlockButton(false);
    if (forceUnlock) {
      await unlock();
    }
    const result = await playCelebrationSequence(sfxKey, voiceKey, ownerId);
    if (result.status === "blocked") {
      setShowUnlockButton(true);
    }
  }, [unlock, playCelebrationSequence, sfxKey, voiceKey, ownerId]);

  useEffect(() => {
    // Prevent double-run in React StrictMode
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    const sessionGuardKey = `arabic-adventures:should-celebrate:${lessonSlug}`;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(sessionGuardKey);
    }

    // Defer execution to avoid synchronous setState inside effect body
    Promise.resolve().then(() => {
      runSequence(false);
    });

    return () => {
      // Clean up on unmount
      stop("celebration-unmounted", ownerId);
    };
  }, [lessonSlug, runSequence, stop, ownerId]);

  const handleManualReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPlaying) {
      stop("celebration-manual-stop", ownerId);
    } else {
      runSequence(false);
    }
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    runSequence(true);
  };

  const canPlay = isKeyPlayable(voiceKey) && (toggleState as string) !== "no_assets";

  if (!canPlay) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 mb-8 select-none">
      {showUnlockButton ? (
        <button
          type="button"
          onClick={handleUnlockClick}
          className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold shadow-md transition-all active:scale-95 text-base flex items-center gap-2 animate-bounce"
        >
          <span>🔊</span>
          <span>اضغط لتفعيل صوت الاحتفال! 🎉</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleManualReplay}
          className={`px-5 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100/80 text-teal-700 hover:text-teal-800 border border-teal-100 font-bold transition-all text-sm flex items-center gap-2 touch-target ${
            isPlaying ? "ring-2 ring-teal-500/30" : ""
          }`}
          title={isPlaying ? "إيقاف الاحتفال" : "اسمع الاحتفال مرة أخرى"}
        >
          <span>{isPlaying ? "⏸️" : "🔊"}</span>
          <span>{isPlaying ? "إيقاف الاحتفال" : "اسمع الاحتفال مرة أخرى"}</span>
        </button>
      )}
    </div>
  );
}
