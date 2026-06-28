"use client";

import React, { useState } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import DictatableTextField from "@/components/activity/DictatableTextField";
import { useAudio } from "@/audio/runtime/use-audio";
import { ActivityAudioContract } from "@/audio/runtime/activity-audio-contract";

interface AgreeDisagreeRendererProps {
  activity: StudentActivityPayload;
  audioContract: ActivityAudioContract;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
  value?: { selectedOption: string; reason: string } | null;
  onChange?: (val: { selectedOption: string; reason: string }) => void;
}

export default function AgreeDisagreeRenderer({
  activity,
  audioContract,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: AgreeDisagreeRendererProps) {
  const { playKey, stop } = useAudio();

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

    const key = audioContract.answerKeys[optionKey];
    if (key) {
      stop();
      playKey(key);
    }
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

          const audioKey = audioContract.answerKeys[opt.optionKey];

          return (
            <div key={opt.optionKey} className="relative">
              <button
                type="button"
                onClick={() => handleSelect(opt.optionKey)}
                disabled={!!evaluationResult || isSubmitting}
                className={`w-full p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer font-bold text-sm md:text-base touch-target ${btnStyle}`}
              >
                {opt.label} {isAgree ? "👍" : "👎"}
              </button>
              {audioKey && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    stop();
                    playKey(audioKey);
                  }}
                  data-audio-key={audioKey}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-150 touch-target z-10 select-none ${
                    isSelected
                      ? "text-teal-100 hover:bg-white/10"
                      : "text-teal-600 hover:bg-teal-50"
                  }`}
                  title="استمع"
                >
                  🔊
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Write the Reason */}
      <div className="mb-6">
        <DictatableTextField
          id="agree-disagree-reason"
          label="اكتب السبب ووجهة نظرك:"
          value={reason}
          onChange={(val) => !evaluationResult && setReason(val)}
          disabled={!!evaluationResult || isSubmitting}
          placeholder="اكتب تفاصيل رأيك بوضوح هنا..."
          multiline={true}
          rows={3}
        />
      </div>

      {!evaluationResult && (
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 touch-target"
        >
          {isSubmitting ? "جاري الإرسال..." : "إرسال الإجابة 🚀"}
        </button>
      )}
    </form>
  );
}
