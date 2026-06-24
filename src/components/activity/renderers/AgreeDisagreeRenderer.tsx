"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface AgreeDisagreeRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

export default function AgreeDisagreeRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: AgreeDisagreeRendererProps) {
  const [selections, setSelections] = useState<
    Record<string, "agree" | "disagree">
  >({});

  const handleSelect = (optionKey: string, val: "agree" | "disagree") => {
    if (evaluationResult) return;
    setSelections((prev) => ({ ...prev, [optionKey]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selections).length < activity.options.length) return;
    onSubmit({ selections });
  };

  const isAllSelected =
    Object.keys(selections).length === activity.options.length;

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      <div className="flex flex-col gap-4 mb-6">
        {activity.options.map((opt) => {
          const choice = selections[opt.optionKey];

          return (
            <div
              key={opt.optionKey}
              className="p-4 rounded-2xl border border-teal-100 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <span className="font-semibold text-teal-900 text-sm md:text-base flex-1">
                {opt.label}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelect(opt.optionKey, "agree")}
                  disabled={!!evaluationResult || isSubmitting}
                  className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all touch-target ${
                    choice === "agree"
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "border-teal-200 bg-teal-50/10 text-teal-800 hover:bg-teal-50"
                  }`}
                >
                  أوافق 👍
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.optionKey, "disagree")}
                  disabled={!!evaluationResult || isSubmitting}
                  className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all touch-target ${
                    choice === "disagree"
                      ? "bg-amber-600 border-amber-600 text-white"
                      : "border-amber-200 bg-amber-50/10 text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  لا أوافق 👎
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || !isAllSelected}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "إرسال تقييم المواقف 🚀"}
        </button>
      )}
    </form>
  );
}
