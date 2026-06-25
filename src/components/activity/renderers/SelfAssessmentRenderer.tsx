"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface SelfAssessmentRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

export default function SelfAssessmentRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: SelfAssessmentRendererProps) {
  const [selected, setSelected] = useState<string | null>(
    (activity.previousResponseData?.ratingKey as string) || null
  );

  const handleSelect = (key: string) => {
    if (evaluationResult) return;
    setSelected(key);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    onSubmit({ ratingKey: selected });
  };

  // If there are no options, display a default 5-star or 3-smiley rating
  const options =
    activity.options && activity.options.length > 0
      ? activity.options
      : [
          {
            optionKey: "happy",
            label: "ممتاز وسعيد للغاية 😊",
            displayOrder: 1,
          },
          { optionKey: "neutral", label: "جيد ومستفيد 😐", displayOrder: 2 },
          {
            optionKey: "bored",
            label: "يحتاج للتطوير والتحسين 🧐",
            displayOrder: 3,
          },
        ];

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {options.map((opt) => {
          const isSelected = selected === opt.optionKey;

          let cardStyle = "border-teal-100 bg-white hover:bg-teal-50/20";
          if (isSelected) {
            cardStyle =
              "border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20";
          }
          if (evaluationResult && isSelected) {
            cardStyle = "border-emerald-500 bg-emerald-50/30";
          }

          return (
            <button
              key={opt.optionKey}
              type="button"
              onClick={() => handleSelect(opt.optionKey)}
              disabled={!!evaluationResult || isSubmitting}
              className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer touch-target ${cardStyle}`}
            >
              {/* Nice Big Emoji representation based on key */}
              <span className="text-3xl mb-2">
                {opt.optionKey === "happy" ||
                opt.optionKey === "proud" ||
                opt.optionKey === "love" ||
                opt.optionKey === "fully"
                  ? "😊"
                  : ""}
                {opt.optionKey === "neutral" ||
                opt.optionKey === "moderate" ||
                opt.optionKey === "awareness" ||
                opt.optionKey === "need_help"
                  ? "😐"
                  : ""}
                {opt.optionKey === "bored" ||
                opt.optionKey === "shy" ||
                opt.optionKey === "low" ||
                opt.optionKey === "competition"
                  ? "🧐"
                  : ""}
                {![
                  "happy",
                  "proud",
                  "love",
                  "fully",
                  "neutral",
                  "moderate",
                  "awareness",
                  "need_help",
                  "bored",
                  "shy",
                  "low",
                  "competition",
                ].includes(opt.optionKey) && "⭐"}
              </span>
              <span className="font-bold text-teal-900 text-sm md:text-base leading-relaxed">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || !selected}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "تأكيد تقييمي ذاتياً 🚀"}
        </button>
      )}
    </form>
  );
}
