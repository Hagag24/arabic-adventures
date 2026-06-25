"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface FillBlankRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

export default function FillBlankRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: FillBlankRendererProps) {
  const prompt = activity.prompt || "";

  // Extract all blank keys like blank1, blank2
  const blankMatches = Array.from(prompt.matchAll(/\[(blank\d+)\]/g));
  const blankKeys = blankMatches.map((m) => m[1]);

  const [blanks, setBlanks] = useState<Record<string, string>>(
    (activity.previousResponseData?.blanks as Record<string, string>) || {}
  );
  const [activeBlank, setActiveBlank] = useState<string | null>(
    blankKeys[0] || null,
  );

  const handleInputChange = (key: string, val: string) => {
    if (evaluationResult) return;
    setBlanks((prev) => ({ ...prev, [key]: val }));
  };

  const handleWordClick = (word: string) => {
    if (evaluationResult) return;

    let targetKey = activeBlank;

    // If no active blank is focused, find the first empty one
    if (!targetKey) {
      targetKey = blankKeys.find((k) => !blanks[k]) || blankKeys[0];
    }

    if (targetKey) {
      handleInputChange(targetKey, word);
      // Auto focus next empty blank
      const nextEmpty = blankKeys.find((k) => k !== targetKey && !blanks[k]);
      if (nextEmpty) {
        setActiveBlank(nextEmpty);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate that all blanks are non-empty
    const allFilled = blankKeys.every(
      (k) => blanks[k] && blanks[k].trim() !== "",
    );
    if (!allFilled) return;
    onSubmit({ blanks });
  };

  // Helper to split and render text with inputs inline
  const renderPromptWithInputs = () => {
    const parts = prompt.split(/(\[blank\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(blank\d+)\]/);
      if (match) {
        const key = match[1];
        const isFocused = activeBlank === key;

        let inputStyle =
          "border-teal-300 focus:border-teal-600 focus:ring-teal-500/20";
        if (evaluationResult) {
          // If evaluation is available, check correctness if possible
          // Otherwise style neutral
          inputStyle = evaluationResult.isCorrect
            ? "border-emerald-500 bg-emerald-50/20 text-emerald-950 font-bold"
            : "border-rose-400 bg-rose-50/20 text-rose-950 font-bold";
        } else if (isFocused) {
          inputStyle = "border-teal-600 ring-2 ring-teal-500/20 bg-teal-50/10";
        }

        return (
          <input
            key={key}
            type="text"
            value={blanks[key] || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
            onFocus={() => setActiveBlank(key)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="اكتب الإجابة..."
            className={`inline-block mx-2 px-3 py-1.5 border rounded-xl text-center text-sm md:text-base font-semibold w-40 transition-all duration-200 outline-none ${inputStyle}`}
          />
        );
      }
      return (
        <span key={index} className="leading-loose text-teal-950 font-medium">
          {part}
        </span>
      );
    });
  };

  const hasWordBank = activity.options && activity.options.length > 0;
  const allFilled = blankKeys.every(
    (k) => blanks[k] && blanks[k].trim() !== "",
  );

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      <div className="bg-teal-50/40 p-6 rounded-3xl border border-teal-100/70 mb-6 leading-loose text-right">
        {renderPromptWithInputs()}
      </div>

      {/* Word Bank section */}
      {hasWordBank && !evaluationResult && (
        <div className="bg-white border border-teal-100 rounded-2xl p-4 mb-6 text-right">
          <span className="text-xs font-bold text-teal-800/60 mb-3 block">
            بنك الكلمات (انقر لملء الفراغ النشط):
          </span>
          <div className="flex flex-wrap gap-2">
            {activity.options.map((opt) => (
              <button
                key={opt.optionKey}
                type="button"
                onClick={() => handleWordClick(opt.label)}
                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl text-sm font-bold text-teal-900 transition-colors touch-target"
              >
                {opt.label}
              </button>
            ))}
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
