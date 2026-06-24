"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface StoryBuilderRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

export default function StoryBuilderRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: StoryBuilderRendererProps) {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [ending, setEnding] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      problem: problem.trim(),
      solution: solution.trim(),
      ending: ending.trim(),
    });
  };

  const isAllFilled =
    problem.trim() !== "" && solution.trim() !== "" && ending.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      <div className="flex flex-col gap-5 mb-6">
        {/* Step 1: Problem */}
        <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl border border-teal-100">
          <label className="text-sm font-bold text-teal-900 mb-1">
            ١. المشكلة أو التحدي للمشروع:
          </label>
          <textarea
            value={problem}
            onChange={(e) => !evaluationResult && setProblem(e.target.value)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="مثال: صعوبة قراءة الكلمات الطويلة لبعض الزملاء..."
            rows={2}
            className="w-full px-4 py-3 border border-teal-50 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-xl outline-none font-semibold text-teal-950 transition-all duration-200 resize-none text-sm"
          />
        </div>

        {/* Step 2: Solution */}
        <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl border border-teal-100">
          <label className="text-sm font-bold text-teal-900 mb-1">
            ٢. الحل أو المبادرة المقترحة:
          </label>
          <textarea
            value={solution}
            onChange={(e) => !evaluationResult && setSolution(e.target.value)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="مثال: تصميم بطاقات ملونة تسهل نطق وتقسيم الكلمات..."
            rows={2}
            className="w-full px-4 py-3 border border-teal-50 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-xl outline-none font-semibold text-teal-950 transition-all duration-200 resize-none text-sm"
          />
        </div>

        {/* Step 3: Ending */}
        <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl border border-teal-100">
          <label className="text-sm font-bold text-teal-900 mb-1">
            ٣. الأثر أو النتيجة المتوقعة:
          </label>
          <textarea
            value={ending}
            onChange={(e) => !evaluationResult && setEnding(e.target.value)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="مثال: تحسن قراءة زملائي وشعورهم بالفخر باللغة العربية..."
            rows={2}
            className="w-full px-4 py-3 border border-teal-50 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-xl outline-none font-semibold text-teal-950 transition-all duration-200 resize-none text-sm"
          />
        </div>
      </div>

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || !isAllFilled}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "إرسال وتصميم المشروع 🚀"}
        </button>
      )}
    </form>
  );
}
