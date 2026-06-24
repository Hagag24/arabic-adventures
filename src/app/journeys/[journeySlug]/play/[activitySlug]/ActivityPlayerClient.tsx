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
  const [shake, setShake] = useState(false);

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
        if (activity.isGraded && !data.result.isCorrect) {
          // Trigger shake animation on incorrect answer
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }
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

  const handleRetry = () => {
    setEvaluationResult(null);
    setErrorMsg(null);
  };

  const progressPercentage =
    (activity.activityNumber / activity.totalActivities) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-right dir-rtl font-sans">
      {/* Header with Journey & Stage Title */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/journeys/${activity.journeySlug}`}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-all shadow-sm shrink-0"
              title="العودة لخريطة الطريق"
            >
              ➔
            </Link>
            <div>
              <span className="text-[10px] md:text-xs font-bold text-teal-600 tracking-wider uppercase block mb-0.5">
                {activity.journeyTitle}
              </span>
              <h1 className="text-sm md:text-base font-black text-slate-800">
                {activity.stageTitle}
              </h1>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-4 shrink-0">
            {/* Activity progress stats */}
            <div className="text-right">
              <span className="text-xs text-slate-400 block">
                التحدي الحالي
              </span>
              <span className="text-xs md:text-sm font-bold text-slate-700">
                {activity.activityNumber} من {activity.totalActivities}
              </span>
            </div>
            <Link
              href={`/journeys/${activity.journeySlug}`}
              className="text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/60 px-3 py-1.5 rounded-full transition-all"
            >
              خريطة الطريق 🗺️
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4 w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      {/* Main Gameplay content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        {/* Instructions Card */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full inline-block mb-3">
            تعليمات التحدي 📝
          </span>
          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2">
            {activity.title}
          </h2>
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
        <div
          className={`bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm mb-6 transition-all ${shake ? "animate-shake border-rose-300 ring-4 ring-rose-500/10" : ""}`}
        >
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
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-800 font-bold text-sm md:text-base flex items-center gap-2">
                  <span className="text-xl">✨🌟</span>
                  <span>إجابة صحيحة! أحسنت عملًا رائعًا ومتميزًا! ⭐</span>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-800 font-bold text-sm md:text-base">
                  💡 محاولة جيدة! حاول مرة أخرى للتحدي لتتعلم وتفهم بشكل أفضل.
                </div>
              )
            ) : (
              <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl text-teal-800 font-bold text-sm md:text-base flex items-center gap-2">
                <span className="text-xl">🌟</span>
                <span>تم تسجيل مشاركتك المتميزة بنجاح! استمر في الإبداع.</span>
              </div>
            )}

            {/* Explanation / Advice (only shown after completion or correct answer) */}
            {evaluationResult.explanation && (
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                <span className="font-bold text-slate-700 block mb-1">
                  توضيح إضافي:
                </span>
                {evaluationResult.explanation}
              </div>
            )}

            {/* Display model answer for open activities after submission */}
            {!activity.isGraded && evaluationResult.modelAnswer && (
              <div className="text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4 bg-teal-50/20 p-4 rounded-xl">
                <span className="font-bold text-teal-900 block mb-1">
                  مثال للإجابة (الإجابات قد تختلف):
                </span>
                <p className="whitespace-pre-line font-medium text-teal-950">
                  {evaluationResult.modelAnswer}
                </p>
                <span className="text-[10px] text-teal-700/60 block mt-2">
                  الإجابات قد تختلف.
                </span>
              </div>
            )}

            {/* Next Steps / Retry Actions */}
            <div className="flex gap-3 border-t border-slate-50 pt-5 mt-2">
              {activity.isGraded && !evaluationResult.isCorrect && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-center rounded-2xl shadow-sm text-sm md:text-base transition-colors touch-target"
                >
                  حاول مجدداً 🔄
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex justify-between items-center gap-4 mt-6">
          {activity.previousActivitySlug ? (
            <Link
              href={`/journeys/${activity.journeySlug}/play/${activity.previousActivitySlug}`}
              className="px-6 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl transition-colors shadow-sm text-sm md:text-base touch-target"
            >
              السابق ➔
            </Link>
          ) : (
            <div /> // Spacer
          )}

          {(!activity.isGraded || evaluationResult?.isCorrect) && (
            <Link
              href={
                activity.nextActivitySlug
                  ? `/journeys/${activity.journeySlug}/play/${activity.nextActivitySlug}`
                  : `/journeys/${activity.journeySlug}/result`
              }
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-colors shadow-md text-sm md:text-base touch-target"
            >
              {activity.nextActivitySlug
                ? "التحدي التالي ➔"
                : "إنهاء الرحلة 🎓"}
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
