import React from "react";

export default async function LandingPage() {
  // Static demo data for Vercel deployment
  const journeys = [
    {
      id: "1",
      slug: "ancient-egyptian-teacher",
      title: "المعلم المصري القديم",
      shortDescription: "انضم إلى رحلة عبر الزمن لاستكشاف حضارة مصر القديمة وتعلم أسرار الكتابة الهيروغليفية.",
      themeKey: "ancient-egypt",
      estimatedMinutes: 25,
    },
    {
      id: "2", 
      slug: "magdi-yacoub",
      title: "الدكتور مجدي يعقوب",
      shortDescription: "تعرف على قصة الدكتور مجدي يعقوب وإنجازاته في مجال جراحة القلب.",
      themeKey: "humanity",
      estimatedMinutes: 20,
    },
  ];

  const progressMap: Record<string, { percent: number; completed: boolean }> = {};

  return (
    <div className="flex flex-col min-h-screen bg-teal-50/20 text-right dir-rtl">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4">
          <h1 className="text-2xl font-bold text-teal-900">مغامرات العربية</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 flex flex-col items-center">
        {/* Hero Section */}
        <div className="w-full flex flex-col items-center text-center pt-10 pb-6 md:pt-14 md:pb-10">
          <span className="text-amber-600 font-extrabold text-sm md:text-base mb-3 tracking-wide uppercase max-w-[850px] block">
            مرحباً بك يا بطل في عالم المعرفة والاستكشاف
          </span>
          <h1
            className="font-black text-teal-900 leading-tight mb-6 max-w-[1100px]"
            style={{
              fontSize: "clamp(3.2rem, 5.3vw, 5.5rem)",
              lineHeight: 1.05,
            }}
          >
            مغامرات مشوّقة لتعلم <br className="hidden md:inline" />
            <span className="text-amber-500">اللغة العربية</span> بذكاء وأمان!
          </h1>
          <p className="text-base md:text-lg text-teal-900/80 mb-6 max-w-[900px] leading-relaxed">
            انضم إلينا في رحلة تفاعلية رائعة مصممة خصيصاً لمساعدتك على استكشاف
            وفهم لغة الضاد الجميلة من خلال قصص ممتعة ومقاطع صوتية وتحديات شيقة.
          </p>
          <div className="mt-4 text-sm text-teal-600">
            🎯 استمتع بتجربة تعليمية تفاعلية
          </div>
        </div>

        {/* Journey Previews */}
        <div className="w-full mt-10 md:mt-12">
          <h2 className="text-xl md:text-2xl font-black text-teal-800 mb-6 md:mb-8 border-r-4 border-amber-500 pr-3 text-right">
            اختر مغامرتك التعليمية لتبدأ الرحلة:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {journeys.map((journey) => {
              const progress = progressMap[journey.id] || {
                percent: 0,
                completed: false,
              };

              let tagColor = "bg-teal-50 text-teal-700 border-teal-100";
              if (journey.themeKey === "humanity") {
                tagColor = "bg-amber-50 text-amber-700 border-amber-100";
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
                          : "إنسانية وعطاء"}
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
                        <span>تقدم الدرس:</span>
                        <span>{progress.percent}%</span>
                      </div>
                      <div className="w-full bg-teal-100/30 rounded-full h-2 overflow-hidden border border-teal-50">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm md:text-base rounded-2xl shadow-sm text-center transition-all duration-200 hover:shadow active:scale-95 touch-target block cursor-pointer"
                    >
                      {progress.percent > 0
                        ? progress.completed
                          ? "مكتمل! العب مجدداً 🌟"
                          : "تابع الدرس 🚀"
                        : "ابدأ الدرس الآن 🚀"}
                    </div>
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
