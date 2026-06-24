"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface ProblemSolutionRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
}

export default function ProblemSolutionRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: ProblemSolutionRendererProps) {
  // If prompt already specifies the problem (e.g. Yacoub project), we can display it read-only
  const [problem, setProblem] = useState("");
  const [solution1, setSolution1] = useState("");
  const [solution2, setSolution2] = useState("");

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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-teal-900">
              المشكلة التي لاحظتها:
            </label>
            <input
              type="text"
              value={problem}
              onChange={(e) => !evaluationResult && setProblem(e.target.value)}
              disabled={!!evaluationResult || isSubmitting}
              placeholder="صف المشكلة باختصار..."
              className="w-full px-4 py-3 border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-2xl outline-none font-semibold text-teal-900 transition-all duration-200"
            />
          </div>
        )}

        {/* Solution 1 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-teal-900">
            المقترح أو الحل الأول:
          </label>
          <textarea
            value={solution1}
            onChange={(e) => !evaluationResult && setSolution1(e.target.value)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="اكتب الحل الأول بالتفصيل..."
            rows={3}
            className="w-full px-4 py-3 border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-2xl outline-none font-semibold text-teal-900 transition-all duration-200 resize-none"
          />
        </div>

        {/* Solution 2 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-teal-900">
            المقترح أو الحل الثاني البديل:
          </label>
          <textarea
            value={solution2}
            onChange={(e) => !evaluationResult && setSolution2(e.target.value)}
            disabled={!!evaluationResult || isSubmitting}
            placeholder="اكتب الحل الثاني البديل..."
            rows={3}
            className="w-full px-4 py-3 border border-teal-100 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-2xl outline-none font-semibold text-teal-900 transition-all duration-200 resize-none"
          />
        </div>
      </div>

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || !isAllFilled}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "إرسال الحلول المقترحة 🚀"}
        </button>
      )}
    </form>
  );
}
