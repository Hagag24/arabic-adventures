import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background justify-center items-center text-center px-6">
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-teal-light shadow-sm max-w-md w-full">
        <span className="text-6xl mb-4 block">🔍</span>
        <h1 className="text-2xl font-black text-teal-primary mb-3">
          لم نتمكن من العثور على هذه الصفحة
        </h1>
        <p className="text-teal-900/70 text-sm leading-relaxed mb-8">
          قد تكون الصفحة غير متاحة أو تم تغيير رابطها. الرجاء التحقق من الرابط
          أو الانتقال لصفحة رئيسية آمنة.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-teal-primary text-white font-bold rounded-xl shadow hover:bg-teal-900 transition-colors text-sm touch-target flex items-center justify-center"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
