"use client";

import React from "react";
import { useAudio } from "@/audio/runtime/use-audio";

interface SemanticAudioButtonProps {
  semanticKey: string;
  label?: string;
  className?: string;
}

export function SemanticAudioButton({
  semanticKey,
  label = "استمع",
  className = "",
}: SemanticAudioButtonProps) {
  const { playKey, stop, activeKey, isNarrating, toggleState, isKeyPlayable } =
    useAudio();

  if (
    !isKeyPlayable(semanticKey) ||
    (toggleState as string) === "no_assets" ||
    (toggleState as string) === "unavailable" ||
    toggleState === "initializing"
  ) {
    return null;
  }

  const isCurrentPlaying = isNarrating && activeKey === semanticKey;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCurrentPlaying) {
      stop();
    } else {
      stop();
      playKey(semanticKey);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      data-audio-key={semanticKey}
      className={`px-4 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100/80 text-teal-700 hover:text-teal-800 border border-teal-100 font-bold transition-all text-sm flex items-center gap-2 select-none touch-target ${className} ${
        isCurrentPlaying ? "ring-2 ring-teal-500/30" : ""
      }`}
      title={isCurrentPlaying ? "إيقاف الصوت" : "تشغيل الصوت"}
    >
      <span>{isCurrentPlaying ? "⏸️" : "🔊"}</span>
      {label && <span>{label}</span>}
    </button>
  );
}
