"use client";

import React from "react";
import Link from "next/link";
import GlobalAudioToggle from "@/audio/runtime/GlobalAudioToggle";

interface PublicHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  backLabel?: string;
  themeKey?: string; // "teal" | "amber" | "white" | "ancient-egypt" | "humanity"
  currentActivity?: number;
  totalActivities?: number;
}

export default function PublicHeader({
  title,
  subtitle,
  backUrl,
  backLabel,
  themeKey = "white",
  currentActivity,
  totalActivities,
}: PublicHeaderProps) {
  // Determine header bg and text colors based on themeKey
  let headerClass =
    "bg-white border-b border-slate-100 text-slate-800 shadow-sm";
  let backBtnClass = "bg-slate-100 hover:bg-slate-200 text-slate-700";
  let labelClass = "text-teal-600";
  let roadmapLinkClass =
    "text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/60";

  if (themeKey === "ancient-egypt" || themeKey === "teal") {
    headerClass = "bg-teal-600 text-white shadow-md";
    backBtnClass = "bg-white/20 hover:bg-white/30 text-white";
    labelClass = "text-teal-100";
    roadmapLinkClass = "bg-white/10 hover:bg-white/25 text-white";
  } else if (themeKey === "humanity" || themeKey === "amber") {
    headerClass = "bg-amber-600 text-white shadow-md";
    backBtnClass = "bg-white/20 hover:bg-white/30 text-white";
    labelClass = "text-amber-100";
    roadmapLinkClass = "bg-white/10 hover:bg-white/25 text-white";
  }

  const progressPercentage =
    currentActivity && totalActivities
      ? (currentActivity / totalActivities) * 100
      : 0;

  return (
    <header
      className={`py-4 px-6 lg:px-10 sticky top-0 z-50 transition-colors duration-300 ${headerClass}`}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Right side: branding / title / back button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {backUrl ? (
            <Link
              href={backUrl}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-sm md:text-base transition-all shadow-sm shrink-0 touch-target ${backBtnClass}`}
              title={backLabel || "رجوع"}
            >
              ➔
            </Link>
          ) : (
            // Platform Logo icon when on root landing
            !backUrl &&
            title === "مغامرات العربية" && (
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0 select-none">
                م
              </div>
            )
          )}

          <div className="text-right">
            {subtitle && (
              <span
                className={`text-[10px] md:text-xs font-bold tracking-wider uppercase block mb-0.5 ${labelClass}`}
              >
                {subtitle}
              </span>
            )}
            {title === "مغامرات العربية" ? (
              <span className="text-sm md:text-base lg:text-lg font-black leading-tight select-none block">
                {title}
              </span>
            ) : (
              <h1 className="text-sm md:text-base lg:text-lg font-black leading-tight select-none">
                {title}
              </h1>
            )}
          </div>
        </div>

        {/* Left side: toggle & action items */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0">
          {currentActivity && totalActivities && (
            <div className="text-right ml-2 sm:ml-4 select-none">
              <span className="text-[10px] md:text-xs text-slate-400 block">
                النشاط الحالي
              </span>
              <span className="text-xs md:text-sm font-bold">
                {currentActivity} من {totalActivities}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <GlobalAudioToggle />

            {/* If on roadmap or activity page, we can render the custom roadmap action badge next to toggle */}
            {backUrl && backLabel === "العودة للدرس" && (
              <Link
                href={backUrl}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all shrink-0 touch-target ${roadmapLinkClass}`}
              >
                خريطة الدرس 🗺️
              </Link>
            )}

            {title === "مغامرات العربية" && !backUrl && (
              <div className="text-xs md:text-sm bg-teal-50 border border-teal-100 text-teal-700 font-bold px-4 py-2 rounded-full select-none">
                بوابة البطل الصغير 🚀
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar (Activity pages only) */}
      {currentActivity && totalActivities && (
        <div className="max-w-4xl mx-auto mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </header>
  );
}
