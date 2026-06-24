import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getPlayerSessionId } from "@/lib/session/session-manager";
import SessionInitializer from "@/components/session/SessionInitializer";

export const dynamic = "force-dynamic";

interface JourneyMapPageProps {
  params: {
    journeySlug: string;
  };
}

export default async function JourneyMapPage({ params }: JourneyMapPageProps) {
  const { journeySlug } = params;
  const sessionId = await getPlayerSessionId();

  const journey = await prisma.journey.findFirst({
    where: { slug: journeySlug, status: "PUBLISHED" },
    include: {
      stages: {
        orderBy: { displayOrder: "asc" },
        include: {
          activities: {
            where: { isPublished: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      },
    },
  });

  if (!journey) {
    notFound();
  }

  // Fetch completed activities for current player session
  const completedProgresses = await prisma.activityProgress.findMany({
    where: {
      playerSessionId: sessionId || "",
      status: "COMPLETED",
    },
    select: { activityId: true },
  });
  const completedSet = new Set(completedProgresses.map((p) => p.activityId));

  // Determine locking states
  const stagesWithStatus = journey.stages.map((stage, idx) => {
    const previousStages = journey.stages.slice(0, idx);
    const lastStageCompleted =
      previousStages.length === 0 ||
      previousStages.every(
        (s) =>
          s.activities.length > 0 &&
          s.activities.every((act) => completedSet.has(act.id)),
      );
    const isUnlocked = lastStageCompleted;
    const isCompleted =
      stage.activities.length > 0 &&
      stage.activities.every((act) => completedSet.has(act.id));

    return {
      ...stage,
      isUnlocked,
      isCompleted,
    };
  });

  const allStagesCompleted = stagesWithStatus.every((s) => s.isCompleted);

  // Setup theme styling colors based on themeKey
  let themeHeaderBg = "bg-teal-600 text-white";
  let themeAccent = "text-teal-600";
  let themeBadge = "bg-teal-50 text-teal-700 border-teal-100";

  if (journey.themeKey === "humanity") {
    themeHeaderBg = "bg-amber-600 text-white";
    themeAccent = "text-amber-600";
    themeBadge = "bg-amber-50 text-amber-700 border-amber-100";
  } else if (journey.themeKey === "safety") {
    themeHeaderBg = "bg-rose-600 text-white";
    themeAccent = "text-rose-600";
    themeBadge = "bg-rose-50 text-rose-700 border-rose-100";
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-right dir-rtl">
      <SessionInitializer />

      {/* Header */}
      <header
        className={`${themeHeaderBg} py-5 px-6 md:px-12 flex justify-between items-center shadow-md`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-extrabold text-sm transition-all shadow-sm"
          >
            ➔
          </Link>
          <h1 className="text-xl md:text-2xl font-black">{journey.title}</h1>
        </div>
        <Link
          href="/"
          className="text-xs md:text-sm font-semibold bg-white/10 hover:bg-white/25 px-4 py-2 rounded-xl transition-all"
        >
          العودة للرئيسية
        </Link>
      </header>

      {/* Main Roadmap */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
            خريطة طريق المغامرة 🗺️
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4">
            {journey.shortDescription}
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <span className={`border px-3 py-1.5 rounded-full ${themeBadge}`}>
              الوسام المكتسب: {journey.achievementTitle} 🏆
            </span>
            <span className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              المدة التقديرية: {journey.estimatedMinutes} دقيقة ⏱️
            </span>
          </div>
        </div>

        {/* Celebration / Award Badge Button */}
        {allStagesCompleted && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 mb-8 text-center shadow-sm flex flex-col items-center justify-center transform hover:scale-[1.01] transition-all duration-300">
            <span className="text-4xl mb-3 block">🎉🏆🌟</span>
            <h3 className="text-xl font-bold text-amber-900 mb-2">
              أحسنت يا بطل! لقد أكملت المغامرة بنجاح!
            </h3>
            <p className="text-sm text-amber-800/80 mb-6 max-w-md">
              لقد أتممت كافة المراحل والتحديات واستمعت للقصص وعالجت الأسئلة
              بذكاء. أنت تستحق وسام الفوز الآن!
            </p>
            <Link
              href={`/journeys/${journeySlug}/result`}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base md:text-lg rounded-2xl shadow-md transition-all active:scale-95 touch-target"
            >
              الحصول على وسام التميز 🏆
            </Link>
          </div>
        )}

        {/* Stages Timeline */}
        <div className="relative border-r-2 border-dashed border-slate-300 pr-6 mr-4 flex flex-col gap-8">
          {stagesWithStatus.map((stage, idx) => {
            const { isUnlocked, isCompleted } = stage;

            let cardBorder = "border-slate-100";
            let opacity = "opacity-100";
            let statusBadge = (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                ✓ مكتملة
              </span>
            );

            if (!isUnlocked) {
              cardBorder = "border-slate-200/50 bg-slate-50/50";
              opacity = "opacity-60";
              statusBadge = (
                <span className="bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                  🔒 مغلقة
                </span>
              );
            } else if (!isCompleted) {
              cardBorder = "border-amber-200 bg-amber-50/10";
              statusBadge = (
                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  🚀 جارية
                </span>
              );
            }

            return (
              <div key={stage.id} className={`relative ${opacity}`}>
                {/* Timeline Circle Bullet */}
                <div
                  className={`absolute -right-[35px] top-6 w-6 h-6 rounded-full border-4 border-slate-50 flex items-center justify-center shadow-sm ${
                    !isUnlocked
                      ? "bg-slate-300"
                      : isCompleted
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                  }`}
                />

                {/* Stage Card */}
                <div
                  className={`bg-white p-6 rounded-3xl border shadow-sm transition-all duration-300 ${cardBorder}`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-black text-sm md:text-base ${themeAccent}`}
                      >
                        المرحلة {idx + 1}:
                      </span>
                      <h3 className="text-base md:text-lg font-bold text-slate-800">
                        {stage.title}
                      </h3>
                    </div>
                    {statusBadge}
                  </div>

                  <p className="text-xs md:text-sm text-slate-500 mb-6 leading-relaxed">
                    {stage.shortDescription}
                  </p>

                  {/* Activities List */}
                  {isUnlocked ? (
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        تحديات هذه المرحلة:
                      </span>
                      {stage.activities.map((act, actIdx) => {
                        const isActCompleted = completedSet.has(act.id);

                        return (
                          <div
                            key={act.id}
                            className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/30 text-xs md:text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center text-[10px] text-slate-500">
                                {actIdx + 1}
                              </span>
                              <span className="font-semibold text-slate-700">
                                {act.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {isActCompleted ? (
                                <span className="text-emerald-600 font-bold">
                                  ✓ تم بنجاح
                                </span>
                              ) : (
                                <span className="text-amber-600 font-bold">
                                  انتظار اللعب
                                </span>
                              )}
                              <Link
                                href={`/journeys/${journeySlug}/play/${act.slug}`}
                                className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-colors touch-target ${
                                  isActCompleted
                                    ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                    : "bg-teal-600 hover:bg-teal-700 text-white"
                                }`}
                              >
                                {isActCompleted
                                  ? "إعادة اللعب 🔄"
                                  : "ابدأ التحدي 🚀"}
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      أكمل المراحل السابقة لفتح هذه التحديات.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500/60 mt-auto">
        <p>
          © {new Date().getFullYear()} مغامرات العربية. خريطة رحلات الأبطال.
        </p>
      </footer>
    </div>
  );
}
