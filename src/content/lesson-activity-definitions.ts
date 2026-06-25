// Authoritative Two-Lesson Activity Definitions
// Generated automatically from legacy seed data.

export interface ActivityDefinition {
  sourceKey: string;
  sourceLessonNumber: number;
  sourceActivityNumber: number;
  slug: string;
  type: string;
  title: string;
  instruction: string;
  prompt: string | null;
  skillTags: string[];
  isGraded: boolean;
  isSensitive: boolean;
  storagePolicy: "FULL_RESPONSE" | "OBJECTIVE_RESULT_ONLY" | "COMPLETION_ONLY" | "NO_PERSISTENCE";
  options: Array<{
    optionKey: string;
    label: string;
    secondaryText?: string | null;
    displayOrder: number;
    narrationKey?: string | null;
  }>;
  answerKey: {
    answerData: any;
    acceptedAlternatives?: any;
    modelAnswer?: string | null;
    explanation?: string | null;
  } | null;
  configuration: any | null;
  instructionAudioKey: string;
  promptAudioKey: string | null;
  correctFeedbackAudioKey: string | null;
  incorrectFeedbackAudioKey: string | null;
  completionFeedbackAudioKey: string;
}

export const lesson1Activities: ActivityDefinition[] = [
  {
    "sourceKey": "j1-18",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 1,
    "slug": "arabic-feelings-j1",
    "type": "self_assessment",
    "title": "شعوري قبل حصة اللغة العربية",
    "instruction": "ما شعورك قبل حصة اللغة العربية؟",
    "prompt": "اختر ما يعبر بصدق عن مشاعرك الداخلية قبل بدء الدرس:",
    "skillTags": [
      "self_regulation"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "happy",
        "label": "أشعر بالحماس والرغبة في المعرفة والاستكشاف",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-arabic-feelings-j1-option-happy"
      },
      {
        "optionKey": "neutral",
        "label": "أشعر بالهدوء والتركيز المعتاد",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-arabic-feelings-j1-option-neutral"
      },
      {
        "optionKey": "calm",
        "label": "أشعر بالسكينة وأتطلع للقصة والمشاريع الجديدة",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-arabic-feelings-j1-option-calm"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-arabic-feelings-j1-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-arabic-feelings-j1-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-arabic-feelings-j1-completion-feedback"
  },
  {
    "sourceKey": "j1-19",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 2,
    "slug": "arabic-self-assessment",
    "type": "self_assessment",
    "title": "قراءة اللغة العربية خارج المدرسة",
    "instruction": "هل تقرأ العربية خارج المدرسة؟",
    "prompt": "حدد مدى اهتمامك بقراءة كتب أو قصص أو تصفح مواقع بالعربية:",
    "skillTags": [
      "self_regulation"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "happy",
        "label": "أشعر بالسعادة والشغف وأقرا باستمرار",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-arabic-self-assessment-option-happy"
      },
      {
        "optionKey": "neutral",
        "label": "أشعر بالهدوء والاعتياد وأقرأ عند الضرورة",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-arabic-self-assessment-option-neutral"
      },
      {
        "optionKey": "bored",
        "label": "أشعر بالملل أحياناً وأحاول التحسن",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-arabic-self-assessment-option-bored"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-arabic-self-assessment-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-arabic-self-assessment-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-arabic-self-assessment-completion-feedback"
  },
  {
    "sourceKey": "j1-01",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 3,
    "slug": "titles-generation",
    "type": "three_answers",
    "title": "اقتراح عناوين مناسبة للخبر",
    "instruction": "اكتب ثلاثة عناوين جديدة مناسبة للخبر المسموع.",
    "prompt": "اقترح 3 عناوين تعبر عن دور الكاتب والمعلم المصري القديم:",
    "skillTags": [
      "listening_comprehension",
      "writing"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "1. مكانة المعلم في مصر القديمة\n2. الكاتب المصري ودوره في نشر العلم\n3. أوراق البردي وسر الكتابة"
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-titles-generation-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-titles-generation-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-titles-generation-completion-feedback"
  },
  {
    "sourceKey": "j1-02",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 4,
    "slug": "student-questions",
    "type": "three_answers",
    "title": "أسئلة تود طرحها حول الاكتشاف",
    "instruction": "دون ثلاثة أسئلة تتمنى أن تسألها عند سماع النص.",
    "prompt": "اكتب 3 أسئلة تثير فضولك حول مقبرة الكاتب المصري القديم:",
    "skillTags": [
      "questioning_skills",
      "writing"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "1. كيف تم العثور على المقبرة؟\n2. ما هي الأدوات التي دفنت معه؟\n3. كيف كان يعلم الكاتب طلابه؟"
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-student-questions-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-student-questions-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-student-questions-completion-feedback"
  },
  {
    "sourceKey": "j1-11",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 5,
    "slug": "best-title-choice",
    "type": "single_choice",
    "title": "اختيار العنوان الأنسب للنص المسموع",
    "instruction": "أختر العنوان الأنسب للنص المسموع.",
    "prompt": "ما هو العنوان الأكثر دقة وشمولاً للنص الذي استمعت إليه؟",
    "skillTags": [
      "reading_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "opt1",
        "label": "أدوات الكتابة الخشبية",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-best-title-choice-option-opt1"
      },
      {
        "optionKey": "opt2",
        "label": "المعلم المصري القديم ودوره في الحضارة",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-best-title-choice-option-opt2"
      },
      {
        "optionKey": "opt3",
        "label": "المتاحف وتطوير القاعات القديمة",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-best-title-choice-option-opt3"
      }
    ],
    "answerKey": {
      "answerData": {
        "correctOption": "opt2"
      },
      "explanation": "يدور النص حول مكانة المعلم وتأثيره التاريخي في بناء الحضارة المصرية القديمة."
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-best-title-choice-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-best-title-choice-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-best-title-choice-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-best-title-choice-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-best-title-choice-completion-feedback"
  },
  {
    "sourceKey": "j1-03",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 6,
    "slug": "main-idea-choice",
    "type": "single_choice",
    "title": "الفكرة الرئيسة للخبر المسموع",
    "instruction": "اختر الفكرة الرئيسة للخبر المسموع.",
    "prompt": "ما هي الفكرة الرئيسة التي يدور حولها الخبر؟",
    "skillTags": [
      "reading_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "opt1",
        "label": "احترام المعلم المصري القديم ودوره في نشر العلم",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-main-idea-choice-option-opt1"
      },
      {
        "optionKey": "opt2",
        "label": "طريقة صناعة أوراق البردي في المقابر",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-main-idea-choice-option-opt2"
      },
      {
        "optionKey": "opt3",
        "label": "أهمية تزيين جدران المقابر بالرسومات",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-main-idea-choice-option-opt3"
      }
    ],
    "answerKey": {
      "answerData": {
        "correctOption": "opt1"
      },
      "explanation": "يركز النص على دور الكاتب في نشر العلم واحترامه الشديد في المجتمع المصري القديم."
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-main-idea-choice-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-main-idea-choice-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-main-idea-choice-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-main-idea-choice-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-main-idea-choice-completion-feedback"
  },
  {
    "sourceKey": "j1-07",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 7,
    "slug": "tomb-location",
    "type": "single_choice",
    "title": "مكان العثور على مقبرة الكاتب",
    "instruction": "أين عُثر على مقبرة الكاتب؟",
    "prompt": "حدد مكان المقبرة التاريخية التي عثر عليها العلماء:",
    "skillTags": [
      "reading_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "loc1",
        "label": "في مقابر العلماء بسقارة",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-tomb-location-option-loc1"
      },
      {
        "optionKey": "loc2",
        "label": "في مقابر وادي الملوك بالأقصر",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-tomb-location-option-loc2"
      },
      {
        "optionKey": "loc3",
        "label": "بجوار أهرامات الجيزة",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-tomb-location-option-loc3"
      }
    ],
    "answerKey": {
      "answerData": {
        "correctOption": "loc1"
      },
      "explanation": "تم العثور على مقبرة الكاتب المصري القديم في جبورة مقابر العلماء بمنطقة سقارة الأثرية."
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-tomb-location-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-tomb-location-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-tomb-location-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-tomb-location-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-tomb-location-completion-feedback"
  },
  {
    "sourceKey": "j1-08",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 8,
    "slug": "tomb-importance",
    "type": "single_choice",
    "title": "سبب أهمية المقبرة المكتشفة",
    "instruction": "لماذا كانت المقبرة مهمة؟",
    "prompt": "ما الذي جعل هذا الاكتشاف الأثري فريداً ومهماً للغاية؟",
    "skillTags": [
      "reading_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "imp1",
        "label": "لأنها تخص كاتب قديم مدفون مع أدوات كتابته الخشبية وبرديات",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-tomb-importance-option-imp1"
      },
      {
        "optionKey": "imp2",
        "label": "لأنها تحتوي على كميات هائلة من الذهب والكنوز الملكية",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-tomb-importance-option-imp2"
      },
      {
        "optionKey": "imp3",
        "label": "لأنها تثبت أسرار بناء الأهرامات الثلاثة بالتفصيل",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-tomb-importance-option-imp3"
      }
    ],
    "answerKey": {
      "answerData": {
        "correctOption": "imp1"
      },
      "explanation": "الأهمية تكمن في العثور على أدوات الكتابة الخشبية والبرديات التي توثق دور التعليم والكاتب."
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-tomb-importance-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-tomb-importance-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-tomb-importance-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-tomb-importance-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-tomb-importance-completion-feedback"
  },
  {
    "sourceKey": "j1-09",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 9,
    "slug": "teacher-status-discovery",
    "type": "single_choice",
    "title": "دلالة الاكتشاف على مكانة المعلم",
    "instruction": "ماذا يدل الاكتشاف على مكانة المعلم؟",
    "prompt": "بماذا يوحي دفن أدوات الكتابة مع الكاتب في مقبرته؟",
    "skillTags": [
      "reading_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "st1",
        "label": "يدل على التقدير الهائل والاحترام للتعليم والمعلم بمصر القديمة",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-teacher-status-discovery-option-st1"
      },
      {
        "optionKey": "st2",
        "label": "يدل على أن التعليم كان يقتصر فقط على الكهنة والملوك",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-teacher-status-discovery-option-st2"
      },
      {
        "optionKey": "st3",
        "label": "يدل على رغبة الكاتب في مواصلة الدراسة بمفرده",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-teacher-status-discovery-option-st3"
      }
    ],
    "answerKey": {
      "answerData": {
        "correctOption": "st1"
      },
      "explanation": "تزيين جدران المقبرة ودفن أدوات الكتابة مع الكاتب يعكسان الهيبة والتقدير الكبير للتعليم قديماً."
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-teacher-status-discovery-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-teacher-status-discovery-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-teacher-status-discovery-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-teacher-status-discovery-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-teacher-status-discovery-completion-feedback"
  },
  {
    "sourceKey": "j1-13",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 10,
    "slug": "synonym-matching",
    "type": "matching",
    "title": "مترادفات الكلمات من النص",
    "instruction": "صل كل كلمة بمرادفها الصحيح.",
    "prompt": "طابق الكلمات مع معانيها المترادفة الواردة بالنص المسموع:",
    "skillTags": [
      "vocabulary_acquisition"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "word1",
        "label": "عالم",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-synonym-matching-option-word1"
      },
      {
        "optionKey": "word2",
        "label": "مقبرة",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-synonym-matching-option-word2"
      },
      {
        "optionKey": "word3",
        "label": "مهنة",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-synonym-matching-option-word3"
      },
      {
        "optionKey": "mean1",
        "label": "باحث",
        "displayOrder": 4,
        "narrationKey": "ancient-egyptian-teacher-synonym-matching-option-mean1"
      },
      {
        "optionKey": "mean2",
        "label": "مدفن",
        "displayOrder": 5,
        "narrationKey": "ancient-egyptian-teacher-synonym-matching-option-mean2"
      },
      {
        "optionKey": "mean3",
        "label": "حرفة",
        "displayOrder": 6,
        "narrationKey": "ancient-egyptian-teacher-synonym-matching-option-mean3"
      }
    ],
    "answerKey": {
      "answerData": {
        "pairs": {
          "word1": "mean1",
          "word2": "mean2",
          "word3": "mean3"
        }
      }
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-synonym-matching-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-synonym-matching-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-synonym-matching-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-synonym-matching-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-synonym-matching-completion-feedback"
  },
  {
    "sourceKey": "j1-14",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 11,
    "slug": "antonyms-detailed",
    "type": "matching",
    "title": "مضاد الكلمات من النص",
    "instruction": "صل الكلمة بضدها الصحيح.",
    "prompt": "طابق الكلمات التالية مع أضدادها المعاكسة في المعنى:",
    "skillTags": [
      "vocabulary_acquisition"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "w1",
        "label": "القديم",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-w1"
      },
      {
        "optionKey": "w2",
        "label": "العلم",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-w2"
      },
      {
        "optionKey": "w3",
        "label": "البداية",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-w3"
      },
      {
        "optionKey": "w4",
        "label": "احترام",
        "displayOrder": 4,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-w4"
      },
      {
        "optionKey": "w5",
        "label": "تقدير",
        "displayOrder": 5,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-w5"
      },
      {
        "optionKey": "w6",
        "label": "عالِم",
        "displayOrder": 6,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-w6"
      },
      {
        "optionKey": "ant1",
        "label": "الحديث",
        "displayOrder": 7,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant1"
      },
      {
        "optionKey": "ant2",
        "label": "الجهل",
        "displayOrder": 8,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant2"
      },
      {
        "optionKey": "ant3",
        "label": "النهاية",
        "displayOrder": 9,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant3"
      },
      {
        "optionKey": "ant4",
        "label": "ازدراء",
        "displayOrder": 10,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant4"
      },
      {
        "optionKey": "ant5",
        "label": "إهمال",
        "displayOrder": 11,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant5"
      },
      {
        "optionKey": "ant6",
        "label": "جاهل",
        "displayOrder": 12,
        "narrationKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant6"
      }
    ],
    "answerKey": {
      "answerData": {
        "pairs": {
          "w1": "ant1",
          "w2": "ant2",
          "w3": "ant3",
          "w4": "ant4",
          "w5": "ant5",
          "w6": "ant6"
        }
      }
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-antonyms-detailed-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-antonyms-detailed-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-antonyms-detailed-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-antonyms-detailed-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-antonyms-detailed-completion-feedback"
  },
  {
    "sourceKey": "j1-04",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 12,
    "slug": "event-meaning-matching",
    "type": "matching",
    "title": "مطابقة الأحداث بمعانيها",
    "instruction": "صل بين الحدث ومعناه الصحيح.",
    "prompt": "طابق الحدث مع المعنى المعبر عنه:",
    "skillTags": [
      "vocabulary_acquisition"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "evt1",
        "label": "تطوير قاعة الكتابة والتعليم بالمتحف",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-event-meaning-matching-option-evt1"
      },
      {
        "optionKey": "evt2",
        "label": "العثور على البرديات بمقابر العلماء",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-event-meaning-matching-option-evt2"
      },
      {
        "optionKey": "evt3",
        "label": "جلوس الكاتب بوقار على وسادة",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-event-meaning-matching-option-evt3"
      },
      {
        "optionKey": "val1",
        "label": "الاهتمام بنشر الوعي بتاريخ التعليم",
        "displayOrder": 4,
        "narrationKey": "ancient-egyptian-teacher-event-meaning-matching-option-val1"
      },
      {
        "optionKey": "val2",
        "label": "تأكيد فكرة تخليد العلم وتقدير المعرفة",
        "displayOrder": 5,
        "narrationKey": "ancient-egyptian-teacher-event-meaning-matching-option-val2"
      },
      {
        "optionKey": "val3",
        "label": "الهيبة والاحترام التي كان يحظى بها الكاتب",
        "displayOrder": 6,
        "narrationKey": "ancient-egyptian-teacher-event-meaning-matching-option-val3"
      }
    ],
    "answerKey": {
      "answerData": {
        "pairs": {
          "evt1": "val1",
          "evt2": "val2",
          "evt3": "val3"
        }
      }
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-event-meaning-matching-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-event-meaning-matching-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-event-meaning-matching-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-event-meaning-matching-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-event-meaning-matching-completion-feedback"
  },
  {
    "sourceKey": "j1-15",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 13,
    "slug": "event-ordering",
    "type": "multi_round",
    "title": "ترتيب أحداث الخبر (المجموعة أ)",
    "instruction": "رتب الأحداث التالية حسب تسلسلها في الخبر.",
    "prompt": "رتب الجمل التالية زمنياً:",
    "skillTags": [
      "sequencing",
      "listening"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "evt1",
        "label": "بدأ المتحف المصري مشروع تطوير القاعة",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-event-ordering-option-evt1"
      },
      {
        "optionKey": "evt2",
        "label": "عرض المتحف دور المعلم",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-event-ordering-option-evt2"
      },
      {
        "optionKey": "evt3",
        "label": "استخدم المعلم القديم البردية",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-event-ordering-option-evt3"
      },
      {
        "optionKey": "evt4",
        "label": "أعجب الزوار بالعرض",
        "displayOrder": 4,
        "narrationKey": "ancient-egyptian-teacher-event-ordering-option-evt4"
      }
    ],
    "answerKey": {
      "answerData": {
        "order": [
          "evt1",
          "evt2",
          "evt3",
          "evt4"
        ]
      }
    },
    "configuration": {
      "rounds": [
        {
          "id": "round-a",
          "type": "ordering",
          "title": "ترتيب أحداث الخبر (المجموعة أ)",
          "instruction": "رتب الأحداث التالية حسب تسلسلها في الخبر.",
          "prompt": "رتب الجمل التالية زمنياً:",
          "options": [
            {
              "optionKey": "evt1",
              "label": "بدأ المتحف المصري مشروع تطوير القاعة",
              "displayOrder": 1,
              "narrationKey": "ancient-egyptian-teacher-event-ordering-option-evt1"
            },
            {
              "optionKey": "evt2",
              "label": "عرض المتحف دور المعلم",
              "displayOrder": 2,
              "narrationKey": "ancient-egyptian-teacher-event-ordering-option-evt2"
            },
            {
              "optionKey": "evt3",
              "label": "استخدم المعلم القديم البردية",
              "displayOrder": 3,
              "narrationKey": "ancient-egyptian-teacher-event-ordering-option-evt3"
            },
            {
              "optionKey": "evt4",
              "label": "أعجب الزوار بالعرض",
              "displayOrder": 4,
              "narrationKey": "ancient-egyptian-teacher-event-ordering-option-evt4"
            }
          ],
          "answerKey": {
            "answerData": {
              "order": [
                "evt1",
                "evt2",
                "evt3",
                "evt4"
              ]
            }
          }
        },
        {
          "id": "round-b",
          "type": "ordering",
          "title": "ترتيب أحداث الكاتب (المجموعة ب)",
          "instruction": "رتب الأحداث التالية حسب تسلسلها المنطقي والتاريخي.",
          "prompt": "رتب مراحل حياة وتأثير الكاتب المصري القديم:",
          "options": [
            {
              "optionKey": "b1",
              "label": "وجود الكاتب في المجتمع",
              "displayOrder": 1,
              "narrationKey": "ancient-egyptian-teacher-event-ordering-b-option-b1"
            },
            {
              "optionKey": "b2",
              "label": "وفاته ودفنه",
              "displayOrder": 2,
              "narrationKey": "ancient-egyptian-teacher-event-ordering-b-option-b2"
            },
            {
              "optionKey": "b3",
              "label": "اكتشاف المقبرة",
              "displayOrder": 3,
              "narrationKey": "ancient-egyptian-teacher-event-ordering-b-option-b3"
            },
            {
              "optionKey": "b4",
              "label": "معرفة أهميته",
              "displayOrder": 4,
              "narrationKey": "ancient-egyptian-teacher-event-ordering-b-option-b4"
            }
          ],
          "answerKey": {
            "answerData": {
              "order": [
                "b1",
                "b2",
                "b3",
                "b4"
              ]
            }
          }
        }
      ]
    },
    "instructionAudioKey": "ancient-egyptian-teacher-event-ordering-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-event-ordering-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-event-ordering-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-event-ordering-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-event-ordering-completion-feedback"
  },
  {
    "sourceKey": "j1-17",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 14,
    "slug": "what-if-reflection",
    "type": "long_text",
    "title": "تأمل: ماذا لو لم يكتشف القبر؟",
    "instruction": "ماذا لو لم تُكتشف مقبرة الكاتب المصري القديم؟",
    "prompt": "عبر بأسلوبك عن رأيك في مدى أهمية هذا الاكتشاف المعرفي والتاريخي لبلدنا الحبيب:",
    "skillTags": [
      "critical_thinking",
      "writing"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "لما عرفنا مكانة الكاتب العظيمة في المجتمع المصري القديم، ولضاع جزء كبير من تاريخ توثيق التعليم وأدوات الكتابة ونشأة العلوم على ورق البردي."
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-what-if-reflection-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-what-if-reflection-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-what-if-reflection-completion-feedback"
  },
  {
    "sourceKey": "j1-10",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 15,
    "slug": "discovery-results",
    "type": "three_answers",
    "title": "نتائج اكتشاف مقبرة الكاتب",
    "instruction": "استخرج نتيجتين ترتبتا على هذا الاكتشاف.",
    "prompt": "اكتب نتيجتين تاريخيتين أو علميتين ترتبتا على العثور على المقبرة:",
    "skillTags": [
      "critical_thinking"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "1. معرفة أدوات الكتابة المستخدمة (الخشب والريش والبردي).\n2. إثبات مدى هيبة ومكانة المعلم والعلماء في مصر القديمة."
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-discovery-results-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-discovery-results-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-discovery-results-completion-feedback"
  },
  {
    "sourceKey": "j1-05",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 16,
    "slug": "character-event-identification",
    "type": "matching",
    "title": "تحديد الشخصية والحدث الأهم",
    "instruction": "صل بين العنصر وتوصيفه المناسب.",
    "prompt": "طابق العناصر بالتعريف الأنسب:",
    "skillTags": [
      "reading_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "elm1",
        "label": "الشخصية الأهم بالخبر",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-character-event-identification-option-elm1"
      },
      {
        "optionKey": "elm2",
        "label": "الحدث الأهم بالنص",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-character-event-identification-option-elm2"
      },
      {
        "optionKey": "def1",
        "label": "الكاتب / المعلم المصري القديم",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-character-event-identification-option-def1"
      },
      {
        "optionKey": "def2",
        "label": "اكتشاف مقبرة كاتب قديم وبدء تطوير القاعة بالمتحف",
        "displayOrder": 4,
        "narrationKey": "ancient-egyptian-teacher-character-event-identification-option-def2"
      }
    ],
    "answerKey": {
      "answerData": {
        "pairs": {
          "elm1": "def1",
          "elm2": "def2"
        }
      }
    },
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-character-event-identification-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-character-event-identification-prompt",
    "correctFeedbackAudioKey": "ancient-egyptian-teacher-character-event-identification-correct-feedback",
    "incorrectFeedbackAudioKey": "ancient-egyptian-teacher-character-event-identification-incorrect-feedback",
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-character-event-identification-completion-feedback"
  },
  {
    "sourceKey": "j1-20",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 17,
    "slug": "mental-visualization",
    "type": "self_assessment",
    "title": "تخيل المشاهد أثناء الاستماع",
    "instruction": "هل تتخيل المشاهد أثناء الاستماع؟",
    "prompt": "اختر ما يصف سلوكك الذهني عند الاستماع للخبر المسموع:",
    "skillTags": [
      "self_regulation"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "vis1",
        "label": "نعم، أرسم صوراً ملونة للمشاهد والشخصيات في مخيلتي",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-mental-visualization-option-vis1"
      },
      {
        "optionKey": "vis2",
        "label": "أحياناً أتخيل التفاصيل الهامة فقط",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-mental-visualization-option-vis2"
      },
      {
        "optionKey": "vis3",
        "label": "أركز على الكلمات والعبارات ولا أتخيل صوراً",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-mental-visualization-option-vis3"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-mental-visualization-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-mental-visualization-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-mental-visualization-completion-feedback"
  },
  {
    "sourceKey": "j1-21",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 18,
    "slug": "new-words-usage",
    "type": "self_assessment",
    "title": "استخدام كلمات عربية جديدة",
    "instruction": "هل تستخدم كلمات عربية جديدة في حياتك اليومية؟",
    "prompt": "اختر مدى حرصك على تطبيق المفردات الجديدة التي تكتشفها في حديثك:",
    "skillTags": [
      "self_regulation"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "use_yes",
        "label": "نعم، أحب استخدام الكلمات الفصيحة أمام والدي وزملائي",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-new-words-usage-option-use_yes"
      },
      {
        "optionKey": "use_try",
        "label": "أحاول استخدامها عندما تكون مناسبة للموضوع",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-new-words-usage-option-use_try"
      },
      {
        "optionKey": "use_no",
        "label": "أنسى الكلمات الجديدة سريعاً ولا أستخدمها",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-new-words-usage-option-use_no"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-new-words-usage-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-new-words-usage-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-new-words-usage-completion-feedback"
  },
  {
    "sourceKey": "j1-22",
    "sourceLessonNumber": 1,
    "sourceActivityNumber": 19,
    "slug": "classroom-attention",
    "type": "self_assessment",
    "title": "التصرف أثناء شرح المعلم",
    "instruction": "كيف تتصرف أثناء شرح المعلم؟",
    "prompt": "ما هو الخيار الذي يصف بصدق سلوكك الصفي عند شرح دروس العربية؟",
    "skillTags": [
      "self_regulation"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "att1",
        "label": "أنصت بكل جوارحي وأدون التلاحظات الهامة",
        "displayOrder": 1,
        "narrationKey": "ancient-egyptian-teacher-classroom-attention-option-att1"
      },
      {
        "optionKey": "att2",
        "label": "أشارك بفعالية في الإجابة عن التحديات الموجهة",
        "displayOrder": 2,
        "narrationKey": "ancient-egyptian-teacher-classroom-attention-option-att2"
      },
      {
        "optionKey": "att3",
        "label": "قد أتشتت أحياناً ولكني سرعان ما أعود للانتباه",
        "displayOrder": 3,
        "narrationKey": "ancient-egyptian-teacher-classroom-attention-option-att3"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "ancient-egyptian-teacher-classroom-attention-instruction",
    "promptAudioKey": "ancient-egyptian-teacher-classroom-attention-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "ancient-egyptian-teacher-classroom-attention-completion-feedback"
  }
];

export const lesson2Activities: ActivityDefinition[] = [
  {
    "sourceKey": "j2-47",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 1,
    "slug": "yacoub-praise-assessment",
    "type": "self_assessment",
    "title": "الشعور عند تلقي المديح",
    "instruction": "بماذا تشعر عند تلقي المديح من معلمك؟",
    "prompt": "اختر بطاقة تعبر عن رد فعلك الداخلي عند ثناء معلم اللغة العربية عليك:",
    "skillTags": [
      "motivation"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "proud",
        "label": "الفخر الشديد والرغبة في مضاعفة الاجتهاد والعمل المتميز",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-praise-assessment-option-proud"
      },
      {
        "optionKey": "happy",
        "label": "السعادة العارمة والارتياح والبهجة الداخلية",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-praise-assessment-option-happy"
      },
      {
        "optionKey": "shy",
        "label": "الخجل والتردد قليلاً مع الابتسام والشكر",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-praise-assessment-option-shy"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-praise-assessment-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-praise-assessment-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-praise-assessment-completion-feedback"
  },
  {
    "sourceKey": "j2-48",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 2,
    "slug": "yacoub-score-motivation",
    "type": "self_assessment",
    "title": "دافع التفوق في اللغة العربية",
    "instruction": "اختر سبب حرصك على التفوق في اللغة العربية.",
    "prompt": "ما هو المحرك الأساسي وراء رغبتك في نيل أعلى الدرجات والتقييمات؟",
    "skillTags": [
      "motivation"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "love",
        "label": "لحبي الشديد والعميق للغة العربية وجمال ألفاظها وقصصها",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-score-motivation-option-love"
      },
      {
        "optionKey": "pleasing",
        "label": "لإدخال الفرحة على قلوب والدي المخلصين وتقديراً لمعلمي",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-score-motivation-option-pleasing"
      },
      {
        "optionKey": "competition",
        "label": "لأكون دائماً في مقدمة المتفوقين علمياً ومعرفياً",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-score-motivation-option-competition"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-score-motivation-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-score-motivation-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-score-motivation-completion-feedback"
  },
  {
    "sourceKey": "j2-24",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 3,
    "slug": "yacoub-title-prediction",
    "type": "short_text",
    "title": "توقع عنوان القصة",
    "instruction": "ماذا تتوقع أن يكون عنوان للنص المسموع؟",
    "prompt": "اكتب توقعك الخاص عن موضوع القصة قبل سماعها بالكامل:",
    "skillTags": [
      "prediction"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "أتوقع أنها قصة طبيب عظيم يضحي بوقته وماله لعلاج قلوب المرضى والفقراء بالمجان."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-title-prediction-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-title-prediction-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-title-prediction-completion-feedback"
  },
  {
    "sourceKey": "j2-26",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 4,
    "slug": "yacoub-stages-ordering",
    "type": "ordering",
    "title": "ترتيب مراحل مسيرة الطبيب",
    "instruction": "رتب الأحداث التالية حسب ورودها وسياقها في القصة.",
    "prompt": "رتب مسيرة عطاء الطبيب مجدي يعقوب:",
    "skillTags": [
      "sequencing",
      "listening"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "st1",
        "label": "سفر مجدي يعقوب للخارج",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-stages-ordering-option-st1"
      },
      {
        "optionKey": "st2",
        "label": "اكتسابه الخبرة العالمية",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-stages-ordering-option-st2"
      },
      {
        "optionKey": "st3",
        "label": "عودته إلى وطنه العزيز مصر",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-stages-ordering-option-st3"
      },
      {
        "optionKey": "st4",
        "label": "إنشاء مركز القلب بأسوان لعلاج الأطفال بالمجان",
        "displayOrder": 4,
        "narrationKey": "king-of-hearts-yacoub-stages-ordering-option-st4"
      }
    ],
    "answerKey": {
      "answerData": {
        "order": [
          "st1",
          "st2",
          "st3",
          "st4"
        ]
      }
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-stages-ordering-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-stages-ordering-prompt",
    "correctFeedbackAudioKey": "king-of-hearts-yacoub-stages-ordering-correct-feedback",
    "incorrectFeedbackAudioKey": "king-of-hearts-yacoub-stages-ordering-incorrect-feedback",
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-stages-ordering-completion-feedback"
  },
  {
    "sourceKey": "j2-28",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 5,
    "slug": "yacoub-return-year",
    "type": "fill_in_the_blank",
    "title": "عام عودة د. مجدي يعقوب",
    "instruction": "أكمل: عاد د. مجدي يعقوب إلى مصر في عام.",
    "prompt": "عاد الدكتور مجدي يعقوب إلى مصر في عام [blank1] لخدمة أهالي وطنه.",
    "skillTags": [
      "listening_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {
        "blank1": [
          "2009"
        ]
      },
      "explanation": "عاد د. مجدي يعقوب إلى مصر وأسس مركز أسوان للقلب في عام 2009."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-return-year-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-return-year-prompt",
    "correctFeedbackAudioKey": "king-of-hearts-yacoub-return-year-correct-feedback",
    "incorrectFeedbackAudioKey": "king-of-hearts-yacoub-return-year-incorrect-feedback",
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-return-year-completion-feedback"
  },
  {
    "sourceKey": "j2-30",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 6,
    "slug": "yacoub-surgeon-calmness",
    "type": "single_choice",
    "title": "صفة الجراح الناجح والهدوء",
    "instruction": "اختر صفة الجراح الهادئ كما يراها د. مجدي.",
    "prompt": "لماذا يرى د. مجدي يعقوب أن الجراح الهادئ يكون أقدر على تحقيق النجاح؟",
    "skillTags": [
      "listening_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "ans1",
        "label": "لأن الهدوء يمنحه القدرة على التفكير بتركيز وتجنب الأخطاء الطبية",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-surgeon-calmness-option-ans1"
      },
      {
        "optionKey": "ans2",
        "label": "لأنه يجعله سريع الحركة للانتهاء من العمليات سريعاً",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-surgeon-calmness-option-ans2"
      },
      {
        "optionKey": "ans3",
        "label": "لأنه يمنع المرضى والزملاء في الغرفة من القلق",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-surgeon-calmness-option-ans3"
      }
    ],
    "answerKey": {
      "answerData": {
        "correctOption": "ans1"
      },
      "explanation": "الهدوء في العمليات الجراحية الدقيقة يسمح بالتركيز والتفكير الواعي واتخاذ القرارات السليمة."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-surgeon-calmness-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-surgeon-calmness-prompt",
    "correctFeedbackAudioKey": "king-of-hearts-yacoub-surgeon-calmness-correct-feedback",
    "incorrectFeedbackAudioKey": "king-of-hearts-yacoub-surgeon-calmness-incorrect-feedback",
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-surgeon-calmness-completion-feedback"
  },
  {
    "sourceKey": "j2-31",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 7,
    "slug": "yacoub-alternative-solution",
    "type": "single_choice",
    "title": "الحلول البديلة لخدمة أهالي أسوان",
    "instruction": "اختر حلًا بديلًا مقترحًا لخدمة أهالي الصعيد.",
    "prompt": "ما هو الحل البديل المناسب إذا لم تتوفر إمكانية السفر للقاهرة لمرضى القلب الصغار؟",
    "skillTags": [
      "critical_thinking"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "sol1",
        "label": "تدريب أطباء محليين وتسيير قوافل طبية متخصصة ومجهزة للصعيد",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-alternative-solution-option-sol1"
      },
      {
        "optionKey": "sol2",
        "label": "إرسال جميع الأطفال المرضى للعلاج خارج جمهورية مصر العربية",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-alternative-solution-option-sol2"
      },
      {
        "optionKey": "sol3",
        "label": "الاعتماد بالكامل على المستشفيات الخاصة بالمدن الكبرى",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-alternative-solution-option-sol3"
      }
    ],
    "answerKey": {
      "answerData": {
        "correctOption": "sol1"
      },
      "explanation": "تدريب الكوادر المحلية وتجهيز قوافل طبية متنقلة هي أفضل الحلول المستدامة والبديلة."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-alternative-solution-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-alternative-solution-prompt",
    "correctFeedbackAudioKey": "king-of-hearts-yacoub-alternative-solution-correct-feedback",
    "incorrectFeedbackAudioKey": "king-of-hearts-yacoub-alternative-solution-incorrect-feedback",
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-alternative-solution-completion-feedback"
  },
  {
    "sourceKey": "j2-38",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 8,
    "slug": "yacoub-insist-reason-open",
    "type": "long_text",
    "title": "سبب إصرار الطبيب على المركز",
    "instruction": "لماذا صمم الطبيب على إنشاء المركز؟",
    "prompt": "اشرح بأسلوبك الدوافع الإنسانية والوطنية وراء تمسك الطبيب بهذا المشروع المتميز في أسوان:",
    "skillTags": [
      "reading_comprehension"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "أصر على إنشائه لخدمة أهل بلده ووطنه العزيز، ولأنه يرى أن من واجب كل عالم أن يعود ليفيد بلده بما تعلمه بالخارج."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-insist-reason-open-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-insist-reason-open-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-insist-reason-open-completion-feedback"
  },
  {
    "sourceKey": "j2-39",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 9,
    "slug": "yacoub-biggest-challenge",
    "type": "long_text",
    "title": "عقبات واجهت الطبيب والمشروع",
    "instruction": "ما العقبة الأساسية التي واجهت الطبيب؟",
    "prompt": "ما هي التحديات أو المخاوف التي قد تواجه مبادرة وطنية ضخمة مثل تأسيس مركز القلب بالمجان؟",
    "skillTags": [
      "reading_comprehension"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "العقبة الأساسية هي الشك في البداية من نجاح المشروع في أقصى الجنوب، وتوفير التمويل المستدام للأجهزة والعمليات بالمجان."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-biggest-challenge-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-biggest-challenge-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-biggest-challenge-completion-feedback"
  },
  {
    "sourceKey": "j2-44",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 10,
    "slug": "yacoub-new-word",
    "type": "short_text",
    "title": "كلمة وجملة مفيدة",
    "instruction": "اختر كلمة أعجبتك وضعها في جملة مفيدة.",
    "prompt": "اكتب كلمة فصيحة أعجبتك في نص الطبيب الإنساني وصيغها في جملة تامة التعبير:",
    "skillTags": [
      "vocabulary_acquisition"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "الكلمة: 'التعاطف'. الجملة: 'التعاطف مع المرضى يهدئ من خوفهم ويساعدهم على الشفاء بسرعة'."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-new-word-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-new-word-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-new-word-completion-feedback"
  },
  {
    "sourceKey": "j2-32",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 11,
    "slug": "yacoub-arabic-practical-use",
    "type": "single_choice",
    "title": "الفائدة العملية للغة العربية",
    "instruction": "اختر الفائدة العملية للغة العربية المذكورة بالعبارات.",
    "prompt": "كيف تسهم مهارات اللغة العربية الفصحى في مسيرة الطبيب البطل؟",
    "skillTags": [
      "reading_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "use1",
        "label": "تساعد في الفهم الدقيق للمفاهيم الطبية والبحثية والتواصل الإنساني ببلده",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-arabic-practical-use-option-use1"
      },
      {
        "optionKey": "use2",
        "label": "تقتصر فقط على قراءة الكتب والقصص الخيالية القديمة",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-arabic-practical-use-option-use2"
      },
      {
        "optionKey": "use3",
        "label": "تحسن من مهارات كتابة التقارير والخط العربي التجميلي",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-arabic-practical-use-option-use3"
      }
    ],
    "answerKey": {
      "answerData": {
        "correctOption": "use1"
      },
      "explanation": "الفهم الدقيق والتواصل الإنساني بلغة المريض الفصحى هما أساس العلاج الناجح والبحث العلمي المحلي."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-arabic-practical-use-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-arabic-practical-use-prompt",
    "correctFeedbackAudioKey": "king-of-hearts-yacoub-arabic-practical-use-correct-feedback",
    "incorrectFeedbackAudioKey": "king-of-hearts-yacoub-arabic-practical-use-incorrect-feedback",
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-arabic-practical-use-completion-feedback"
  },
  {
    "sourceKey": "j2-27",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 12,
    "slug": "yacoub-life-ordering",
    "type": "ordering",
    "title": "ترتيب مراحل حياة الطبيب",
    "instruction": "رتب مراحل حياة الدكتور مجدي يعقوب.",
    "prompt": "رتب التطور التاريخي لمسيرة الطبيب مجدي يعقوب:",
    "skillTags": [
      "sequencing",
      "listening"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [
      {
        "optionKey": "mil1",
        "label": "نشأة مجدي يعقوب ببلده مصر",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-life-ordering-option-mil1"
      },
      {
        "optionKey": "mil2",
        "label": "حبه الشديد لمهنة الطب وتفوقه الدراسي",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-life-ordering-option-mil2"
      },
      {
        "optionKey": "mil3",
        "label": "رحلته العلمية والمهنية الطويلة في بريطانيا",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-life-ordering-option-mil3"
      },
      {
        "optionKey": "mil4",
        "label": "جهوده الإنسانية لإنقاذ حياة المرضى الفقراء",
        "displayOrder": 4,
        "narrationKey": "king-of-hearts-yacoub-life-ordering-option-mil4"
      },
      {
        "optionKey": "mil5",
        "label": "أثره الباقي وتكريمه العالمي والوطني",
        "displayOrder": 5,
        "narrationKey": "king-of-hearts-yacoub-life-ordering-option-mil5"
      }
    ],
    "answerKey": {
      "answerData": {
        "order": [
          "mil1",
          "mil2",
          "mil3",
          "mil4",
          "mil5"
        ]
      }
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-life-ordering-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-life-ordering-prompt",
    "correctFeedbackAudioKey": "king-of-hearts-yacoub-life-ordering-correct-feedback",
    "incorrectFeedbackAudioKey": "king-of-hearts-yacoub-life-ordering-incorrect-feedback",
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-life-ordering-completion-feedback"
  },
  {
    "sourceKey": "j2-33",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 13,
    "slug": "yacoub-problem-solutions",
    "type": "problem_solution",
    "title": "تحديد مشكلة واقتراح حلين",
    "instruction": "حدد مشكلة من النص واقترح حلين لها.",
    "prompt": "المشكلة: بعد مركز القلب بأسوان عن العاصمة وصعوبة سفر المرضى الفقراء.",
    "skillTags": [
      "problem_solving",
      "writing"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "الحل 1: بناء مركز محلي متخصص متكامل في أسوان (كما فعل الطبيب).\nالحل 2: توفير قوافل طبية متنقلة مجهزة لفحص الحالات وتحديد الدعم."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-problem-solutions-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-problem-solutions-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-problem-solutions-completion-feedback"
  },
  {
    "sourceKey": "j2-36",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 14,
    "slug": "yacoub-funding-alternatives",
    "type": "long_text",
    "title": "حلول بديلة في غياب التمويل",
    "instruction": "اقترح حلولًا بديلة في حال عدم توفر تمويل للمركز.",
    "prompt": "لو لم تتوافر الإمكانات لإنشاء مركز جراحات قلب كبير ثابت بأسوان، كيف يمكن مساعدة الأطفال المرضى؟",
    "skillTags": [
      "problem_solving"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "يمكن تسيير عيادات فحص متنقلة بالتطوع، أو التنسيق لإجراء العمليات الصعبة في أقسام القلب بالمستشفيات الجامعية القريبة."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-funding-alternatives-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-funding-alternatives-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-funding-alternatives-completion-feedback"
  },
  {
    "sourceKey": "j2-34",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 15,
    "slug": "yacoub-character-opinion",
    "type": "long_text",
    "title": "رأيك في الطبيب وهل تراه قدوة",
    "instruction": "ما رأيك في شخصية الطبيب مجدي يعقوب وهل تراه قدوة؟ ولماذا؟",
    "prompt": "عبر بصدق عن تقييمك لشخصية ملك القلوب ودوره الوطني والإنساني:",
    "skillTags": [
      "value_judgment",
      "writing"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "هو قدوة عظيمة لأنه جسد معاني الرحمة والعطاء والتواضع، وآثر خدمة وطنه بالمجان على الشهرة الفردية بالخارج."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-character-opinion-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-character-opinion-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-character-opinion-completion-feedback"
  },
  {
    "sourceKey": "j2-25",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 16,
    "slug": "yacoub-interview-questions",
    "type": "three_answers",
    "title": "أسئلة تود طرحها في مقابلة",
    "instruction": "اكتب ثلاثة أسئلة تود طرحها على د. مجدي يعقوب.",
    "prompt": "لو أتيحت لك فرصة إجراء مقابلة مع طبيب القلوب، ما هي أسئلتك الثلاثة؟",
    "skillTags": [
      "questioning_skills"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "1. ما الذي جعلك تختار جراحة القلب بالذات؟\n2. كيف تشعر بعد نجاح عملية معقدة لطفل صغير؟\n3. بم تنصح الأطفال الذين يتمنون أن يكونوا أطباء؟"
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-interview-questions-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-interview-questions-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-interview-questions-completion-feedback"
  },
  {
    "sourceKey": "j2-37",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 17,
    "slug": "yacoub-story-retell",
    "type": "retell_story",
    "title": "تلخيص سيرة ملك القلوب بأسلوبك",
    "instruction": "لخص قصة الدكتور مجدي يعقوب بأسلوبك.",
    "prompt": "أعد كتابة سيرة الدكتور كقصة قصيرة تعبر عن العطاء وحب الوطن:",
    "skillTags": [
      "writing",
      "story_telling"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "طبيب مصري نشأ محباً لخدمة الناس، تفوق وسافر لبريطانيا ونال الشهرة العالمية، ثم عاد ليبني مركز قلب مجاني للأطفال والفقراء في أسوان ليرسم البسمة على وجوههم."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-story-retell-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-story-retell-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-story-retell-completion-feedback"
  },
  {
    "sourceKey": "j2-41",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 18,
    "slug": "yacoub-humanitarian-project",
    "type": "story_builder",
    "title": "تصميم مشروعك الإنساني الخاص",
    "instruction": "تخيل مشروعك الإنساني وحدد المشكلة والحل والنهاية.",
    "prompt": "اكتب خطة إبداعية لمشروع ترغب في بنائه مستقبلاً لخدمة زملائك أو مجتمعك:",
    "skillTags": [
      "creative_thinking"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "المشكلة: صعوبة القراءة لفاقدي البصر.\nالحل: تطبيق مجاني يحول الكتب لقصص مسموعة بأصوات تفاعلية.\nالنتيجة: تمكين المكفوفين من القراءة والتعلم بسهولة ونشر الثقافة."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-humanitarian-project-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-humanitarian-project-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-humanitarian-project-completion-feedback"
  },
  {
    "sourceKey": "j2-43",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 19,
    "slug": "yacoub-student-problem",
    "type": "problem_solution",
    "title": "علاج مشكلة دراسية",
    "instruction": "اقترح مشكلة دراسية وحلها على غرار النص.",
    "prompt": "المشكلة: صعوبة فهم القواعد النحوية وكثرة الخوف من الامتحانات الدراسية.",
    "skillTags": [
      "problem_solving"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "الحل 1: تلخيص القواعد في خرائط ذهنية ملونة وجذابة مبسطة.\nالحل 2: التدرب اليومي على حل أنشطة تفاعلية قصيرة وممتعة دون خوف."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-student-problem-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-student-problem-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-student-problem-completion-feedback"
  },
  {
    "sourceKey": "j2-23",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 20,
    "slug": "yacoub-story-titles",
    "type": "three_answers",
    "title": "عناوين مقترحة لحكاية مجدي يعقوب",
    "instruction": "اكتب ثلاثة عناوين مناسبة لحكاية مجدي يعقوب.",
    "prompt": "اقترح 3 عناوين تعبر عن الطبيب الإنساني ورحلة عطائه:",
    "skillTags": [
      "creative_thinking"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "1. زارع الأمل بأسوان\n2. طبيب القلوب الرحيم\n3. رحلة العطاء والعودة للوطن"
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-story-titles-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-story-titles-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-story-titles-completion-feedback"
  },
  {
    "sourceKey": "j2-29",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 21,
    "slug": "yacoub-target-community",
    "type": "fill_in_the_blank",
    "title": "المجتمع المستهدف بالمركز",
    "instruction": "أكمل: أُنشئ مركز القلب لخدمة.",
    "prompt": "أُنشئ مركز جراحة القلب في مدينة أسوان لخدمة [blank1] والفقراء بالمجان.",
    "skillTags": [
      "listening_comprehension"
    ],
    "isGraded": true,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {
        "blank1": [
          "اهالي الصعيد",
          "أهالي الصعيد",
          "الصعيد"
        ]
      },
      "explanation": "اختار الدكتور مجدي يعقوب أسوان تحديداً لخدمة أهالي الصعيد نظراً لقلة الخدمات الطبية الصعبة هناك قديماً."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-target-community-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-target-community-prompt",
    "correctFeedbackAudioKey": "king-of-hearts-yacoub-target-community-correct-feedback",
    "incorrectFeedbackAudioKey": "king-of-hearts-yacoub-target-community-incorrect-feedback",
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-target-community-completion-feedback"
  },
  {
    "sourceKey": "j2-40",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 22,
    "slug": "yacoub-alternative-ending",
    "type": "long_text",
    "title": "اقتراح نهاية بديلة للقصة",
    "instruction": "اقترح نهاية أخرى مناسبة ومطمئنة لقصة الطبيب مجدي يعقوب.",
    "prompt": "اكتب نهاية بديلة تتخيلها لزيارة أحد الأطفال المتعافين للمركز بعد سنوات طويلة من العلاج:",
    "skillTags": [
      "creative_thinking"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "كبر الطفل وأصبح طبيب جراحة متميزاً في نفس المركز بأسوان، ليرد الجميل ويعالج قلوب أطفال آخرين متطوعاً ومحباً."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-alternative-ending-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-alternative-ending-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-alternative-ending-completion-feedback"
  },
  {
    "sourceKey": "j2-42",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 23,
    "slug": "yacoub-different-ending",
    "type": "long_text",
    "title": "نهاية بديلة تعبر عن الأثر الإنساني",
    "instruction": "صمم نهاية مختلفة تعبر عن انتشار فكرة العطاء في مجتمعك.",
    "prompt": "تخيل تأثر زملاء الطبيب بعودته وخطواتهم اللاحقة لمساندته:",
    "skillTags": [
      "creative_thinking"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "FULL_RESPONSE",
    "options": [],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "تأثر الكثير من العلماء والأطباء المهاجرين بمسيرة مجدي يعقوب، وقرروا تأسيس مراكز تخصصية أخرى مجانية في مختلف مدن مصر الحبيبة."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-different-ending-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-different-ending-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-different-ending-completion-feedback"
  },
  {
    "sourceKey": "j2-45",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 24,
    "slug": "yacoub-agree-disagree",
    "type": "agree_disagree",
    "title": "موقفي من قيم السيرة والعطاء",
    "instruction": "حدد موقفك (موافق/غير موافق) من العبارات وعبر عن رأيك بصدق.",
    "prompt": "العمل الإنساني ومساعدة المحتاجين هو أهم بكثير من نيل الشهرة والجوائز الفردية.",
    "skillTags": [
      "value_judgment"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "agree",
        "label": "موافق",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-agree-disagree-option-agree"
      },
      {
        "optionKey": "disagree",
        "label": "غير موافق",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-agree-disagree-option-disagree"
      }
    ],
    "answerKey": {
      "answerData": {},
      "modelAnswer": "الإجابات قد تختلف، وهذه بعض الأفكار المقترحة: مساعدة المحتاجين تجلب السعادة الحقيقية الدائمة للمجتمع والنفوس."
    },
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-agree-disagree-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-agree-disagree-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-agree-disagree-completion-feedback"
  },
  {
    "sourceKey": "j2-49",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 25,
    "slug": "yacoub-listening-behavior",
    "type": "self_assessment",
    "title": "سلوكيات الاستماع المتميزة",
    "instruction": "أجب بصراحة عن سلوكياتك أثناء استماع المعلم أو المقطع الصوتي.",
    "prompt": "ما الذي تحرص على فعله لتكون مستمعاً متميزاً للقصص والخبر المسموع؟",
    "skillTags": [
      "listening_skills"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "focus",
        "label": "أنصت بكل حواسي وأتجنب أي تشتت جانبي",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-listening-behavior-option-focus"
      },
      {
        "optionKey": "notes",
        "label": "أدون الأفكار الرائعة أو الكلمات الجديدة التي تعجبني",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-listening-behavior-option-notes"
      },
      {
        "optionKey": "distracted",
        "label": "قد أنشغل أحياناً ولكني سرعان ما أستعيد التركيز",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-listening-behavior-option-distracted"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-listening-behavior-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-listening-behavior-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-listening-behavior-completion-feedback"
  },
  {
    "sourceKey": "j2-50",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 26,
    "slug": "yacoub-improvement-checklist",
    "type": "self_assessment",
    "title": "المهارات التي تحسنت فيها",
    "instruction": "حدد المهارات التي تشعر أنك تحسنت فيها باللغة العربية.",
    "prompt": "اختر المهارات اللغوية التي تلاحظ تطورك الإيجابي والملحوظ فيها:",
    "skillTags": [
      "self_evaluation"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "listening",
        "label": "الاستماع بتركيز وفهم أدق تفاصيل النصوص",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-improvement-checklist-option-listening"
      },
      {
        "optionKey": "reading",
        "label": "قراءة النصوص المتنوعة بطلاقة وسرعة ودون تعثر",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-improvement-checklist-option-reading"
      },
      {
        "optionKey": "writing",
        "label": "كتابة الجمل والتعبير عن آرائي وأفكاري بوضوح تام",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-improvement-checklist-option-writing"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-improvement-checklist-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-improvement-checklist-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-improvement-checklist-completion-feedback"
  },
  {
    "sourceKey": "j2-51",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 27,
    "slug": "yacoub-competitions-assessment",
    "type": "self_assessment",
    "title": "حبي واهتمامي بالمسابقات المدرسية",
    "instruction": "لماذا تحب المشاركة في المسابقات اللغوية والثقافية؟",
    "prompt": "اختر الدوافع التي تجعلك متطلعاً للأنشطة والمسابقات بصفك الدراسي:",
    "skillTags": [
      "motivation"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "learn",
        "label": "لأنها تزيد من مخزوني المعرفي واللغوي بأسلوب ممتع وشيق",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-competitions-assessment-option-learn"
      },
      {
        "optionKey": "team",
        "label": "لأني أحب التعاون والعمل الجماعي مع زملائي الأبطال",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-competitions-assessment-option-team"
      },
      {
        "optionKey": "challenge",
        "label": "لأنني أحب خوض التحديات وإثبات كفاءتي وتفوقي الصفي",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-competitions-assessment-option-challenge"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-competitions-assessment-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-competitions-assessment-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-competitions-assessment-completion-feedback"
  },
  {
    "sourceKey": "j2-52",
    "sourceLessonNumber": 2,
    "sourceActivityNumber": 28,
    "slug": "yacoub-encouragement-assessment",
    "type": "self_assessment",
    "title": "تقييم تشجيع الأهل والمعلم",
    "instruction": "قيم مدى تشجيع والديك ومعلمك وتفاعلك معهم.",
    "prompt": "كيف تصف الدعم والتشجيع الذي تتلقاه باستمرار لمواصلة تطورك التعليمي؟",
    "skillTags": [
      "social_support"
    ],
    "isGraded": false,
    "isSensitive": false,
    "storagePolicy": "COMPLETION_ONLY",
    "options": [
      {
        "optionKey": "superb",
        "label": "تشجيع دائم وحث قوي ودعم بالجوائز ومتابعة يومية مخلصة",
        "displayOrder": 1,
        "narrationKey": "king-of-hearts-yacoub-encouragement-assessment-option-superb"
      },
      {
        "optionKey": "good",
        "label": "دعم كافٍ ومساندة ومساعدة فعالة عند التعثر أو الحاجة",
        "displayOrder": 2,
        "narrationKey": "king-of-hearts-yacoub-encouragement-assessment-option-good"
      },
      {
        "optionKey": "self",
        "label": "أعتمد بالكامل على تحفيزي الذاتي وشغفي الخاص بالتعلم والمثابرة",
        "displayOrder": 3,
        "narrationKey": "king-of-hearts-yacoub-encouragement-assessment-option-self"
      }
    ],
    "answerKey": null,
    "configuration": null,
    "instructionAudioKey": "king-of-hearts-yacoub-encouragement-assessment-instruction",
    "promptAudioKey": "king-of-hearts-yacoub-encouragement-assessment-prompt",
    "correctFeedbackAudioKey": null,
    "incorrectFeedbackAudioKey": null,
    "completionFeedbackAudioKey": "king-of-hearts-yacoub-encouragement-assessment-completion-feedback"
  }
];

export const allActivities: ActivityDefinition[] = [...lesson1Activities, ...lesson2Activities];
