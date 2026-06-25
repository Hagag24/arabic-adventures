"use client";

import React from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import { SelfAssessmentResponse } from "../ActivityPlayerClient";

interface SelfAssessmentRendererProps {
  activity: StudentActivityPayload;
  value: SelfAssessmentResponse | null;
  onChange: (value: SelfAssessmentResponse) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

export default function SelfAssessmentRenderer({
  activity,
  value,
  onChange,
  isSubmitting,
  evaluationResult,
}: SelfAssessmentRendererProps) {
  const selectedKey = value?.selectedKey ?? null;

  const handleSelect = (key: string) => {
    if (evaluationResult) return;
    onChange({ selectedKey: key });
  };

  // If there are no options, display default options
  const options =
    activity.options && activity.options.length > 0
      ? activity.options
      : [
          {
            optionKey: "happy",
            label: "أشعر بالحماس والرغبة في المعرفة والاستكشاف 😊",
            displayOrder: 1,
          },
          {
            optionKey: "neutral",
            label: "أشعر بالهدوء والتركيز المعتاد 😐",
            displayOrder: 2,
          },
          {
            optionKey: "calm",
            label: "أشعر بالسكينة وأتطلع للقصة والمشاريع الجديدة 🧐",
            displayOrder: 3,
          },
        ];

  return (
    <div className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {options.map((opt) => {
          const isSelected = selectedKey === opt.optionKey;

          let cardStyle = "border-slate-200 bg-white hover:border-slate-300";
          if (isSelected) {
            cardStyle =
              "border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/10 scale-[1.01] shadow-sm";
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
              aria-pressed={isSelected}
              className={`p-6 rounded-3xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer touch-target focus:outline-none focus:ring-2 focus:ring-teal-500 motion-safe:active:scale-95 disabled:cursor-not-allowed ${cardStyle}`}
            >
              {isSelected && (
                <span className="text-xs font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-full mb-3 flex items-center gap-1">
                  ✓ تم الاختيار
                </span>
              )}

              {/* Big Emoji representation based on key */}
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
                opt.optionKey === "calm" ||
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
                  "calm",
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
    </div>
  );
}
