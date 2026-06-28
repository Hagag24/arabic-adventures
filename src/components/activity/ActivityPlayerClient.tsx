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
import { resolveActivityAudioContract } from "@/audio/runtime/activity-audio-contract";

function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F]/g, "") // Remove diacritics
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?]/g, "") // Remove punctuation
    .replace(/\s+/g, "") // Remove whitespace
    .trim();
}

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
    playSequence,
    stop,
    pauseVoice,
    isMuted,
    toggleState,
    isKeyPlayable,
    setActivityScope,
    dictationActive,
    isNarrating,
    unlock,
    setEntryIdentity,
    requestEntryNarration,
  } = useAudio();

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

  const [activeSubId, setActiveSubId] = useState<string>(() => {
    if (activity.type === "multi_round" && activity.configuration?.rounds?.[0]) {
      return activity.configuration.rounds[0].id;
    }
    return "";
  });

  const [prevActivityId, setPrevActivityId] = useState(activity.id);
  if (activity.id !== prevActivityId) {
    setPrevActivityId(activity.id);
    setActiveSubId(
      activity.type === "multi_round" && activity.configuration?.rounds?.[0]
        ? activity.configuration.rounds[0].id
        : ""
    );

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

  const contract = React.useMemo(() => {
    return resolveActivityAudioContract(activity, {
      hasKey: isKeyPlayable,
      roundId: activeSubId,
    });
  }, [activity, isKeyPlayable, activeSubId]);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [blockedSequence, setBlockedSequence] = useState<string[] | null>(null);

  const clientIdRef = React.useRef("unknown");
  useEffect(() => {
    clientIdRef.current = Math.random().toString(36).substring(7);
  }, []);

  // Setup activity scope to cancel previous playbacks
  const currentActivityIdRef = React.useRef(activity.id);

  useEffect(() => {
    setActivityScope(activity.id);
    
    if (currentActivityIdRef.current !== activity.id) {
      stop("activity-scope-changed");
      currentActivityIdRef.current = activity.id;
    }

    return () => {
      stop("activity-player-unmounted", activity.id);
    };
  }, [activity.id, setActivityScope, stop]);

  // Autoplay trigger logic
  const lastNarratedScreenEntryId = React.useRef("");
  const approvedManifestLoaded =
    toggleState !== "no_assets" && toggleState !== "initializing";

  useEffect(() => {
    if (approvedManifestLoaded) {
      const fullContract = resolveActivityAudioContract(activity, {
        hasKey: isKeyPlayable,
        roundId: activeSubId,
      });
      if (fullContract.questionKey && !isKeyPlayable(fullContract.questionKey)) {
        console.error(
          `[AUDIO_BINDING_ERROR]\nlesson=${activity.journeySlug}\nactivity=${activity.slug}\nscreen=${activity.id}\nevent=question\nkey=${fullContract.questionKey}\nreason=missing-manifest-entry`
        );
      }
      for (const key of Object.values(fullContract.answerKeys) as string[]) {
        if (key && !isKeyPlayable(key)) {
          console.error(
            `[AUDIO_BINDING_ERROR]\nlesson=${activity.journeySlug}\nactivity=${activity.slug}\nscreen=${activity.id}\nevent=answer\nkey=${key}\nreason=missing-manifest-entry`
          );
        }
      }
    }
  }, [activity, activeSubId, approvedManifestLoaded, isKeyPlayable]);

  const entryId = `${activity.journeySlug}:${activity.slug}:${activeSubId || activity.id}`;

  useEffect(() => {
    if (setEntryIdentity) {
      setEntryIdentity(entryId);
    }
  }, [entryId, setEntryIdentity]);

  useEffect(() => {
    const audioEnabled = !isMuted;

    if (
      audioEnabled &&
      approvedManifestLoaded &&
      !dictationActive &&
      blockedSequence === null &&
      entryId !== lastNarratedScreenEntryId.current
    ) {
      const round = (activity.configuration?.rounds as Array<{ id: string; prompt?: string }>)?.find((r) => r.id === activeSubId);
      const questionText = round?.prompt || activity.prompt || "";
      const instructionText = activity.instruction || "";

      const normInstruction = normalizeArabicText(instructionText);
      const normQuestion = normalizeArabicText(questionText);

      const instructionKey = contract.instructionKey || null;
      let questionKey = contract.questionKey || null;
      if (
        questionKey &&
        (questionKey === instructionKey || normQuestion === normInstruction)
      ) {
        questionKey = null;
      }

      const keys = [instructionKey, questionKey].filter(Boolean) as string[];

      const ownerId = activity.id;
      const windowObj = (typeof window !== "undefined" ? window : null) as { __audioSessionId?: string } | null;
      const sessionVal = windowObj ? windowObj.__audioSessionId || (windowObj.__audioSessionId = Math.random().toString(36).substring(7)) : "server";
      console.log(`[AUDIO_LOG] autoplay-attempt | sessionId=${sessionVal} | clientId=${clientIdRef.current} | entryId=${entryId} | instructionKey=${instructionKey} | questionKey=${questionKey} | timestamp=${Date.now()}`);

      requestEntryNarration({
        ownerId,
        entryId,
        instructionKey,
        questionKey,
        onPlaybackStart: () => {
          lastNarratedScreenEntryId.current = entryId;
        }
      }).then((result) => {
        console.log(`[AUDIO_LOG] autoplay-result | sessionId=${sessionVal} | clientId=${clientIdRef.current} | entryId=${entryId} | status=${result.status} | timestamp=${Date.now()}`);
        if (result.status === "blocked") {
          lastNarratedScreenEntryId.current = "";
          setBlockedSequence(keys);
        } else {
          setBlockedSequence(null);
          if (result.status === "completed") {
            lastNarratedScreenEntryId.current = entryId;
          }
        }
      });
    }
  }, [
    entryId,
    contract,
    isMuted,
    approvedManifestLoaded,
    dictationActive,
    toggleState,
    requestEntryNarration,
    blockedSequence,
    clientIdRef,
    activity.id,
    activity.instruction,
    activity.prompt,
    activity.configuration?.rounds,
    activeSubId,
  ]);

  const handleSubmitResponse = async (
    responseData: Record<string, unknown>,
  ) => {
    stop("answer-selected"); // Stop any currently playing audio on submit

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
        const feedback = data.result.feedback;
        if (feedback) {
          let sfxKey = "";
          let audioKey = "";

          if (feedback.status === "correct") {
            sfxKey = "global.sfx.correct";
            audioKey = "global.feedback.correct.01";
          } else if (feedback.status === "incorrect") {
            sfxKey = "global.sfx.incorrect";
            audioKey = "global.feedback.retry.01";
          } else if (feedback.status === "participation") {
            sfxKey = "";
            audioKey = "global.feedback.participation.01";
          } else {
            sfxKey = "global.sfx.completion";
            audioKey = "global.feedback.completion.01";
          }

          // Lesson completion (Section 8)
          const isNewlyCompleted = data.result.journeyStatus === "COMPLETED" && !activity.isCompleted;

          if (isNewlyCompleted) {
            if (typeof window !== "undefined") {
              sessionStorage.setItem(`arabic-adventures:should-celebrate:${activity.journeySlug}`, "true");
              // Preload celebration assets
              const preloadAudio = (url: string) => {
                try {
                  const audio = new Audio();
                  audio.src = url;
                  audio.preload = "auto";
                } catch (e) {
                  console.warn("Preload failed:", e);
                }
              };
              preloadAudio("/audio/v1/sfx/lesson-complete.01.wav");
              preloadAudio(`/audio/v1/lessons/${activity.journeySlug}/result.wav`);
            }
          }

          if (sfxKey) {
            playFeedbackSequence(sfxKey, audioKey || null);
          } else if (audioKey) {
            playKey(audioKey);
          }
          
          if (feedback.status === "incorrect") {
            setShake(true);
            setTimeout(() => setShake(false), 500);
          }
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

  const handleManualReplay = async () => {
    setBlockedSequence(null);
    lastNarratedScreenEntryId.current = entryId;

    const configObj = activity.configuration as { rounds?: { id: string; prompt?: string }[] } | null;
    const round = configObj?.rounds?.find((r) => r.id === activeSubId);
    const questionText = round?.prompt || activity.prompt || "";
    const instructionText = activity.instruction || "";

    const normInstruction = normalizeArabicText(instructionText);
    const normQuestion = normalizeArabicText(questionText);

    const keys: string[] = [];
    if (contract.instructionKey) {
      keys.push(contract.instructionKey);
    }
    if (
      contract.questionKey &&
      contract.questionKey !== contract.instructionKey &&
      normQuestion !== normInstruction
    ) {
      keys.push(contract.questionKey);
    }

    if (keys.length > 0) {
      await playSequence(keys);
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
        {/* Child-friendly Activation Control when audio is locked */}
        {(toggleState === "unlock_required" || blockedSequence !== null) && (
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-3xl p-6 text-center shadow-sm mb-6 animate-pulse select-none">
            <button
              type="button"
              onClick={async () => {
                const sessionVal = typeof window !== "undefined" ? (window as unknown as { __audioSessionId?: string }).__audioSessionId : "unknown";
                console.log(`[AUDIO_LOG] user-unlock-clicked | sessionId=${sessionVal} | clientId=${clientIdRef.current} | entryId=${entryId} | timestamp=${Date.now()}`);
                await unlock();
                
                const configObj2 = activity.configuration as { rounds?: { id: string; prompt?: string }[] } | null;
                const round = configObj2?.rounds?.find((r) => r.id === activeSubId);
                const questionText = round?.prompt || activity.prompt || "";
                const instructionText = activity.instruction || "";

                const normInstruction = normalizeArabicText(instructionText);
                const normQuestion = normalizeArabicText(questionText);

                const keys = blockedSequence || (() => {
                  const k: string[] = [];
                  if (contract.instructionKey) k.push(contract.instructionKey);
                  if (
                    contract.questionKey &&
                    contract.questionKey !== contract.instructionKey &&
                    normQuestion !== normInstruction
                  ) {
                    k.push(contract.questionKey);
                  }
                  return k;
                })();

                if (keys.length > 0) {
                  lastNarratedScreenEntryId.current = entryId;
                  const result = await playSequence(keys);
                  console.log(`[AUDIO_LOG] unlock-play-result | sessionId=${sessionVal} | clientId=${clientIdRef.current} | status=${result.status} | timestamp=${Date.now()}`);
                  if (result.status === "completed") {
                    setBlockedSequence(null);
                  }
                } else {
                  setBlockedSequence(null);
                }
              }}
              className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg md:text-xl rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 mx-auto touch-target cursor-pointer"
            >
              <span>🔊</span>
              <span>اضغط لتفعيل الصوت</span>
            </button>
          </div>
        )}
        {/* Instructions Card */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full inline-block select-none">
              تعليمات النشاط 📝
            </span>

            {/* Manual Audio Widget */}
            {toggleState !== "no_assets" && toggleState !== "initializing" && (
              <div className="flex gap-2">
                {isNarrating ? (
                  <button
                    onClick={() => pauseVoice()}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] md:text-xs font-bold transition-all touch-target"
                  >
                    ⏸️ إيقاف مؤقت
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualReplay}
                    data-audio-key={activity.instructionAudioKey || ""}
                    className="px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-100 text-[10px] md:text-xs font-bold transition-all touch-target"
                  >
                    🔊 استمع إلى السؤال
                  </button>
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
            audioContract={contract}
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
        {evaluationResult && evaluationResult.feedback && (
          <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-fade-in text-right">
            {evaluationResult.feedback.status === "participation" || evaluationResult.feedback.status === "completed" ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🌟</span>
                  <h3 className="text-base md:text-lg font-bold text-slate-800">
                    {evaluationResult.feedback.displayText}
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
                    {evaluationResult.feedback.status === "correct" ? "🎉" : "💡"}
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-slate-800">
                    {evaluationResult.feedback.displayText}
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
