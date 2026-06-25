"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface WordBankRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

export default function WordBankRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: WordBankRendererProps) {
  const prompt = activity.prompt || "";
  const blankMatches = Array.from(prompt.matchAll(/\[(blank\d+)\]/g));
  const blankKeys = blankMatches.map((m) => m[1]);

  const [blanks, setBlanks] = useState<Record<string, string>>(
    (activity.previousResponseData?.blanks as Record<string, string>) || {},
  );
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordSelect = (word: string) => {
    if (evaluationResult) return;
    setSelectedWord(word === selectedWord ? null : word);
  };

  const handleBlankClick = (key: string) => {
    if (evaluationResult) return;

    if (blanks[key]) {
      // Remove word
      const updatedBlanks = { ...blanks };
      delete updatedBlanks[key];
      setBlanks(updatedBlanks);
      setSelectedWord(null);
    } else if (selectedWord) {
      // Place word
      setBlanks((prev) => ({ ...prev, [key]: selectedWord }));
      setSelectedWord(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, word: string) => {
    if (evaluationResult) return;
    e.dataTransfer.setData("text/plain", word);
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    if (evaluationResult) return;
    const word = e.dataTransfer.getData("text/plain");
    if (word) {
      setBlanks((prev) => ({ ...prev, [key]: word }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allFilled = blankKeys.every(
      (k) => blanks[k] && blanks[k].trim() !== "",
    );
    if (!allFilled) return;
    onSubmit({ blanks });
  };

  // List of words that have been placed
  const placedWords = Object.values(blanks);

  const renderPromptWithInputs = () => {
    const parts = prompt.split(/(\[blank\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(blank\d+)\]/);
      if (match) {
        const key = match[1];
        const word = blanks[key];
        const isCorrect = evaluationResult?.isCorrect;

        let blankStyle = "border-teal-300 bg-teal-50/10 hover:border-teal-500";
        if (evaluationResult) {
          blankStyle = isCorrect
            ? "border-emerald-500 bg-emerald-50/20 text-emerald-950 font-bold"
            : "border-rose-400 bg-rose-50/20 text-rose-950 font-bold";
        } else if (word) {
          blankStyle = "border-teal-600 bg-teal-50 text-teal-950 font-bold";
        }

        return (
          <div
            key={key}
            onClick={() => handleBlankClick(key)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, key)}
            className={`inline-flex items-center justify-center mx-2 px-4 py-1.5 border rounded-2xl cursor-pointer text-sm md:text-base font-semibold min-w-32 min-h-10 transition-all duration-200 ${blankStyle}`}
          >
            {word ? (
              <span className="flex items-center gap-1">
                {word}
                {!evaluationResult && (
                  <span className="text-[10px] text-teal-600 hover:text-teal-800">
                    ✕
                  </span>
                )}
              </span>
            ) : (
              <span className="text-xs text-teal-800/40 font-bold">
                اسحب الكلمة هنا
              </span>
            )}
          </div>
        );
      }
      return (
        <span key={index} className="leading-loose text-teal-950 font-semibold">
          {part}
        </span>
      );
    });
  };

  const allFilled = blankKeys.every(
    (k) => blanks[k] && blanks[k].trim() !== "",
  );

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      <div className="bg-teal-50/20 p-6 rounded-3xl border border-teal-100/70 mb-6 leading-loose text-right">
        {renderPromptWithInputs()}
      </div>

      {!evaluationResult && (
        <div className="bg-white border border-teal-100 rounded-3xl p-5 mb-6 text-right shadow-sm">
          <span className="text-xs font-bold text-teal-800/60 mb-3 block">
            بنك الكلمات (اسحب الكلمة أو انقر عليها ثم انقر على الفراغ):
          </span>
          <div className="flex flex-wrap gap-2.5">
            {activity.options.map((opt) => {
              const isPlaced = placedWords.includes(opt.label);
              const isSelected = selectedWord === opt.label;

              let btnStyle =
                "bg-teal-50/50 text-teal-900 border-teal-200 hover:bg-teal-100";
              if (isPlaced) {
                btnStyle =
                  "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-40";
              } else if (isSelected) {
                btnStyle =
                  "bg-teal-600 text-white border-teal-600 ring-4 ring-teal-500/20";
              }

              return (
                <button
                  key={opt.optionKey}
                  type="button"
                  draggable={!isPlaced}
                  onDragStart={(e) => handleDragStart(e, opt.label)}
                  onClick={() => !isPlaced && handleWordSelect(opt.label)}
                  className={`px-4 py-2 border rounded-xl text-sm font-bold transition-all touch-target select-none cursor-grab active:cursor-grabbing ${btnStyle}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || !allFilled}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "تأكيد الإجابة 🚀"}
        </button>
      )}
    </form>
  );
}
