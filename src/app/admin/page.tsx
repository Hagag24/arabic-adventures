import Link from "next/link";

export default function AdminPage() {
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
          <span className="text-sm bg-gold-light text-gold-accent px-3 py-1 rounded-full font-bold">
            لوحة الإدارة
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
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 flex flex-col justify-center text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-teal-light shadow-sm">
          <span className="text-4xl mb-4 block">⚙️</span>
          <h1 className="text-3xl font-black text-teal-primary mb-4">
            لوحة الإدارة قريباً!
          </h1>
          <p className="text-lg text-teal-900/80 mb-8 leading-relaxed">
            ستوفر لوحة الإدارة قريباً كافة الصلاحيات اللازمة للتحكم في المنصة
            وتكوين الإعدادات وإدارة قواعد البيانات بشكل كامل وآمن.
          </p>
          <Link
            href="/"
            className="px-8 py-3 bg-teal-primary text-white font-bold rounded-2xl shadow-md hover:bg-teal-900 transition-all touch-target inline-flex items-center justify-center"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-teal-light py-6 text-center text-xs text-teal-900/60 mt-auto">
        <p>© {new Date().getFullYear()} مغامرات العربية. لوحة الإدارة.</p>
      </footer>
    </div>
  );
}
