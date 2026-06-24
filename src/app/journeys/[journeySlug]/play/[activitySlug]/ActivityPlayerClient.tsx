"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import AudioPlayButton from "@/components/audio/AudioPlayButton";
import ActivityRenderer from "@/components/activity/ActivityRenderer";

interface ActivityPlayerClientProps {
  activity: StudentActivityPayload;
}

export default function ActivityPlayerClient({
  activity,
}: ActivityPlayerClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] =
    useState<SafeEvaluationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmitResponse = async (
    responseData: Record<string, unknown>,
  ) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/activities/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId: activity.id,
          responseData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEvaluationResult(data.result);
      } else {
        setErrorMsg(data.error || "فشل إرسال الإجابة. يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg(
        "حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-right dir-rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/journeys/${activity.journeySlug}`}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-all shadow-sm"
          >
            ➔
          </Link>
          <h1 className="text-base md:text-lg font-bold text-slate-800">
            {activity.title}
          </h1>
        </div>
        <Link
          href={`/journeys/${activity.journeySlug}`}
          className="text-xs md:text-sm font-bold text-teal-600 hover:text-teal-800 transition-colors"
        >
          خريطة الطريق 🗺️
        </Link>
      </header>

      {/* Main Gameplay content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        {/* Instructions Card */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full inline-block mb-3">
            تعليمات التحدي 📝
          </span>
          <p className="text-sm md:text-base text-slate-700 leading-relaxed font-semibold">
            {activity.instruction}
          </p>

          {/* Skill Tag Badges */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {activity.skillTags.map((tag) => (
              <span
                key={tag}
                className="bg-slate-50 border border-slate-200/60 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Audio Player if available */}
        {activity.audioAsset && (
          <div className="mb-6">
            <AudioPlayButton
              assetKey={activity.audioAsset.assetKey}
              label="اضغط للاستماع للفقرة الصوتية بتركيز 🎧"
            />
          </div>
        )}

        {/* Dynamic Activity Renderer Dispatcher */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <ActivityRenderer
            activity={activity}
            onSubmit={handleSubmitResponse}
            isSubmitting={isSubmitting}
            evaluationResult={evaluationResult}
          />
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl font-bold text-sm md:text-base mb-6 shadow-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Submission Feedback Banner */}
        {evaluationResult && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col gap-4 animate-fade-in">
            {/* Graded success vs reflection check */}
            {activity.isGraded ? (
              evaluationResult.isCorrect ? (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-800 font-bold text-sm md:text-base">
                  🎉 أحسنت يا بطل! إجابة صحيحة وعمل رائع ومتميز!
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-800 font-bold text-sm md:text-base">
                  💡 محاولة طيبة يا ذكي! راجع التوضيح وحاول التحدي مجدداً لتطور
                  فهمك.
                </div>
              )
            ) : (
              <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl text-teal-800 font-bold text-sm md:text-base">
                🌟 تم تسجيل مشاركتك المتميزة بنجاح يا بطل! استمر في الإبداع.
              </div>
            )}

            {/* Explanation / Advice */}
            {evaluationResult.explanation && (
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                <span className="font-bold text-slate-700 block mb-1">
                  توضيح إضافي:
                </span>
                {evaluationResult.explanation}
              </div>
            )}

            {/* Next Steps Buttons */}
            <div className="flex gap-3 border-t border-slate-50 pt-5 mt-2">
              <Link
                href={`/journeys/${activity.journeySlug}`}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-center rounded-2xl shadow-sm text-sm md:text-base transition-colors touch-target"
              >
                العودة لخريطة الطريق 🗺️
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
