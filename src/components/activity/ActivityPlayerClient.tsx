"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import ActivityRenderer from "@/components/activity/ActivityRenderer";
import PublicHeader from "@/components/layout/PublicHeader";
import { useAudio } from "@/audio/runtime/use-audio";

export type SelfAssessmentResponse = {
  selectedKey: string;
};

export type StudentResponse =
  | { type: "self_assessment"; data: SelfAssessmentResponse }
  | { type: "single_choice"; data: { selectedOption: string } }
  | {
      type: "checklist" | "multiple_select";
      data: { selectedOptions: string[] };
    }
  | { type: "word_bank"; data: { blanks: Record<string, string> } }
  | { type: "matching"; data: { pairs: Record<string, string> } }
  | { type: "ordering"; data: { order: string[] } }
  | { type: "fill_in_the_blank"; data: { blanks: Record<string, string> } }
  | { type: "three_answers"; data: { answers: string[] } }
  | {
      type: "problem_solution";
      data: { problem: string; solution1: string; solution2: string };
    }
  | {
      type: "story_builder";
      data: { problem: string; solution: string; ending: string };
    }
  | {
      type: "short_text" | "long_text" | "creative_ending" | "retell_story";
      data: { text: string };
    }
  | { type: "agree_disagree"; data: { selectedOption: string; reason: string } }
  | { type: "multi_round"; data: { rounds: Record<string, unknown> } };

interface ActivityPlayerClientProps {
  activity: StudentActivityPayload;
}

export default function ActivityPlayerClient({
  activity,
}: ActivityPlayerClientProps) {
  const {
    playKey,
    playFeedbackSequence,
    stop,
    pauseVoice,
    isMuted,
    toggleState,
    isNarrating,
    dictationActive,
    setActivityScope,
  } = useAudio();

  const [narrationTriggered, setNarrationTriggered] = useState<string | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<StudentResponse | null>(() => {
    if (activity.previousResponseData) {
      const data = activity.previousResponseData as Record<string, unknown>;
      if (
        activity.type === "self_assessment" &&
        typeof data.selectedKey === "string"
      ) {
        return {
          type: "self_assessment",
          data: { selectedKey: data.selectedKey },
        };
      }
    }
    return null;
  });

  const [prevActivityId, setPrevActivityId] = useState(activity.id);
  if (activity.id !== prevActivityId) {
    setPrevActivityId(activity.id);
    setNarrationTriggered(null);
    if (activity.previousResponseData && activity.type === "self_assessment") {
      const data = activity.previousResponseData as Record<string, unknown>;
      if (typeof data.selectedKey === "string") {
        setResponse({
          type: "self_assessment",
          data: { selectedKey: data.selectedKey },
        });
      } else {
        setResponse(null);
      }
    } else {
      setResponse(null);
    }
  }

  const [evaluationResult, setEvaluationResult] =
    useState<SafeEvaluationResult | null>(
      activity.isCompleted
        ? {
            isCorrect: activity.isGraded ? true : null,
            score: activity.isGraded ? 1.0 : null,
            storagePolicy: activity.storagePolicy,
            modelAnswer: activity.modelAnswer || null,
            explanation: activity.explanation || null,
            journeyStatus: "IN_PROGRESS",
          }
        : null,
    );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Setup activity scope to cancel previous playbacks
  useEffect(() => {
    setActivityScope(activity.id);
    return () => {
      stop();
    };
  }, [activity.id, setActivityScope, stop]);

  // Autoplay trigger logic
  useEffect(() => {
    if (narrationTriggered === activity.id) return;

    const audioEnabled = !isMuted;
    const autoRead = true;
    const approvedManifestLoaded =
      toggleState !== "unavailable" && toggleState !== "loading";

    if (
      audioEnabled &&
      autoRead &&
      !dictationActive &&
      approvedManifestLoaded
    ) {
      setTimeout(() => {
        setNarrationTriggered(activity.id);
      }, 0);

      const triggerAutoplay = async () => {
        if (activity.instructionAudioKey) {
          await playKey(activity.instructionAudioKey);
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (activity.promptAudioKey) {
          await playKey(activity.promptAudioKey);
        }
      };

      triggerAutoplay();
    }
  }, [
    activity.id,
    activity.instructionAudioKey,
    activity.promptAudioKey,
    isMuted,
    toggleState,
    dictationActive,
    narrationTriggered,
    playKey,
  ]);

  const handleSubmitResponse = async (
    responseData: Record<string, unknown>,
  ) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/activities/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityId: activity.id,
          responseData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEvaluationResult(data.result);

        // Trigger feedback sounds
        if (activity.isGraded) {
          if (data.result.isCorrect) {
            playFeedbackSequence(
              "global.sfx.correct",
              activity.correctFeedbackAudioKey,
            );
          } else {
            playFeedbackSequence(
              "global.sfx.incorrect",
              activity.incorrectFeedbackAudioKey,
            );
            setShake(true);
            setTimeout(() => setShake(false), 500);
          }
        } else {
          playFeedbackSequence(
            "global.sfx.completion",
            activity.completionFeedbackAudioKey,
          );
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

  const roadmapUrl = `/lessons/${activity.journeySlug}`;
  const nextActivityUrl = activity.nextActivitySlug
    ? `/lessons/${activity.journeySlug}/activities/${activity.nextActivitySlug}`
    : `/lessons/${activity.journeySlug}/result`;

  const handleManualPlay = () => {
    if (activity.instructionAudioKey) {
      playKey(activity.instructionAudioKey);
    }
  };

  const handleManualReplay = async () => {
    stop();
    if (activity.instructionAudioKey) {
      await playKey(activity.instructionAudioKey);
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (activity.promptAudioKey) {
      await playKey(activity.promptAudioKey);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-right dir-rtl font-sans">
      {/* Unified PublicHeader */}
      <PublicHeader
        title={activity.journeyTitle}
        subtitle="الدرس الحالي"
        backUrl={roadmapUrl}
        backLabel="العودة للدرس"
        themeKey="white"
        currentActivity={activity.activityNumber}
        totalActivities={activity.totalActivities}
      />

      {/* Main Gameplay content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        {/* Instructions Card */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full inline-block select-none">
              تعليمات النشاط 📝
            </span>

            {/* Manual Audio Widget */}
            {toggleState !== "unavailable" && toggleState !== "loading" && (
              <div className="flex gap-2">
                {isNarrating ? (
                  <button
                    onClick={() => pauseVoice()}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] md:text-xs font-bold transition-all touch-target"
                  >
                    ⏸️ إيقاف مؤقت
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={handleManualPlay}
                      className="px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-100 text-[10px] md:text-xs font-bold transition-all touch-target"
                    >
                      🔊 استمع إلى السؤال
                    </button>
                    <button
                      onClick={handleManualReplay}
                      className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 text-[10px] md:text-xs font-bold transition-all touch-target"
                      title="إعادة الاستماع"
                    >
                      🔄 إعادة
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <h2 className="text-base md:text-lg font-bold text-slate-800 mb-2 select-none">
            {activity.title}
          </h2>
          <p className="text-sm md:text-base text-slate-700 leading-relaxed font-semibold">
            {activity.instruction}
          </p>
        </div>

        {/* Shake wrapper around actual game renderer */}
        <div className={`${shake ? "animate-shake" : ""}`}>
          <ActivityRenderer
            activity={activity}
            onSubmit={handleSubmitResponse}
            isSubmitting={isSubmitting}
            evaluationResult={evaluationResult}
            response={response}
            onResponseChange={setResponse}
          />
        </div>

        {/* Render submit button for self_assessment in the parent client */}
        {activity.type === "self_assessment" && (
          <div className="mt-6">
            <button
              onClick={() => {
                if (response?.type === "self_assessment") {
                  handleSubmitResponse(response.data);
                }
              }}
              disabled={
                response?.type !== "self_assessment" ||
                response.data.selectedKey.trim().length === 0 ||
                isSubmitting ||
                !!evaluationResult
              }
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md transition-all duration-200 disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 touch-target focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {evaluationResult
                ? "تم حفظ اختيارك"
                : isSubmitting
                  ? "جارٍ الحفظ..."
                  : response?.type === "self_assessment" &&
                      response.data.selectedKey.trim().length > 0
                    ? "تأكيد اختياري"
                    : "اختر إجابة أولاً"}
            </button>
          </div>
        )}

        {/* Submission Error messages */}
        {errorMsg && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs md:text-sm font-semibold rounded-2xl">
            {errorMsg}
          </div>
        )}

        {/* Feedback Card after evaluation */}
        {evaluationResult && (
          <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in text-right">
            {!activity.isGraded ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🌟</span>
                  <h3 className="text-base md:text-lg font-bold text-slate-800">
                    شكرًا لمشاركتك 🌟
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                  تم حفظ اختيارك، ويمكنك الانتقال إلى النشاط التالي.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">
                    {evaluationResult.isCorrect ? "🎉" : "💡"}
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-slate-800">
                    {evaluationResult.isCorrect
                      ? "أحسنت! إجابة صحيحة"
                      : "محاولة جيدة!"}
                  </h3>
                </div>

                {/* Model answer for reflection / open-text tasks */}
                {evaluationResult.modelAnswer && (
                  <div className="bg-teal-50/30 border border-teal-100/40 p-4 rounded-2xl mb-4 text-right">
                    <span className="text-xs font-bold text-teal-700 block mb-2">
                      💡 الإجابة المقترحة:
                    </span>
                    <p className="text-xs md:text-sm text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                      {evaluationResult.modelAnswer}
                    </p>
                  </div>
                )}

                {/* Explanations */}
                {evaluationResult.explanation && (
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl mb-6 text-right">
                    <span className="text-xs font-bold text-slate-500 block mb-2">
                      📘 الشرح والتوضيح:
                    </span>
                    <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                      {evaluationResult.explanation}
                    </p>
                  </div>
                )}

                {/* If incorrect, give a retry button */}
                {!evaluationResult.isCorrect && (
                  <div className="flex gap-4">
                    <button
                      onClick={handleRetry}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm md:text-base rounded-2xl transition-all shadow-md active:scale-95 touch-target"
                    >
                      حاول مجدداً 🔄
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation actions after submission */}
        {evaluationResult && (
          <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">
                خطوتك التالية
              </span>
              <span className="text-sm font-bold text-slate-700">
                {activity.nextActivitySlug
                  ? `النشاط التالي: ${activity.nextActivityTitle || ""}`
                  : "لقد أتممت الدرس بالكامل! 🏆"}
              </span>
            </div>
            <Link
              href={nextActivityUrl}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-center rounded-2xl shadow-md transition-all active:scale-95 touch-target"
            >
              {activity.nextActivitySlug ? "النشاط التالي ➔" : "إنهاء الدرس 🏆"}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
