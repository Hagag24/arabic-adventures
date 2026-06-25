"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import DictatableTextField from "@/components/activity/DictatableTextField";

interface OpenTextRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
  value?: { text: string } | null;
  onChange?: (val: { text: string }) => void;
}

export default function OpenTextRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: OpenTextRendererProps) {
  const [text, setText] = useState(
    (activity.previousResponseData?.text as string) || "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === "") return;
    onSubmit({ text: text.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      <div className="mb-6">
        <DictatableTextField
          id="open-answer"
          label="اكتب إجابتك باللغة العربية الفصحى:"
          value={text}
          onChange={(val) => !evaluationResult && setText(val)}
          disabled={!!evaluationResult || isSubmitting}
          placeholder="اكتب إجابتك وتفكيرك الرائع هنا..."
          multiline={true}
          rows={5}
        />
      </div>

      {evaluationResult && evaluationResult.modelAnswer && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-right transition-all duration-300">
          <span className="text-xs font-bold text-amber-800 block mb-2">
            💡 نموذج للإجابة المقترحة للمقارنة:
          </span>
          <p className="text-amber-950 font-semibold text-sm md:text-base leading-relaxed whitespace-pre-line">
            {evaluationResult.modelAnswer}
          </p>
        </div>
      )}

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || text.trim() === ""}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "إرسال الإجابة 🚀"}
        </button>
      )}
    </form>
  );
}
