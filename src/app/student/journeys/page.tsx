import Link from "next/link";
import { connection } from "next/server";
import { fetchPublishedJourneys } from "@/server/services/journey-service";

export default async function StudentJourneysPage() {
  // Ensure the page is requested at request-time (dynamic rendering)
  await connection();

  const journeys = await fetchPublishedJourneys();

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
            رحلات التعلم
          </span>
        </div>
        <Link
          href="/student"
          className="text-teal-900/60 hover:text-teal-primary text-sm font-medium"
        >
          بوابة الطالب
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 text-right">
        <h1 className="text-3xl font-black text-teal-primary mb-2">
          رحلاتك التعليمية المتاحة 🗺️
        </h1>
        <p className="text-teal-900/70 mb-10 text-lg leading-relaxed">
          اختر إحدى الرحلات المشوقة لتبدأ التعلم وجمع النقاط وتحدي ذاتك!
        </p>

        {journeys.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-teal-light shadow-sm">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-lg text-teal-900/75 font-semibold">
              لا توجد رحلات تعليمية منشورة حالياً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {journeys.map((journey) => (
              <div
                key={journey.slug}
                className="bg-white rounded-3xl border border-teal-light shadow-sm hover:shadow-md hover:border-teal-primary/30 p-8 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-teal-light text-teal-primary text-xs font-bold px-3 py-1 rounded-full">
                      {journey.themeKey === "ancient-egypt"
                        ? "حضارة وتاريخ"
                        : journey.themeKey === "safety"
                          ? "أمان وحماية"
                          : "عطاء ومواطنة"}
                    </span>
                    <span className="text-xs bg-gold-light text-gold-accent font-bold px-2 py-1 rounded">
                      {journey.estimatedMinutes} دقيقة
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-teal-primary mb-3">
                    {journey.title}
                  </h2>
                  <p className="text-sm text-teal-900/70 leading-relaxed mb-6">
                    {journey.shortDescription}
                  </p>
                </div>

                <div className="border-t border-teal-light/50 pt-6 mt-6 flex justify-between items-center">
                  <div className="text-right">
                    <span className="block text-[11px] text-teal-900/50">
                      الوسام المكتسب:
                    </span>
                    <span className="text-sm font-bold text-gold-accent">
                      {journey.achievementTitle}
                    </span>
                  </div>
                  <Link
                    href={`/student/journeys/${journey.slug}`}
                    className="px-5 py-2.5 bg-teal-primary text-white font-bold rounded-xl shadow hover:bg-teal-900 transition-colors text-sm touch-target flex items-center justify-center"
                  >
                    ابدأ المغامرة
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-teal-light py-6 text-center text-xs text-teal-900/60 mt-auto">
        <p>© {new Date().getFullYear()} مغامرات العربية. رحلات الطالب.</p>
      </footer>
    </div>
  );
}
