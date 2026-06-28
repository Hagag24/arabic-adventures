export type GlobalAudioVisualState =
  | "initializing"
  | "no_assets"
  | "unlock_required"
  | "ready"
  | "buffering"
  | "playing_instruction"
  | "playing_prompt"
  | "playing_option"
  | "playing_correct_feedback"
  | "playing_retry_feedback"
  | "playing_completion"
  | "switching"
  | "paused"
  | "muted"
  | "dictation_active"
  | "recoverable_error";

export type AudioButtonIcon =
  | "speaker"
  | "speakerMuted"
  | "play"
  | "pause"
  | "spinner"
  | "equalizer"
  | "microphone"
  | "check"
  | "retry"
  | "warning";

export type AudioButtonVisual = {
  label: string;
  shortLabel: string;
  ariaLabel: string;
  icon: AudioButtonIcon;
  animation: "none" | "spin" | "equalizer" | "pulseOnce" | "softGlow";
  disabled: boolean;
  dataState: GlobalAudioVisualState;
  classes: {
    container: string;
    icon: string;
    statusDot: string;
    ring: string;
  };
};

export const audioVisualStateMap: Record<
  GlobalAudioVisualState,
  AudioButtonVisual
> = {
  initializing: {
    label: "جاري تجهيز الصوت",
    shortLabel: "تجهيز",
    ariaLabel: "جاري تجهيز نظام الصوت.",
    icon: "spinner",
    animation: "spin",
    disabled: true,
    dataState: "initializing",
    classes: {
      container: "bg-slate-100 text-slate-400 border-slate-200 cursor-wait",
      icon: "text-slate-400",
      statusDot: "bg-slate-300",
      ring: "focus:ring-slate-300/50",
    },
  },
  no_assets: {
    label: "الصوت غير جاهز حاليًا",
    shortLabel: "غير جاهز",
    ariaLabel: "الصوت غير جاهز حاليًا.",
    icon: "warning",
    animation: "none",
    disabled: true,
    dataState: "no_assets",
    classes: {
      container:
        "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed",
      icon: "text-slate-400",
      statusDot: "hidden",
      ring: "focus:ring-slate-200/50",
    },
  },
  unlock_required: {
    label: "تشغيل الصوت",
    shortLabel: "تفعيل",
    ariaLabel: "اضغط لتفعيل الصوت في هذا المتصفح.",
    icon: "play",
    animation: "pulseOnce",
    disabled: false,
    dataState: "unlock_required",
    classes: {
      container:
        "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-red-500 animate-ping",
      ring: "focus:ring-amber-400/50",
    },
  },
  ready: {
    label: "الصوت يعمل",
    shortLabel: "جاهز",
    ariaLabel: "الصوت يعمل حاليًا.",
    icon: "speaker",
    animation: "none",
    disabled: false,
    dataState: "ready",
    classes: {
      container:
        "bg-teal-600 hover:bg-teal-700 text-white border-teal-700 shadow-sm active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-emerald-400",
      ring: "focus:ring-teal-500/50",
    },
  },
  buffering: {
    label: "جارٍ تحميل الصوت...",
    shortLabel: "تحميل",
    ariaLabel: "جارٍ تحميل الملف الصوتي.",
    icon: "spinner",
    animation: "spin",
    disabled: false,
    dataState: "buffering",
    classes: {
      container:
        "bg-cyan-600 text-white border-cyan-700 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-cyan-300",
      ring: "focus:ring-cyan-500/50",
    },
  },
  playing_instruction: {
    label: "يقرأ التعليمات",
    shortLabel: "تعليمات",
    ariaLabel: "يقرأ تعليمات النشاط حاليًا.",
    icon: "equalizer",
    animation: "equalizer",
    disabled: false,
    dataState: "playing_instruction",
    classes: {
      container:
        "bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-teal-700 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-cyan-300",
      ring: "focus:ring-teal-500/50",
    },
  },
  playing_prompt: {
    label: "يقرأ السؤال",
    shortLabel: "سؤال",
    ariaLabel: "يقرأ السؤال حاليًا.",
    icon: "equalizer",
    animation: "equalizer",
    disabled: false,
    dataState: "playing_prompt",
    classes: {
      container:
        "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-emerald-700 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-emerald-300",
      ring: "focus:ring-emerald-500/50",
    },
  },
  playing_option: {
    label: "يقرأ الاختيار",
    shortLabel: "اختيار",
    ariaLabel: "يقرأ اختيار الإجابة حاليًا.",
    icon: "equalizer",
    animation: "equalizer",
    disabled: false,
    dataState: "playing_option",
    classes: {
      container:
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-indigo-700 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-blue-300",
      ring: "focus:ring-indigo-500/50",
    },
  },
  playing_correct_feedback: {
    label: "أحسنت!",
    shortLabel: "أحسنت",
    ariaLabel: "الرد صحيح! أحسنت.",
    icon: "check",
    animation: "softGlow",
    disabled: false,
    dataState: "playing_correct_feedback",
    classes: {
      container:
        "bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-emerald-300",
      ring: "focus:ring-emerald-500/50",
    },
  },
  playing_retry_feedback: {
    label: "جرّب مرة أخرى",
    shortLabel: "أعد",
    ariaLabel: "حاول مجدداً. جرّب مرة أخرى.",
    icon: "retry",
    animation: "pulseOnce",
    disabled: false,
    dataState: "playing_retry_feedback",
    classes: {
      container:
        "bg-amber-500 text-white border-amber-600 shadow-sm active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-amber-300",
      ring: "focus:ring-amber-500/50",
    },
  },
  playing_completion: {
    label: "تم النشاط بنجاح",
    shortLabel: "مكتمل",
    ariaLabel: "اكتمل النشاط بنجاح.",
    icon: "check",
    animation: "softGlow",
    disabled: false,
    dataState: "playing_completion",
    classes: {
      container:
        "bg-gradient-to-r from-violet-600 to-emerald-600 text-white border-emerald-700 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-violet-300",
      ring: "focus:ring-emerald-500/50",
    },
  },
  switching: {
    label: "يبدّل المقطع...",
    shortLabel: "تبديل",
    ariaLabel: "يبدّل المقطع الصوتي.",
    icon: "spinner",
    animation: "spin",
    disabled: false,
    dataState: "switching",
    classes: {
      container:
        "bg-indigo-600 text-white border-indigo-700 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-indigo-300",
      ring: "focus:ring-indigo-500/50",
    },
  },
  paused: {
    label: "الصوت متوقف مؤقتًا",
    shortLabel: "مؤقت",
    ariaLabel: "تم إيقاف تشغيل الصوت مؤقتًا.",
    icon: "pause",
    animation: "none",
    disabled: false,
    dataState: "paused",
    classes: {
      container:
        "bg-indigo-500 text-white border-indigo-600 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-indigo-300",
      ring: "focus:ring-indigo-400/50",
    },
  },
  muted: {
    label: "تشغيل الصوت",
    shortLabel: "مكتوم",
    ariaLabel: "الصوت مكتوم حاليًا.",
    icon: "speakerMuted",
    animation: "none",
    disabled: false,
    dataState: "muted",
    classes: {
      container:
        "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 active:scale-95 cursor-pointer",
      icon: "text-slate-500",
      statusDot: "bg-rose-500",
      ring: "focus:ring-rose-500/50 border-rose-300 ring-1",
    },
  },
  dictation_active: {
    label: "الإملاء الصوتي يعمل",
    shortLabel: "🎙 إملاء",
    ariaLabel: "ميكروفون الإملاء الصوتي نشط حاليًا.",
    icon: "microphone",
    animation: "softGlow",
    disabled: false,
    dataState: "dictation_active",
    classes: {
      container:
        "bg-violet-600 hover:bg-violet-700 text-white border-violet-700 shadow-sm shadow-violet-500/20 active:scale-95 cursor-pointer",
      icon: "text-white animate-pulse",
      statusDot: "bg-red-600",
      ring: "focus:ring-violet-500/50",
    },
  },
  recoverable_error: {
    label: "تعذر تشغيل الصوت",
    shortLabel: "خطأ",
    ariaLabel: "تعذر تشغيل المقطع الصوتي. انقر للمحاولة مرة أخرى.",
    icon: "warning",
    animation: "none",
    disabled: false,
    dataState: "recoverable_error",
    classes: {
      container:
        "bg-rose-600 text-white border-rose-700 active:scale-95 cursor-pointer",
      icon: "text-white",
      statusDot: "bg-rose-300",
      ring: "focus:ring-rose-500/50",
    },
  },
};

export type AudioRuntimeFacts = {
  initialized: boolean;
  hasApprovedAssets: boolean;
  enabled: boolean;
  unlocked: boolean;
  playbackStatus:
    | "idle"
    | "buffering"
    | "playing"
    | "paused"
    | "switching"
    | "error";
  activePurpose:
    | "instruction"
    | "prompt"
    | "option"
    | "correct_feedback"
    | "retry_feedback"
    | "completion"
    | null;
  dictationActive: boolean;
};

export function selectGlobalAudioVisualState(
  facts: AudioRuntimeFacts,
): GlobalAudioVisualState {
  if (!facts.initialized) {
    return "initializing";
  }
  if (!facts.hasApprovedAssets) {
    return "no_assets";
  }
  if (facts.dictationActive) {
    return "dictation_active";
  }
  if (!facts.unlocked) {
    return "unlock_required";
  }
  if (!facts.enabled) {
    return "muted";
  }

  // Playback state derivations
  if (facts.playbackStatus === "switching") {
    return "switching";
  }
  if (facts.playbackStatus === "buffering") {
    return "buffering";
  }
  if (facts.playbackStatus === "paused") {
    return "paused";
  }
  if (facts.playbackStatus === "error") {
    return "recoverable_error";
  }
  if (facts.playbackStatus === "playing" && facts.activePurpose) {
    switch (facts.activePurpose) {
      case "instruction":
        return "playing_instruction";
      case "prompt":
        return "playing_prompt";
      case "option":
        return "playing_option";
      case "correct_feedback":
        return "playing_correct_feedback";
      case "retry_feedback":
        return "playing_retry_feedback";
      case "completion":
        return "playing_completion";
    }
  }

  return "ready";
}
