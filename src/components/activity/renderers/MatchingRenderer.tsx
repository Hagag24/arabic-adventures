"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface MatchingRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

export default function MatchingRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: MatchingRendererProps) {
  // Partition options into Left side and Right side
  const leftOptions = activity.options.filter(
    (opt) =>
      opt.optionKey.startsWith("word") ||
      opt.optionKey.startsWith("evt") ||
      opt.optionKey.startsWith("elm"),
  );
  const rightOptions = activity.options.filter(
    (opt) => !leftOptions.includes(opt),
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>(
    (activity.previousResponseData?.pairs as Record<string, string>) || {},
  );

  const handleLeftClick = (key: string) => {
    if (evaluationResult) return;
    setSelectedLeft(key);
    // If a right item is already highlighted, pair them up
    if (selectedRight) {
      makePair(key, selectedRight);
    }
  };

  const handleRightClick = (key: string) => {
    if (evaluationResult) return;
    setSelectedRight(key);
    // If a left item is already highlighted, pair them up
    if (selectedLeft) {
      makePair(selectedLeft, key);
    }
  };

  const makePair = (leftKey: string, rightKey: string) => {
    setPairs((prev) => {
      const next = { ...prev };
      // Remove any existing pairing that uses this rightKey
      for (const lKey of Object.keys(next)) {
        if (next[lKey] === rightKey) {
          delete next[lKey];
        }
      }
      next[leftKey] = rightKey;
      return next;
    });
    // Reset selection
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleRemovePair = (leftKey: string) => {
    if (evaluationResult) return;
    setPairs((prev) => {
      const next = { ...prev };
      delete next[leftKey];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(pairs).length < leftOptions.length) return;
    onSubmit({ pairs });
  };

  const isAllPaired = Object.keys(pairs).length === leftOptions.length;

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      {/* Grid of Columns */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-teal-800/60 mb-1 block">
            الكلمة / الحدث
          </span>
          {leftOptions.map((opt) => {
            const isSelected = selectedLeft === opt.optionKey;
            const pairedRightKey = pairs[opt.optionKey];
            const isPaired = !!pairedRightKey;

            let cardStyle = "border-teal-100 bg-white hover:bg-teal-50/20";
            if (isSelected) {
              cardStyle =
                "border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/10";
            } else if (isPaired) {
              cardStyle = "border-teal-200 bg-teal-50/20 opacity-80";
            }

            return (
              <button
                key={opt.optionKey}
                type="button"
                onClick={() => handleLeftClick(opt.optionKey)}
                disabled={!!evaluationResult || isSubmitting}
                className={`p-4 rounded-2xl border text-right font-semibold text-teal-900 transition-all duration-200 touch-target ${cardStyle}`}
              >
                {opt.label}
                {isPaired && (
                  <span className="text-xs text-teal-600 block mt-1 font-bold">
                    ✓ تم التوصيل
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-teal-800/60 mb-1 block">
            المعنى / المقابل
          </span>
          {rightOptions.map((opt) => {
            const isSelected = selectedRight === opt.optionKey;
            const isPaired = Object.values(pairs).includes(opt.optionKey);

            let cardStyle = "border-teal-100 bg-white hover:bg-teal-50/20";
            if (isSelected) {
              cardStyle =
                "border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/10";
            } else if (isPaired) {
              cardStyle = "border-teal-200 bg-teal-50/20 opacity-80";
            }

            return (
              <button
                key={opt.optionKey}
                type="button"
                onClick={() => handleRightClick(opt.optionKey)}
                disabled={!!evaluationResult || isSubmitting}
                className={`p-4 rounded-2xl border text-right font-semibold text-teal-900 transition-all duration-200 touch-target ${cardStyle}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matched Pairs Indicator / Panel */}
      {Object.keys(pairs).length > 0 && (
        <div className="bg-teal-50/30 rounded-2xl p-4 border border-teal-100 mb-6">
          <span className="text-xs font-bold text-teal-800/60 mb-3 block">
            التوصيلات الحالية:
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(pairs).map(([lKey, rKey]) => {
              const leftOpt = leftOptions.find((o) => o.optionKey === lKey);
              const rightOpt = rightOptions.find((o) => o.optionKey === rKey);

              let badgeStyle = "bg-teal-100 border-teal-200 text-teal-900";
              if (evaluationResult) {
                // Correct or incorrect pairs
                const isCorrectPair =
                  evaluationResult.isCorrect ||
                  (evaluationResult.explanation === null &&
                    evaluationResult.score > 0.8); // fallback
                badgeStyle = isCorrectPair
                  ? "bg-emerald-100 border-emerald-200 text-emerald-900"
                  : "bg-rose-100 border-rose-200 text-rose-900";
              }

              return (
                <div
                  key={lKey}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${badgeStyle}`}
                >
                  <span>{leftOpt?.label}</span>
                  <span className="text-teal-800/40">⟷</span>
                  <span>{rightOpt?.label}</span>
                  {!evaluationResult && (
                    <button
                      type="button"
                      onClick={() => handleRemovePair(lKey)}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-sm focus:outline-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || !isAllPaired}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "تأكيد التوصيل 🚀"}
        </button>
      )}
    </form>
  );
}
