"use client";

import React from "react";
import { useAudio } from "./use-audio";

export default function GlobalAudioToggle() {
  const { toggleMute, toggleState, isNarrating } = useAudio();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleMute();
    }
  };

  let icon = "🔊";
  let text = "الصوت يعمل";
  let buttonStyle =
    "bg-teal-600 hover:bg-teal-700 text-white border-teal-700 shadow-sm shadow-teal-700/20";
  let animateClass = "";
  let disabled = false;
  let ariaPressed: "true" | "false" = "true";

  switch (toggleState) {
    case "enabled":
      icon = "🔊";
      text = "الصوت يعمل";
      buttonStyle =
        "bg-teal-600 hover:bg-teal-700 text-white border-teal-700 shadow-sm shadow-teal-700/20";
      ariaPressed = "true";
      if (isNarrating) {
        animateClass = "animate-pulse";
      }
      break;
    case "muted":
      icon = "🔇";
      text = "الصوت مكتوم";
      buttonStyle =
        "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300";
      ariaPressed = "false";
      break;
    case "unlock_required":
      icon = "🔊";
      text = "اضغط لتفعيل الصوت";
      buttonStyle =
        "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-500/20";
      ariaPressed = "false";
      break;
    case "loading":
      icon = "⏳";
      text = "جارٍ تجهيز الصوت...";
      buttonStyle = "bg-slate-50 text-slate-400 border-slate-200 cursor-wait";
      disabled = true;
      ariaPressed = "false";
      break;
    case "temporarily_blocked":
      icon = "🎙️";
      text = "الصوت متوقف أثناء الإملاء";
      buttonStyle =
        "bg-rose-50 text-rose-700 border-rose-200 cursor-not-allowed";
      disabled = true;
      ariaPressed = "false";
      break;
    case "unavailable":
    default:
      icon = "🔇";
      text = "الصوت غير متاح حاليًا";
      buttonStyle =
        "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed";
      disabled = true;
      ariaPressed = "false";
      break;
  }

  return (
    <button
      onClick={() => !disabled && toggleMute()}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-pressed={ariaPressed}
      aria-label={`تفعيل أو كتم الصوت. الحالة الحالية: ${text}`}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all select-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 active:scale-95 touch-target ${buttonStyle} ${animateClass}`}
    >
      <span className="text-sm shrink-0" role="img" aria-hidden="true">
        {icon}
      </span>
      <span className="whitespace-nowrap">{text}</span>
    </button>
  );
}
