import { workbookActivityInventory } from "./workbook-activity-inventory";
import { z } from "zod";

// Zod validation schemas for seeder data integrity
export const SeederActivitySchema = z.object({
  sourceItemKey: z.string(),
  journeySlug: z.string(),
  stageSlug: z.string(),
  slug: z.string(),
  type: z.string(),
  title: z.string(),
  instruction: z.string(),
  prompt: z.string().nullable().optional(),
  skillTags: z.array(z.string()),
  isGraded: z.boolean(),
  isSensitive: z.boolean(),
  storagePolicy: z.enum([
    "FULL_RESPONSE",
    "OBJECTIVE_RESULT_ONLY",
    "COMPLETION_ONLY",
    "NO_PERSISTENCE",
  ]),
  correctFeedback: z.string().nullable().optional(),
  incorrectFeedback: z.string().nullable().optional(),
  completionFeedback: z.string().nullable().optional(),
  instructionNarrationKey: z.string().nullable().optional(),
  promptNarrationKey: z.string().nullable().optional(),
  correctFeedbackNarrationKey: z.string().nullable().optional(),
  incorrectFeedbackNarrationKey: z.string().nullable().optional(),
  completionFeedbackNarrationKey: z.string().nullable().optional(),
  options: z
    .array(
      z.object({
        optionKey: z.string(),
        label: z.string(),
        secondaryText: z.string().nullable().optional(),
        displayOrder: z.number(),
        narrationKey: z.string().nullable().optional(),
      }),
    )
    .optional(),
  answerKey: z
    .object({
      answerData: z.any(),
      acceptedAlternatives: z.any().nullable().optional(),
      modelAnswer: z.string().nullable().optional(),
      explanation: z.string().nullable().optional(),
    })
    .optional(),
});

export type SeederActivity = z.infer<typeof SeederActivitySchema>;

// Seed content definition for all 77 activities mapped to workbook
const seedDefinitions: Record<
  string,
  Omit<SeederActivity, "sourceItemKey" | "journeySlug" | "stageSlug">
> = {
  // ==========================================
  // JOURNEY 1 (j1-01 to j1-22)
  // ==========================================
  "j1-01": {
    slug: "titles-generation",
    type: "three_answers",
    title: "اقتراح عناوين مناسبة للخبر",
    instruction: "اكتب ثلاثة عناوين جديدة مناسبة للخبر المسموع.",
    prompt: "اقترح 3 عناوين تعبر عن دور الكاتب والمعلم المصري القديم:",
    skillTags: ["listening_comprehension", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. مكانة المعلم في مصر القديمة\n2. الكاتب المصري ودوره في نشر العلم\n3. أوراق البردي وسر الكتابة",
    },
  },
  "j1-02": {
    slug: "student-questions",
    type: "three_answers",
    title: "أسئلة تود طرحها حول الاكتشاف",
    instruction: "دون ثلاثة أسئلة تتمنى أن تسألها عند سماع النص.",
    prompt: "اكتب 3 أسئلة تثير فضولك حول مقبرة الكاتب المصري القديم:",
    skillTags: ["questioning_skills", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. كيف تم العثور على المقبرة؟\n2. ما هي الأدوات التي دفنت معه؟\n3. كيف كان يعلم الكاتب طلابه؟",
    },
  },
  "j1-03": {
    slug: "main-idea-choice",
    type: "single_choice",
    title: "الفكرة الرئيسة للخبر المسموع",
    instruction: "اختر الفكرة الرئيسة للخبر المسموع.",
    prompt: "ما هي الفكرة الرئيسة التي يدور حولها الخبر؟",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
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
        "يركز النص على دور الكاتب في نشر العلم واحترامه الشديد في المجتمع المصري القديم.",
    },
  },
  "j1-04": {
    slug: "event-meaning-matching",
    type: "matching",
    title: "مطابقة الأحداث بمعانيها",
    instruction: "صل بين الحدث ومعناه الصحيح.",
    prompt: "طابق الحدث مع المعنى المعبر عنه:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
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
  "j1-05": {
    slug: "character-event-identification",
    type: "matching",
    title: "تحديد الشخصية والحدث الأهم",
    instruction: "صل بين العنصر وتوصيفه المناسب.",
    prompt: "طابق العناصر بالتعريف الأنسب:",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
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
  "j1-06": {
    slug: "character-event-identification-ref",
    type: "short_text",
    title: "أهم حدث في النص",
    instruction: "تم دمج هذا النشاط مع نشاط الشخصية الأهم.",
    prompt: "هذا النشاط مدمج مع النشاط السابق لتقديم أفضل تجربة لعبة مطابقة.",
    skillTags: ["reading_comprehension"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer: "راجع النشاط السابق لمطابقة الشخصية والحدث.",
    },
  },
  "j1-07": {
    slug: "tomb-location",
    type: "single_choice",
    title: "مكان العثور على مقبرة الكاتب",
    instruction: "أين عُثر على مقبرة الكاتب؟",
    prompt: "حدد مكان المقبرة التاريخية التي عثر عليها العلماء:",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      { optionKey: "loc1", label: "في مقابر العلماء بسقارة", displayOrder: 1 },
      {
        optionKey: "loc2",
        label: "في مقابر وادي الملوك بالأقصر",
        displayOrder: 2,
      },
      { optionKey: "loc3", label: "بجوار أهرامات الجيزة", displayOrder: 3 },
    ],
    answerKey: {
      answerData: { correctOption: "loc1" },
      explanation:
        "تم العثور على مقبرة الكاتب المصري القديم في جبورة مقابر العلماء بمنطقة سقارة الأثرية.",
    },
  },
  "j1-08": {
    slug: "tomb-importance",
    type: "single_choice",
    title: "سبب أهمية المقبرة المكتشفة",
    instruction: "لماذا كانت المقبرة مهمة؟",
    prompt: "ما الذي جعل هذا الاكتشاف الأثري فريداً ومهماً للغاية؟",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      {
        optionKey: "imp1",
        label: "لأنها تخص كاتب قديم مدفون مع أدوات كتابته الخشبية وبرديات",
        displayOrder: 1,
      },
      {
        optionKey: "imp2",
        label: "لأنها تحتوي على كميات هائلة من الذهب والكنوز الملكية",
        displayOrder: 2,
      },
      {
        optionKey: "imp3",
        label: "لأنها تثبت أسرار بناء الأهرامات الثلاثة بالتفصيل",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "imp1" },
      explanation:
        "الأهمية تكمن في العثور على أدوات الكتابة الخشبية والبرديات التي توثق دور التعليم والكاتب.",
    },
  },
  "j1-09": {
    slug: "teacher-status-discovery",
    type: "single_choice",
    title: "دلالة الاكتشاف على مكانة المعلم",
    instruction: "ماذا يدل الاكتشاف على مكانة المعلم؟",
    prompt: "بماذا يوحي دفن أدوات الكتابة مع الكاتب في مقبرته؟",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      {
        optionKey: "st1",
        label: "يدل على التقدير الهائل والاحترام للتعليم والمعلم بمصر القديمة",
        displayOrder: 1,
      },
      {
        optionKey: "st2",
        label: "يدل على أن التعليم كان يقتصر فقط على الكهنة والملوك",
        displayOrder: 2,
      },
      {
        optionKey: "st3",
        label: "يدل على رغبة الكاتب في مواصلة الدراسة بمفرده",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "st1" },
      explanation:
        "تزيين جدران المقبرة ودفن أدوات الكتابة مع الكاتب يعكسان الهيبة والتقدير الكبير للتعليم قديماً.",
    },
  },
  "j1-10": {
    slug: "discovery-results",
    type: "three_answers",
    title: "نتائج اكتشاف مقبرة الكاتب",
    instruction: "استخرج نتيجتين ترتبتا على هذا الاكتشاف.",
    prompt: "اكتب نتيجتين تاريخيتين أو علميتين ترتبتا على العثور على المقبرة:",
    skillTags: ["critical_thinking"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. معرفة أدوات الكتابة المستخدمة (الخشب والريش والبردي).\n2. إثبات مدى هيبة ومكانة المعلم والعلماء في مصر القديمة.",
    },
  },
  "j1-11": {
    slug: "best-title-choice",
    type: "single_choice",
    title: "اختيار العنوان الأنسب للنص المسموع",
    instruction: "أختر العنوان الأنسب للنص المسموع.",
    prompt: "ما هو العنوان الأكثر دقة وشمولاً للنص الذي استمعت إليه؟",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
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
        "يدور النص حول مكانة المعلم وتأثيره التاريخي في بناء الحضارة المصرية القديمة.",
    },
  },
  "j1-12": {
    slug: "main-idea-choice-ref",
    type: "short_text",
    title: "اختيار الفكرة الرئيسة",
    instruction: "تم دمج هذا النشاط مع نشاط الفكرة الرئيسة للخبر.",
    prompt:
      "هذا النشاط مكرر ومدمج مع الفكرة الرئيسة للخبر لعدم التكرار اللفظي.",
    skillTags: ["reading_comprehension"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer: "راجع نشاط الفكرة الرئيسة للخبر المسموع.",
    },
  },
  "j1-13": {
    slug: "synonym-matching",
    type: "matching",
    title: "مترادفات الكلمات من النص",
    instruction: "صل كل كلمة بمرادفها الصحيح.",
    prompt: "طابق الكلمات مع معانيها المترادفة الواردة بالنص المسموع:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      { optionKey: "word1", label: "عالم", displayOrder: 1 },
      { optionKey: "word2", label: "مقبرة", displayOrder: 2 },
      { optionKey: "word3", label: "مهنة", displayOrder: 3 },
      { optionKey: "mean1", label: "باحث", displayOrder: 4 },
      { optionKey: "mean2", label: "مدفن", displayOrder: 5 },
      { optionKey: "mean3", label: "حرفة", displayOrder: 6 },
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
  "j1-14": {
    slug: "antonyms-detailed",
    type: "matching",
    title: "مضاد الكلمات من النص",
    instruction: "صل الكلمة بضدها الصحيح.",
    prompt: "طابق الكلمات التالية مع أضدادها المعاكسة في المعنى:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      { optionKey: "w1", label: "القديم", displayOrder: 1 },
      { optionKey: "w2", label: "العلم", displayOrder: 2 },
      { optionKey: "w3", label: "البداية", displayOrder: 3 },
      { optionKey: "w4", label: "احترام", displayOrder: 4 },
      { optionKey: "w5", label: "تقدير", displayOrder: 5 },
      { optionKey: "w6", label: "عالِم", displayOrder: 6 },
      { optionKey: "ant1", label: "الحديث", displayOrder: 7 },
      { optionKey: "ant2", label: "الجهل", displayOrder: 8 },
      { optionKey: "ant3", label: "النهاية", displayOrder: 9 },
      { optionKey: "ant4", label: "ازدراء", displayOrder: 10 },
      { optionKey: "ant5", label: "إهمال", displayOrder: 11 },
      { optionKey: "ant6", label: "جاهل", displayOrder: 12 },
    ],
    answerKey: {
      answerData: {
        pairs: {
          w1: "ant1",
          w2: "ant2",
          w3: "ant3",
          w4: "ant4",
          w5: "ant5",
          w6: "ant6",
        },
      },
    },
  },
  "j1-15": {
    slug: "event-ordering",
    type: "ordering",
    title: "ترتيب أحداث الخبر (المجموعة أ)",
    instruction: "رتب الأحداث التالية حسب تسلسلها في الخبر.",
    prompt: "رتب الجمل التالية زمنياً:",
    skillTags: ["sequencing", "listening"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      {
        optionKey: "evt1",
        label: "بدأ المتحف المصري مشروع تطوير القاعة",
        displayOrder: 1,
      },
      { optionKey: "evt2", label: "عرض المتحف دور المعلم", displayOrder: 2 },
      {
        optionKey: "evt3",
        label: "استخدم المعلم القديم البردية",
        displayOrder: 3,
      },
      { optionKey: "evt4", label: "أعجب الزوار بالعرض", displayOrder: 4 },
    ],
    answerKey: {
      answerData: {
        order: ["evt1", "evt2", "evt3", "evt4"],
      },
    },
  },
  "j1-16": {
    slug: "event-ordering-b",
    type: "ordering",
    title: "ترتيب أحداث الكاتب (المجموعة ب)",
    instruction: "رتب الأحداث التالية حسب تسلسلها المنطقي والتاريخي.",
    prompt: "رتب مراحل حياة وتأثير الكاتب المصري القديم:",
    skillTags: ["sequencing", "listening"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      { optionKey: "b1", label: "وجود الكاتب في المجتمع", displayOrder: 1 },
      { optionKey: "b2", label: "وفاته ودفنه", displayOrder: 2 },
      { optionKey: "b3", label: "اكتشاف المقبرة", displayOrder: 3 },
      { optionKey: "b4", label: "معرفة أهميته", displayOrder: 4 },
    ],
    answerKey: {
      answerData: {
        order: ["b1", "b2", "b3", "b4"],
      },
    },
  },
  "j1-17": {
    slug: "what-if-reflection",
    type: "long_text",
    title: "تأمل: ماذا لو لم يكتشف القبر؟",
    instruction: "ماذا لو لم تُكتشف مقبرة الكاتب المصري القديم؟",
    prompt:
      "عبر بأسلوبك عن رأيك في مدى أهمية هذا الاكتشاف المعرفي والتاريخي لبلدنا الحبيب:",
    skillTags: ["critical_thinking", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "لما عرفنا مكانة الكاتب العظيمة في المجتمع المصري القديم، ولضاع جزء كبير من تاريخ توثيق التعليم وأدوات الكتابة ونشأة العلوم على ورق البردي.",
    },
  },
  "j1-18": {
    slug: "arabic-feelings-j1",
    type: "self_assessment",
    title: "شعوري قبل حصة اللغة العربية",
    instruction: "ما شعورك قبل حصة اللغة العربية؟",
    prompt: "اختر ما يعبر بصدق عن مشاعرك الداخلية قبل بدء الدرس:",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "happy",
        label: "أشعر بالحماس والرغبة في المعرفة والاستكشاف",
        displayOrder: 1,
      },
      {
        optionKey: "neutral",
        label: "أشعر بالهدوء والتركيز المعتاد",
        displayOrder: 2,
      },
      {
        optionKey: "calm",
        label: "أشعر بالسكينة وأتطلع للقصة والمشاريع الجديدة",
        displayOrder: 3,
      },
    ],
  },
  "j1-19": {
    slug: "arabic-self-assessment",
    type: "self_assessment",
    title: "قراءة اللغة العربية خارج المدرسة",
    instruction: "هل تقرأ العربية خارج المدرسة؟",
    prompt: "حدد مدى اهتمامك بقراءة كتب أو قصص أو تصفح مواقع بالعربية:",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "happy",
        label: "أشعر بالسعادة والشغف وأقرا باستمرار",
        displayOrder: 1,
      },
      {
        optionKey: "neutral",
        label: "أشعر بالهدوء والاعتياد وأقرأ عند الضرورة",
        displayOrder: 2,
      },
      {
        optionKey: "bored",
        label: "أشعر بالملل أحياناً وأحاول التحسن",
        displayOrder: 3,
      },
    ],
  },
  "j1-20": {
    slug: "mental-visualization",
    type: "self_assessment",
    title: "تخيل المشاهد أثناء الاستماع",
    instruction: "هل تتخيل المشاهد أثناء الاستماع؟",
    prompt: "اختر ما يصف سلوكك الذهني عند الاستماع للخبر المسموع:",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "vis1",
        label: "نعم، أرسم صوراً ملونة للمشاهد والشخصيات في مخيلتي",
        displayOrder: 1,
      },
      {
        optionKey: "vis2",
        label: "أحياناً أتخيل التفاصيل الهامة فقط",
        displayOrder: 2,
      },
      {
        optionKey: "vis3",
        label: "أركز على الكلمات والعبارات ولا أتخيل صوراً",
        displayOrder: 3,
      },
    ],
  },
  "j1-21": {
    slug: "new-words-usage",
    type: "self_assessment",
    title: "استخدام كلمات عربية جديدة",
    instruction: "هل تستخدم كلمات عربية جديدة في حياتك اليومية؟",
    prompt: "اختر مدى حرصك على تطبيق المفردات الجديدة التي تكتشفها في حديثك:",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "use_yes",
        label: "نعم، أحب استخدام الكلمات الفصيحة أمام والدي وزملائي",
        displayOrder: 1,
      },
      {
        optionKey: "use_try",
        label: "أحاول استخدامها عندما تكون مناسبة للموضوع",
        displayOrder: 2,
      },
      {
        optionKey: "use_no",
        label: "أنسى الكلمات الجديدة سريعاً ولا أستخدمها",
        displayOrder: 3,
      },
    ],
  },
  "j1-22": {
    slug: "classroom-attention",
    type: "self_assessment",
    title: "التصرف أثناء شرح المعلم",
    instruction: "كيف تتصرف أثناء شرح المعلم؟",
    prompt: "ما هو الخيار الذي يصف بصدق سلوكك الصفي عند شرح دروس العربية؟",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "att1",
        label: "أنصت بكل جوارحي وأدون التلاحظات الهامة",
        displayOrder: 1,
      },
      {
        optionKey: "att2",
        label: "أشارك بفعالية في الإجابة عن التحديات الموجهة",
        displayOrder: 2,
      },
      {
        optionKey: "att3",
        label: "قد أتشتت أحياناً ولكني سرعان ما أعود للانتباه",
        displayOrder: 3,
      },
    ],
  },

  // ==========================================
  // JOURNEY 2 (j2-23 to j2-53)
  // ==========================================
  "j2-23": {
    slug: "yacoub-story-titles",
    type: "three_answers",
    title: "عناوين مقترحة لحكاية مجدي يعقوب",
    instruction: "اكتب ثلاثة عناوين مناسبة لحكاية مجدي يعقوب.",
    prompt: "اقترح 3 عناوين تعبر عن الطبيب الإنساني ورحلة عطائه:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. زارع الأمل بأسوان\n2. طبيب القلوب الرحيم\n3. رحلة العطاء والعودة للوطن",
    },
  },
  "j2-24": {
    slug: "yacoub-title-prediction",
    type: "short_text",
    title: "توقع عنوان القصة",
    instruction: "ماذا تتوقع أن يكون عنوان للنص المسموع؟",
    prompt: "اكتب توقعك الخاص عن موضوع القصة قبل سماعها بالكامل:",
    skillTags: ["prediction"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "أتوقع أنها قصة طبيب عظيم يضحي بوقته وماله لعلاج قلوب المرضى والفقراء بالمجان.",
    },
  },
  "j2-25": {
    slug: "yacoub-interview-questions",
    type: "three_answers",
    title: "أسئلة تود طرحها في مقابلة",
    instruction: "اكتب ثلاثة أسئلة تود طرحها على د. مجدي يعقوب.",
    prompt:
      "لو أتيحت لك فرصة إجراء مقابلة مع طبيب القلوب، ما هي أسئلتك الثلاثة؟",
    skillTags: ["questioning_skills"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. ما الذي جعلك تختار جراحة القلب بالذات؟\n2. كيف تشعر بعد نجاح عملية معقدة لطفل صغير؟\n3. بم تنصح الأطفال الذين يتمنون أن يكونوا أطباء؟",
    },
  },
  "j2-26": {
    slug: "yacoub-stages-ordering",
    type: "ordering",
    title: "ترتيب مراحل مسيرة الطبيب",
    instruction: "رتب الأحداث التالية حسب ورودها وسياقها في القصة.",
    prompt: "رتب مسيرة عطاء الطبيب مجدي يعقوب:",
    skillTags: ["sequencing", "listening"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      { optionKey: "st1", label: "سفر مجدي يعقوب للخارج", displayOrder: 1 },
      { optionKey: "st2", label: "اكتسابه الخبرة العالمية", displayOrder: 2 },
      { optionKey: "st3", label: "عودته إلى وطنه العزيز مصر", displayOrder: 3 },
      {
        optionKey: "st4",
        label: "إنشاء مركز القلب بأسوان لعلاج الأطفال بالمجان",
        displayOrder: 4,
      },
    ],
    answerKey: {
      answerData: {
        order: ["st1", "st2", "st3", "st4"],
      },
    },
  },
  "j2-27": {
    slug: "yacoub-life-ordering",
    type: "ordering",
    title: "ترتيب مراحل حياة الطبيب",
    instruction: "رتب مراحل حياة الدكتور مجدي يعقوب.",
    prompt: "رتب التطور التاريخي لمسيرة الطبيب مجدي يعقوب:",
    skillTags: ["sequencing", "listening"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      {
        optionKey: "mil1",
        label: "نشأة مجدي يعقوب ببلده مصر",
        displayOrder: 1,
      },
      {
        optionKey: "mil2",
        label: "حبه الشديد لمهنة الطب وتفوقه الدراسي",
        displayOrder: 2,
      },
      {
        optionKey: "mil3",
        label: "رحلته العلمية والمهنية الطويلة في بريطانيا",
        displayOrder: 3,
      },
      {
        optionKey: "mil4",
        label: "جهوده الإنسانية لإنقاذ حياة المرضى الفقراء",
        displayOrder: 4,
      },
      {
        optionKey: "mil5",
        label: "أثره الباقي وتكريمه العالمي والوطني",
        displayOrder: 5,
      },
    ],
    answerKey: {
      answerData: {
        order: ["mil1", "mil2", "mil3", "mil4", "mil5"],
      },
    },
  },
  "j2-28": {
    slug: "yacoub-return-year",
    type: "fill_in_the_blank",
    title: "عام عودة د. مجدي يعقوب",
    instruction: "أكمل: عاد د. مجدي يعقوب إلى مصر في عام.",
    prompt: "عاد الدكتور مجدي يعقوب إلى مصر في عام [blank1] لخدمة أهالي وطنه.",
    skillTags: ["listening_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {
        blank1: ["2009"],
      },
      explanation:
        "عاد د. مجدي يعقوب إلى مصر وأسس مركز أسوان للقلب في عام 2009.",
    },
  },
  "j2-29": {
    slug: "yacoub-target-community",
    type: "fill_in_the_blank",
    title: "المجتمع المستهدف بالمركز",
    instruction: "أكمل: أُنشئ مركز القلب لخدمة.",
    prompt:
      "أُنشئ مركز جراحة القلب في مدينة أسوان لخدمة [blank1] والفقراء بالمجان.",
    skillTags: ["listening_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {
        blank1: ["اهالي الصعيد", "أهالي الصعيد", "الصعيد"],
      },
      explanation:
        "اختار الدكتور مجدي يعقوب أسوان تحديداً لخدمة أهالي الصعيد نظراً لقلة الخدمات الطبية الصعبة هناك قديماً.",
    },
  },
  "j2-30": {
    slug: "yacoub-surgeon-calmness",
    type: "single_choice",
    title: "صفة الجراح الناجح والهدوء",
    instruction: "اختر صفة الجراح الهادئ كما يراها د. مجدي.",
    prompt:
      "لماذا يرى د. مجدي يعقوب أن الجراح الهادئ يكون أقدر على تحقيق النجاح؟",
    skillTags: ["listening_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      {
        optionKey: "ans1",
        label:
          "لأن الهدوء يمنحه القدرة على التفكير بتركيز وتجنب الأخطاء الطبية",
        displayOrder: 1,
      },
      {
        optionKey: "ans2",
        label: "لأنه يجعله سريع الحركة للانتهاء من العمليات سريعاً",
        displayOrder: 2,
      },
      {
        optionKey: "ans3",
        label: "لأنه يمنع المرضى والزملاء في الغرفة من القلق",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "ans1" },
      explanation:
        "الهدوء في العمليات الجراحية الدقيقة يسمح بالتركيز والتفكير الواعي واتخاذ القرارات السليمة.",
    },
  },
  "j2-31": {
    slug: "yacoub-alternative-solution",
    type: "single_choice",
    title: "الحلول البديلة لخدمة أهالي أسوان",
    instruction: "اختر حلًا بديلًا مقترحًا لخدمة أهالي الصعيد.",
    prompt:
      "ما هو الحل البديل المناسب إذا لم تتوفر إمكانية السفر للقاهرة لمرضى القلب الصغار؟",
    skillTags: ["critical_thinking"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      {
        optionKey: "sol1",
        label: "تدريب أطباء محليين وتسيير قوافل طبية متخصصة ومجهزة للصعيد",
        displayOrder: 1,
      },
      {
        optionKey: "sol2",
        label: "إرسال جميع الأطفال المرضى للعلاج خارج جمهورية مصر العربية",
        displayOrder: 2,
      },
      {
        optionKey: "sol3",
        label: "الاعتماد بالكامل على المستشفيات الخاصة بالمدن الكبرى",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "sol1" },
      explanation:
        "تدريب الكوادر المحلية وتجهيز قوافل طبية متنقلة هي أفضل الحلول المستدامة والبديلة.",
    },
  },
  "j2-32": {
    slug: "yacoub-arabic-practical-use",
    type: "single_choice",
    title: "الفائدة العملية للغة العربية",
    instruction: "اختر الفائدة العملية للغة العربية المذكورة بالعبارات.",
    prompt: "كيف تسهم مهارات اللغة العربية الفصحى في مسيرة الطبيب البطل؟",
    skillTags: ["reading_comprehension"],
    isGraded: true,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    options: [
      {
        optionKey: "use1",
        label:
          "تساعد في الفهم الدقيق للمفاهيم الطبية والبحثية والتواصل الإنساني ببلده",
        displayOrder: 1,
      },
      {
        optionKey: "use2",
        label: "تقتصر فقط على قراءة الكتب والقصص الخيالية القديمة",
        displayOrder: 2,
      },
      {
        optionKey: "use3",
        label: "تحسن من مهارات كتابة التقارير والخط العربي التجميلي",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "use1" },
      explanation:
        "الفهم الدقيق والتواصل الإنساني بلغة المريض الفصحى هما أساس العلاج الناجح والبحث العلمي المحلي.",
    },
  },
  "j2-33": {
    slug: "yacoub-problem-solutions",
    type: "problem_solution",
    title: "تحديد مشكلة واقتراح حلين",
    instruction: "حدد مشكلة من النص واقترح حلين لها.",
    prompt:
      "المشكلة: بعد مركز القلب بأسوان عن العاصمة وصعوبة سفر المرضى الفقراء.",
    skillTags: ["problem_solving", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "الحل 1: بناء مركز محلي متخصص متكامل في أسوان (كما فعل الطبيب).\nالحل 2: توفير قوافل طبية متنقلة مجهزة لفحص الحالات وتحديد الدعم.",
    },
  },
  "j2-34": {
    slug: "yacoub-character-opinion",
    type: "long_text",
    title: "رأيك في الطبيب وهل تراه قدوة",
    instruction: "ما رأيك في شخصية الطبيب مجدي يعقوب وهل تراه قدوة؟ ولماذا؟",
    prompt: "عبر بصدق عن تقييمك لشخصية ملك القلوب ودوره الوطني والإنساني:",
    skillTags: ["value_judgment", "writing"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "هو قدوة عظيمة لأنه جسد معاني الرحمة والعطاء والتواضع، وآثر خدمة وطنه بالمجان على الشهرة الفردية بالخارج.",
    },
  },
  "j2-35": {
    slug: "yacoub-character-opinion-ref",
    type: "short_text",
    title: "القدوة والصفات الإنسانية",
    instruction: "تم دمج هذا النشاط مع رأيك في شخصية الطبيب.",
    prompt:
      "هذا النشاط مدمج مع رأيك في شخصية الطبيب مجدي يعقوب لتقديم أفضل إجابة تأملية متكاملة.",
    skillTags: ["value_judgment"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer: "راجع النشاط السابق لمطالعة وتدبر دور القدوة الحسنة.",
    },
  },
  "j2-36": {
    slug: "yacoub-funding-alternatives",
    type: "long_text",
    title: "حلول بديلة في غياب التمويل",
    instruction: "اقترح حلولًا بديلة في حال عدم توفر تمويل للمركز.",
    prompt:
      "لو لم تتوافر الإمكانات لإنشاء مركز جراحات قلب كبير ثابت بأسوان، كيف يمكن مساعدة الأطفال المرضى؟",
    skillTags: ["problem_solving"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "يمكن تسيير عيادات فحص متنقلة بالتطوع، أو التنسيق لإجراء العمليات الصعبة في أقسام القلب بالمستشفيات الجامعية القريبة.",
    },
  },
  "j2-37": {
    slug: "yacoub-story-retell",
    type: "retell_story",
    title: "تلخيص سيرة ملك القلوب بأسلوبك",
    instruction: "لخص قصة الدكتور مجدي يعقوب بأسلوبك.",
    prompt: "أعد كتابة سيرة الدكتور كقصة قصيرة تعبر عن العطاء وحب الوطن:",
    skillTags: ["writing", "story_telling"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "طبيب مصري نشأ محباً لخدمة الناس، تفوق وسافر لبريطانيا ونال الشهرة العالمية، ثم عاد ليبني مركز قلب مجاني للأطفال والفقراء في أسوان ليرسم البسمة على وجوههم.",
    },
  },
  "j2-38": {
    slug: "yacoub-insist-reason-open",
    type: "long_text",
    title: "سبب إصرار الطبيب على المركز",
    instruction: "لماذا صمم الطبيب على إنشاء المركز؟",
    prompt:
      "اشرح بأسلوبك الدوافع الإنسانية والوطنية وراء تمسك الطبيب بهذا المشروع المتميز في أسوان:",
    skillTags: ["reading_comprehension"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "أصر على إنشائه لخدمة أهل بلده ووطنه العزيز، ولأنه يرى أن من واجب كل عالم أن يعود ليفيد بلده بما تعلمه بالخارج.",
    },
  },
  "j2-39": {
    slug: "yacoub-biggest-challenge",
    type: "long_text",
    title: "عقبات واجهت الطبيب والمشروع",
    instruction: "ما العقبة الأساسية التي واجهت الطبيب؟",
    prompt:
      "ما هي التحديات أو المخاوف التي قد تواجه مبادرة وطنية ضخمة مثل تأسيس مركز القلب بالمجان؟",
    skillTags: ["reading_comprehension"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "العقبة الأساسية هي الشك في البداية من نجاح المشروع في أقصى الجنوب، وتوفير التمويل المستدام للأجهزة والعمليات بالمجان.",
    },
  },
  "j2-40": {
    slug: "yacoub-alternative-ending",
    type: "long_text",
    title: "اقتراح نهاية بديلة للقصة",
    instruction: "اقترح نهاية أخرى مناسبة ومطمئنة لقصة الطبيب مجدي يعقوب.",
    prompt:
      "اكتب نهاية بديلة تتخيلها لزيارة أحد الأطفال المتعافين للمركز بعد سنوات طويلة من العلاج:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "كبر الطفل وأصبح طبيب جراحة متميزاً في نفس المركز بأسوان، ليرد الجميل ويعالج قلوب أطفال آخرين متطوعاً ومحباً.",
    },
  },
  "j2-41": {
    slug: "yacoub-humanitarian-project",
    type: "story_builder",
    title: "تصميم مشروعك الإنساني الخاص",
    instruction: "تخيل مشروعك الإنساني وحدد المشكلة والحل والنهاية.",
    prompt:
      "اكتب خطة إبداعية لمشروع ترغب في بنائه مستقبلاً لخدمة زملائك أو مجتمعك:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "المشكلة: صعوبة القراءة لفاقدي البصر.\nالحل: تطبيق مجاني يحول الكتب لقصص مسموعة بأصوات تفاعلية.\nالنتيجة: تمكين المكفوفين من القراءة والتعلم بسهولة ونشر الثقافة.",
    },
  },
  "j2-42": {
    slug: "yacoub-different-ending",
    type: "long_text",
    title: "نهاية بديلة تعبر عن الأثر الإنساني",
    instruction: "صمم نهاية مختلفة تعبر عن انتشار فكرة العطاء في مجتمعك.",
    prompt: "تخيل تأثر زملاء الطبيب بعودته وخطواتهم اللاحقة لمساندته:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "تأثر الكثير من العلماء والأطباء المهاجرين بمسيرة مجدي يعقوب، وقرروا تأسيس مراكز تخصصية أخرى مجانية في مختلف مدن مصر الحبيبة.",
    },
  },
  "j2-43": {
    slug: "yacoub-student-problem",
    type: "problem_solution",
    title: "علاج مشكلة دراسية",
    instruction: "اقترح مشكلة دراسية وحلها على غرار النص.",
    prompt:
      "المشكلة: صعوبة فهم القواعد النحوية وكثرة الخوف من الامتحانات الدراسية.",
    skillTags: ["problem_solving"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "الحل 1: تلخيص القواعد في خرائط ذهنية ملونة وجذابة مبسطة.\nالحل 2: التدرب اليومي على حل أنشطة تفاعلية قصيرة وممتعة دون خوف.",
    },
  },
  "j2-44": {
    slug: "yacoub-new-word",
    type: "short_text",
    title: "كلمة وجملة مفيدة",
    instruction: "اختر كلمة أعجبتك وضعها في جملة مفيدة.",
    prompt:
      "اكتب كلمة فصيحة أعجبتك في نص الطبيب الإنساني وصيغها في جملة تامة التعبير:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "FULL_RESPONSE",
    answerKey: {
      answerData: {},
      modelAnswer:
        "الكلمة: 'التعاطف'. الجملة: 'التعاطف مع المرضى يهدئ من خوفهم ويساعدهم على الشفاء بسرعة'.",
    },
  },
  "j2-45": {
    slug: "yacoub-agree-disagree",
    type: "agree_disagree",
    title: "موقفي من قيم السيرة والعطاء",
    instruction: "حدد موقفك (موافق/غير موافق) من العبارات وعبر عن رأيك بصدق.",
    prompt:
      "العمل الإنساني ومساعدة المحتاجين هو أهم بكثير من نيل الشهرة والجوائز الفردية.",
    skillTags: ["value_judgment"],
    isGraded: false, // Ungraded opinion statement per instruction
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      { optionKey: "agree", label: "موافق", displayOrder: 1 },
      { optionKey: "disagree", label: "غير موافق", displayOrder: 2 },
    ],
    answerKey: {
      answerData: {},
      modelAnswer:
        "الإجابات قد تختلف، وهذه بعض الأفكار المقترحة: مساعدة المحتاجين تجلب السعادة الحقيقية الدائمة للمجتمع والنفوس.",
    },
  },
  "j2-46": {
    slug: "yacoub-agree-disagree-ref",
    type: "short_text",
    title: "موقفي من قيمة الإصرار",
    instruction: "تم دمج هذا النشاط مع قيم السيرة السابقة.",
    prompt:
      "هذا النشاط مدمج مع النشاط التقييمي السابق لتغطية قضايا الإصرار والعطاء معاً.",
    skillTags: ["value_judgment"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    answerKey: {
      answerData: {},
      modelAnswer: "راجع نشاط موافقتي على قيم السيرة والعطاء.",
    },
  },
  "j2-47": {
    slug: "yacoub-praise-assessment",
    type: "self_assessment",
    title: "الشعور عند تلقي المديح",
    instruction: "بماذا تشعر عند تلقي المديح من معلمك؟",
    prompt:
      "اختر بطاقة تعبر عن رد فعلك الداخلي عند ثناء معلم اللغة العربية عليك:",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "proud",
        label: "الفخر الشديد والرغبة في مضاعفة الاجتهاد والعمل المتميز",
        displayOrder: 1,
      },
      {
        optionKey: "happy",
        label: "السعادة العارمة والارتياح والبهجة الداخلية",
        displayOrder: 2,
      },
      {
        optionKey: "shy",
        label: "الخجل والتردد قليلاً مع الابتسام والشكر",
        displayOrder: 3,
      },
    ],
  },
  "j2-48": {
    slug: "yacoub-score-motivation",
    type: "self_assessment",
    title: "دافع التفوق في اللغة العربية",
    instruction: "اختر سبب حرصك على التفوق في اللغة العربية.",
    prompt: "ما هو المحرك الأساسي وراء رغبتك في نيل أعلى الدرجات والتقييمات؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "love",
        label: "لحبي الشديد والعميق للغة العربية وجمال ألفاظها وقصصها",
        displayOrder: 1,
      },
      {
        optionKey: "pleasing",
        label: "لإدخال الفرحة على قلوب والدي المخلصين وتقديراً لمعلمي",
        displayOrder: 2,
      },
      {
        optionKey: "competition",
        label: "لأكون دائماً في مقدمة المتفوقين علمياً ومعرفياً",
        displayOrder: 3,
      },
    ],
  },
  "j2-49": {
    slug: "yacoub-listening-behavior",
    type: "self_assessment",
    title: "سلوكيات الاستماع المتميزة",
    instruction: "أجب بصراحة عن سلوكياتك أثناء استماع المعلم أو المقطع الصوتي.",
    prompt: "ما الذي تحرص على فعله لتكون مستمعاً متميزاً للقصص والخبر المسموع؟",
    skillTags: ["listening_skills"],
    isGraded: false, // Ungraded self assessment per instruction
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "focus",
        label: "أنصت بكل حواسي وأتجنب أي تشتت جانبي",
        displayOrder: 1,
      },
      {
        optionKey: "notes",
        label: "أدون الأفكار الرائعة أو الكلمات الجديدة التي تعجبني",
        displayOrder: 2,
      },
      {
        optionKey: "distracted",
        label: "قد أنشغل أحياناً ولكني سرعان ما أستعيد التركيز",
        displayOrder: 3,
      },
    ],
  },
  "j2-50": {
    slug: "yacoub-improvement-checklist",
    type: "self_assessment",
    title: "المهارات التي تحسنت فيها",
    instruction: "حدد المهارات التي تشعر أنك تحسنت فيها باللغة العربية.",
    prompt: "اختر المهارات اللغوية التي تلاحظ تطورك الإيجابي والملحوظ فيها:",
    skillTags: ["self_evaluation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "listening",
        label: "الاستماع بتركيز وفهم أدق تفاصيل النصوص",
        displayOrder: 1,
      },
      {
        optionKey: "reading",
        label: "قراءة النصوص المتنوعة بطلاقة وسرعة ودون تعثر",
        displayOrder: 2,
      },
      {
        optionKey: "writing",
        label: "كتابة الجمل والتعبير عن آرائي وأفكاري بوضوح تام",
        displayOrder: 3,
      },
    ],
  },
  "j2-51": {
    slug: "yacoub-competitions-assessment",
    type: "self_assessment",
    title: "حبي واهتمامي بالمسابقات المدرسية",
    instruction: "لماذا تحب المشاركة في المسابقات اللغوية والثقافية؟",
    prompt: "اختر الدوافع التي تجعلك متطلعاً للأنشطة والمسابقات بصفك الدراسي:",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "learn",
        label: "لأنها تزيد من مخزوني المعرفي واللغوي بأسلوب ممتع وشيق",
        displayOrder: 1,
      },
      {
        optionKey: "team",
        label: "لأني أحب التعاون والعمل الجماعي مع زملائي الأبطال",
        displayOrder: 2,
      },
      {
        optionKey: "challenge",
        label: "لأنني أحب خوض التحديات وإثبات كفاءتي وتفوقي الصفي",
        displayOrder: 3,
      },
    ],
  },
  "j2-52": {
    slug: "yacoub-encouragement-assessment",
    type: "self_assessment",
    title: "تقييم تشجيع الأهل والمعلم",
    instruction: "قيم مدى تشجيع والديك ومعلمك وتفاعلك معهم.",
    prompt:
      "كيف تصف الدعم والتشجيع الذي تتلقاه باستمرار لمواصلة تطورك التعليمي؟",
    skillTags: ["social_support"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "superb",
        label: "تشجيع دائم وحث قوي ودعم بالجوائز ومتابعة يومية مخلصة",
        displayOrder: 1,
      },
      {
        optionKey: "good",
        label: "دعم كافٍ ومساندة ومساعدة فعالة عند التعثر أو الحاجة",
        displayOrder: 2,
      },
      {
        optionKey: "self",
        label: "أعتمد بالكامل على تحفيزي الذاتي وشغفي الخاص بالتعلم والمثابرة",
        displayOrder: 3,
      },
    ],
  },
  "j2-53": {
    slug: "yacoub-encouragement-assessment-ref",
    type: "self_assessment",
    title: "تشجيع المعلم ودعمه المعرفي",
    instruction:
      "تم دمج هذا التقييم مع تشجيع الأهل لتوفير دراسة شاملة للدعم الاجتماعي.",
    prompt:
      "هذا التقييم مدمج في النشاط السابق لتوفير نظرة متكاملة وشاملة لدعم الأسرة والمدرسة.",
    skillTags: ["social_support"],
    isGraded: false,
    isSensitive: false,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "ref_only",
        label: "طالع تفاصيل التشجيع المتكامل بالنشاط التقييمي السابق",
        displayOrder: 1,
      },
    ],
  },

  // ==========================================
  // JOURNEY 3 (j3-54 to j3-77)
  // ==========================================
  "j3-54": {
    slug: "safety-private-parts",
    type: "single_choice",
    title: "الأجزاء الخاصة جداً بأجسامنا",
    instruction: "ما الأجزاء الخاصة في أجسادنا؟",
    prompt: "ما المقصود بالأجزاء الخاصة في جسم الإنسان وفقاً لما استمعت إليه؟",
    skillTags: ["safety_awareness"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    options: [
      {
        optionKey: "opt1",
        label: "هي أجزاء مكشوفة وعادية يمكن للجميع رؤيتها ولمسها في أي وقت",
        displayOrder: 1,
      },
      {
        optionKey: "opt2",
        label:
          "أجزاء خاصة جداً ومغطاة لا يحق لأي شخص آخر أن يراها أو يلمسها مطلقاً",
        displayOrder: 2,
      },
      {
        optionKey: "opt3",
        label:
          "الملابس الرياضية التي نرتديها فقط أثناء ممارسة التمارين بالخارج",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "opt2" },
      explanation:
        "الأجزاء الخاصة هي ملك للطفل وحده ولا يجوز لأحد الاطلاع عليها أو لمسها مطلقاً لحمايته وأمانه.",
    },
  },
  "j3-55": {
    slug: "safety-privacy-meaning",
    type: "single_choice",
    title: "معنى الخصوصية بالأمان الجسدي",
    instruction: "ما المقصود بكلمة 'خصوصية' في النص؟",
    prompt: "ما معنى الخصوصية التي ركز عليها المقطع الصوتي التعليمي؟",
    skillTags: ["safety_awareness"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    options: [
      {
        optionKey: "ans1",
        label: "أن نشارك كل شيء ونلعب دون قيود أو تفكير مع الغرباء",
        displayOrder: 1,
      },
      {
        optionKey: "ans2",
        label:
          "أن يكون لكل شخص خصوصية تامة وحدود تخص جسده وممتلكاته لا يتعدى عليها غيره",
        displayOrder: 2,
      },
      {
        optionKey: "ans3",
        label: "الحديث بصوت خفيض وسرية تامة مع أي زميل بالصف",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "ans2" },
      explanation:
        "الخصوصية تعني تفرد الشخص بحدوده الجسدية والخاصة الآمنة التي يجب أن يحترمها الجميع.",
    },
  },
  "j3-56": {
    slug: "safety-abuse-action",
    type: "single_choice",
    title: "التصرف الصحيح عند التعرض للمسة مريبة",
    instruction: "ماذا يجب أن يفعل الطفل إذا تعرض للإيذاء؟",
    prompt:
      "إذا حاول شخص لمسك لمسة غير طيبة تسبب لك الضيق أو الخوف، ماذا تفعل؟",
    skillTags: ["safety_awareness"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    options: [
      {
        optionKey: "act1",
        label: "أسكت وأخفي الموضوع تماماً عن والديّ لأني أشعر بالخجل والذنب",
        displayOrder: 1,
      },
      {
        optionKey: "act2",
        label:
          "أقول بصوت قوي وواضح: 'كُفّ عن هذا!' وأبتعد فوراً وأخبر والديّ أو شخصاً موثوقاً",
        displayOrder: 2,
      },
      {
        optionKey: "act3",
        label: "أنتظر بهدوء حتى يتكرر الموقف للتأكد التام من نية الشخص",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "act2" },
      explanation:
        "البوح الفوري والشجاعة في الرفض وقول 'لا' والهرب للأهل هي الدرع الأساسي لأمان الطفل.",
    },
  },
  "j3-57": {
    slug: "safety-uncomfortable-touch",
    type: "single_choice",
    title: "رد الفعل الشجاع للمسة غير الطيبة",
    instruction: "ماذا يجب أن يفعل الطفل إذا شعر بعدم الارتياح؟",
    prompt: "الحديث عن اللمسات المزعجة وحماية جسدك هو تصرف:",
    skillTags: ["safety_awareness"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    options: [
      {
        optionKey: "res1",
        label: "خطأ يجب إخفاؤه عن الأهل لعدم التسبب في المشاكل والغضب",
        displayOrder: 1,
      },
      {
        optionKey: "res2",
        label:
          "حق طبيعي وواجب لحمايتك، والخطأ يقع بالكامل على من يحاول إيذاءك وليس عليك أبداً",
        displayOrder: 2,
      },
      {
        optionKey: "res3",
        label: "سر معيب لا يجب مناقشته مع المدرسين أو البالغين الموثوقين بالصف",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "res2" },
      explanation:
        "حماية النفس حق أصيل للطفل، والملامة تقع بالكامل على المعتدي دائماً وبلا استثناء.",
    },
  },
  "j3-58": {
    slug: "safety-title-prediction",
    type: "single_choice",
    title: "توقع قصة جسدي أمانة",
    instruction:
      "عند سماع عنوان القصة 'جسدي أمانة'، ما الفكرة الأساسية المتوقعة؟",
    prompt: "اختر ما يتبادر لذهنك مباشرة من هذا العنوان لحماية نفسك:",
    skillTags: ["prediction"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    options: [
      {
        optionKey: "pred1",
        label:
          "أن جسدي ملك لي وحدي ويجب أن أحافظ عليه سالماً آمناً وأتعلم قواعد السلامة",
        displayOrder: 1,
      },
      {
        optionKey: "pred2",
        label:
          "أن أترك حماية جسدي وتفكيري للآخرين دون بذل مجهود في الوعي والتفكير",
        displayOrder: 2,
      },
    ],
    answerKey: {
      answerData: { correctOption: "pred1" },
      explanation:
        "عنوان 'جسدي أمانة' يعزز الملكية والخصوصية الفردية وحتمية الحفاظ عليه شريفاً وآمناً.",
    },
  },
  "j3-59": {
    slug: "safety-representation-choice",
    type: "single_choice",
    title: "طريقة التعبير وتلخيص قواعد الأمان",
    instruction: "ماذا يمكنني أن أفعل بالنص المسموع لتوعية زملائي؟",
    prompt:
      "اختر أفضل مبادرة صفية متميزة تسهم بها في نشر التوعية بالأمان الجسدي:",
    skillTags: ["critical_thinking"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "OBJECTIVE_RESULT_ONLY",
    options: [
      {
        optionKey: "rep1",
        label: "رسم لوحة إرشادية جذابة تعبر عن الحدود الآمنة والخصوصية للجسد",
        displayOrder: 1,
      },
      {
        optionKey: "rep2",
        label:
          "كتابة ملخص إرشادي مبسط وإلقائه بشجاعة ووضوح في الإذاعة المدرسية",
        displayOrder: 2,
      },
      {
        optionKey: "rep3",
        label: "تجاهل مناقشة الموضوع تماماً والسكوت لعدم إزعاج الآخرين بالصف",
        displayOrder: 3,
      },
    ],
    answerKey: {
      answerData: { correctOption: "rep2" },
      explanation:
        "كتابة ملخص وإلقائه بالإذاعة المدرسية يضمن وصول رسالة الأمان لأكبر عدد من الزملاء بصورة رسمية ومنظمة.",
    },
  },
  "j3-60": {
    slug: "safety-word-bank-fill",
    type: "word_bank",
    title: "إكمال عبارات الأمان بالكلمة المناسبة",
    instruction:
      "أكمل الجمل بالكلمات المناسبة من القائمة (أمان – خصوصية - كفّ - خطأ).",
    prompt:
      "1. لكل طفل حق تام في [blank1] جسده وحمايته ورعايته بوعي.\n2. عندما يزعجك شخص بتصرف غير طيب، قل له بقوة [blank2] عن هذا الفعل.\n3. الحديث عن الضيق والبوح للموثوقين ليس [blank3] بل هو واجب لحمايتك.",
    skillTags: ["safety_awareness", "reading"],
    isGraded: true,
    isSensitive: true,
    storagePolicy: "FULL_RESPONSE",
    options: [
      { optionKey: "opt1", label: "خصوصية", displayOrder: 1 },
      { optionKey: "opt2", label: "كفّ", displayOrder: 2 },
      { optionKey: "opt3", label: "خطأ", displayOrder: 3 },
      { optionKey: "opt4", label: "أمان", displayOrder: 4 },
    ],
    answerKey: {
      answerData: {
        blank1: ["خصوصية", "أمان"],
        blank2: ["كف", "كفّ"],
        blank3: ["خطأ", "خطأً"],
      },
    },
  },
  "j3-61": {
    slug: "safety-alternative-ending",
    type: "long_text",
    title: "اقتراح نهاية مطمئنة ومسؤولة للقصة",
    instruction: "اقترح نهاية جديدة للنص تتخيلها بنفسك.",
    prompt:
      "تخيل أن طفلاً تعرض لمضايقة وباح لوالديه؛ اكتب نهاية هذه الحكاية المطمئنة وكيف تمت حمايته ومساندته بوعي:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY", // Safest policy for Journey 3 open-ended tasks
    answerKey: {
      answerData: {},
      modelAnswer:
        "باح الطفل لوالديه بشجاعة، فحضناه وطمأناه بعبارات الدعم والمحبة، وقام والده بإبلاغ إدارة المدرسة والجهات المسؤولة فوراً لحمايته وضمان أمان جميع الأطفال.",
    },
  },
  "j3-62": {
    slug: "safety-story-summary",
    type: "long_text",
    title: "تلخيص رسالة الأمان والخصوصية",
    instruction: "لخص النص بأسلوبك الخاص.",
    prompt:
      "اكتب أهم النصائح والقواعد التي خرجت بها من القصة لحماية خصوصية جسدك الصغير:",
    skillTags: ["writing", "safety_awareness"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    answerKey: {
      answerData: {},
      modelAnswer:
        "أجسادنا مميزة ولها خصوصية تامة. اللمسات الطيبة تشعرنا بالأمان، واللمسات غير الطيبة تسبب الضيق. واجبنا قول 'كُفّ' والبوح فوراً للأهل لنبقى بأمان.",
    },
  },
  "j3-63": {
    slug: "safety-story-retell",
    type: "long_text",
    title: "إعادة حكاية الأمان بكلماتك البسيطة",
    instruction: "أعِد الحكاية بطريقتك بقصة قصيرة.",
    prompt:
      "أعد صياغة القصة بأسلوبك الخاص للتأكيد على الشجاعة ورفض الأذى والبوح الدائم للأهل:",
    skillTags: ["writing", "safety_awareness"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    answerKey: {
      answerData: {},
      modelAnswer:
        "جسدي مميز وخاص بي. عندما يحضنني والداي أشعر بالأمان، وإذا ضايقني شخص أبتعد فوراً وأصرخ 'كفّ عن هذا'، وأتحدث بصدق لوالديّ فهما حمايتي العظمى.",
    },
  },
  "j3-64": {
    slug: "safety-safe-titles",
    type: "three_answers",
    title: "عناوين مناسبة لحكاية جسدي أمانة",
    instruction: "اكتب ثلاثة عناوين مناسبة لقصة 'جسدي أمانة'.",
    prompt: "اقترح 3 عناوين تعزز قيم الثقة بالنفس والحماية الفردية للأطفال:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    answerKey: {
      answerData: {},
      modelAnswer:
        "1. حدود جسدي الآمنة\n2. شجاعة البوح للأهل\n3. أنا ذكي وجسدي أمانة",
    },
  },
  "j3-65": {
    slug: "safety-title-prediction-open",
    type: "short_text",
    title: "توقع عنوان القصة التوعوية",
    instruction: "ماذا تتوقع أن يكون عنوان القصة في المرة القادمة؟",
    prompt:
      "اكتب عنواناً إبداعياً جديداً تقترحه لقصة تدور حول شجاعة قول 'لا' للغرباء والمزعجين:",
    skillTags: ["prediction"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    answerKey: {
      answerData: {},
      modelAnswer:
        "أتوقع عنواناً مثل: 'خط الدفاع الذكي' أو 'أنا شجاع وجسدي خاص'.",
    },
  },
  "j3-66": {
    slug: "safety-double-endings",
    type: "long_text",
    title: "كتابة نهايتين مختلفتين للقصة",
    instruction: "اكتبي نهايتين مختلفتين للقصة.",
    prompt:
      "اكتب نهايتين مختلفتين وقصيرتين تعززان وعي الأمان والشجاعة والبوح الدائم للأهل:",
    skillTags: ["creative_thinking"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    answerKey: {
      answerData: {},
      modelAnswer:
        "النهاية الأولى: تصرف المعلم الموثوق بحزم ومعاقبة الشخص المزعج.\nالنهاية الثانية: تدريب زملائه على شجاعة البوح لتطهير البيئة المحيطة من أي مضايقات.",
    },
  },
  "j3-67": {
    slug: "safety-word-sentence",
    type: "short_text",
    title: "جملة مفيدة عن الخصوصية والأمان",
    instruction: "اكتبي كلمة جديدة أعجبتك، ثم ضعيها في جملة.",
    prompt:
      "ضع كلمة 'خصوصية' في جملة مفيدة تؤكد فيها وعيك وحماية حدودك الجسدية الآمنة:",
    skillTags: ["vocabulary_acquisition"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    answerKey: {
      answerData: {},
      modelAnswer: "جسدي له خصوصية تامة ولا أسمح لأي غريب بتجاوز هذه الحدود.",
    },
  },
  "j3-68": {
    slug: "safety-arabic-feelings",
    type: "self_assessment",
    title: "الشعور العام تجاه الأمان والخصوصية",
    instruction: "ما هو شعورك تجاه حصة اللغة العربية والتوعية بالأمان الجسدي؟",
    prompt:
      "ما شعورك عند الحديث عن القواعد التي تحميك في منزلك والشارع والمدرسة؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "opt1",
        label: "أشعر بالأمان والطمأنينة لمعرفتي المتميزة بها",
        displayOrder: 1,
      },
      {
        optionKey: "opt2",
        label: "أشعر بالرغبة والفضول في فهم المزيد لأحمي نفسي وزملاء الصف بوعي",
        displayOrder: 2,
      },
    ],
  },
  "j3-69": {
    slug: "safety-arabic-importance",
    type: "self_assessment",
    title: "أهمية فهم حدود الجسد لحمايتنا",
    instruction:
      "ما مدى أهمية اللغة العربية وفهم الأمان الجسدي في حياتك اليومية؟",
    prompt:
      "لماذا تظن أن معرفة اللمسة الطيبة واللمسة غير الطيبة هو أمر ضروري للغاية؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "imp1",
        label: "لأحمي جسدي وأخبر والدي فوراً بأي تصرف مريب أو شخص مزعج دون خجل",
        displayOrder: 1,
      },
      {
        optionKey: "imp2",
        label:
          "لأكون واعياً وذكياً في تصرفاتي اليومية بالشارع والمدرسة ومع زملائي الأبطال",
        displayOrder: 2,
      },
    ],
  },
  "j3-70": {
    slug: "safety-arabic-excellence",
    type: "self_assessment",
    title: "كيف تحافظ على تفوقك وأمانك؟",
    instruction: "كيف تحافظ على تفوقك في اللغة العربية وأمانك الشخصي؟",
    prompt:
      "أي من هذه الممارسات تحرص على تطبيقها يومياً لتشعر بالأمان المتميز؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "ex1",
        label:
          "أتحدث مع والدي بصدق وصراحة تامة عن كل ما أواجهه خلال يومي الدراسي",
        displayOrder: 1,
      },
      {
        optionKey: "ex2",
        label:
          "أنتبه دائماً لتعليمات السلامة وأتعاون مع معلمي لحماية زملائي الأبطال بالصف",
        displayOrder: 2,
      },
    ],
  },
  "j3-71": {
    slug: "safety-new-word-behavior",
    type: "self_assessment",
    title: "سلوك سماع الكلمة الجديدة بالدرس",
    instruction: "ماذا تفعل عند سماع كلمة جديدة في النص؟",
    prompt:
      "ماذا تفعل عند سماع تعبير جديد لا تفهمه تماماً في نص الحماية والسلامة الجسدية؟",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "ask",
        label:
          "أسأل والدي أو معلمي فوراً ليثبت المعنى الصحيح بذهني وأستفيد منه بوعي",
        displayOrder: 1,
      },
      {
        optionKey: "try",
        label:
          "أحاول تخمينه بنفسي من السياق دون التأكد التام من البالغين الموثوقين",
        displayOrder: 2,
      },
    ],
  },
  "j3-72": {
    slug: "safety-classroom-attention",
    type: "self_assessment",
    title: "الانتباه والتركيز أثناء الشرح بالصف",
    instruction:
      "ماذا تفعل أثناء شرح المعلم لدروس اللغة العربية وتوجيهات الأمان؟",
    prompt:
      "اختر مدى تركيزك واهتمامك عند تقديم معلمك لنصائح وقواعد السلامة الشخصية:",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "listen",
        label:
          "أنصت بكل جوارحي وأتجنب اللعب أو الحديث الجانبي مع زملائي الأبطال بالصف",
        displayOrder: 1,
      },
      {
        optionKey: "share",
        label: "أشارك بفعالية بالإجابة عن التحديات الموجهة بشجاعة ووضوح تام",
        displayOrder: 2,
      },
    ],
  },
  "j3-73": {
    slug: "safety-final-self-checks",
    type: "self_assessment",
    title: "تقييم وعي الأمان والخصوصية الجسدية",
    instruction: "قيم اهتمامك ووعيك العام بحماية نفسك وخصوصيتك الجسدية.",
    prompt:
      "هل تشعر بالثقة في تطبيق قواعد الأمان والبوح بصدق للموثوقين بالمنزل والمدرسة؟",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "sure",
        label:
          "نعم، أستطيع حماية نفسي والبوح فوراً دون خوف لأني أثق بوالديّ الحبيبين",
        displayOrder: 1,
      },
      {
        optionKey: "help",
        label:
          "نعم، وسأطلب مساعدة بابا وماما دائماً في أي شك أو حيرة تخص سلامتي الشخصية",
        displayOrder: 2,
      },
    ],
  },
  "j3-74": {
    slug: "safety-listening-behavior-assessment",
    type: "self_assessment",
    title: "سلوك الاستماع والإنصات الصفي",
    instruction: "ضعي ✔ أمام السلوك الصحيح أثناء الاستماع.",
    prompt:
      "اختر مدى تركيزك وإنصاتك للمقطع الصوتي التعليمي لدرس الأمان والخصوصية:",
    skillTags: ["listening_skills"],
    isGraded: false, // Ungraded self assessment per instruction
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "listen_all",
        label: "أستمع بإنصات كامل وتام لرسالة الأمان وأتدبر معاني الحماية بوعي",
        displayOrder: 1,
      },
      {
        optionKey: "listen_notes",
        label:
          "أركز على الكلمات الهامة مثل الخصوصية والأمان واللمسة غير الطيبة",
        displayOrder: 2,
      },
    ],
  },
  "j3-75": {
    slug: "safety-likes-arabic-assessment",
    type: "self_assessment",
    title: "لماذا تحب حصة اللغة العربية والأمان؟",
    instruction:
      "عبر عن سبب حبك واهتمامك بهذه الدروس التوعوية الصعبة والمفيدة.",
    prompt: "ما الذي تجده أكثر إفادة وإثارة في حصص الأمان والخصوصية بالعربية؟",
    skillTags: ["motivation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "safety_first",
        label: "لأنها تعلمني كيف أكون بطلاً ذكياً أحمي حدود جسدي وأمنع إزعاجي",
        displayOrder: 1,
      },
      {
        optionKey: "arabic_beauty",
        label:
          "لأن اللغة العربية تمكنني من البوح والتعبير بوضوح عما يؤلمني ويزعجني للأهل",
        displayOrder: 2,
      },
    ],
  },
  "j3-76": {
    slug: "safety-new-words-usage-assessment",
    type: "self_assessment",
    title: "تطبيق مفردات الأمان في حديثك اليومي",
    instruction: "هل تستخدم كلمات مثل 'خصوصية' و'لمسة غير طيبة' بوعي مع الأهل؟",
    prompt: "اختر مدى حرصك على تطبيق هذه المصطلحات الهامة لوقاية نفسك بالمنزل:",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "yes_talk",
        label:
          "نعم، تحدثت مع أمي وأبي بوعي تام عن معاني الخصوصية وحدود الأمان الجسدي",
        displayOrder: 1,
      },
      {
        optionKey: "try_talk",
        label:
          "سأتحدث مع والديّ فور انتهاء الدرس لأتأكد من دائرة الثقة والأمان بالمنزل",
        displayOrder: 2,
      },
    ],
  },
  "j3-77": {
    slug: "safety-homework-habits-assessment",
    type: "self_assessment",
    title: "حل واجبات الأمان والتوعية الذاتية",
    instruction: "كيف تحل واجبات التوعية والأمان الذاتي بالمنزل؟",
    prompt: "اختر طريقتك المعتادة لحل أنشطة وقضايا السلامة الشخصية:",
    skillTags: ["self_regulation"],
    isGraded: false,
    isSensitive: true,
    storagePolicy: "COMPLETION_ONLY",
    options: [
      {
        optionKey: "with_parent",
        label:
          "أحلها مع والديّ لتكون فرصة رائعة لمناقشة حدود أماني وخصوصية جسدي الحبيب",
        displayOrder: 1,
      },
      {
        optionKey: "by_self",
        label:
          "أحلها بمفردي بوعي تام وشجاعة بناء على فهمي لنصائح معلمي المخلص بالصف",
        displayOrder: 2,
      },
    ],
  },
};

/**
 * Builds the complete list of 77 validated activities for seeding,
 * mapping structural definitions to the corresponding canonical workbook inventory item.
 */
export function buildSeedActivities(): SeederActivity[] {
  const result: SeederActivity[] = [];

  // Verify that all 77 inventory items are mapped without duplicates
  const inventoryKeys = new Set(
    workbookActivityInventory.map((i) => i.sourceItemKey),
  );
  const seedKeys = new Set(Object.keys(seedDefinitions));

  // 1. Check for unmapped inventory items
  const unmapped: string[] = [];
  for (const key of inventoryKeys) {
    if (!seedKeys.has(key)) {
      unmapped.push(key);
    }
  }
  if (unmapped.length > 0) {
    throw new Error(
      `Inventory items missing seed definitions: ${unmapped.join(", ")}`,
    );
  }

  // 2. Check for extra seed definitions not in inventory
  const extra: string[] = [];
  for (const key of seedKeys) {
    if (!inventoryKeys.has(key)) {
      extra.push(key);
    }
  }
  if (extra.length > 0) {
    throw new Error(
      `Seed definitions with no matching inventory items: ${extra.join(", ")}`,
    );
  }

  // 3. Map inventory + rich structural definitions
  for (const item of workbookActivityInventory) {
    const def = seedDefinitions[item.sourceItemKey];
    if (!def) {
      throw new Error(
        `Seeder config missing for source key: ${item.sourceItemKey}`,
      );
    }

    // Prepare default config if options are defined
    const enrichedOptions =
      def.options?.map((opt) => ({
        ...opt,
        narrationKey: `${item.journeySlug}-${def.slug}-option-${opt.optionKey}`,
      })) || [];

    const isGraded =
      item.gradingMode === "OBJECTIVE" &&
      item.implementationStatus !== "MERGED_WITH_REASON";
    const correctFeedback = isGraded ? "إجابة رائعة! أحسنت." : null;
    const incorrectFeedback = isGraded ? "محاولة جيدة، حاول مرة أخرى!" : null;
    const completionFeedback = "تم تسجيل إجابتك بنجاح!";

    const hasPrompt = !!(def.prompt || item.normalizedPrompt);

    const activityPayload: SeederActivity = {
      sourceItemKey: item.sourceItemKey,
      journeySlug: item.journeySlug,
      stageSlug: item.stageSlug,
      slug: def.slug,
      type: def.type,
      title: def.title,
      instruction: def.instruction,
      prompt: def.prompt || item.normalizedPrompt || null,
      skillTags: def.skillTags,
      isGraded,
      isSensitive: item.journeySlug === "my-body-is-a-trust", // Journey 3 is marked sensitive
      storagePolicy:
        item.journeySlug === "my-body-is-a-trust"
          ? isGraded
            ? "OBJECTIVE_RESULT_ONLY"
            : "COMPLETION_ONLY"
          : item.storagePolicy,
      correctFeedback,
      incorrectFeedback,
      completionFeedback,
      instructionNarrationKey: `${item.journeySlug}-${def.slug}-instruction`,
      promptNarrationKey: hasPrompt
        ? `${item.journeySlug}-${def.slug}-prompt`
        : null,
      correctFeedbackNarrationKey: isGraded
        ? `${item.journeySlug}-${def.slug}-correct-feedback`
        : null,
      incorrectFeedbackNarrationKey: isGraded
        ? `${item.journeySlug}-${def.slug}-incorrect-feedback`
        : null,
      completionFeedbackNarrationKey: `${item.journeySlug}-${def.slug}-completion-feedback`,
      options: enrichedOptions,
      answerKey: def.answerKey,
    };

    // Zod validation before insertion to guarantee integrity
    const parsed = SeederActivitySchema.safeParse(activityPayload);
    if (!parsed.success) {
      throw new Error(
        `Validation failed for activity [${item.sourceItemKey}]: ${parsed.error.message}`,
      );
    }

    result.push(parsed.data);
  }

  return result;
}
