"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import DictatableTextField from "@/components/activity/DictatableTextField";

interface ProblemSolutionRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
  value?: { problem: string; solution1: string; solution2: string } | null;
  onChange?: (val: {
    problem: string;
    solution1: string;
    solution2: string;
  }) => void;
}

export default function ProblemSolutionRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: ProblemSolutionRendererProps) {
  const [problem, setProblem] = useState(
    (activity.previousResponseData?.problem as string) ||
      (activity.prompt && activity.prompt.includes("المشكلة:")
        ? activity.prompt
        : ""),
  );
  const [solution1, setSolution1] = useState(
    (activity.previousResponseData?.solution1 as string) || "",
  );
  const [solution2, setSolution2] = useState(
    (activity.previousResponseData?.solution2 as string) || "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      problem: problem.trim(),
      solution1: solution1.trim(),
      solution2: solution2.trim(),
    });
  };

  const isAllFilled = solution1.trim() !== "" && solution2.trim() !== "";

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100/60 mb-6 text-right">
          <span className="text-xs font-bold text-teal-800/60 mb-1 block">
            الموقف المطروح:
          </span>
          <p className="text-teal-950 font-bold text-sm md:text-base leading-relaxed">
            {activity.prompt}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5 mb-6">
        {/* Problem Description (If not fixed in prompt) */}
        {!activity.prompt && (
          <div className="mb-2">
            <DictatableTextField
              id="problem"
              label="المشكلة التي لاحظتها:"
              value={problem}
              onChange={(val) => !evaluationResult && setProblem(val)}
              disabled={!!evaluationResult || isSubmitting}
              placeholder="صف المشكلة باختصار..."
            />
          </div>
        )}

        {/* Solution 1 */}
        <div className="mb-2">
          <DictatableTextField
            id="solution1"
            label="المقترح أو الحل الأول:"
            value={solution1}
            onChange={(val) => !evaluationResult && setSolution1(val)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="اكتب الحل الأول بالتفصيل..."
            multiline={true}
            rows={3}
          />
        </div>

        {/* Solution 2 */}
        <div className="mb-2">
          <DictatableTextField
            id="solution2"
            label="المقترح أو الحل الثاني:"
            value={solution2}
            onChange={(val) => !evaluationResult && setSolution2(val)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="اكتب الحل الثاني بالتفصيل..."
            multiline={true}
            rows={3}
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
