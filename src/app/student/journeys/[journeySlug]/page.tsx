import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { fetchJourneyBySlug } from "@/server/services/journey-service";

interface Params {
  journeySlug: string;
}

export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  // Ensure dynamic rendering
  await connection();

  const { journeySlug } = await params;
  const journey = await fetchJourneyBySlug(journeySlug);

  if (!journey) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-teal-light bg-white py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl font-extrabold text-teal-primary hover:opacity-90"
          >
            مغامرات العربية
          </Link>
          <span className="text-sm bg-teal-light text-teal-primary px-3 py-1 rounded-full font-bold">
            تفاصيل المغامرة
          </span>
        </div>
        <Link
          href="/student/journeys"
          className="text-teal-900/60 hover:text-teal-primary text-sm font-medium"
        >
          العودة للرحلات
        </Link>
      </header>

      {/* Hero Section */}
      <div className="bg-white border-b border-teal-light py-10 text-right">
        <div className="max-w-4xl w-full mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-teal-light text-teal-primary text-xs font-bold px-3 py-1 rounded-full">
              {journey.themeKey === "ancient-egypt"
                ? "حضارة وتاريخ"
                : journey.themeKey === "safety"
                  ? "أمان وحماية"
                  : "عطاء ومواطنة"}
            </span>
            <span className="text-xs bg-gold-light text-gold-accent font-bold px-2 py-1 rounded">
              {journey.estimatedMinutes} دقيقة للإنهاء
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-teal-primary mb-3">
            {journey.title}
          </h1>
          <p className="text-teal-900/75 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
            {journey.shortDescription}
          </p>
          <div className="inline-flex items-center gap-2 bg-gold-light text-gold-accent px-4 py-2 rounded-xl border border-gold-light/80 text-sm font-bold">
            🏆 الوسام المكتسب عند الإتمام: {journey.achievementTitle}
          </div>
        </div>
      </div>

      {/* Stages Section */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 text-right">
        <h2 className="text-2xl font-extrabold text-teal-primary mb-6 pr-3 border-r-4 border-gold-accent">
          خريطة المراحل التعليمية ({journey.stages.length})
        </h2>

        <div className="relative border-r-2 border-teal-light/75 mr-4 pl-4 space-y-8 py-4">
          {journey.stages.map((stage, index) => (
            <div key={stage.slug} className="relative pr-8">
              {/* Timeline Indicator Dot */}
              <div className="absolute right-[-10px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-teal-primary shadow-sm" />

              <div className="bg-white p-6 rounded-2xl border border-teal-light shadow-sm max-w-2xl hover:border-teal-primary/20 transition-all">
                <span className="text-xs text-gold-accent font-bold mb-1 block">
                  المرحلة {index + 1}
                </span>
                <h3 className="text-lg font-bold text-teal-primary mb-2">
                  {stage.title}
                </h3>
                <p className="text-sm text-teal-900/70 leading-relaxed mb-4">
                  {stage.shortDescription}
                </p>
                <button
                  disabled
                  className="px-4 py-2 bg-teal-light/50 text-teal-primary/60 font-bold rounded-lg text-xs cursor-not-allowed"
                >
                  المحتوى مغلق حالياً 🔒
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-6 mt-12 text-right text-sm">
          ⚠️ **تنبيه**: الأنشطة والتفاعلات الحية لهذه المراحل سيتم تفعيلها في
          المراحل القادمة المعتمدة للمشروع.
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-teal-light py-6 text-center text-xs text-teal-900/60 mt-auto">
        <p>© {new Date().getFullYear()} مغامرات العربية. تفاصيل المغامرة.</p>
      </footer>
    </div>
  );
}
