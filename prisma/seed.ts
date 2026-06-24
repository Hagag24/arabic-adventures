import { createPrismaClient } from "../src/lib/db/create-prisma-client";
import type { Prisma } from "../src/generated/prisma/client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const dbUrl = process.env.DATABASE_URL || "file:./data/arabic-adventures.db";
const prisma = createPrismaClient(dbUrl);

interface StageData {
  slug: string;
  title: string;
  shortDescription: string;
  displayOrder: number;
}

interface JourneyData {
  slug: string;
  title: string;
  shortDescription: string;
  themeKey: string;
  achievementTitle: string;
  estimatedMinutes: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  displayOrder: number;
  stages: StageData[];
}

const seedJourneys: JourneyData[] = [
  {
    slug: "ancient-egyptian-teacher",
    title: "أسرار المعلم المصري القديم",
    shortDescription:
      "اكتشف أسرار الكتابة والتعليم في مصر القديمة ودور المعلم المصري.",
    themeKey: "ancient-egypt",
    achievementTitle: "مستكشف الحضارة",
    estimatedMinutes: 45,
    status: "PUBLISHED",
    displayOrder: 1,
    stages: [
      {
        slug: "prepare",
        title: "استعد",
        shortDescription: "تهيئة واستعداد للرحلة المشوقة.",
        displayOrder: 1,
      },
      {
        slug: "predict",
        title: "توقّع",
        shortDescription: "ماذا تتوقع أن تتعلم في هذه الرحلة؟",
        displayOrder: 2,
      },
      {
        slug: "listen",
        title: "استمع",
        shortDescription: "استمع إلى القصة أو المحتوى التعليمي بتركيز.",
        displayOrder: 3,
      },
      {
        slug: "understand",
        title: "افهم",
        shortDescription: "أنشطة وأسئلة لقياس فهمك للمحتوى.",
        displayOrder: 4,
      },
      {
        slug: "word-play",
        title: "العب بالكلمات",
        shortDescription: "تطوير المفردات اللغوية من خلال الألعاب.",
        displayOrder: 5,
      },
      {
        slug: "sequence-events",
        title: "رتّب الأحداث",
        shortDescription: "ترتيب الأحداث بطريقة منطقية وزمنية.",
        displayOrder: 6,
      },
      {
        slug: "think-and-create",
        title: "فكّر وأبدع",
        shortDescription: "نشاط تعبيري وإبداعي لتطبيق ما تعلمته.",
        displayOrder: 7,
      },
      {
        slug: "review-achievement",
        title: "راجع إنجازك",
        shortDescription: "تقييم ذاتي ومراجعة لما أنجزته.",
        displayOrder: 8,
      },
    ],
  },
  {
    slug: "king-of-hearts",
    title: "ملك القلوب",
    shortDescription:
      "رحلة ملهمة حول العطاء الإنساني وصناعة الأمل لمستقبل أفضل.",
    themeKey: "humanity",
    achievementTitle: "صانع الأمل",
    estimatedMinutes: 30,
    status: "PUBLISHED",
    displayOrder: 2,
    stages: [
      {
        slug: "prepare",
        title: "استعد",
        shortDescription: "تهيئة واستعداد للرحلة المشوقة.",
        displayOrder: 1,
      },
      {
        slug: "predict",
        title: "توقّع",
        shortDescription: "ماذا تتوقع أن تتعلم في هذه الرحلة؟",
        displayOrder: 2,
      },
      {
        slug: "listen",
        title: "استمع",
        shortDescription: "استمع إلى القصة أو المحتوى التعليمي بتركيز.",
        displayOrder: 3,
      },
      {
        slug: "understand",
        title: "افهم",
        shortDescription: "أنشطة وأسئلة لقياس فهمك للمحتوى.",
        displayOrder: 4,
      },
      {
        slug: "word-play",
        title: "العب بالكلمات",
        shortDescription: "تطوير المفردات اللغوية من خلال الألعاب.",
        displayOrder: 5,
      },
      {
        slug: "sequence-events",
        title: "رتّب الأحداث",
        shortDescription: "ترتيب الأحداث بطريقة منطقية وزمنية.",
        displayOrder: 6,
      },
      {
        slug: "think-and-create",
        title: "فكّر وأبدع",
        shortDescription: "نشاط تعبيري وإبداعي لتطبيق ما تعلمته.",
        displayOrder: 7,
      },
      {
        slug: "review-achievement",
        title: "راجع إنجازك",
        shortDescription: "تقييم ذاتي ومراجعة لما أنجزته.",
        displayOrder: 8,
      },
    ],
  },
  {
    slug: "my-body-is-a-trust",
    title: "جسدي أمانة",
    shortDescription: "تعلم كيفية حماية جسدك وفهم حدود الأمان الشخصي والجسدي.",
    themeKey: "safety",
    achievementTitle: "بطل الأمان",
    estimatedMinutes: 40,
    status: "PUBLISHED",
    displayOrder: 3,
    stages: [
      {
        slug: "prepare",
        title: "استعد",
        shortDescription: "تهيئة واستعداد للرحلة المشوقة.",
        displayOrder: 1,
      },
      {
        slug: "predict",
        title: "توقّع",
        shortDescription: "ماذا تتوقع أن تتعلم في هذه الرحلة؟",
        displayOrder: 2,
      },
      {
        slug: "listen",
        title: "استمع",
        shortDescription: "استمع إلى القصة أو المحتوى التعليمي بتركيز.",
        displayOrder: 3,
      },
      {
        slug: "understand",
        title: "افهم",
        shortDescription: "أنشطة وأسئلة لقياس فهمك للمحتوى.",
        displayOrder: 4,
      },
      {
        slug: "word-play",
        title: "العب بالكلمات",
        shortDescription: "تطوير المفردات اللغوية من خلال الألعاب.",
        displayOrder: 5,
      },
      {
        slug: "sequence-events",
        title: "رتّب الأحداث",
        shortDescription: "ترتيب الأحداث بطريقة منطقية وزمنية.",
        displayOrder: 6,
      },
      {
        slug: "think-and-create",
        title: "فكّر وأبدع",
        shortDescription: "نشاط تعبيري وإبداعي لتطبيق ما تعلمته.",
        displayOrder: 7,
      },
      {
        slug: "review-achievement",
        title: "راجع إنجازك",
        shortDescription: "تقييم ذاتي ومراجعة لما أنجزته.",
        displayOrder: 8,
      },
    ],
  },
];

interface OptionData {
  optionKey: string;
  label: string;
  secondaryText?: string | null;
  displayOrder: number;
}

type JsonValue = Prisma.InputJsonValue;

interface AnswerKeyData {
  answerData: JsonValue;
  acceptedAlternatives?:
    | Prisma.NullableJsonNullValueInput
    | Prisma.InputJsonValue
    | null;
  modelAnswer?: string | null;
  explanation?: string | null;
}

interface SeedActivity {
  journeySlug: string;
  stageSlug: string;
  slug: string;
  type: string;
  title: string;
  instruction: string;
  prompt?: string | null;
  skillTags: string[];
  isGraded: boolean;
  isSensitive: boolean;
  storagePolicy: string;
  audioAssetKey?: string | null;
  configuration?: JsonValue;
  correctFeedback?: string | null;
  incorrectFeedback?: string | null;
  completionFeedback?: string | null;
  displayOrder: number;
  options?: OptionData[];
  answerKey?: AnswerKeyData;
}

const seedActivities: SeedActivity[] = [
  // ==========================================
  // JOURNEY 1: ancient-egyptian-teacher (15 activities)
  // ==========================================
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "prepare",
    slug: "arabic-self-assessment",
    type: "self_assessment",
    title: "التقييم الذاتي لاهتماماتي",
    instruction: "أجب بصراحة عن اهتمامك باللغة العربية والتعلم.",
    prompt: "كيف تشعر تجاه قراءة نصوص اللغة العربية خارج المدرسة؟",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 1,
    options: [
      { optionKey: "happy", label: "أشعر بالسعادة والشغف", displayOrder: 1 },
      {
        optionKey: "neutral",
        label: "أشعر بالهدوء والاعتياد",
        displayOrder: 2,
      },
      { optionKey: "bored", label: "أشعر بالملل أحياناً", displayOrder: 3 },
    ],
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "predict",
    slug: "titles-generation",
    type: "three_answers",
    title: "اقتراح عناوين مناسبة للخبر",
    instruction: "اكتب ثلاثة عناوين جديدة مناسبة للخبر الذي ستستمع إليه.",
    prompt: "اقترح 3 عناوين تعبر عن دور الكاتب والمعلم المصري القديم:",
    skillTags: ["listening_comprehension", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. مكانة المعلم في مصر القديمة\n2. الكاتب المصري ودوره في نشر العلم\n3. أوراق البردي وسر الكتابة",
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "predict",
    slug: "student-questions",
    type: "three_answers",
    title: "أسئلة تود طرحها حول الاكتشاف",
    instruction: "دون ثلاثة أسئلة تتمنى أن تسألها عند سماع النص.",
    prompt: "اكتب 3 أسئلة تثير فضولك حول مقبرة الكاتب المصري القديم:",
    skillTags: ["questioning_skills", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. كيف تم العثور على المقبرة؟\n2. ما هي الأدوات التي دفنت معه؟\n3. كيف كان يعلم الكاتب طلابه؟",
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "listen",
    slug: "best-title-choice",
    type: "single_choice",
    title: "اختيار العنوان الأنسب للنص المسموع",
    instruction: "اختر العنوان الأنسب للنص المسموع.",
    prompt: "ما هو العنوان الأكثر دقة وشمولاً للنص الذي استمعت إليه؟",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    audioAssetKey: "ancient-egyptian-teacher-main",
    displayOrder: 1,
    options: [
      { optionKey: "opt1", label: "أدوات الكتابة الخشبية", displayOrder: 1 },
      {
        optionKey: "opt2",
        label: "المعلم المصري القديم ودوره في الحضارة",
        displayOrder: 2,
      },
      {
        optionKey: "opt3",
        label: "المتاحف وتطوير القاعات القديمة",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "opt2" },
      explanation:
        "النص يدور بشكل رئيسي حول دور المعلم (الكاتب) ومكانته وبنائه للحضارة.",
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "understand",
    slug: "main-idea-choice",
    type: "single_choice",
    title: "الفكرة الرئيسة للخبر المسموع",
    instruction: "اختر الفكرة الرئيسة للخبر المسموع.",
    prompt: "ما هي الفكرة الرئيسة التي يدور حولها الخبر؟",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    options: [
      {
        optionKey: "opt1",
        label: "احترام المعلم المصري القديم ودوره في نشر العلم",
        displayOrder: 1,
      },
      {
        optionKey: "opt2",
        label: "طريقة صناعة أوراق البردي في المقابر",
        displayOrder: 2,
      },
      {
        optionKey: "opt3",
        label: "أهمية تزيين جدران المقابر بالرسومات",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "opt1" },
      explanation:
        "يركز النص على دور الكاتب في نشر العلم واحترامه الشديد في المجتمع.",
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "understand",
    slug: "main-idea-open",
    type: "short_text",
    title: "الفكرة الرئيسة بأسلوبك",
    instruction: "اكتب بأسلوبك الفكرة الرئيسة لهذا الخبر.",
    prompt: "لخص الفكرة الرئيسة للنص المسموع في سطر واحد:",
    skillTags: ["listening_comprehension", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    answerKey: {
      answerData: {},
      modelAnswer:
        "مكانة الكاتب المصري القديم ودوره العظيم في نشر المعرفة وبناء الحضارة وتدوين التاريخ.",
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "understand",
    slug: "comprehension-questions",
    type: "fill_in_the_blank",
    title: "أسئلة حول مقبرة الكاتب",
    instruction: "أجب عن الأسئلة التالية بكلمات مناسبة من النص.",
    prompt:
      "1. عُثر على أوراق البردي في مقابر [blank1].\n2. كان الكاتب يجلس في وقار على [blank2].\n3. كان يُسمى المعلم المصري القديم بالـ [blank3].",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 3,
    answerKey: {
      answerData: {
        blank1: ["العلماء", "علماء"],
        blank2: ["وسادة", "الوسادة"],
        blank3: ["الكاتب", "كاتب"],
      },
      explanation:
        "العلماء والوسادة والكاتب هي الكلمات الواردة بالنص في المواضع المقابلة.",
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "word-play",
    slug: "synonym-matching",
    type: "matching",
    title: "مترادفات الكلمات من النص",
    instruction: "صل كل كلمة بمرادفها الصحيح.",
    prompt: "طابق الكلمات مع معانيها المترادفة:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    options: [
      { optionKey: "word1", label: "وقار", displayOrder: 1 },
      { optionKey: "word2", label: "يدوّن", displayOrder: 2 },
      { optionKey: "word3", label: "يسهم", displayOrder: 3 },
      { optionKey: "mean1", label: "هيبة واحترام", displayOrder: 4 },
      { optionKey: "mean2", label: "يكتب ويسجل", displayOrder: 5 },
      { optionKey: "mean3", label: "يشارك ويساعد", displayOrder: 6 },
    ],
    answerKey: {
      answerData: {
        pairs: {
          word1: "mean1",
          word2: "mean2",
          word3: "mean3",
        },
      },
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "word-play",
    slug: "antonym-matching",
    type: "matching",
    title: "مضاد الكلمات",
    instruction: "طابق الكلمة بمضادها الصحيح.",
    prompt: "صل الكلمات مع أضدادها المعاكسة في المعنى:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    options: [
      { optionKey: "word1", label: "عظيمة", displayOrder: 1 },
      { optionKey: "word2", label: "ينشر", displayOrder: 2 },
      { optionKey: "word3", label: "وقار", displayOrder: 3 },
      { optionKey: "ant1", label: "حقيرة أو ضئيلة", displayOrder: 4 },
      { optionKey: "ant2", label: "يجمع أو يخفي", displayOrder: 5 },
      { optionKey: "ant3", label: "خفة وطيش", displayOrder: 6 },
    ],
    answerKey: {
      answerData: {
        pairs: {
          word1: "ant1",
          word2: "ant2",
          word3: "ant3",
        },
      },
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "word-play",
    slug: "antonyms-detailed",
    type: "matching",
    title: "مضاد الكلمات بالتفصيل",
    instruction: "صل كل كلمة بمضادها الدقيق.",
    prompt: "طابق الكلمات التالية مع أضدادها الصحيحة:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 3,
    options: [
      { optionKey: "word1", label: "مكانة", displayOrder: 1 },
      { optionKey: "word2", label: "احترام", displayOrder: 2 },
      { optionKey: "word3", label: "تقدير", displayOrder: 3 },
      { optionKey: "word4", label: "معلم", displayOrder: 4 },
      { optionKey: "ant1", label: "تجاهل وضعة", displayOrder: 5 },
      { optionKey: "ant2", label: "ازدراء", displayOrder: 6 },
      { optionKey: "ant3", label: "إهمال أو استخفاف", displayOrder: 7 },
      { optionKey: "ant4", label: "تلميذ", displayOrder: 8 },
    ],
    answerKey: {
      answerData: {
        pairs: {
          word1: "ant1",
          word2: "ant2",
          word3: "ant3",
          word4: "ant4",
        },
      },
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "sequence-events",
    slug: "event-ordering",
    type: "ordering",
    title: "ترتيب أحداث الخبر المسموع",
    instruction: "رتب الأحداث التالية حسب تسلسلها في الخبر.",
    prompt: "رتب الجمل التالية زمنياً:",
    skillTags: ["sequencing", "listening"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    options: [
      {
        optionKey: "evt1",
        label: "بدأ المتحف المصري مشروعاً لتطوير قاعة التعليم والكتابة.",
        displayOrder: 1,
      },
      {
        optionKey: "evt2",
        label: "كان الكاتب يجلس بوقار حاملاً لوحة وأدوات خشبية.",
        displayOrder: 2,
      },
      {
        optionKey: "evt3",
        label:
          "عثر العلماء على علوم وأفكار الكُتّاب في مقابر العلماء على أوراق بردي.",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: {
        order: ["evt1", "evt2", "evt3"],
      },
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "sequence-events",
    slug: "event-meaning-matching",
    type: "matching",
    title: "مطابقة الأحداث بمعانيها",
    instruction: "صل بين الحدث ودلالته الصحيحة.",
    prompt: "طابق الحدث مع المعنى المعبر عنه:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    options: [
      {
        optionKey: "evt1",
        label: "تطوير قاعة الكتابة والتعليم بالمتحف",
        displayOrder: 1,
      },
      {
        optionKey: "evt2",
        label: "العثور على البرديات بمقابر العلماء",
        displayOrder: 2,
      },
      {
        optionKey: "evt3",
        label: "جلوس الكاتب بوقار على وسادة",
        displayOrder: 3,
      },
      {
        optionKey: "val1",
        label: "الاهتمام بنشر الوعي بتاريخ التعليم",
        displayOrder: 4,
      },
      {
        optionKey: "val2",
        label: "تأكيد فكرة تخليد العلم وتقدير المعرفة",
        displayOrder: 5,
      },
      {
        optionKey: "val3",
        label: "الهيبة والاحترام التي كان يحظى بها الكاتب",
        displayOrder: 6,
      },
    ],
    answerKey: {
      answerData: {
        pairs: {
          evt1: "val1",
          evt2: "val2",
          evt3: "val3",
        },
      },
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "think-and-create",
    slug: "what-if-reflection",
    type: "long_text",
    title: "انعكاس: ماذا لو لم يكتشف القبر؟",
    instruction: "أجب عن السؤال مفكراً في النتائج المترتبة.",
    prompt:
      "ماذا لو لم يُكتشف قبر الكاتب المصري القديم؟ كيف كان ذلك سيؤثر على معرفتنا بالتاريخ التعليمي؟",
    skillTags: ["critical_thinking", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    answerKey: {
      answerData: {},
      modelAnswer:
        "لما عرفنا مكانة الكاتب العظيمة في المجتمع المصري القديم، ولضاع جزء كبير من تاريخ توثيق التعليم وأدوات الكتابة ونشأة العلوم على ورق البردي.",
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "think-and-create",
    slug: "discovery-results",
    type: "three_answers",
    title: "نتائج اكتشاف مقبرة الكاتب",
    instruction: "اذكر نتيجتين ترتبتا على اكتشاف المقبرة.",
    prompt: "اكتب نتيجتين علميتين أو تاريخيتين لاكتشاف مقبرة الكاتب:",
    skillTags: ["critical_thinking"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. معرفة أدوات الكتابة المستخدمة (الخشب والريش والبردي).\n2. إثبات مدى هيبة ومكانة المعلم والعلماء في مصر القديمة.",
    },
  },
  {
    journeySlug: "ancient-egyptian-teacher",
    stageSlug: "review-achievement",
    slug: "character-event-identification",
    type: "matching",
    title: "تحديد الشخصية والحدث الأهم",
    instruction: "صل العنصر بما يناسبه لتقييم فهمك.",
    prompt: "طابق العناصر بالتعريف الأنسب:",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    options: [
      { optionKey: "elm1", label: "الشخصية الأهم بالخبر", displayOrder: 1 },
      { optionKey: "elm2", label: "الحدث الأهم بالنص", displayOrder: 2 },
      {
        optionKey: "def1",
        label: "الكاتب / المعلم المصري القديم",
        displayOrder: 3,
      },
      {
        optionKey: "def2",
        label: "اكتشاف مقبرة كاتب قديم وبدء تطوير القاعة بالمتحف",
        displayOrder: 4,
      },
    ],
    answerKey: {
      answerData: {
        pairs: {
          elm1: "def1",
          elm2: "def2",
        },
      },
    },
  },

  // ==========================================
  // JOURNEY 2: king-of-hearts (24 activities)
  // ==========================================
  {
    journeySlug: "king-of-hearts",
    stageSlug: "prepare",
    slug: "yacoub-praise-assessment",
    type: "self_assessment",
    title: "الشعور عند تلقي المديح",
    instruction:
      "اختر التعبير الذي يمثلك عند تلقي المديح من معلم اللغة العربية.",
    prompt: "بماذا تشعر عندما يمدح معلمك أداءك؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 1,
    options: [
      {
        optionKey: "proud",
        label: "الفخر والرغبة في بذل المزيد من الجهد",
        displayOrder: 1,
      },
      { optionKey: "happy", label: "السعادة والارتياح العام", displayOrder: 2 },
      {
        optionKey: "shy",
        label: "الخجل والتردد في الإجابة مستقبلاً",
        displayOrder: 3,
      },
    ],
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "prepare",
    slug: "yacoub-score-motivation",
    type: "self_assessment",
    title: "دافع الحصول على درجة عالية",
    instruction: "اختر السبب الأكثر تعبيراً عن رغبتك في نيل درجات عالية.",
    prompt: "لماذا تحرص على الحصول على درجة عالية في اللغة العربية؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 2,
    options: [
      {
        optionKey: "love",
        label: "لحبي الشديد للغة العربية وثقافتها",
        displayOrder: 1,
      },
      {
        optionKey: "pleasing",
        label: "لإسعاد والدي وتقدير معلمي لي",
        displayOrder: 2,
      },
      {
        optionKey: "competition",
        label: "لأكون متفوقاً ومتميزاً بين زملائي",
        displayOrder: 3,
      },
    ],
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "prepare",
    slug: "yacoub-improvement-checklist",
    type: "self_assessment",
    title: "المهارات التي تحسنت فيها",
    instruction: "حدد المهارات التي تلاحظ أنك تطورت فيها باللغة العربية.",
    prompt: "اختر المهارات التي تحسن أداؤك فيها:",
    skillTags: ["self_evaluation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 3,
    options: [
      {
        optionKey: "listening",
        label: "الاستماع بتركيز وفهم أدق التفاصيل",
        displayOrder: 1,
      },
      {
        optionKey: "reading",
        label: "قراءة النصوص بطلاقة واستخراج المعاني",
        displayOrder: 2,
      },
      {
        optionKey: "writing",
        label: "كتابة الجمل والتعبير عن الرأي بوضوح",
        displayOrder: 3,
      },
    ],
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "prepare",
    slug: "yacoub-encouragement-assessment",
    type: "self_assessment",
    title: "تقييم تشجيع البيئة المحيطة",
    instruction: "اختر بطاقة تعبر عن مدى تشجيع والديك ومعلمك لك.",
    prompt: "كيف تصف الدعم والتشجيع الذي تتلقاه لتعلم العربية؟",
    skillTags: ["social_support"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 4,
    options: [
      {
        optionKey: "high",
        label: "تشجيع دائم وقوي يدفعني للنجاح",
        displayOrder: 1,
      },
      {
        optionKey: "moderate",
        label: "تشجيع كافٍ ومساعد عند الحاجة",
        displayOrder: 2,
      },
      {
        optionKey: "low",
        label: "أعتمد على تحفيزي الذاتي غالباً",
        displayOrder: 3,
      },
    ],
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "predict",
    slug: "yacoub-title-prediction",
    type: "short_text",
    title: "توقع قصة ملك القلوب",
    instruction: "ما توقعك لعنوان القصة قبل سماعها؟",
    prompt:
      "عندما تسمع بلقب 'ملك القلوب' في مجال الطب، ماذا تتوقع أن تكون قصة البطل؟",
    skillTags: ["prediction"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    answerKey: {
      answerData: {},
      modelAnswer:
        "أتوقع أنها قصة طبيب عظيم يضحي بوقته وماله لعلاج قلوب المرضى والفقراء بالمجان ونشر السعادة.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "listen",
    slug: "yacoub-stages-ordering",
    type: "ordering",
    title: "ترتيب أحداث سيرة الطبيب",
    instruction: "رتب أحداث سيرة الطبيب مجدي يعقوب حسب سماعك للخبر.",
    prompt: "رتب الجمل التالية حسب تسلسلها في القصة:",
    skillTags: ["sequencing", "listening"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    audioAssetKey: "king-of-hearts-main",
    displayOrder: 1,
    options: [
      {
        optionKey: "stg1",
        label: "نشأ مجدي في مصر وتعلم من والده الجراح حب مساعدة الناس.",
        displayOrder: 1,
      },
      {
        optionKey: "stg2",
        label: "سافر مجدي يعقوب إلى بريطانيا واجتهد حتى نال لقب سير.",
        displayOrder: 2,
      },
      {
        optionKey: "stg3",
        label: "عاد إلى مصر واختار أسوان لبناء مركز جراحة قلوب مجاني.",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { order: ["stg1", "stg2", "stg3"] },
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "listen",
    slug: "yacoub-return-year",
    type: "fill_in_the_blank",
    title: "سنة عودة الدكتور مجدي يعقوب",
    instruction: "أكمل الجملة التالية بالعام الذي عاد فيه الطبيب إلى مصر.",
    prompt:
      "عاد د. مجدي يعقوب إلى مصر وبدأ تأسيس مركز أسوان للقلب في عام [blank1].",
    skillTags: ["listening_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    answerKey: {
      answerData: { blank1: ["2009", "ألفين وتسعة", "ألفين وتسعه"] },
      explanation: "عاد في عام 2009 ميلادي كما هو مسجل بالخبر المسموع.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "understand",
    slug: "yacoub-surgeon-calmness",
    type: "single_choice",
    title: "صفة الجراح الهادئ وعوامل نجاحه",
    instruction: "اختر صفة الجراح الهادئ كما يراها د. مجدي.",
    prompt: "لماذا يعد الهدوء الشديد من أهم صفات الجراح الناجح؟",
    skillTags: ["listening_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    options: [
      {
        optionKey: "opt1",
        label: "لأنه يجعله سريع الحركة والحديث",
        displayOrder: 1,
      },
      {
        optionKey: "opt2",
        label: "لأنه يمنحه القدرة على تحقيق النجاح وتجنب الأخطاء",
        displayOrder: 2,
      },
      {
        optionKey: "opt3",
        label: "لأنه يمنع المرضى من القلق أثناء الفحص",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "opt2" },
      explanation:
        "الهدوء يتيح للجراح التركيز واتخاذ القرارات السليمة أثناء العمليات الدقيقة.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "understand",
    slug: "yacoub-alternative-solution",
    type: "single_choice",
    title: "اقتراح حلول بديلة لخدمة الصعيد",
    instruction: "اختر حلاً بديلاً مقترحاً لخدمة أهالي الصعيد صحياً.",
    prompt:
      "ما هو الحل البديل الأقرب لتحقيق نفع طبي لأهل الصعيد إذا لم يُبن المركز في أسوان؟",
    skillTags: ["critical_thinking"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    options: [
      {
        optionKey: "sol1",
        label: "إرسال المرضى للعلاج خارج مصر دائماً",
        displayOrder: 1,
      },
      {
        optionKey: "sol2",
        label: "تدريب أطباء محليين في الصعيد وتسيير قوافل طبية متخصصة",
        displayOrder: 2,
      },
      {
        optionKey: "sol3",
        label: "الاعتماد كلياً على المستشفيات الخاصة بالمدن الكبرى",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "sol2" },
      explanation:
        "التدريب والقوافل هي الحلول التنموية الأكثر استدامة ونفعاً للفقراء والمناطق البعيدة.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "understand",
    slug: "yacoub-insist-reason",
    type: "fill_in_the_blank",
    title: "سبب إصرار الطبيب على إنشاء المركز",
    instruction: "أجب: لماذا صمم الطبيب على إنشاء المركز في أسوان بالذات؟",
    prompt:
      "أصر الطبيب على إنشاء المركز في أسوان بسبب [blank1] وعلاج المرضى بالمجان.",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 3,
    answerKey: {
      answerData: { blank1: ["مساعدة الناس", "خدمة الوطن", "مساعدة الفقراء"] },
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "understand",
    slug: "yacoub-biggest-challenge",
    type: "fill_in_the_blank",
    title: "العقبة الكبرى لتمويل المشروع",
    instruction: "ما هي العقبة الأساسية التي واجهت الطبيب لتمويل المركز؟",
    prompt:
      "العقبة الأساسية كانت توفير [blank1] اللازم للأجهزة الحديثة وتكاليف العمليات.",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 4,
    answerKey: {
      answerData: { blank1: ["المال", "التمويل", "الدعم المالي"] },
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "word-play",
    slug: "yacoub-new-word",
    type: "short_text",
    title: "كلمة وجملة مفيدة",
    instruction: "اختر كلمة جديدة أعجبتك من النص المسموع وضعها في جملة مفيدة.",
    prompt: "اكتب الكلمة ثم ضعها في سياق جملة تامة التعبير:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    answerKey: {
      answerData: {},
      modelAnswer:
        "الكلمة: 'التعاطف'. الجملة: 'التعاطف مع المرضى يهدئ من خوفهم ويساعدهم على الشفاء بسرعة'.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "word-play",
    slug: "yacoub-arabic-practical-use",
    type: "single_choice",
    title: "الفائدة العملية للغة العربية",
    instruction: "اختر الفائدة العملية للغة العربية التي ذُكرت في العبارات.",
    prompt: "كيف تسهم مهارات اللغة العربية الفصحى في تطوير فهم المواد الأخرى؟",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    options: [
      {
        optionKey: "use1",
        label:
          "تساعد في الفهم الدقيق للمفاهيم الطبية والبحثية المكتوبة بالعربية",
        displayOrder: 1,
      },
      {
        optionKey: "use2",
        label: "تقتصر على قراءة الكتب والقصص القديمة فقط",
        displayOrder: 2,
      },
      {
        optionKey: "use3",
        label: "تحسن الخطوط والزخارف على جدران المستشفيات",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "use1" },
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "sequence-events",
    slug: "yacoub-life-ordering",
    type: "ordering",
    title: "ترتيب مراحل حياة الطبيب",
    instruction: "رتب مراحل حياة الدكتور مجدي يعقوب تصاعدياً.",
    prompt: "رتب مسيرة حياة الدكتور مجدي يعقوب:",
    skillTags: ["sequencing", "listening"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    options: [
      {
        optionKey: "mil1",
        label: "النشأة بمصر ومرافقة والده الطبيب والتعلم منه.",
        displayOrder: 1,
      },
      {
        optionKey: "mil2",
        label: "الدراسة الجامعية ثم السفر للمملكة المتحدة.",
        displayOrder: 2,
      },
      {
        optionKey: "mil3",
        label: "العمل كجراح قلب عالمي والحصول على التكريمات الدولية.",
        displayOrder: 3,
      },
      {
        optionKey: "mil4",
        label: "العودة للوطن وافتتاح مركز جراحة القلب بأسوان.",
        displayOrder: 4,
      },
    ],
    answerKey: {
      answerData: { order: ["mil1", "mil2", "mil3", "mil4"] },
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "sequence-events",
    slug: "yacoub-listening-behavior",
    type: "checklist",
    title: "السلوك الصحيح أثناء الاستماع",
    instruction: "حدد السلوكيات الصحيحة أثناء الاستماع للنص المعروض.",
    prompt: "اختر السلوكيات التي تمثل مستمعاً متميزاً للقصص والدروس:",
    skillTags: ["listening_skills"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 2,
    options: [
      {
        optionKey: "chk1",
        label: "التركيز البصري والذهني مع المتحدث أو المقطع الصوتي",
        displayOrder: 1,
      },
      {
        optionKey: "chk2",
        label: "تسجيل الأفكار والكلمات الهامة دون مقاطعة القراءة",
        displayOrder: 2,
      },
      {
        optionKey: "chk3",
        label: "الانشغال بالهاتف أو اللعب أثناء سماع النص",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOptions: ["chk1", "chk2"] },
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "think-and-create",
    slug: "yacoub-problem-solutions",
    type: "problem_solution",
    title: "تحديد مشكلة واقتراح حلين",
    instruction: "اختر مشكلة واجهت أهالي أسوان في العلاج واقترح حلين عمليين.",
    prompt:
      "المشكلة: بعد مركز القلب بأسوان عن القاهرة وصعوبة السفر للمرضى الفقراء.",
    skillTags: ["problem_solving", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 1,
    answerKey: {
      answerData: {},
      modelAnswer:
        "الحل 1: بناء مركز متخصص متكامل محلي في أسوان (كما فعل الطبيب).\nالحل 2: توفير وسائل مواصلات مجانية أو قوافل مجهزة بشكل دوري.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "think-and-create",
    slug: "yacoub-funding-alternatives",
    type: "long_text",
    title: "حلول بديلة في غياب التمويل الكافي",
    instruction: "فكر في بدائل عملية لخدمة المرضى في غياب الموارد الكافية.",
    prompt:
      "لو لم تتوافر الإمكانات الضخمة لإنشاء مركز جراحات قلب ثابت بأسوان، كيف يمكن مساعدة الأطفال المرضى؟",
    skillTags: ["problem_solving"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    answerKey: {
      answerData: {},
      modelAnswer:
        "كان يمكن إنشاء عيادة فحص متنقلة أو شبكة تطوعية تنسق مع مستشفيات جامعية قريبة لإجراء العمليات الصعبة.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "think-and-create",
    slug: "yacoub-character-opinion",
    type: "long_text",
    title: "رأيك في الطبيب والقدوة",
    instruction: "ما رأيك في شخصية الطبيب مجدي يعقوب؟ هل تراه قدوة؟ ولماذا؟",
    prompt: "عبر عن رأيك بوضوح في الصفات الإنسانية والوطنية للبطل:",
    skillTags: ["value_judgment", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 3,
    answerKey: {
      answerData: {},
      modelAnswer:
        "نعم، هو قدوة عظيمة لأنه جسد معاني الرحمة والعطاء والتواضع، وآثر خدمة أبناء وطنه بالمجان على البقاء في شهرته الخارجية.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "think-and-create",
    slug: "yacoub-interview-questions",
    type: "three_answers",
    title: "أسئلة تود طرحها على الطبيب",
    instruction: "اكتب ثلاثة أسئلة تتمنى طرحها على د. مجدي يعقوب لو قابلته.",
    prompt:
      "لو أتيحت لك فرصة إجراء مقابلة مع ملك القلوب، ما هي أسئلتك الثلاثة له؟",
    skillTags: ["questioning_skills"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 4,
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. ما الذي جعلك تختار جراحة القلب بالذات؟\n2. كيف تشعر بعد نجاح عملية معقدة لطفل صغير؟\n3. بم تنصح الأطفال الذين يتمنون أن يكونوا أطباء في المستقبل؟",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "think-and-create",
    slug: "yacoub-story-retell",
    type: "retell_story",
    title: "تلخيص الحكاية بأسلوبك",
    instruction: "أعد كتابة قصة الدكتور مجدي يعقوب بأسلوبك الخاص كقصة قصيرة.",
    prompt: "لخص سيرة ملك القلوب في بضعة أسطر:",
    skillTags: ["writing", "story_telling"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 5,
    answerKey: {
      answerData: {},
      modelAnswer:
        "طبيب مصري نشأ محباً لخدمة الناس، تفوق وسافر لبريطانيا ونال الشهرة العالمية ولقب سير، ثم عاد لبلده ليبني مركز قلب مجاني للأطفال والفقراء في أسوان ليرسم البسمة على وجوههم.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "think-and-create",
    slug: "yacoub-humanitarian-project",
    type: "story_builder",
    title: "تصميم مشروعك الإنساني الخاص",
    instruction: "تخيل أنك مسؤول عن مشروع إنساني، حدد المشكلة والحل والنتيجة.",
    prompt: "املاً بطاقات التخطيط لمشروعك الإنساني المستقبلي:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 6,
    answerKey: {
      answerData: {},
      modelAnswer:
        "المشكلة: صعوبة قراءة الكتب لفاقدي البصر.\nالحل: تطبيق مجاني يحول الكتب لقصص مسموعة بأصوات تفاعلية.\nالنتيجة: تمكين المكفوفين من القراءة والتعلم بسهولة ونشر الثقافة.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "think-and-create",
    slug: "yacoub-student-problem",
    type: "problem_solution",
    title: "علاج مشكلة دراسية",
    instruction: "اقترح مشكلة دراسية يواجهها الطلاب وحلين عمليين لها.",
    prompt: "المشكلة: صعوبة تنظيم الوقت وتراكم الواجبات المدرسية.",
    skillTags: ["problem_solving"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 7,
    answerKey: {
      answerData: {},
      modelAnswer:
        "الحل 1: عمل جدول يومي مرن يخصص ساعة ونصف محددة للمذاكرة دون مشتتات.\nالحل 2: تقسيم المهام الكبيرة لمهام صغيرة وحل الواجبات فور أخذ الدرس مباشرة.",
    },
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "review-achievement",
    slug: "yacoub-agree-disagree",
    type: "agree_disagree",
    title: "موقفي من قيم السيرة",
    instruction: "اختر موافق أو غير موافق تجاه هذه المبادئ المستوحاة من النص.",
    prompt:
      "1. الإصرار والاجتهاد هما المفتاح الأساسي لتحقيق النجاحات العظيمة.\n2. العطاء ومساعدة الآخرين يجلب السعادة الحقيقية أكثر من الشهرة والمال.",
    skillTags: ["value_judgment"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 1,
    options: [
      { optionKey: "val1", label: "الإصرار أساس النجاح", displayOrder: 1 },
      {
        optionKey: "val2",
        label: "مساعدة الآخرين سعادة حقيقية",
        displayOrder: 2,
      },
    ],
  },
  {
    journeySlug: "king-of-hearts",
    stageSlug: "review-achievement",
    slug: "yacoub-story-titles",
    type: "three_answers",
    title: "عناوين مقترحة لحكاية مجدي يعقوب",
    instruction: "اكتب ثلاثة عناوين إبداعية مناسبة لحكاية الطبيب.",
    prompt: "اقترح 3 عناوين تمثل جوهر القصة الإنسانية لملك القلوب:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    displayOrder: 2,
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. زارع الأمل بأسوان\n2. طبيب القلوب الرحيم\n3. رحلة العطاء والعودة للوطن",
    },
  },

  // ==========================================
  // JOURNEY 3: my-body-is-a-trust (21 activities)
  // ==========================================
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "prepare",
    slug: "safety-arabic-feelings",
    type: "self_assessment",
    title: "الشعور العام تجاه الأمان الشخصي",
    instruction: "أجب بصدق لتهيئة فهمك للأمان والخصوصية.",
    prompt: "ما هو شعورك عند الحديث عن القواعد التي تحميك في منزلك والشارع؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 1,
    options: [
      {
        optionKey: "safe",
        label: "أشعر بالأمان والطمأنينة لمعرفتي بها",
        displayOrder: 1,
      },
      {
        optionKey: "curious",
        label: "أشعر بالرغبة في فهم المزيد لأحمي نفسي",
        displayOrder: 2,
      },
    ],
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "prepare",
    slug: "safety-arabic-importance",
    type: "self_assessment",
    title: "أهمية فهم حدود الجسد",
    instruction: "قيم مدى أهمية معرفة حدود جسدك بالنسبة لك.",
    prompt: "لماذا تظن أن معرفة اللمسة الطيبة واللمسة غير الطيبة أمر ضروري؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 2,
    options: [
      {
        optionKey: "protect",
        label: "لأحمي جسدي وأخبر والدي بأي تصرف مريب",
        displayOrder: 1,
      },
      {
        optionKey: "awareness",
        label: "لأكون واعياً وذكياً في تصرفاتي اليومية",
        displayOrder: 2,
      },
    ],
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "prepare",
    slug: "safety-arabic-excellence",
    type: "self_assessment",
    title: "كيف تحافظ على تفوقك وأمانك؟",
    instruction: "اختر الخيار الذي تمارسه لتشعر بالأمان والتميز.",
    prompt: "أي من هذه الممارسات تحرص عليها دائماً؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 3,
    options: [
      {
        optionKey: "talk",
        label: "أتحدث مع والدي بصدق تام عن كل يومي",
        displayOrder: 1,
      },
      {
        optionKey: "alert",
        label: "أنتبه دائماً لتعليمات السلامة في المدرسة والمنزل",
        displayOrder: 2,
      },
    ],
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "prepare",
    slug: "safety-final-self-checks",
    type: "self_assessment",
    title: "تقييم وعي الأمان الشخصي",
    instruction: "قيم مدى وعيك وثقتك بالقواعد التي تعلمتها لحماية نفسك.",
    prompt: "هل تشعر بالثقة في تطبيق قواعد الأمان والبوح بصدق للموثوقين؟",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 4,
    options: [
      {
        optionKey: "fully",
        label: "نعم، أستطيع حماية نفسي والبوح فوراً دون خوف",
        displayOrder: 1,
      },
      {
        optionKey: "need_help",
        label: "نعم، وسأطلب مساعدة بابا وماما دائماً في أي شك",
        displayOrder: 2,
      },
    ],
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "predict",
    slug: "safety-title-reaction",
    type: "self_assessment",
    title: "توقع قصة جسدي أمانة",
    instruction: "اختر ما تفكر فيه عندما تسمع عبارة 'جسدي أمانة'.",
    prompt: "ما أول ما يتبادر إلى ذهنك عند سماع هذا العنوان؟",
    skillTags: ["prediction"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 1,
    options: [
      {
        optionKey: "prt1",
        label: "أن جسدي ملك لي وحدي ويجب أن أحافظ عليه سالماً",
        displayOrder: 1,
      },
      {
        optionKey: "prt2",
        label: "أن هناك حدوداً خاصة لا يحق لأحد تجاوزها",
        displayOrder: 2,
      },
    ],
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "listen",
    slug: "safety-private-parts",
    type: "single_choice",
    title: "الأجزاء الخاصة في أجسادنا",
    instruction: "اختر التعريف الصحيح للأجزاء الخاصة بجسم الإنسان.",
    prompt: "ما المقصود بالأجزاء الخاصة في أجسامنا طبقاً للخبر المسموع؟",
    skillTags: ["safety_awareness"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    audioAssetKey: "my-body-is-a-trust-main",
    displayOrder: 1,
    options: [
      {
        optionKey: "ans1",
        label: "هي أجزاء مكشوفة يمكن للجميع رؤيتها ولمسها",
        displayOrder: 1,
      },
      {
        optionKey: "ans2",
        label: "أجزاء خاصة جداً ومغطاة لا يحق لأي شخص آخر أن يراها أو يلمسها",
        displayOrder: 2,
      },
      {
        optionKey: "ans3",
        label: "الملابس الرياضية التي نرتديها فقط",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "ans2" },
      explanation:
        "الأجزاء الخاصة هي ملك للطفل وحده ولا يجوز لأحد الاطلاع عليها أو لمسها مطلقاً.",
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "listen",
    slug: "safety-privacy-meaning",
    type: "single_choice",
    title: "معنى الخصوصية بالأمان الشخصي",
    instruction: "اختر ما تعنيه كلمة الخصوصية في سياق الأمان الجسدي.",
    prompt: "ما معنى الخصوصية التي تحدث عنها المقطع الصوتي؟",
    skillTags: ["safety_awareness"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    displayOrder: 2,
    options: [
      {
        optionKey: "opt1",
        label: "أن نشارك كل شيء مع الآخرين في أي وقت",
        displayOrder: 1,
      },
      {
        optionKey: "opt2",
        label:
          "أن يكون لكل شخص خصوصية تامة وحدود تخص جسده وممتلكاته ولا يتعدى عليها غيره",
        displayOrder: 2,
      },
      {
        optionKey: "opt3",
        label: "أن نلعب مع الجميع دون أي حذر",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "opt2" },
      explanation: "الخصوصية تعني تفرد الشخص بحدوده الجسدية الآمنة.",
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "understand",
    slug: "safety-abuse-action",
    type: "single_choice",
    title: "التصرف الصحيح عند التعرض للمسة مريبة",
    instruction: "اختر الإجراء السليم والآمن فوراً.",
    prompt:
      "إذا حاول شخص لمسك لمسة غير طيبة تجعلك تشعر بالخوف أو عدم الارتياح، ماذا تفعل؟",
    skillTags: ["safety_awareness"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    displayOrder: 1,
    options: [
      {
        optionKey: "act1",
        label: "أسكت ولا أخبر أحداً لأني أشعر بالخجل والذنب",
        displayOrder: 1,
      },
      {
        optionKey: "act2",
        label:
          "أقول بصوت واضح وقوي: 'كُفّ عن هذا!' وأبتعد فوراً وأخبر والديّ أو شخصاً بالغاً أثق به",
        displayOrder: 2,
      },
      {
        optionKey: "act3",
        label: "أنتظر حتى يتكرر الأمر لأتأكد",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "act2" },
      explanation: "البوح الفوري والشجاعة في قول 'لا' هي الدرع الحامي للطفل.",
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "understand",
    slug: "safety-uncomfortable-touch",
    type: "single_choice",
    title: "رد الفعل الشجاع للمسة غير الطيبة",
    instruction: "اختر بطاقة التصرف الشجاع عند الضيق والتهديد.",
    prompt: "الحديث عن اللمسات المزعجة وحماية جسدك هو:",
    skillTags: ["safety_awareness"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    displayOrder: 2,
    options: [
      { optionKey: "shg1", label: "خطأ يجب إخفاؤه عن الأهل", displayOrder: 1 },
      {
        optionKey: "shg2",
        label: "حق طبيعي وواجب لحمايتك، والخطأ يقع بالكامل على من يحاول إيذاءك",
        displayOrder: 2,
      },
      {
        optionKey: "shg3",
        label: "سر لا يجب مناقشته مع المدرسين مطلقاً",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "shg2" },
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "understand",
    slug: "safety-word-bank-fill",
    type: "fill_in_the_blank",
    title: "إكمال عبارات الأمان بالكلمة المناسبة",
    instruction:
      "أكمل الجمل بالكلمات المناسبة من القائمة (أمان – خصوصية - كفّ - خطأ).",
    prompt:
      "1. لكل طفل حق تام في [blank1] جسده وحمايته.\n2. عندما يزعجك شخص قل له بقوة [blank2] عن هذا.\n3. الحديث عن الضيق ليس [blank3] تقترفه بل هو واجب لحمايتك.",
    skillTags: ["safety_awareness", "reading"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "FULL_RESPONSE", // No sensitive child experience stored, just generic validation
    displayOrder: 3,
    answerKey: {
      answerData: {
        blank1: ["خصوصية", "أمان"],
        blank2: ["كف", "كفّ"],
        blank3: ["خطأ", "خطأً"],
      },
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "word-play",
    slug: "safety-word-sentence",
    type: "short_text",
    title: "جملة مفيدة عن الخصوصية",
    instruction: "ضع كلمة 'خصوصية' في جملة مفيدة تؤكد فيها وعيك.",
    prompt: "اكتب جملة تحتوي على كلمة 'خصوصية':",
    skillTags: ["vocabulary_acquisition"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 1,
    answerKey: {
      answerData: {},
      modelAnswer: "جسدي له خصوصية تامة ولا أسمح لأي غريب بتجاوز هذه الحدود.",
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "word-play",
    slug: "safety-listening-rules",
    type: "checklist",
    title: "سلوك الأمان والاستماع",
    instruction: "حدد السلوك السليم للطفل المنتبه لدروس السلامة.",
    prompt: "اختر القواعد الصحيحة للاستماع والانتباه لرسائل الأمان الجسدي:",
    skillTags: ["listening_skills"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 2,
    options: [
      {
        optionKey: "rule1",
        label: "الإنصات الجيد للمعلم والوالدين والتعلم بوعي وشجاعة",
        displayOrder: 1,
      },
      {
        optionKey: "rule2",
        label: "طرح الأسئلة بوضوح عند عدم فهم أي فكرة تخص الأمان",
        displayOrder: 2,
      },
      {
        optionKey: "rule3",
        label: "عدم الاهتمام والمغادرة عند بدء شرح قواعد الحماية",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOptions: ["rule1", "rule2"] },
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "sequence-events",
    slug: "safety-representation-choice",
    type: "single_choice",
    title: "طريقة التعبير عن الخبر والأمان",
    instruction: "اختر طريقتك المفضلة للتعبير وتلخيص معاني الحماية.",
    prompt: "كيف يمكنك مساعدة زملائك في فهم حدود أجسادهم؟",
    skillTags: ["critical_thinking"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    displayOrder: 1,
    options: [
      {
        optionKey: "rep1",
        label: "أرسم لوحة إرشادية تعبر عن حدود الأمان الشخصي والبوح للأهل",
        displayOrder: 1,
      },
      {
        optionKey: "rep2",
        label:
          "أكتب ملخصاً إرشادياً مبسطاً وألقيه بالإذاعة المدرسية بعد مراجعته مع المعلم",
        displayOrder: 2,
      },
      {
        optionKey: "rep3",
        label: "أتجاهل مناقشة الفكرة وأترك الآخرين دون نصيحة",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "rep2" }, // Both rep1 and rep2 are acceptable, rep2 chosen as primary model answer
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "think-and-create",
    slug: "safety-alternative-ending",
    type: "creative_ending",
    title: "اقتراح نهاية مطمئنة ومسؤولة",
    instruction: "اقترح نهاية جديدة مطمئنة وآمنة للقصة تتخيلها بنفسك.",
    prompt:
      "تخيل أن طفلاً تعرض لمضايقة وباح لوالديه؛ اكتب نهاية هذه الحكاية المطمئنة وكيف تمت حمايته:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 1,
    answerKey: {
      answerData: {},
      modelAnswer:
        "باح الطفل لوالديه بشجاعة، فحضناه وطمأناه بعبارات الدعم، وقام والده بإبلاغ إدارة المدرسة والجهات المسؤولة فوراً لمعاقبة المخطئ وضمان أمان جميع الأطفال.",
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "think-and-create",
    slug: "safety-story-summary",
    type: "retell_story",
    title: "تلخيص رسالة الأمان والخصوصية",
    instruction:
      "لخص الرسالة التي استمعت إليها بأسلوبك البسيط وبما تراه مفيداً لحمايتك.",
    prompt: "اكتب تلخيصاً موجزاً ومقنعاً لقواعد الأمان الشخصي:",
    skillTags: ["writing", "safety_awareness"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 2,
    answerKey: {
      answerData: {},
      modelAnswer:
        "أجسادنا مميزة ولها خصوصية تامة. اللمسات الطيبة تشعرنا بالأمان، واللمسات غير الطيبة تسبب الضيق. واجبنا قول 'كُفّ' والبوح فوراً للأهل أو البالغين الموثوقين لنبقى بأمان.",
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "think-and-create",
    slug: "safety-story-retell",
    type: "retell_story",
    title: "إعادة حكاية الأمان بكلماتك",
    instruction: "أعد صياغة القصة بأسلوبك للتأكيد على الشجاعة ورفض الأذى.",
    prompt: "لخص قصة اللمسة الطيبة وحق البوح:",
    skillTags: ["writing", "safety_awareness"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 3,
    answerKey: {
      answerData: {},
      modelAnswer:
        "جسدي مميز وخاص بي. عندما يحضنني والداي أشعر بالأمان، وإذا ضايقني شخص أبتعد فوراً وأصرخ 'كفّ عن هذا'، وأتحدث بصدق لوالديّ فهما حمايتي العظمى.",
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "think-and-create",
    slug: "safety-ending-rethought",
    type: "creative_ending",
    title: "نهاية أخرى ملائمة للطفل",
    instruction: "اذكر نهاية أخرى مناسبة ومطمئنة تؤكد قوة البوح والأمان.",
    prompt: "اكتب نهاية بديلة مطمئنة:",
    skillTags: ["critical_thinking"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 4,
    answerKey: {
      answerData: {},
      modelAnswer:
        "شكرت الأم طفلها على ذكائه وبوحه الشجاع، وقالت له: 'أنت بطل، نحن فخورون بك وسنحميك دائماً ولن نسمح لأحد بإزعاجك'.",
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "think-and-create",
    slug: "safety-double-endings",
    type: "creative_ending",
    title: "كتابة نهايتين مختلفتين للقصة",
    instruction: "اكتب نهايتين مختلفتين تعززان وعي الأمان والشجاعة.",
    prompt: "اكتب نهايتين مختلفتين وقصيرتين:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 5,
    answerKey: {
      answerData: {},
      modelAnswer:
        "النهاية الأولى: تصرف المعلم الموثوق بحزم ومعاقبة الشخص المزعج.\nالنهاية الثانية: تدريب زملائه على شجاعة البوح لتطهير البيئة المحيطة من أي مضايقات.",
    },
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "review-achievement",
    slug: "safety-new-word-behavior",
    type: "self_assessment",
    title: "سلوك سماع الكلمة الجديدة",
    instruction: "اختر تصرفك المعتاد عند سماع تعبير جديد يخص سلامتك.",
    prompt: "ماذا تفعل عند سماع تعبير جديد لا تفهمه تماماً في نص الحماية؟",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 1,
    options: [
      {
        optionKey: "ask",
        label: "أسأل والدي أو معلمي فوراً ليثبت المعنى الصحيح بذهني",
        displayOrder: 1,
      },
      {
        optionKey: "ignore",
        label: "أحاول تخمينه بنفسي دون التأكد من الآخرين",
        displayOrder: 2,
      },
    ],
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "review-achievement",
    slug: "safety-classroom-attention",
    type: "self_assessment",
    title: "الانتباه أثناء الشرح بالصف",
    instruction: "اختر مدى تركيزك عند تقديم المعلم لنصائح الأمان.",
    prompt: "ماذا تفعل أثناء شرح المعلم لدرس الخصوصية والأمان؟",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    displayOrder: 2,
    options: [
      {
        optionKey: "listen",
        label: "أنصت بكل جوارحي وأتجنب اللعب أو الحديث الجانبي",
        displayOrder: 1,
      },
      {
        optionKey: "interact",
        label: "أشارك بالإجابة عن الأسئلة المطروحة بوعي وشجاعة",
        displayOrder: 2,
      },
    ],
  },
  {
    journeySlug: "my-body-is-a-trust",
    stageSlug: "review-achievement",
    slug: "safety-safe-titles",
    type: "three_answers",
    title: "عناوين مناسبة لجسدي أمانة",
    instruction: "اكتب ثلاثة عناوين إبداعية مناسبة لقصة الأمان وحماية الجسد.",
    prompt: "اقترح 3 عناوين تعزز قيم الثقة بالنفس والحماية:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY", // Safest policy for Journey 3 text entries
    displayOrder: 3,
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. حدود جسدي الآمنة\n2. شجاعة البوح للأهل\n3. أنا ذكي وجسدي أمانة",
    },
  },
];

async function main() {
  console.log("Starting database seeding...");

  // 1. Seed/Upsert Journeys and Stages
  for (const journeyData of seedJourneys) {
    await prisma.$transaction(async (tx) => {
      // Upsert Journey
      const journey = await tx.journey.upsert({
        where: { slug: journeyData.slug },
        update: {
          title: journeyData.title,
          shortDescription: journeyData.shortDescription,
          themeKey: journeyData.themeKey,
          achievementTitle: journeyData.achievementTitle,
          estimatedMinutes: journeyData.estimatedMinutes,
          status: journeyData.status,
          displayOrder: journeyData.displayOrder,
        },
        create: {
          slug: journeyData.slug,
          title: journeyData.title,
          shortDescription: journeyData.shortDescription,
          themeKey: journeyData.themeKey,
          achievementTitle: journeyData.achievementTitle,
          estimatedMinutes: journeyData.estimatedMinutes,
          status: journeyData.status,
          displayOrder: journeyData.displayOrder,
        },
      });

      console.log(`Journey [${journey.slug}] upserted.`);

      // Upsert stages
      const activeStageIds: string[] = [];
      for (const stageData of journeyData.stages) {
        const stage = await tx.journeyStage.upsert({
          where: {
            journeyId_slug: {
              journeyId: journey.id,
              slug: stageData.slug,
            },
          },
          update: {
            title: stageData.title,
            shortDescription: stageData.shortDescription,
            displayOrder: stageData.displayOrder,
          },
          create: {
            journeyId: journey.id,
            slug: stageData.slug,
            title: stageData.title,
            shortDescription: stageData.shortDescription,
            displayOrder: stageData.displayOrder,
          },
        });
        activeStageIds.push(stage.id);
      }

      // Remove obsolete stages
      await tx.journeyStage.deleteMany({
        where: {
          journeyId: journey.id,
          id: { notIn: activeStageIds },
        },
      });
    });
  }

  // 2. Read manifest and seed AudioAsset records
  const manifestPath = path.resolve(
    "public/audio/approved/audio_manifest.json",
  );
  if (fs.existsSync(manifestPath)) {
    console.log("Found audio manifest. Seeding AudioAsset records...");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const key of Object.keys(manifest)) {
      const asset = manifest[key];
      await prisma.audioAsset.upsert({
        where: { assetKey: asset.assetKey },
        update: {
          provider: asset.provider,
          providerVoiceId: asset.providerVoiceId,
          locale: asset.locale,
          spokenText: asset.spokenText,
          durationSeconds: asset.durationSeconds,
          fileHash: asset.fileHash,
          generationVersion: asset.generationVersion,
          status: asset.status,
        },
        create: {
          assetKey: asset.assetKey,
          provider: asset.provider,
          providerVoiceId: asset.providerVoiceId,
          locale: asset.locale,
          spokenText: asset.spokenText,
          durationSeconds: asset.durationSeconds,
          fileHash: asset.fileHash,
          generationVersion: asset.generationVersion,
          status: asset.status,
        },
      });
      console.log(`AudioAsset [${asset.assetKey}] seeded.`);
    }
  } else {
    console.warn("Audio manifest not found. Skipping AudioAsset seeding.");
  }

  // Fetch all journeys and stages for fast reference
  const allJourneys = await prisma.journey.findMany({
    include: { stages: true },
  });
  const audioAssets = await prisma.audioAsset.findMany();

  const journeyMap = new Map(allJourneys.map((j) => [j.slug, j]));
  const audioMap = new Map(audioAssets.map((a) => [a.assetKey, a]));

  console.log(`Seeding ${seedActivities.length} activities...`);

  // 3. Seed/Upsert Activities
  for (const act of seedActivities) {
    const journey = journeyMap.get(act.journeySlug);
    if (!journey) {
      throw new Error(`Journey [${act.journeySlug}] not found during seeding.`);
    }
    const stage = journey.stages.find((s) => s.slug === act.stageSlug);
    if (!stage) {
      throw new Error(
        `Stage [${act.stageSlug}] not found in Journey [${act.journeySlug}] during seeding.`,
      );
    }

    const audioAsset = act.audioAssetKey
      ? audioMap.get(act.audioAssetKey)
      : null;

    // Use transaction for activity + options + answerKey upsert
    await prisma.$transaction(async (tx) => {
      // Upsert Activity
      const activity = await tx.activity.upsert({
        where: {
          journeyId_slug: {
            journeyId: journey.id,
            slug: act.slug,
          },
        },
        update: {
          stageId: stage.id,
          type: act.type,
          title: act.title,
          instruction: act.instruction,
          prompt: act.prompt || null,
          skillTags: act.skillTags,
          isGraded: act.isGraded,
          isSensitive: act.isSensitive,
          storagePolicy: act.storagePolicy,
          audioAssetId: audioAsset ? audioAsset.id : null,
          configuration: act.configuration ?? undefined,
          displayOrder: act.displayOrder,
        },
        create: {
          journeyId: journey.id,
          stageId: stage.id,
          slug: act.slug,
          type: act.type,
          title: act.title,
          instruction: act.instruction,
          prompt: act.prompt || null,
          skillTags: act.skillTags,
          isGraded: act.isGraded,
          isSensitive: act.isSensitive,
          storagePolicy: act.storagePolicy,
          audioAssetId: audioAsset ? audioAsset.id : null,
          configuration: act.configuration ?? undefined,
          displayOrder: act.displayOrder,
        },
      });

      // Upsert Options
      if (act.options && act.options.length > 0) {
        const activeOptionKeys: string[] = [];
        for (const opt of act.options) {
          await tx.activityOption.upsert({
            where: {
              activityId_optionKey: {
                activityId: activity.id,
                optionKey: opt.optionKey,
              },
            },
            update: {
              label: opt.label,
              secondaryText: opt.secondaryText || null,
              displayOrder: opt.displayOrder,
            },
            create: {
              activityId: activity.id,
              optionKey: opt.optionKey,
              label: opt.label,
              secondaryText: opt.secondaryText || null,
              displayOrder: opt.displayOrder,
            },
          });
          activeOptionKeys.push(opt.optionKey);
        }

        // Clean obsolete options
        await tx.activityOption.deleteMany({
          where: {
            activityId: activity.id,
            optionKey: { notIn: activeOptionKeys },
          },
        });
      } else {
        await tx.activityOption.deleteMany({
          where: { activityId: activity.id },
        });
      }

      // Upsert Answer Key
      if (act.answerKey) {
        await tx.activityAnswerKey.upsert({
          where: { activityId: activity.id },
          update: {
            answerData: act.answerKey.answerData,
            acceptedAlternatives:
              act.answerKey.acceptedAlternatives ?? undefined,
            modelAnswer: act.answerKey.modelAnswer ?? undefined,
            explanation: act.answerKey.explanation ?? undefined,
          },
          create: {
            activityId: activity.id,
            answerData: act.answerKey.answerData,
            acceptedAlternatives:
              act.answerKey.acceptedAlternatives ?? undefined,
            modelAnswer: act.answerKey.modelAnswer ?? undefined,
            explanation: act.answerKey.explanation ?? undefined,
          },
        });
      } else {
        await tx.activityAnswerKey.deleteMany({
          where: { activityId: activity.id },
        });
      }
    });
  }

  // Clean up any activities that were NOT seeded but exist in DB for these journeys
  const seededSlugs = seedActivities.map((sa) => sa.slug);
  await prisma.activity.deleteMany({
    where: {
      slug: { notIn: seededSlugs },
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
