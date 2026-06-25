"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import ActivityRenderer from "@/components/activity/ActivityRenderer";

interface ActivityPlayerClientProps {
  activity: StudentActivityPayload;
}

export default function ActivityPlayerClient({
  activity,
}: ActivityPlayerClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] =
    useState<SafeEvaluationResult | null>(
      activity.isCompleted
        ? {
            isCorrect: true,
            score: activity.isGraded ? 1.0 : 0.0,
            storagePolicy: activity.storagePolicy,
            modelAnswer: activity.modelAnswer || null,
            explanation: activity.explanation || null,
            journeyStatus: "IN_PROGRESS",
          }
        : null
    );
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

  const roadmapUrl = `/lessons/${activity.journeySlug}`;
  const nextActivityUrl = activity.nextActivitySlug
    ? `/lessons/${activity.journeySlug}/activities/${activity.nextActivitySlug}`
    : `/lessons/${activity.journeySlug}/result`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-right dir-rtl font-sans">
      {/* Header with Journey & Stage Title */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={roadmapUrl}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-all shadow-sm shrink-0"
              title="العودة للدرس"
            >
              ➔
            </Link>
            <div>
              <span className="text-[10px] md:text-xs font-bold text-teal-600 tracking-wider uppercase block mb-0.5">
                الدرس الحالي
              </span>
              <h1 className="text-sm md:text-base font-black text-slate-800">
                {activity.journeyTitle}
              </h1>
            </div>
          </div>

          <div className="w-full md:w-auto flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">
                النشاط الحالي
              </span>
              <span className="text-xs md:text-sm font-bold text-slate-700">
                {activity.activityNumber} من {activity.totalActivities}
              </span>
            </div>
            <Link
              href={roadmapUrl}
              className="text-xs font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/60 px-3 py-1.5 rounded-full transition-all"
            >
              خريطة الدرس 🗺️
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
            تعليمات النشاط 📝
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
                className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Shake wrapper around actual game renderer */}
        <div className={`${shake ? "animate-shake" : ""}`}>
          <ActivityRenderer
            activity={activity}
            onSubmit={handleSubmitResponse}
            isSubmitting={isSubmitting}
            evaluationResult={evaluationResult}
          />
        </div>

        {/* Submission Error messages */}
        {errorMsg && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs md:text-sm font-semibold rounded-2xl">
            {errorMsg}
          </div>
        )}

        {/* Feedback Card after evaluation */}
        {evaluationResult && (
          <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">
                {evaluationResult.isCorrect ? "🎉" : "💡"}
              </span>
              <h3 className="text-base md:text-lg font-bold text-slate-800">
                {evaluationResult.isCorrect ? "أحسنت! إجابة صحيحة" : "محاولة جيدة!"}
              </h3>
            </div>

            {/* Model answer for reflection / open-text tasks */}
            {evaluationResult.modelAnswer && (
              <div className="bg-teal-50/30 border border-teal-100/40 p-4 rounded-2xl mb-4 text-right">
                <span className="text-xs font-bold text-teal-700 block mb-2">💡 الإجابة المقترحة:</span>
                <p className="text-xs md:text-sm text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                  {evaluationResult.modelAnswer}
                </p>
              </div>
            )}

            {/* Explanations */}
            {evaluationResult.explanation && (
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl mb-6 text-right">
                <span className="text-xs font-bold text-slate-500 block mb-2">📘 الشرح والتوضيح:</span>
                <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                  {evaluationResult.explanation}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              {/* If incorrect, give a retry button */}
              {activity.isGraded && !evaluationResult.isCorrect && (
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm md:text-base rounded-2xl transition-all shadow-md active:scale-95 touch-target"
                >
                  حاول مجدداً 🔄
                </button>
              )}

              {/* Continue to next page button */}
              {(evaluationResult.isCorrect || !activity.isGraded) && (
                <Link
                  href={nextActivityUrl}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm md:text-base rounded-2xl transition-all shadow-md active:scale-95 touch-target text-center"
                >
                  {activity.nextActivitySlug ? "النشاط التالي ➔" : "إنهاء الدرس 🏆"}
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-500/50 mt-auto">
        <p>© {new Date().getFullYear()} مغامرات العربية. لعبة التعلم السعيد.</p>
      </footer>
    </div>
  );
}
