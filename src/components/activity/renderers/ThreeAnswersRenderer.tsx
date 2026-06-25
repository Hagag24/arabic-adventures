"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import DictatableTextField from "@/components/activity/DictatableTextField";

interface ThreeAnswersRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
  value?: { answers: string[] } | null;
  onChange?: (val: { answers: string[] }) => void;
}

export default function ThreeAnswersRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: ThreeAnswersRendererProps) {
  const [answers, setAnswers] = useState<string[]>(
    (activity.previousResponseData?.answers as string[]) || ["", "", ""],
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (index: number, val: string) => {
    if (evaluationResult) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswers = answers.map((ans) => ans.trim());

    // 1. Validate that all three are filled
    if (cleanAnswers.some((ans) => ans === "")) {
      setErrorMsg("يرجى ملء جميع الحقول الثلاثة!");
      return;
    }

    // 2. Validate that they are unique (case-insensitive & diacritic-insensitive duplicate check)
    const uniqueAnswers = new Set(cleanAnswers.map((ans) => ans.toLowerCase()));
    if (uniqueAnswers.size < 3) {
      setErrorMsg("يرجى كتابة إجابات مختلفة وعدم تكرارها!");
      return;
    }

    onSubmit({ answers: cleanAnswers });
  };

  const isAllFilled = answers.every((ans) => ans.trim() !== "");

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      <div className="flex flex-col gap-4 mb-6">
        {[0, 1, 2].map((idx) => (
          <DictatableTextField
            key={idx}
            id={`three-answer-${idx}`}
            label={
              idx === 0
                ? "الإجابة الأولى:"
                : idx === 1
                  ? "الإجابة الثانية:"
                  : "الإجابة الثالثة:"
            }
            value={answers[idx]}
            onChange={(val) => handleInputChange(idx, val)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="اكتب هنا..."
          />
        ))}
      </div>

      {errorMsg && (
        <p className="text-rose-600 text-sm font-bold mb-4 bg-rose-50 border border-rose-100 p-3 rounded-xl animate-fade-in">
          ⚠️ {errorMsg}
        </p>
      )}

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || !isAllFilled}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "إرسال الإجابة 🚀"}
        </button>
      )}
    </form>
  );
}
