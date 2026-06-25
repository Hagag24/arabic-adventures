"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSpeechDictation } from "@/hooks/use-speech-dictation";
import { useAudio } from "@/audio/runtime/use-audio";

interface DictatableTextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
}

export default function DictatableTextField({
  id,
  label,
  value,
  onChange,
  multiline = false,
  placeholder = "",
  disabled = false,
  maxLength,
  rows = 3,
}: DictatableTextFieldProps) {
  const elRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { setDictationActive } = useAudio();
  const [ariaAnnouncement, setAriaAnnouncement] = useState("");
  const [ariaAssertive, setAriaAssertive] = useState("");

  const handleTranscript = (transcript: string) => {
    const el = elRef.current;
    if (!el) return;

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const originalValue = el.value;

    let textToInsert = transcript;

    // Spacing normalization
    if (start > 0 && originalValue[start - 1] !== " ") {
      textToInsert = " " + textToInsert;
    }
    if (end < originalValue.length && originalValue[end] !== " ") {
      textToInsert = textToInsert + " ";
    }

    const newValue =
      originalValue.slice(0, start) + textToInsert + originalValue.slice(end);

    onChange(newValue);
    setAriaAnnouncement("تمت إضافة النص بالصوت");

    // Caret restoration
    setTimeout(() => {
      if (elRef.current) {
        elRef.current.focus();
        const newCursorPos = start + textToInsert.length;
        elRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const { isListening, isSupported, error, startListening, stopListening } =
    useSpeechDictation({
      onTranscript: handleTranscript,
    });

  // Coordinate output blocking when dictation is active
  useEffect(() => {
    if (isListening) {
      setTimeout(() => {
        setDictationActive(true);
        setAriaAnnouncement("بدأ الإملاء الصوتي. تحدث الآن...");
      }, 0);
    } else {
      setTimeout(() => {
        setDictationActive(false);
      }, 0);
    }
    return () => {
      setDictationActive(false);
    };
  }, [isListening, setDictationActive]);

  // Map technical error codes to child-friendly Arabic status announcements
  useEffect(() => {
    if (error) {
      setTimeout(() => {
        if (error === "permission-denied") {
          setAriaAssertive(
            "تم رفض إذن الميكروفون. يرجى تفعيل الإذن من إعدادات المتصفح.",
          );
        } else if (error === "unsupported") {
          setAriaAssertive("الميكروفون غير مدعوم في هذا المتصفح.");
        } else if (error === "no-speech") {
          setAriaAssertive("تعذر سماع الكلام بوضوح. حاول مرة أخرى.");
        } else {
          setAriaAssertive("حدث خطأ في الإملاء. حاول مرة أخرى.");
        }
      }, 0);
    }
  }, [error]);

  const handleMicToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (isListening) {
      stopListening();
      setAriaAnnouncement("تم إيقاف الإملاء");
    } else {
      startListening();
    }
  };

  let titleText = "تحدث للكتابة بالصوت 🎙️";
  let micBtnStyle =
    "bg-teal-50 hover:bg-teal-100/60 text-teal-700 border-teal-200";
  let icon = "🎙️";
  let btnLabel = "إملاء صوّتي";

  if (isListening) {
    titleText = "أوقف الإملاء";
    micBtnStyle =
      "bg-red-500 hover:bg-red-600 text-white border-red-600 animate-pulse";
    icon = "🛑";
    btnLabel = "أوقف الإملاء";
  } else if (error === "permission-denied") {
    titleText = "تم رفض إذن الميكروفون";
    micBtnStyle = "bg-rose-50 text-rose-500 border-rose-200 cursor-not-allowed";
    icon = "⚠️";
    btnLabel = "الإذن مرفوض";
  }

  return (
    <div className="flex flex-col gap-2 w-full text-right dir-rtl">
      {/* Header section with label and mic */}
      <div className="flex justify-between items-center gap-2">
        <label
          htmlFor={id}
          className="text-xs font-bold text-teal-800/60 select-none"
        >
          {label}
        </label>

        {isSupported && (
          <button
            onClick={handleMicToggle}
            disabled={disabled || error === "permission-denied"}
            type="button"
            aria-pressed={isListening}
            aria-label={`ابدأ الإملاء الصوتي لهذه الخانة. الحالة الحالية: ${btnLabel}`}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 touch-target ${micBtnStyle}`}
            title={titleText}
          >
            <span role="img" aria-hidden="true">
              {icon}
            </span>
            <span>{isListening ? "أوقف الإملاء" : "إملاء صوّتي"}</span>
          </button>
        )}
      </div>

      {multiline ? (
        <textarea
          id={id}
          ref={elRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className="w-full px-4 py-3 border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-2xl outline-none font-semibold text-teal-900 transition-all duration-200 resize-none"
        />
      ) : (
        <input
          id={id}
          type="text"
          ref={elRef as React.RefObject<HTMLInputElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-4 py-3 border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-2xl outline-none font-semibold text-teal-900 transition-all duration-200"
        />
      )}

      {/* Accessible announcements using aria-live */}
      <div className="sr-only" aria-live="polite">
        {ariaAnnouncement}
      </div>
      <div className="sr-only" aria-live="assertive">
        {ariaAssertive}
      </div>
    </div>
  );
}
