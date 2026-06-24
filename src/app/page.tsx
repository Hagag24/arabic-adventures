import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getPlayerSessionId } from "@/lib/session/session-manager";
import SessionInitializer from "@/components/session/SessionInitializer";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const sessionId = await getPlayerSessionId();

  // Fetch all published journeys
  const journeys = await prisma.journey.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { displayOrder: "asc" },
    include: {
      stages: {
        include: {
          activities: {
            where: { isPublished: true },
          },
        },
      },
    },
  });

  // Fetch journey progress for current player session if available
  const progressMap: Record<string, { percent: number; completed: boolean }> =
    {};

  if (sessionId) {
    const progresses = await prisma.journeyProgress.findMany({
      where: { playerSessionId: sessionId },
    });

    for (const prog of progresses) {
      // Calculate real completion percentage based on completed activities vs total activities
      const journey = journeys.find((j) => j.id === prog.journeyId);
      if (journey) {
        const totalActivities = journey.stages.reduce(
          (acc, stage) => acc + stage.activities.length,
          0,
        );

        // Fetch completed activities count for this journey
        const completedCount = await prisma.activityProgress.count({
          where: {
            playerSessionId: sessionId,
            activity: {
              journeyId: journey.id,
            },
            status: "COMPLETED",
          },
        });

        const percent =
          totalActivities > 0
            ? Math.round((completedCount / totalActivities) * 100)
            : 0;
        progressMap[journey.id] = {
          percent,
          completed: prog.status === "COMPLETED",
        };
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-teal-50/20 text-right dir-rtl">
      {/* Client-side Session Initializer */}
      <SessionInitializer />

      {/* Header */}
      <header className="border-b border-teal-100 bg-white py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
            م
          </div>
          <span className="text-2xl font-black text-teal-800">
            مغامرات العربية
          </span>
        </div>
        <div className="text-xs md:text-sm bg-teal-50 border border-teal-100 text-teal-700 font-bold px-4 py-2 rounded-full">
          بوابة البطل الصغير 🚀
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-20 max-w-5xl mx-auto">
        <span className="text-amber-600 font-extrabold text-sm md:text-base mb-3 tracking-wide uppercase">
          مرحباً بك يا بطل في عالم المعرفة والاستكشاف
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-teal-900 leading-tight mb-6">
          مغامرات مشوّقة لتعلم <br className="hidden md:inline" />
          <span className="text-amber-500">اللغة العربية</span> بذكاء وأمان!
        </h1>
        <p className="text-base md:text-lg text-teal-900/80 mb-10 max-w-2xl leading-relaxed">
          انضم إلينا في رحلة تفاعلية رائعة مصممة خصيصاً لمساعدتك على استكشاف
          وفهم لغة الضاد الجميلة من خلال قصص ممتعة ومقاطع صوتية وتحديات شيقة.
        </p>

        {/* Journey Previews */}
        <div className="w-full mt-6">
          <h2 className="text-xl md:text-2xl font-black text-teal-800 mb-8 border-r-4 border-amber-500 pr-3 text-right">
            اختر مغامرتك التعليمية لتبدأ الرحلة:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {journeys.map((journey) => {
              const progress = progressMap[journey.id] || {
                percent: 0,
                completed: false,
              };

              let tagColor = "bg-teal-50 text-teal-700 border-teal-100";
              if (journey.themeKey === "humanity") {
                tagColor = "bg-amber-50 text-amber-700 border-amber-100";
              } else if (journey.themeKey === "safety") {
                tagColor = "bg-rose-50 text-rose-700 border-rose-100";
              }

              return (
                <div
                  key={journey.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-teal-100/60 text-right flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span
                        className={`inline-block border text-xs font-bold px-3 py-1 rounded-full ${tagColor}`}
                      >
                        {journey.themeKey === "ancient-egypt"
                          ? "حضارة وتاريخ"
                          : journey.themeKey === "humanity"
                            ? "إنسانية وعطاء"
                            : "أمان وحماية"}
                      </span>
                      <span className="bg-teal-50/55 border border-teal-100/50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {journey.estimatedMinutes} دقيقة ⏱️
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-teal-900 mb-3">
                      {journey.title}
                    </h3>
                    <p className="text-xs md:text-sm text-teal-950/70 leading-relaxed mb-6">
                      {journey.shortDescription}
                    </p>
                  </div>

                  {/* Progress & Link */}
                  <div className="border-t border-teal-50 pt-5 mt-4 flex flex-col gap-4">
                    {/* Progress Indicator */}
                    <div className="w-full text-right">
                      <div className="flex justify-between items-center text-xs font-bold text-teal-800 mb-1.5">
                        <span>تقدم المغامرة:</span>
                        <span>{progress.percent}%</span>
                      </div>
                      <div className="w-full bg-teal-100/30 rounded-full h-2 overflow-hidden border border-teal-50">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/journeys/${journey.slug}`}
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm md:text-base rounded-2xl shadow-sm text-center transition-all duration-200 hover:shadow active:scale-95 touch-target block"
                    >
                      {progress.percent > 0
                        ? progress.completed
                          ? "مكتملة! العب مجدداً 🌟"
                          : "تابع المغامرة 🚀"
                        : "ابدأ المغامرة الآن 🚀"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-teal-100 py-6 text-center text-xs text-teal-800/60 mt-auto shadow-inner">
        <p>© {new Date().getFullYear()} مغامرات العربية. رحلات الطالب البطل.</p>
      </footer>
    </div>
  );
}
