import crypto from "crypto";

export type AuditionPhrase = {
  semanticKey: string;
  category: string;
  displayText: string;
  spokenText: string;
  spokenTextHash: string;
};

export const AUDITION_PHRASES: AuditionPhrase[] = [
  {
    semanticKey: "global.feedback.correct.01",
    category: "feedback",
    displayText: "أحسنت يا بطل، إجابتك صحيحة!",
    spokenText: "أَحْسَنْت يا بَطَل، إِجابَتُك صَحيحَة!",
    spokenTextHash: sha256String("أَحْسَنْت يا بَطَل، إِجابَتُك صَحيحَة!"),
  },
  {
    semanticKey: "global.feedback.retry.01",
    category: "feedback",
    displayText: "ولا يهمّك، فكّر شوية وجرّب تاني.",
    spokenText: "وَلا يِهِمَّك، فَكِّر شُوَيَّة وَجَرِّب تاني.",
    spokenTextHash: sha256String(
      "وَلا يِهِمَّك، فَكِّر شُوَيَّة وَجَرِّب تاني.",
    ),
  },
  {
    semanticKey: "global.feedback.completion.01",
    category: "feedback",
    displayText: "برافو يا بطل! خلّصت النشاط بنجاح.",
    spokenText: "بَرافو يا بَطَل! خَلَّصْت النَّشاط بِنَجاح.",
    spokenTextHash: sha256String("بَرافو يا بَطَل! خَلَّصْت النَّشاط بِنَجاح."),
  },
  {
    semanticKey: "global.welcome.01",
    category: "educational",
    displayText: "مرحبًا يا بطل! جاهز لنبدأ مغامرة جديدة في اللغة العربية؟",
    spokenText:
      "مَرْحَبًا يا بَطَل! جَاهِزٌ لِنَبْدَأَ مُغامَرَةً جَديدَةً فِي اللُّغَةِ العَرَبِيَّةِ؟",
    spokenTextHash: sha256String(
      "مَرْحَبًا يا بَطَل! جَاهِزٌ لِنَبْدَأَ مُغامَرَةً جَديدَةً فِي اللُّغَةِ العَرَبِيَّةِ؟",
    ),
  },
  {
    semanticKey: "audition.prompt.main-idea",
    category: "educational",
    displayText: "ما الفكرة الرئيسة لهذا الخبر؟",
    spokenText: "مَا الْفِكْرَةُ الرَّئِيسَةُ لِهَذَا الْخَبَرِ؟",
    spokenTextHash: sha256String(
      "مَا الْفِكْرَةُ الرَّئِيسَةُ لِهَذَا الْخَبَرِ؟",
    ),
  },
  {
    semanticKey: "audition.pronunciation.magdi-yacoub",
    category: "educational",
    displayText: "عاد الدكتور مجدي يعقوب إلى مصر في عام 2009.",
    spokenText:
      "عادَ الدُّكْتورُ مَجْدي يَعْقوبَ إِلى مِصْرَ في عامِ أَلْفَيْنِ وَتِسْعَةٍ.",
    spokenTextHash: sha256String(
      "عادَ الدُّكْتورُ مَجْدي يَعْقوبَ إِلى مِصْرَ في عامِ أَلْفَيْنِ وَتِسْعَةٍ.",
    ),
  },
  {
    semanticKey: "audition.pronunciation.upper-egypt",
    category: "educational",
    displayText: "أُنشئ مركز القلب لخدمة أهالي الصعيد.",
    spokenText: "أُنْشِئَ مَرْكَزُ الْقَلْبِ لِخِدْمَةِ أَهالي الصَّعيدِ.",
    spokenTextHash: sha256String(
      "أُنْشِئَ مَرْكَزُ الْقَلْبِ لِخِدْمَةِ أَهالي الصَّعيدِ.",
    ),
  },
  {
    semanticKey: "audition.pronunciation.ancient-teacher",
    category: "educational",
    displayText: "استخدم المعلم المصري القديم البردية وأدوات الكتابة.",
    spokenText:
      "اسْتَخْدَمَ الْمُعَلِّمُ الْمِصْرِيُّ الْقَديمُ الْبَرْدِيَّةَ وَأَدَواتِ الْكِتابَةِ.",
    spokenTextHash: sha256String(
      "اسْتَخْدَمَ الْمُعَلِّمُ الْمِصْرِيُّ الْقَديمُ الْبَرْدِيَّةَ وَأَدَواتِ الْكِتابَةِ.",
    ),
  },
];

function sha256String(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

export const VOICES = ["callirrhoe", "kore", "enceladus", "puck"];
export const STYLES = ["normal-educational", "calm-slow"];
export const SFX_KEYS = [
  "selection",
  "correct",
  "retry",
  "completion",
  "transition",
];
