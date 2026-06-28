"use client";

import React, { useState, useEffect } from "react";
import {
  StudentActivityPayload,
  SafeEvaluationResult,
} from "@/server/services/activity-service";
import DictatableTextField from "@/components/activity/DictatableTextField";
import { useAudio } from "@/audio/runtime/use-audio";

import { ActivityAudioContract } from "@/audio/runtime/activity-audio-contract";

interface Round {
  id: string;
  type: string;
  title: string;
  instruction: string;
  prompt?: string | null;
  options: Array<{
    optionKey: string;
    label: string;
    secondaryText?: string | null;
    displayOrder: number;
  }>;
  answerKey?: unknown;
}

interface MultiRoundRendererProps {
  activity: StudentActivityPayload;
  audioContract: ActivityAudioContract;
  setActiveSubId: (id: string) => void;
  onSubmit: (responseData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  evaluationResult: SafeEvaluationResult | null;
  value?: { rounds: Record<string, unknown> } | null;
  onChange?: (val: { rounds: Record<string, unknown> }) => void;
}

function deterministicShuffle<T>(array: T[], seed: string): T[] {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  const rng = () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };

  const list = [...array];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

export default function MultiRoundRenderer({
  activity,
  audioContract,
  setActiveSubId,
  onSubmit,
  isSubmitting,
  evaluationResult,
}: MultiRoundRendererProps) {
  const { playKey, stop } = useAudio();

  const rounds = React.useMemo(() => {
    const config = (activity.configuration as { rounds?: Round[] }) || {};
    return config.rounds || [];
  }, [activity.configuration]);

  const shuffledOptionsMap = React.useMemo(() => {
    const map: Record<
      string,
      Array<{
        optionKey: string;
        label: string;
        secondaryText?: string | null;
        displayOrder: number;
      }>
    > = {};
    for (const r of rounds) {
      if (r.type === "matching") {
        const left = r.options.filter(
          (o) =>
            o.optionKey.startsWith("word") ||
            o.optionKey.startsWith("w") ||
            o.optionKey.startsWith("evt") ||
            o.optionKey.startsWith("elm")
        );
        const right = r.options.filter((o) => !left.includes(o));
        map[r.id] = deterministicShuffle(right, r.id);
      }
    }
    return map;
  }, [rounds]);

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [roundResponses, setRoundResponses] = useState<
    Record<
      string,
      {
        order?: string[];
        pairs?: Record<string, string>;
        selectedOption?: string;
        text?: string;
      }
    >
  >({});

  // States for matching round type
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Synchronously update parent active entry ID on round change
  useEffect(() => {
    if (rounds.length > 0) {
      const currentRound = rounds[currentRoundIdx];
      if (currentRound) {
        setActiveSubId(currentRound.id);
      }
    }
  }, [currentRoundIdx, rounds, setActiveSubId]);

  if (rounds.length === 0) {
    return (
      <div className="text-center py-8">لا توجد جولات مهيأة لهذا النشاط.</div>
    );
  }

  const currentRound = rounds[currentRoundIdx];
  const responseForCurrent = roundResponses[currentRound.id] || {};

  const handleNextRound = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentRoundIdx < rounds.length - 1) {
      setCurrentRoundIdx((prev) => prev + 1);
      // Reset matching state
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handlePrevRound = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentRoundIdx > 0) {
      setCurrentRoundIdx((prev) => prev - 1);
      // Reset matching state
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const handleOrderingChange = (newOrder: string[]) => {
    if (evaluationResult) return;
    setRoundResponses((prev) => ({
      ...prev,
      [currentRound.id]: {
        ...prev[currentRound.id],
        order: newOrder,
      },
    }));
  };

  const handleMatchingChange = (leftKey: string, rightKey: string) => {
    if (evaluationResult) return;
    setRoundResponses((prev) => {
      const currentRoundPairs = prev[currentRound.id]?.pairs
        ? { ...prev[currentRound.id].pairs }
        : {};
      // Delete any duplicate rightKey mappings
      for (const k of Object.keys(currentRoundPairs)) {
        if (currentRoundPairs[k] === rightKey) {
          delete currentRoundPairs[k];
        }
      }
      currentRoundPairs[leftKey] = rightKey;
      return {
        ...prev,
        [currentRound.id]: {
          ...prev[currentRound.id],
          pairs: currentRoundPairs,
        },
      };
    });
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleRemovePair = (leftKey: string) => {
    if (evaluationResult) return;
    setRoundResponses((prev) => {
      const currentRoundPairs = prev[currentRound.id]?.pairs
        ? { ...prev[currentRound.id].pairs }
        : {};
      delete currentRoundPairs[leftKey];
      return {
        ...prev,
        [currentRound.id]: {
          ...prev[currentRound.id],
          pairs: currentRoundPairs,
        },
      };
    });
  };

  const handleSingleChoiceSelect = (optionKey: string) => {
    if (evaluationResult) return;

    const key = audioContract.answerKeys[optionKey];
    if (key) {
      stop("item-selected");
      playKey(key);
    }

    setRoundResponses((prev) => ({
      ...prev,
      [currentRound.id]: {
        ...prev[currentRound.id],
        selectedOption: optionKey,
      },
    }));
  };

  const handleTextChange = (text: string) => {
    if (evaluationResult) return;
    setRoundResponses((prev) => ({
      ...prev,
      [currentRound.id]: {
        ...prev[currentRound.id],
        text,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (evaluationResult) return;
    onSubmit({ rounds: roundResponses });
  };

  // Helper validation for round completedness before continuing/submitting
  const isRoundValid = () => {
    if (evaluationResult) return true;
    if (currentRound.type === "ordering") {
      const order = responseForCurrent.order || [];
      return order.length === currentRound.options.length;
    }
    if (currentRound.type === "matching") {
      const pairs = responseForCurrent.pairs || {};
      const leftOptions = currentRound.options.filter(
        (o) =>
          o.optionKey.startsWith("word") ||
          o.optionKey.startsWith("w") ||
          o.optionKey.startsWith("evt") ||
          o.optionKey.startsWith("elm"),
      );
      return Object.keys(pairs).length === leftOptions.length;
    }
    if (currentRound.type === "single_choice") {
      return !!responseForCurrent.selectedOption;
    }
    if (currentRound.type === "open_text") {
      return !!responseForCurrent.text?.trim();
    }
    return true;
  };

  const isAllValid = rounds.every((r) => {
    const resp = roundResponses[r.id] || {};
    if (r.type === "ordering") {
      return (resp.order || []).length === r.options.length;
    }
    if (r.type === "matching") {
      const leftOptions = r.options.filter(
        (o) =>
          o.optionKey.startsWith("word") ||
          o.optionKey.startsWith("w") ||
          o.optionKey.startsWith("evt") ||
          o.optionKey.startsWith("elm"),
      );
      return Object.keys(resp.pairs || {}).length === leftOptions.length;
    }
    if (r.type === "single_choice") {
      return !!resp.selectedOption;
    }
    if (r.type === "open_text") {
      return !!resp.text?.trim();
    }
    return true;
  });

  // Render individual round content
  const renderRoundContent = () => {
    if (currentRound.type === "ordering") {
      const items =
        responseForCurrent.order ||
        currentRound.options.map((o) => o.optionKey);

      const moveItem = (fromIdx: number, toIdx: number) => {
        const nextOrder = [...items];
        const [moved] = nextOrder.splice(fromIdx, 1);
        nextOrder.splice(toIdx, 0, moved);
        handleOrderingChange(nextOrder);

        const key = audioContract.answerKeys[moved];
        if (key) {
          stop("item-selected");
          playKey(key);
        }
      };

      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-500 font-medium">
            رتب الجمل التالية بسحبها أو ترتيبها بالتسلسل الصحيح:
          </p>
          <div className="flex flex-col gap-3">
            {items.map((optKey: string, idx: number) => {
              const opt = currentRound.options.find(
                (o) => o.optionKey === optKey,
              );
              if (!opt) return null;
              return (
                <div
                  key={optKey}
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-300 transition-all"
                >
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-2 select-none">
                    <span>{opt.label}</span>
                    {audioContract.answerKeys[optKey] && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          stop("new-playback-request");
                          playKey(audioContract.answerKeys[optKey]);
                        }}
                        data-audio-key={audioContract.answerKeys[optKey]}
                        className="p-1 rounded-full hover:bg-teal-100/50 text-teal-600 hover:text-teal-800 transition-colors shrink-0 touch-target select-none cursor-pointer z-10 relative"
                        title="استمع"
                      >
                        🔊
                      </button>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0 || !!evaluationResult}
                      onClick={() => moveItem(idx, idx - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 rounded-lg text-slate-600 font-bold"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1 || !!evaluationResult}
                      onClick={() => moveItem(idx, idx + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 rounded-lg text-slate-600 font-bold"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentRound.type === "matching") {
      const leftOptions = currentRound.options.filter(
        (o) =>
          o.optionKey.startsWith("word") ||
          o.optionKey.startsWith("w") ||
          o.optionKey.startsWith("evt") ||
          o.optionKey.startsWith("elm"),
      );
      const rightOptions = currentRound.options.filter(
        (o) => !leftOptions.includes(o),
      );
      const pairs = responseForCurrent.pairs || {};

      const shuffledRightOptions = shuffledOptionsMap[currentRound.id] || [];

      let leftLabel = "الكلمة";
      let rightLabel = "المعنى / المقابل";
      if (currentRound.id.includes("synonym")) {
        leftLabel = "الكلمة";
        rightLabel = "مرادفها";
      } else if (currentRound.id.includes("antonym")) {
        leftLabel = "الكلمة";
        rightLabel = "ضدها";
      }

      const handleLeftClick = (key: string) => {
        if (evaluationResult) return;
        setSelectedLeft(key);
        
        const audioKey = audioContract.answerKeys[key];
        if (audioKey) {
          stop("item-selected");
          playKey(audioKey);
        }

        if (selectedRight) handleMatchingChange(key, selectedRight);
      };

      const handleRightClick = (key: string) => {
        if (evaluationResult) return;
        setSelectedRight(key);

        const audioKey = audioContract.answerKeys[key];
        if (audioKey) {
          stop("item-selected");
          playKey(audioKey);
        }

        if (selectedLeft) handleMatchingChange(selectedLeft, key);
      };

      return (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-slate-500 font-medium">
            اختر عنصراً من اليمين ثم ما يطابقه من اليسار:
          </p>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-teal-800/60 mb-1 block text-right">
                {leftLabel}
              </span>
              {leftOptions.map((opt) => {
                const isPaired = !!pairs[opt.optionKey];
                const isSelected = selectedLeft === opt.optionKey;
                return (
                  <button
                    key={opt.optionKey}
                    type="button"
                    disabled={!!evaluationResult}
                    onClick={() => handleLeftClick(opt.optionKey)}
                    className={`p-4 text-right rounded-2xl border text-sm font-bold transition-all shadow-sm flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-teal-600 text-white border-teal-600"
                        : isPaired
                          ? "bg-slate-50 text-slate-400 border-slate-200"
                          : "bg-white hover:border-teal-400 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {audioContract.answerKeys[opt.optionKey] && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          stop("new-playback-request");
                          playKey(audioContract.answerKeys[opt.optionKey]);
                        }}
                        className="p-1 rounded-full hover:bg-teal-100/50 text-teal-600 hover:text-teal-800 transition-colors select-none cursor-pointer z-10 relative"
                      >
                        🔊
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Right Column */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-teal-800/60 mb-1 block text-right">
                {rightLabel}
              </span>
              {shuffledRightOptions.map((opt) => {
                const isPaired = Object.values(pairs).includes(opt.optionKey);
                const isSelected = selectedRight === opt.optionKey;
                return (
                  <button
                    key={opt.optionKey}
                    type="button"
                    disabled={!!evaluationResult}
                    onClick={() => handleRightClick(opt.optionKey)}
                    className={`p-4 text-right rounded-2xl border text-sm font-bold transition-all shadow-sm flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-teal-600 text-white border-teal-600"
                        : isPaired
                          ? "bg-slate-50 text-slate-400 border-slate-200"
                          : "bg-white hover:border-teal-400 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {audioContract.answerKeys[opt.optionKey] && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          stop("new-playback-request");
                          playKey(audioContract.answerKeys[opt.optionKey]);
                        }}
                        className="p-1 rounded-full hover:bg-teal-100/50 text-teal-600 hover:text-teal-800 transition-colors select-none cursor-pointer z-10 relative"
                      >
                        🔊
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Show Current Pairs */}
          {Object.keys(pairs).length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-400 block mb-3">
                التوصيلات الحالية:
              </span>
              <div className="flex flex-col gap-2">
                {Object.entries(pairs).map(([lKey, rKey]) => {
                  const leftOpt = leftOptions.find((o) => o.optionKey === lKey);
                  const rightOpt = rightOptions.find(
                    (o) => o.optionKey === rKey,
                  );
                  if (!leftOpt || !rightOpt) return null;
                  return (
                    <div
                      key={lKey}
                      className="flex items-center justify-between p-3 bg-teal-50/30 border border-teal-100/40 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">
                          {leftOpt.label}
                        </span>
                        <span className="text-slate-400">⟷</span>
                        <span className="font-semibold text-slate-700">
                          {rightOpt.label}
                        </span>
                      </div>
                      {!evaluationResult && (
                        <button
                          type="button"
                          onClick={() => handleRemovePair(lKey)}
                          className="text-red-500 hover:text-red-700 font-bold px-2"
                        >
                          إلغاء ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (currentRound.type === "single_choice") {
      const selected = responseForCurrent.selectedOption;
      return (
        <div className="flex flex-col gap-3">
          {currentRound.options.map((opt) => {
            const isSelected = selected === opt.optionKey;
            return (
              <button
                key={opt.optionKey}
                type="button"
                disabled={!!evaluationResult}
                onClick={() => handleSingleChoiceSelect(opt.optionKey)}
                className={`w-full p-4 text-right rounded-2xl border text-sm font-bold transition-all shadow-sm flex items-center justify-between gap-2 ${
                  isSelected
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white hover:border-teal-400 border-slate-200 text-slate-700"
                }`}
              >
                <span>{opt.label}</span>
                {audioContract.answerKeys[opt.optionKey] && (
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      stop("new-playback-request");
                      playKey(audioContract.answerKeys[opt.optionKey]);
                    }}
                    className="p-1 rounded-full hover:bg-teal-100/50 text-teal-600 hover:text-teal-800 transition-colors select-none cursor-pointer z-10 relative"
                  >
                    🔊
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    if (currentRound.type === "open_text") {
      const text = responseForCurrent.text || "";
      return (
        <div className="mb-2">
          <DictatableTextField
            id={`multi-round-open-${currentRound.id}`}
            label="اكتب إجابتك هنا:"
            value={text}
            onChange={handleTextChange}
            disabled={!!evaluationResult}
            placeholder="اكتب إجابتك هنا..."
            multiline={true}
            rows={3}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full text-right dir-rtl">
      {/* Round Header / Indicators */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
          الجولة {currentRoundIdx + 1} من {rounds.length}
        </span>
        <div className="flex gap-1">
          {rounds.map((_, rIdx) => (
            <div
              key={rIdx}
              className={`w-4 h-1.5 rounded-full transition-all ${
                rIdx === currentRoundIdx ? "bg-teal-600 w-6" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3">
          {currentRound.title}
        </h3>
        <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
          {currentRound.instruction}
        </p>

        {currentRound.prompt && (
          <p className="text-teal-950 font-bold text-sm md:text-base mb-6 leading-relaxed bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
            {currentRound.prompt}
          </p>
        )}

        {renderRoundContent()}
      </div>

      {/* Navigation for rounds */}
      <div className="flex justify-between items-center mt-6">
        {currentRoundIdx > 0 ? (
          <button
            onClick={handlePrevRound}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
            type="button"
          >
            الجولة السابقة
          </button>
        ) : (
          <div />
        )}

        {currentRoundIdx < rounds.length - 1 ? (
          <button
            onClick={handleNextRound}
            disabled={!isRoundValid()}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
            type="button"
          >
            الجولة التالية ➔
          </button>
        ) : (
          !evaluationResult && (
            <button
              type="submit"
              disabled={isSubmitting || !isAllValid}
              className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-sm md:text-base rounded-2xl transition-all shadow-md active:scale-95 touch-target"
            >
              {isSubmitting ? "جاري الإرسال..." : "إرسال الإجابة 🚀"}
            </button>
          )
        )}
      </div>
    </form>
  );
}
