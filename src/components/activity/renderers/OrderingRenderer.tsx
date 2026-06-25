"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";

interface OrderingRendererProps {
  activity: StudentActivityPayload;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
  value?: { order: string[] } | null;
  onChange?: (val: { order: string[] }) => void;
}

export default function OrderingRenderer({
  activity,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: OrderingRendererProps) {
  const [items, setItems] = useState(() => {
    const prevOrder = activity.previousResponseData?.order as string[];
    if (prevOrder && prevOrder.length === activity.options.length) {
      const sorted = [...activity.options];
      sorted.sort(
        (a, b) =>
          prevOrder.indexOf(a.optionKey) - prevOrder.indexOf(b.optionKey),
      );
      return sorted;
    }
    return activity.options;
  });

  const handleMoveUp = (index: number) => {
    if (evaluationResult || index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (evaluationResult || index === items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ order: items.map((item) => item.optionKey) });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {activity.prompt && (
        <p className="text-teal-950 font-bold text-base md:text-lg mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
          {activity.prompt}
        </p>
      )}

      <div className="flex flex-col gap-3 mb-6">
        {items.map((item, index) => {
          let cardStyle = "border-teal-100 bg-white hover:bg-teal-50/10";
          if (evaluationResult) {
            cardStyle = evaluationResult.isCorrect
              ? "border-emerald-500 bg-emerald-50/30"
              : "border-rose-300 bg-rose-50/30";
          }

          return (
            <div
              key={item.optionKey}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${cardStyle}`}
            >
              {/* Position Badge & Text */}
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-teal-600/10 text-teal-800 font-bold flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <span className="font-semibold text-teal-900 text-sm md:text-base">
                  {item.label}
                </span>
              </div>

              {/* Move Buttons */}
              {!evaluationResult && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-100 disabled:opacity-30 disabled:cursor-not-allowed touch-target"
                    title="تحريك لأعلى"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 hover:bg-teal-100 disabled:opacity-30 disabled:cursor-not-allowed touch-target"
                    title="تحريك لأسفل"
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "تأكيد الترتيب 🚀"}
        </button>
      )}
    </form>
  );
}
