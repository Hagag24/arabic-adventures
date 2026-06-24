"use client";

import React, { useEffect, useState } from "react";
import { audioManager } from "@/lib/audio/audio-manager";

interface AudioPlayButtonProps {
  assetKey: string;
  filePath?: string;
  label?: string;
}

export default function AudioPlayButton({
  assetKey,
  filePath,
  label = "استمع للقصة",
}: AudioPlayButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!audioManager) return;

    const unsubscribe = audioManager.subscribe((state) => {
      const isCurrent = state.assetKey === assetKey;
      setIsActive(isCurrent);
      setIsPlaying(isCurrent && state.isPlaying);
      setProgress(isCurrent ? state.progress : 0);
    });

    return () => {
      unsubscribe();
    };
  }, [assetKey]);

  const handleToggle = () => {
    if (!audioManager) return;

    if (isActive) {
      if (isPlaying) {
        audioManager.pause();
      } else {
        audioManager.resume();
      }
    } else {
      audioManager.play(assetKey, filePath || "");
    }
  };

  return (
    <div className="flex flex-col items-center bg-teal-50 border border-teal-100 rounded-2xl p-4 shadow-sm max-w-md w-full mx-auto my-4 text-right dir-rtl">
      <div className="flex items-center justify-between w-full mb-3 gap-4">
        <span className="text-teal-900 font-bold text-sm md:text-base">
          {label} 🎧
        </span>
        <button
          onClick={handleToggle}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md touch-target ${
            isPlaying
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-teal-600 hover:bg-teal-700 text-white"
          }`}
          aria-label={isPlaying ? "إيقاف مؤقت للقصة" : "تشغيل القصة الصوتية"}
        >
          {isPlaying ? (
            <span className="text-lg font-bold">❚❚</span>
          ) : (
            <span className="text-lg font-bold mr-1">▶</span>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-teal-100/50 rounded-full h-2 overflow-hidden mb-1">
        <div
          className="bg-teal-600 h-full rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between w-full text-[10px] text-teal-800/60 font-medium">
        <span>البداية</span>
        <span>النهاية</span>
      </div>
    </div>
  );
}
