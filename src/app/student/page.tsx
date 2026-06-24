import Link from "next/link";

export default function StudentDashboardPage() {
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
            بوابة الطالب
          </span>
        </div>
        <Link
          href="/"
          className="text-teal-900/60 hover:text-teal-primary text-sm font-medium"
        >
          العودة للرئيسية
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 text-right">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-teal-light shadow-sm mb-8">
          <h1 className="text-3xl font-black text-teal-primary mb-4">
            أهلاً بك يا بطل في مغامرات العربية! 👋
          </h1>
          <p className="text-lg text-teal-900/80 mb-8 leading-relaxed">
            مستعد لرحلة جديدة مليئة بالمتعة والتعلم؟ اختر إحدى الرحلات التعليمية
            لتبدأ مغامرتك الشيقة وتكتسب أوسمة جديدة!
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/student/journeys"
              className="px-8 py-4 bg-teal-primary text-white font-bold text-lg rounded-2xl shadow-md hover:bg-teal-900 transition-all touch-target flex items-center justify-center"
            >
              عرض الرحلات المتاحة 🚀
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-teal-light/40 p-6 rounded-2xl border border-teal-light/60">
            <h2 className="text-xl font-bold text-teal-primary mb-3">
              كيف أبدأ؟
            </h2>
            <p className="text-sm text-teal-900/85 leading-relaxed">
              الأمر بسيط جداً! اضغط على زر «عرض الرحلات المتاحة»، واختر رحلة
              تعليمية تثير اهتمامك، ثم تصفح مراحل الرحلة واحدة تلو الأخرى
              واستمتع بالتعلم.
            </p>
          </div>
          <div className="bg-gold-light/40 p-6 rounded-2xl border border-gold-light/60">
            <h2 className="text-xl font-bold text-teal-primary mb-3">
              الأوسمة والإنجازات
            </h2>
            <p className="text-sm text-teal-900/85 leading-relaxed">
              عند إتمامك لأي رحلة تعليمية بنجاح، ستحصل على لقب فريد ووسام خاص
              يثبت تفوقك وإنجازك الرائع.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-teal-light py-6 text-center text-xs text-teal-900/60 mt-auto">
        <p>© {new Date().getFullYear()} مغامرات العربية. بوابة الطالب.</p>
      </footer>
    </div>
  );
}
