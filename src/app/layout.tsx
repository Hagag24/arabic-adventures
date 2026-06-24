import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-noto-arabic",
});

export const metadata: Metadata = {
  title: "مغامرات العربية — رحلتك الممتعة لتعلم لغة الضاد",
  description:
    "منصة تعليمية تفاعلية تقدم مغامرات مشوقة وقصصًا ممتعة لمساعدة الأطفال على استكشاف وفهم اللغة العربية بذكاء ومتعة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${notoArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
