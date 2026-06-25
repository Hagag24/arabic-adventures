"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import DictatableTextField from "@/components/activity/DictatableTextField";

interface StoryBuilderRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
  value?: { problem: string; solution: string; ending: string } | null;
  onChange?: (val: {
    problem: string;
    solution: string;
    ending: string;
  }) => void;
}

export default function StoryBuilderRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: StoryBuilderRendererProps) {
  const [problem, setProblem] = useState(
    (activity.previousResponseData?.problem as string) || "",
  );
  const [solution, setSolution] = useState(
    (activity.previousResponseData?.solution as string) || "",
  );
  const [ending, setEnding] = useState(
    (activity.previousResponseData?.ending as string) || "",
  );

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
        <div className="bg-white p-4 rounded-2xl border border-teal-100">
          <DictatableTextField
            id="story-problem"
            label="١. المشكلة أو التحدي للمشروع:"
            value={problem}
            onChange={(val) => !evaluationResult && setProblem(val)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="مثال: صعوبة قراءة الكلمات الطويلة لبعض الزملاء..."
            multiline={true}
            rows={2}
          />
        </div>

        {/* Step 2: Solution */}
        <div className="bg-white p-4 rounded-2xl border border-teal-100">
          <DictatableTextField
            id="story-solution"
            label="٢. الحل أو المبادرة المقترحة:"
            value={solution}
            onChange={(val) => !evaluationResult && setSolution(val)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="مثال: تصميم بطاقات ملونة تسهل نطق وتقسيم الكلمات..."
            multiline={true}
            rows={2}
          />
        </div>

        {/* Step 3: Ending */}
        <div className="bg-white p-4 rounded-2xl border border-teal-100">
          <DictatableTextField
            id="story-ending"
            label="٣. الأثر أو النتيجة المتوقعة:"
            value={ending}
            onChange={(val) => !evaluationResult && setEnding(val)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="مثال: تحسن قراءة زملائي وشعورهم بالفخر باللغة العربية..."
            multiline={true}
            rows={2}
          />
        </div>
      </div>

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
