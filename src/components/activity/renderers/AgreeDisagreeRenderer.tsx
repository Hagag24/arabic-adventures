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
  // Load previous selection: "agree" or "disagree"
  const [selected, setSelected] = useState<string | null>(
    (activity.previousResponseData?.selectedOption as string) || null,
  );
  // Load previous reason
  const [reason, setReason] = useState<string>(
    (activity.previousResponseData?.reason as string) || "",
  );

  const handleSelect = (optionKey: string) => {
    if (evaluationResult) return;
    setSelected(optionKey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    onSubmit({
      selectedOption: selected,
      reason: reason.trim(),
    });
  };

  const isValid = selected !== null && reason.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100/60 mb-6 text-right">
          <span className="text-xs font-bold text-teal-800/60 mb-1 block">
            العبارة المطروحة للنقاش:
          </span>
          <p className="text-teal-950 font-bold text-base md:text-lg leading-relaxed">
            {activity.prompt}
          </p>
        </div>
      )}

      {/* Agree / Disagree Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {activity.options.map((opt) => {
          const isSelected = selected === opt.optionKey;
          const isAgree =
            opt.optionKey === "agree" ||
            (opt.label.includes("موافق") && !opt.label.includes("غير"));

          let btnStyle =
            "border-teal-100 bg-white text-teal-900 hover:bg-teal-50/30";
          if (isSelected) {
            btnStyle = isAgree
              ? "bg-teal-600 border-teal-600 text-white font-bold ring-2 ring-teal-500/20"
              : "bg-amber-600 border-amber-600 text-white font-bold ring-2 ring-amber-500/20";
          }

          return (
            <button
              key={opt.optionKey}
              type="button"
              onClick={() => handleSelect(opt.optionKey)}
              disabled={!!evaluationResult || isSubmitting}
              className={`p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer font-bold text-sm md:text-base touch-target ${btnStyle}`}
            >
              {opt.label} {isAgree ? "👍" : "👎"}
            </button>
          );
        })}
      </div>

      {/* Write the Reason */}
      <div className="flex flex-col gap-2 mb-6">
        <label className="text-sm font-bold text-teal-900">
          اكتب السبب ووجهة نظرك:
        </label>
        <textarea
          value={reason}
          onChange={(e) => !evaluationResult && setReason(e.target.value)}
          disabled={!!evaluationResult || isSubmitting}
          placeholder="عبر عن رأيك بصدق ووضوح..."
          rows={4}
          className="w-full px-4 py-3 border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-2xl outline-none font-semibold text-teal-900 transition-all duration-200 resize-none text-sm md:text-base"
        />
      </div>

      {/* Model Answer / Feedback */}
      {evaluationResult && evaluationResult.modelAnswer && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 mb-6 text-right transition-all duration-300">
          <span className="text-xs font-bold text-emerald-800 block mb-2">
            🌟 إجابة جميلة ومميزة! إليك بعض الأفكار المقترحة:
          </span>
          <p className="text-emerald-950 font-semibold text-sm md:text-base leading-relaxed">
            {evaluationResult.modelAnswer}
          </p>
        </div>
      )}

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "إرسال الرأي 🚀"}
        </button>
      )}
    </form>
  );
}
