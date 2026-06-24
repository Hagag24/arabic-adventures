import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-teal-light bg-white py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-teal-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
            م
          </div>
          <span className="text-2xl font-extrabold text-teal-primary">
            مغامرات العربية
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/teacher"
            className="text-teal-primary hover:text-teal-800 font-medium transition-colors"
          >
            بوابة المعلم
          </Link>
          <Link
            href="/admin"
            className="text-teal-primary hover:text-teal-800 font-medium transition-colors"
          >
            لوحة الإدارة
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-24 max-w-4xl mx-auto">
        <span className="text-gold-accent font-bold text-lg mb-3 tracking-wide uppercase">
          مرحباً بكم في عالم الاستكشاف
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-teal-primary leading-tight mb-6">
          مغامرات مشوّقة لتعلم <br className="hidden md:inline" />
          <span className="text-gold-accent">اللغة العربية</span> بذكاء ومتعة!
        </h1>
        <p className="text-lg md:text-xl text-teal-900/80 mb-10 max-w-2xl leading-relaxed">
          انضم إلينا في رحلة تفاعلية فريدة وممتعة مصممة خصيصاً لمساعدة طفلك على
          استكشاف وفهم لغة الضاد من خلال قصص حية وتحديات تعليمية مرحة.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/student/journeys"
            className="px-8 py-4 bg-teal-primary text-white font-bold text-lg rounded-2xl shadow-md hover:bg-teal-900 transition-transform active:scale-95 touch-target flex items-center justify-center"
          >
            ابدأ المغامرة الآن
          </Link>
          <Link
            href="/student"
            className="px-8 py-4 bg-white border-2 border-teal-primary text-teal-primary font-bold text-lg rounded-2xl hover:bg-teal-light transition-transform active:scale-95 touch-target flex items-center justify-center"
          >
            بوابة الطالب
          </Link>
        </div>

        {/* Journey Previews */}
        <div className="w-full">
          <h2 className="text-2xl md:text-3xl font-extrabold text-teal-primary mb-8 text-right border-r-4 border-gold-accent pr-4">
            استكشف رحلاتنا التعليمية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Journey 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-light text-right flex flex-col justify-between">
              <div>
                <span className="inline-block bg-teal-light text-teal-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                  حضارة وتاريخ
                </span>
                <h3 className="text-xl font-bold text-teal-primary mb-3">
                  أسرار المعلم المصري القديم
                </h3>
                <p className="text-sm text-teal-900/70 leading-relaxed mb-6">
                  اكتشف أسرار الكتابة والتعليم في مصر القديمة ودور المعلم في نقل
                  المعرفة عبر الأجيال.
                </p>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-teal-primary">
                <span>وسام: مستكشف الحضارة</span>
                <span className="bg-gold-light text-gold-accent px-2 py-1 rounded">
                  ٤٥ دقيقة
                </span>
              </div>
            </div>

            {/* Journey 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-light text-right flex flex-col justify-between">
              <div>
                <span className="inline-block bg-gold-light text-gold-accent text-xs font-bold px-3 py-1 rounded-full mb-4">
                  إنسانية وعطاء
                </span>
                <h3 className="text-xl font-bold text-teal-primary mb-3">
                  ملك القلوب
                </h3>
                <p className="text-sm text-teal-900/70 leading-relaxed mb-6">
                  رحلة ملهمة حول قيم العطاء والمواطنة الإيجابية وصناعة الأمل
                  لمجتمع أفضل.
                </p>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-teal-primary">
                <span>وسام: صانع الأمل</span>
                <span className="bg-gold-light text-gold-accent px-2 py-1 rounded">
                  ٣٠ دقيقة
                </span>
              </div>
            </div>

            {/* Journey 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-light text-right flex flex-col justify-between">
              <div>
                <span className="inline-block bg-teal-light text-teal-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                  أمان وحماية
                </span>
                <h3 className="text-xl font-bold text-teal-primary mb-3">
                  جسدي أمانة
                </h3>
                <p className="text-sm text-teal-900/70 leading-relaxed mb-6">
                  تعلم كيفية فهم حدود الأمان الشخصي وحماية الجسد بطرق واضحة
                  ومبسطة.
                </p>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-teal-primary">
                <span>وسام: بطل الأمان</span>
                <span className="bg-gold-light text-gold-accent px-2 py-1 rounded">
                  ٤٠ دقيقة
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-teal-light py-8 px-6 text-center text-sm text-teal-900/60 mt-auto">
        <p>© {new Date().getFullYear()} مغامرات العربية. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
