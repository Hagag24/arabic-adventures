import type { Metadata } from "next";
import "./globals.css";
import { AudioProvider } from "@/audio/runtime/AudioProvider";

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
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
