"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface ChecklistRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
  value?: { selectedOptions: string[] } | null;
  onChange?: (val: { selectedOptions: string[] }) => void;
}

export default function ChecklistRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: ChecklistRendererProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    (activity.previousResponseData?.selectedOptions as string[]) || [],
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleCardClick = (optionKey: string) => {
    if (evaluationResult) return;
    setSelectedOptions((prev) =>
      prev.includes(optionKey)
        ? prev.filter((k) => k !== optionKey)
        : [...prev, optionKey],
    );
  };

  const handleClearSelection = () => {
    if (evaluationResult) return;
    setSelectedOptions([]);
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
      setFocusedIndex((prev) =>
        prev !== null && prev < activity.options.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev !== null && prev > 0 ? prev - 1 : activity.options.length - 1,
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOptions.length === 0) return;
    onSubmit({ selectedOptions });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      {/* Selected count info & clear button */}
      {!evaluationResult && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-teal-800/60">
            العناصر المحددة: {selectedOptions.length}
          </span>
          {selectedOptions.length > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
            >
              إلغاء التحديد الكل ✕
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-6">
        {activity.options.map((option, index) => {
          const isSelected = selectedOptions.includes(option.optionKey);
          const isFocused = focusedIndex === index;

          let cardBorder = "border-teal-100 hover:border-teal-300";
          let cardBg = "bg-white hover:bg-teal-50/30";

          if (isSelected) {
            cardBorder = "border-teal-600 ring-2 ring-teal-500/20";
            cardBg = "bg-teal-50/70";
          }

          if (isFocused && !evaluationResult) {
            cardBorder = "border-teal-600 ring-2 ring-teal-600/30";
          }

          // Visual feedback after submission
          if (evaluationResult) {
            if (isSelected) {
              cardBorder = "border-teal-600 ring-2 ring-teal-500/20";
              cardBg = "bg-teal-50/70";
            }
          }

          return (
            <button
              key={option.optionKey}
              type="button"
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onKeyDown={(e) => handleKeyDown(e, index, option.optionKey)}
              onClick={() => handleCardClick(option.optionKey)}
              disabled={!!evaluationResult || isSubmitting}
              className={`flex items-center p-4 rounded-2xl border text-right transition-all duration-200 cursor-pointer ${cardBorder} ${cardBg} touch-target focus:outline-none`}
            >
              {/* Checkbox Box */}
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center ml-4 shrink-0 transition-all ${
                  isSelected
                    ? "bg-teal-600 border-teal-600 text-white"
                    : "border-teal-300 bg-white"
                }`}
              >
                {isSelected && "✓"}
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
          disabled={isSubmitting || selectedOptions.length === 0}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "تأكيد الإجابة 🚀"}
        </button>
      )}
    </form>
  );
}
