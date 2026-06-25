"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface ChoiceRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

export default function ChoiceRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: ChoiceRendererProps) {
  const isMultiple = activity.type === "checklist";
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [selectedSingle, setSelectedSingle] = useState<string | null>(
    (activity.previousResponseData?.selectedOption as string) || null,
  );
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>(
    (activity.previousResponseData?.selectedOptions as string[]) || [],
  );

  const handleCardClick = (optionKey: string) => {
    if (evaluationResult) return; // Read-only after evaluation

    if (isMultiple) {
      setSelectedMultiple((prev) =>
        prev.includes(optionKey)
          ? prev.filter((k) => k !== optionKey)
          : [...prev, optionKey],
      );
    } else {
      setSelectedSingle(optionKey);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    optionKey: string,
  ) => {
    if (evaluationResult) return;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleCardClick(optionKey);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = index < activity.options.length - 1 ? index + 1 : 0;
      setFocusedIndex(nextIndex);
      const btn = document.getElementById(
        `opt-${activity.options[nextIndex].optionKey}`,
      );
      btn?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = index > 0 ? index - 1 : activity.options.length - 1;
      setFocusedIndex(prevIndex);
      const btn = document.getElementById(
        `opt-${activity.options[prevIndex].optionKey}`,
      );
      btn?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMultiple) {
      if (selectedMultiple.length === 0) return;
      onSubmit({ selectedOptions: selectedMultiple });
    } else {
      if (!selectedSingle) return;
      onSubmit({ selectedOption: selectedSingle });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 mb-6">
        {activity.options.map((option, index) => {
          const isSelected = isMultiple
            ? selectedMultiple.includes(option.optionKey)
            : selectedSingle === option.optionKey;
          const isFocused = focusedIndex === index;

          let cardBorderColor = "border-teal-100 hover:border-teal-300";
          let cardBgColor = "bg-white hover:bg-teal-50/30";

          if (isSelected) {
            cardBorderColor = "border-teal-600 ring-2 ring-teal-500/20";
            cardBgColor = "bg-teal-50/70";
          }

          if (isFocused && !evaluationResult) {
            cardBorderColor = "border-teal-600 ring-2 ring-teal-600/30";
          }

          // Show green/red state after evaluation
          if (evaluationResult) {
            if (activity.type === "single_choice") {
              // For single choice, show correct/incorrect state
              if (isSelected && evaluationResult.isCorrect) {
                cardBorderColor =
                  "border-emerald-500 ring-2 ring-emerald-500/20";
                cardBgColor = "bg-emerald-50/70";
              } else if (isSelected && !evaluationResult.isCorrect) {
                cardBorderColor = "border-rose-500 ring-2 ring-rose-500/20";
                cardBgColor = "bg-rose-50/70";
              }
            } else {
              // For check-boxes, visually mark choices
              if (isSelected) {
                cardBorderColor = "border-teal-600 ring-2 ring-teal-500/20";
                cardBgColor = "bg-teal-50/70";
              }
            }
          }

          return (
            <button
              key={option.optionKey}
              id={`opt-${option.optionKey}`}
              type="button"
              onClick={() => handleCardClick(option.optionKey)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onKeyDown={(e) => handleKeyDown(e, index, option.optionKey)}
              disabled={!!evaluationResult || isSubmitting}
              className={`flex items-center p-4 rounded-2xl border text-right transition-all duration-200 cursor-pointer focus:outline-none ${cardBorderColor} ${cardBgColor} touch-target`}
            >
              {/* Checkbox / Radio Circle */}
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center ml-4 shrink-0 transition-all ${
                  isSelected
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "border-teal-300 bg-white"
                }`}
              >
                {isSelected && (isMultiple ? "✓" : "●")}
              </div>
              <div className="flex-1">
                <span className="block font-bold text-teal-900 text-sm md:text-base">
                  {option.label}
                </span>
                {option.secondaryText && (
                  <span className="block text-xs text-teal-800/60 mt-1">
                    {option.secondaryText}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!evaluationResult && (
        <button
          type="submit"
          disabled={
            isSubmitting ||
            (isMultiple ? selectedMultiple.length === 0 : !selectedSingle)
          }
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "تأكيد الإجابة 🚀"}
        </button>
      )}
    </form>
  );
}
