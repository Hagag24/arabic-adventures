import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getPlayerSessionId } from "@/lib/session/session-manager";
import SessionInitializer from "@/components/session/SessionInitializer";

export const dynamic = "force-dynamic";

interface LessonRoadmapPageProps {
  params: Promise<{
    lessonSlug: string;
  }>;
}

export default async function LessonRoadmapPage({ params }: LessonRoadmapPageProps) {
  const { lessonSlug } = await params;
  const sessionId = await getPlayerSessionId();

  // Fetch the lesson (journey) and all its activities
  const lesson = await prisma.journey.findFirst({
    where: { slug: lessonSlug, status: "PUBLISHED" },
    include: {
      activities: {
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!lesson) {
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

  // Determine locking states sequentially by displayOrder
  const activitiesWithStatus = lesson.activities.map((act, idx) => {
    const isUnlocked = idx === 0 || completedSet.has(lesson.activities[idx - 1].id);
    const isCompleted = completedSet.has(act.id);
    return {
      ...act,
      isUnlocked,
      isCompleted,
    };
  });

  const allActivitiesCompleted = activitiesWithStatus.every((a) => a.isCompleted);

  // Setup theme styling colors based on themeKey
  let themeHeaderBg = "bg-teal-600 text-white";
  let themeAccent = "text-teal-600";
  let themeBadge = "bg-teal-50 text-teal-700 border-teal-100";

  if (lesson.themeKey === "humanity") {
    themeHeaderBg = "bg-amber-600 text-white";
    themeAccent = "text-amber-600";
    themeBadge = "bg-amber-50 text-amber-700 border-amber-100";
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-right dir-rtl font-sans">
      <SessionInitializer />

      {/* Header */}
      <header className={`${themeHeaderBg} py-5 px-6 md:px-12 flex justify-between items-center shadow-md`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-extrabold text-sm transition-all shadow-sm"
          >
            ➔
          </Link>
          <h1 className="text-xl md:text-2xl font-black">{lesson.title}</h1>
        </div>
        <Link
          href="/"
          className="text-xs md:text-sm font-semibold bg-white/10 hover:bg-white/25 px-4 py-2 rounded-xl transition-all"
        >
          الرئيسية
        </Link>
      </header>

      {/* Main Roadmap */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
            خريطة الطريق للدرس 🗺️
          </h2>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4">
            {lesson.shortDescription}
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <span className={`border px-3 py-1.5 rounded-full ${themeBadge}`}>
              الوسام: {lesson.achievementTitle} 🏆
            </span>
            <span className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              الأنشطة: {lesson.activities.length} نشاطاً 📝
            </span>
            <span className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              المدة التقديرية: {lesson.estimatedMinutes} دقيقة ⏱️
            </span>
          </div>
        </div>

        {/* Celebration / Award Badge Button */}
        {allActivitiesCompleted && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 mb-8 text-center shadow-sm flex flex-col items-center justify-center transform hover:scale-[1.01] transition-all duration-300 animate-fade-in">
            <span className="text-4xl mb-3 block">🎉🏆🌟</span>
            <h3 className="text-xl font-bold text-amber-900 mb-2">
              تهانينا يا بطل! لقد أنهيت الدرس بالكامل!
            </h3>
            <p className="text-sm text-amber-800/80 mb-6 max-w-md">
              لقد أتممت كافة الأنشطة وحصلت على وسام التميز بنجاح.
            </p>
            <Link
              href={`/lessons/${lessonSlug}/result`}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base md:text-lg rounded-2xl shadow-md transition-all active:scale-95 touch-target"
            >
              عرض وسام التميز 🏆
            </Link>
          </div>
        )}

        {/* Activities Timeline */}
        <div className="relative border-r-2 border-dashed border-slate-300 pr-6 mr-4 flex flex-col gap-6">
          {activitiesWithStatus.map((act, idx) => {
            const { isUnlocked, isCompleted } = act;

            let cardBorder = "border-slate-100";
            let opacity = "opacity-100";
            let statusBadge = (
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                ✓ مكتمل
              </span>
            );

            if (!isUnlocked) {
              cardBorder = "border-slate-200/50 bg-slate-50/50";
              opacity = "opacity-60";
              statusBadge = (
                <span className="bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                  🔒 مغلق
                </span>
              );
            } else if (!isCompleted) {
              cardBorder = "border-amber-200 bg-amber-50/10";
              statusBadge = (
                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  🚀 جاري اللعب
                </span>
              );
            }

            return (
              <div key={act.id} className={`relative ${opacity}`}>
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

                {/* Activity Card */}
                <div className={`bg-white p-6 rounded-3xl border shadow-sm transition-all duration-300 ${cardBorder}`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm md:text-base ${themeAccent}`}>
                        النشاط {idx + 1}:
                      </span>
                      <h3 className="text-base md:text-lg font-bold text-slate-800">
                        {act.title}
                      </h3>
                    </div>
                    {statusBadge}
                  </div>

                  <p className="text-xs md:text-sm text-slate-500 mb-6 leading-relaxed">
                    {act.instruction}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {(act.skillTags as string[] || []).map((tag: string) => (
                        <span key={tag} className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {isUnlocked ? (
                      <Link
                        href={`/lessons/${lessonSlug}/activities/${act.slug}`}
                        className={`px-5 py-2 rounded-xl font-bold text-xs shadow-sm transition-colors touch-target ${
                          isCompleted
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-teal-600 hover:bg-teal-700 text-white"
                        }`}
                      >
                        {isCompleted ? "إعادة اللعب 🔄" : "ابدأ التحدي 🚀"}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        أكمل الأنشطة السابقة لفتح هذا التحدي.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500/60 mt-auto">
        <p>© {new Date().getFullYear()} مغامرات العربية. لعبة التعلم البطل.</p>
      </footer>
    </div>
  );
}
