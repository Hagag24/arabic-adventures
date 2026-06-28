import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getPlayerSessionId } from "@/lib/session/session-manager";
import PublicHeader from "@/components/layout/PublicHeader";
import { LessonResultCelebration } from "@/components/audio/LessonResultCelebration";

export const dynamic = "force-dynamic";

interface LessonResultCelebrationProps {
  params: Promise<{
    lessonSlug: string;
  }>;
}

export default async function LessonResultPage({
  params,
}: LessonResultCelebrationProps) {
  const { lessonSlug } = await params;
  const sessionId = await getPlayerSessionId();

  if (!sessionId) {
    redirect("/");
  }

  const progress = await prisma.journeyProgress.findFirst({
    where: {
      playerSessionId: sessionId,
      journey: { slug: lessonSlug },
    },
    include: { journey: true },
  });

  if (!progress) {
    notFound();
  }

  // Ensure lesson is completed before showing badge
  if (progress.status !== "COMPLETED") {
    redirect(`/lessons/${lessonSlug}`);
  }

  const journey = progress.journey;

  // Render different styling/emojis based on theme
  let badgeEmoji = "🏆";
  const badgeTitle = journey.achievementTitle;
  let bgGradient = "from-teal-50 to-emerald-50";
  let borderStyle = "border-emerald-200";
  let textColor = "text-teal-900";
  let badgeAccent = "bg-teal-600";

  if (journey.themeKey === "ancient-egypt") {
    badgeEmoji = "🏺🦁📜";
    bgGradient = "from-amber-50 to-teal-50";
    borderStyle = "border-amber-200";
    textColor = "text-teal-950";
    badgeAccent = "bg-amber-500";
  } else if (journey.themeKey === "humanity") {
    badgeEmoji = "❤️🏥🕊️";
    bgGradient = "from-amber-50 to-orange-50";
    borderStyle = "border-amber-200";
    textColor = "text-amber-950";
    badgeAccent = "bg-amber-500";
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-right dir-rtl font-sans">
      <PublicHeader
        title="نتائج الدرس"
        backUrl="/"
        backLabel="الرئيسية"
        themeKey={journey.themeKey}
      />
      <div
        className={`flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br ${bgGradient}`}
      >
        {/* Badge Celebration Container */}
        <div
          className={`bg-white rounded-3xl border-2 ${borderStyle} shadow-xl p-8 md:p-12 max-w-xl w-full text-center flex flex-col items-center justify-center relative overflow-hidden`}
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-teal-500/5 blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />

          {/* Celebration Badges */}
          <span className="text-5xl md:text-7xl mb-4 block animate-bounce">
            {badgeEmoji}
          </span>

          <span className="text-amber-500 font-extrabold text-xs md:text-sm uppercase tracking-wider mb-2 block">
            وسام الشرف المكتسب
          </span>

          <h1 className={`text-3xl md:text-4xl font-black ${textColor} mb-4`}>
            لقب: {badgeTitle}
          </h1>

          <div className={`w-24 h-1 rounded-full ${badgeAccent} mb-6`} />

          <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-8 max-w-sm mx-auto">
            تهانينا الحارة لك يا بطل! لقد أنهيت درس{" "}
            <strong className="text-slate-800">«{journey.title}»</strong> بكافة
            تحدياته ونلت هذا اللقب بجدارة لاستماعك وتفكيرك الذكي.
          </p>

          <LessonResultCelebration lessonSlug={lessonSlug} />

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link
              href="/"
              className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-md text-center transition-all active:scale-95 touch-target block"
            >
              الرئيسية 🏠
            </Link>
            <Link
              href={`/lessons/${lessonSlug}`}
              className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-2xl text-center transition-all active:scale-95 touch-target block"
            >
              خريطة الدرس 🗺️
            </Link>
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-500/60">
          مغامرات العربية • رحلة نحو التميز
        </footer>
      </div>
    </div>
  );
}
