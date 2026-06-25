"use client";

import React from "react";
import { useSpeechDictation } from "@/hooks/use-speech-dictation";

interface MicrophoneButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function MicrophoneButton({
  onTranscript,
  className = "",
}: MicrophoneButtonProps) {
  const { isListening, isSupported, error, startListening, stopListening } =
    useSpeechDictation({
      onTranscript,
    });

  if (!isSupported) {
    return null;
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  let titleText = "تحدث للكتابة بالصوت 🎙️";
  let buttonColor =
    "bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200";
  let icon = "🎙️";

  if (isListening) {
    titleText = "أوقف الإملاء";
    buttonColor =
      "bg-red-500 hover:bg-red-600 text-white border-red-600 animate-pulse";
    icon = "🛑";
  } else if (error === "permission-denied") {
    titleText = "تم رفض إذن الميكروفون";
    buttonColor = "bg-rose-50 text-rose-500 border-rose-200 cursor-not-allowed";
    icon = "⚠️";
  }

  return (
    <button
      onClick={handleToggle}
      disabled={error === "permission-denied"}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 touch-target ${buttonColor} ${className}`}
      title={titleText}
      type="button"
    >
      <span>{icon}</span>
      <span>{isListening ? "أوقف الإملاء" : "إملاء صوّتي"}</span>
    </button>
  );
}
