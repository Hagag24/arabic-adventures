// Canonical Audio Script Index for Student Experience
// Generated automatically from activity definitions.

export type AudioScriptDefinition = {
  semanticKey: string;
  relativeBasePath: string;
  category:
    | "welcome"
    | "story"
    | "instruction"
    | "prompt"
    | "option"
    | "correct_feedback"
    | "retry_feedback"
    | "completion_feedback"
    | "participation_feedback"
    | "result";
  deliveryProfile: "formal_educational" | "warm_egyptian_feedback";
  lessonSlug?: string;
  screenId?: string;
  usedByComponent: string;
};

export const audioScripts: AudioScriptDefinition[] = [
  {
    "semanticKey": "global.welcome.01",
    "relativeBasePath": "global/welcome/01",
    "category": "welcome",
    "deliveryProfile": "formal_educational",
    "usedByComponent": "WelcomeAudioButton"
  },
  {
    "semanticKey": "global.feedback.correct.01",
    "relativeBasePath": "global/feedback/correct/01",
    "category": "correct_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "global.feedback.retry.01",
    "relativeBasePath": "global/feedback/retry/01",
    "category": "retry_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "global.feedback.completion.01",
    "relativeBasePath": "global/feedback/completion/01",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "global.feedback.participation.01",
    "relativeBasePath": "global/feedback/participation/01",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "lessons.ancient-egyptian-teacher.story",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/story",
    "category": "story",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "usedByComponent": "LessonStoryAudioButton"
  },
  {
    "semanticKey": "lessons.magdi-yacoub.story",
    "relativeBasePath": "lessons/magdi-yacoub/story",
    "category": "story",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "usedByComponent": "LessonStoryAudioButton"
  },
  {
    "semanticKey": "lessons.ancient-egyptian-teacher.result",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/result",
    "category": "result",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "usedByComponent": "ResultAudioButton"
  },
  {
    "semanticKey": "lessons.magdi-yacoub.result",
    "relativeBasePath": "lessons/magdi-yacoub/result",
    "category": "result",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "usedByComponent": "ResultAudioButton"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-feelings-j1-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-feelings-j1/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-feelings-j1",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-feelings-j1-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-feelings-j1/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-feelings-j1",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-feelings-j1-option-happy",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-feelings-j1/option-happy",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-feelings-j1",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-feelings-j1-option-neutral",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-feelings-j1/option-neutral",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-feelings-j1",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-feelings-j1-option-calm",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-feelings-j1/option-calm",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-feelings-j1",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-feelings-j1-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-feelings-j1/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-feelings-j1",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-self-assessment-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-self-assessment/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-self-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-self-assessment-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-self-assessment/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-self-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-self-assessment-option-happy",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-self-assessment/option-happy",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-self-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-self-assessment-option-neutral",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-self-assessment/option-neutral",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-self-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-self-assessment-option-bored",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-self-assessment/option-bored",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-self-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-arabic-self-assessment-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/arabic-self-assessment/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "arabic-self-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-titles-generation-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/titles-generation/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "titles-generation",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-titles-generation-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/titles-generation/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "titles-generation",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-titles-generation-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/titles-generation/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "titles-generation",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-student-questions-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/student-questions/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "student-questions",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-student-questions-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/student-questions/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "student-questions",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-student-questions-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/student-questions/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "student-questions",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-best-title-choice-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/best-title-choice/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "best-title-choice",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-best-title-choice-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/best-title-choice/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "best-title-choice",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-best-title-choice-option-opt1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/best-title-choice/option-opt1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "best-title-choice",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-best-title-choice-option-opt2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/best-title-choice/option-opt2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "best-title-choice",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-best-title-choice-option-opt3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/best-title-choice/option-opt3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "best-title-choice",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-best-title-choice-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/best-title-choice/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "best-title-choice",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-main-idea-choice-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/main-idea-choice/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "main-idea-choice",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-main-idea-choice-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/main-idea-choice/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "main-idea-choice",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-main-idea-choice-option-opt1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/main-idea-choice/option-opt1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "main-idea-choice",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-main-idea-choice-option-opt2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/main-idea-choice/option-opt2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "main-idea-choice",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-main-idea-choice-option-opt3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/main-idea-choice/option-opt3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "main-idea-choice",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-main-idea-choice-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/main-idea-choice/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "main-idea-choice",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-location-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-location/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-location",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-location-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-location/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-location",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-location-option-loc1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-location/option-loc1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-location",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-location-option-loc2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-location/option-loc2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-location",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-location-option-loc3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-location/option-loc3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-location",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-location-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-location/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-location",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-importance-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-importance/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-importance",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-importance-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-importance/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-importance",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-importance-option-imp1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-importance/option-imp1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-importance",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-importance-option-imp2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-importance/option-imp2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-importance",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-importance-option-imp3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-importance/option-imp3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-importance",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-tomb-importance-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/tomb-importance/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "tomb-importance",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-teacher-status-discovery-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/teacher-status-discovery/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "teacher-status-discovery",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-teacher-status-discovery-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/teacher-status-discovery/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "teacher-status-discovery",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-teacher-status-discovery-option-st1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/teacher-status-discovery/option-st1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "teacher-status-discovery",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-teacher-status-discovery-option-st2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/teacher-status-discovery/option-st2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "teacher-status-discovery",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-teacher-status-discovery-option-st3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/teacher-status-discovery/option-st3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "teacher-status-discovery",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-teacher-status-discovery-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/teacher-status-discovery/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "teacher-status-discovery",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-synonym-matching-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/synonym-matching/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "synonym-matching",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-synonym-matching-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/synonym-matching/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "synonym-matching",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-synonym-matching-option-word1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/synonym-matching/option-word1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "synonym-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-synonym-matching-option-word2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/synonym-matching/option-word2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "synonym-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-synonym-matching-option-word3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/synonym-matching/option-word3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "synonym-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-synonym-matching-option-mean1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/synonym-matching/option-mean1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "synonym-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-synonym-matching-option-mean2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/synonym-matching/option-mean2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "synonym-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-synonym-matching-option-mean3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/synonym-matching/option-mean3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "synonym-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-synonym-matching-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/synonym-matching/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "synonym-matching",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-w1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-w1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-w2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-w2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-w3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-w3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-w4",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-w4",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-w5",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-w5",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-w6",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-w6",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-ant1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-ant2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-ant3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant4",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-ant4",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant5",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-ant5",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-option-ant6",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/option-ant6",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-antonyms-detailed-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/antonyms-detailed/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "antonyms-detailed",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-meaning-matching-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-meaning-matching/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-meaning-matching",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-meaning-matching-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-meaning-matching/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-meaning-matching",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-meaning-matching-option-evt1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-meaning-matching/option-evt1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-meaning-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-meaning-matching-option-evt2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-meaning-matching/option-evt2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-meaning-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-meaning-matching-option-evt3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-meaning-matching/option-evt3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-meaning-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-meaning-matching-option-val1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-meaning-matching/option-val1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-meaning-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-meaning-matching-option-val2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-meaning-matching/option-val2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-meaning-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-meaning-matching-option-val3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-meaning-matching/option-val3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-meaning-matching",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-meaning-matching-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-meaning-matching/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-meaning-matching",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-ordering-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-ordering/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-ordering",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-ordering-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-ordering/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-ordering",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-ordering-option-evt1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-ordering/option-evt1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-ordering-option-evt2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-ordering/option-evt2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-ordering-option-evt3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-ordering/option-evt3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-ordering-option-evt4",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-ordering/option-evt4",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-event-ordering-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/event-ordering/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "event-ordering",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-what-if-reflection-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/what-if-reflection/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "what-if-reflection",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-what-if-reflection-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/what-if-reflection/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "what-if-reflection",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-what-if-reflection-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/what-if-reflection/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "what-if-reflection",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-discovery-results-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/discovery-results/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "discovery-results",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-discovery-results-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/discovery-results/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "discovery-results",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-discovery-results-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/discovery-results/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "discovery-results",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-character-event-identification-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/character-event-identification/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "character-event-identification",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-character-event-identification-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/character-event-identification/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "character-event-identification",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-character-event-identification-option-elm1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/character-event-identification/option-elm1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "character-event-identification",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-character-event-identification-option-elm2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/character-event-identification/option-elm2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "character-event-identification",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-character-event-identification-option-def1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/character-event-identification/option-def1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "character-event-identification",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-character-event-identification-option-def2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/character-event-identification/option-def2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "character-event-identification",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-character-event-identification-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/character-event-identification/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "character-event-identification",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-mental-visualization-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/mental-visualization/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "mental-visualization",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-mental-visualization-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/mental-visualization/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "mental-visualization",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-mental-visualization-option-vis1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/mental-visualization/option-vis1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "mental-visualization",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-mental-visualization-option-vis2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/mental-visualization/option-vis2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "mental-visualization",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-mental-visualization-option-vis3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/mental-visualization/option-vis3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "mental-visualization",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-mental-visualization-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/mental-visualization/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "mental-visualization",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-new-words-usage-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/new-words-usage/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "new-words-usage",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-new-words-usage-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/new-words-usage/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "new-words-usage",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-new-words-usage-option-use_yes",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/new-words-usage/option-use_yes",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "new-words-usage",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-new-words-usage-option-use_try",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/new-words-usage/option-use_try",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "new-words-usage",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-new-words-usage-option-use_no",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/new-words-usage/option-use_no",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "new-words-usage",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-new-words-usage-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/new-words-usage/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "new-words-usage",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-classroom-attention-instruction",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/classroom-attention/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "classroom-attention",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-classroom-attention-prompt",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/classroom-attention/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "classroom-attention",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-classroom-attention-option-att1",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/classroom-attention/option-att1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "classroom-attention",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-classroom-attention-option-att2",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/classroom-attention/option-att2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "classroom-attention",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-classroom-attention-option-att3",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/classroom-attention/option-att3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "classroom-attention",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "ancient-egyptian-teacher-classroom-attention-completion-feedback",
    "relativeBasePath": "lessons/ancient-egyptian-teacher/classroom-attention/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "ancient-egyptian-teacher",
    "screenId": "classroom-attention",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-praise-assessment-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-praise-assessment/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-praise-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-praise-assessment-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-praise-assessment/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-praise-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-praise-assessment-option-proud",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-praise-assessment/option-proud",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-praise-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-praise-assessment-option-happy",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-praise-assessment/option-happy",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-praise-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-praise-assessment-option-shy",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-praise-assessment/option-shy",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-praise-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-praise-assessment-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-praise-assessment/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-praise-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-score-motivation-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-score-motivation/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-score-motivation",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-score-motivation-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-score-motivation/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-score-motivation",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-score-motivation-option-love",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-score-motivation/option-love",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-score-motivation",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-score-motivation-option-pleasing",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-score-motivation/option-pleasing",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-score-motivation",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-score-motivation-option-competition",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-score-motivation/option-competition",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-score-motivation",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-score-motivation-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-score-motivation/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-score-motivation",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-title-prediction-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-title-prediction/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-title-prediction",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-title-prediction-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-title-prediction/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-title-prediction",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-title-prediction-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-title-prediction/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-title-prediction",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-stages-ordering-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-stages-ordering/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-stages-ordering",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-stages-ordering-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-stages-ordering/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-stages-ordering",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-stages-ordering-option-st1",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-stages-ordering/option-st1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-stages-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-stages-ordering-option-st2",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-stages-ordering/option-st2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-stages-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-stages-ordering-option-st3",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-stages-ordering/option-st3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-stages-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-stages-ordering-option-st4",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-stages-ordering/option-st4",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-stages-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-stages-ordering-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-stages-ordering/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-stages-ordering",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-return-year-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-return-year/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-return-year",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-return-year-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-return-year/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-return-year",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-return-year-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-return-year/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-return-year",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-surgeon-calmness-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-surgeon-calmness/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-surgeon-calmness",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-surgeon-calmness-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-surgeon-calmness/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-surgeon-calmness",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-surgeon-calmness-option-ans1",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-surgeon-calmness/option-ans1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-surgeon-calmness",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-surgeon-calmness-option-ans2",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-surgeon-calmness/option-ans2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-surgeon-calmness",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-surgeon-calmness-option-ans3",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-surgeon-calmness/option-ans3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-surgeon-calmness",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-surgeon-calmness-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-surgeon-calmness/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-surgeon-calmness",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-alternative-solution-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-alternative-solution/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-alternative-solution",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-alternative-solution-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-alternative-solution/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-alternative-solution",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-alternative-solution-option-sol1",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-alternative-solution/option-sol1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-alternative-solution",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-alternative-solution-option-sol2",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-alternative-solution/option-sol2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-alternative-solution",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-alternative-solution-option-sol3",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-alternative-solution/option-sol3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-alternative-solution",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-alternative-solution-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-alternative-solution/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-alternative-solution",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-insist-reason-open-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-insist-reason-open/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-insist-reason-open",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-insist-reason-open-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-insist-reason-open/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-insist-reason-open",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-insist-reason-open-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-insist-reason-open/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-insist-reason-open",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-biggest-challenge-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-biggest-challenge/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-biggest-challenge",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-biggest-challenge-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-biggest-challenge/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-biggest-challenge",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-biggest-challenge-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-biggest-challenge/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-biggest-challenge",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-new-word-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-new-word/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-new-word",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-new-word-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-new-word/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-new-word",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-new-word-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-new-word/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-new-word",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-arabic-practical-use-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-arabic-practical-use/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-arabic-practical-use",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-arabic-practical-use-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-arabic-practical-use/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-arabic-practical-use",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-arabic-practical-use-option-use1",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-arabic-practical-use/option-use1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-arabic-practical-use",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-arabic-practical-use-option-use2",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-arabic-practical-use/option-use2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-arabic-practical-use",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-arabic-practical-use-option-use3",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-arabic-practical-use/option-use3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-arabic-practical-use",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-arabic-practical-use-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-arabic-practical-use/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-arabic-practical-use",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-life-ordering-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-life-ordering/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-life-ordering",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-life-ordering-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-life-ordering/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-life-ordering",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-life-ordering-option-mil1",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-life-ordering/option-mil1",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-life-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-life-ordering-option-mil2",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-life-ordering/option-mil2",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-life-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-life-ordering-option-mil3",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-life-ordering/option-mil3",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-life-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-life-ordering-option-mil4",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-life-ordering/option-mil4",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-life-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-life-ordering-option-mil5",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-life-ordering/option-mil5",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-life-ordering",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-life-ordering-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-life-ordering/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-life-ordering",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-problem-solutions-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-problem-solutions/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-problem-solutions",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-problem-solutions-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-problem-solutions/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-problem-solutions",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-problem-solutions-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-problem-solutions/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-problem-solutions",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-funding-alternatives-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-funding-alternatives/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-funding-alternatives",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-funding-alternatives-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-funding-alternatives/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-funding-alternatives",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-funding-alternatives-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-funding-alternatives/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-funding-alternatives",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-character-opinion-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-character-opinion/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-character-opinion",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-character-opinion-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-character-opinion/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-character-opinion",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-character-opinion-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-character-opinion/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-character-opinion",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-interview-questions-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-interview-questions/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-interview-questions",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-interview-questions-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-interview-questions/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-interview-questions",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-interview-questions-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-interview-questions/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-interview-questions",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-story-retell-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-story-retell/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-story-retell",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-story-retell-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-story-retell/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-story-retell",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-story-retell-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-story-retell/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-story-retell",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-humanitarian-project-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-humanitarian-project/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-humanitarian-project",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-humanitarian-project-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-humanitarian-project/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-humanitarian-project",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-humanitarian-project-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-humanitarian-project/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-humanitarian-project",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-student-problem-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-student-problem/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-student-problem",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-student-problem-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-student-problem/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-student-problem",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-student-problem-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-student-problem/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-student-problem",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-story-titles-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-story-titles/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-story-titles",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-story-titles-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-story-titles/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-story-titles",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-story-titles-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-story-titles/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-story-titles",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-target-community-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-target-community/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-target-community",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-target-community-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-target-community/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-target-community",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-target-community-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-target-community/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-target-community",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-alternative-ending-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-alternative-ending/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-alternative-ending",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-alternative-ending-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-alternative-ending/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-alternative-ending",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-alternative-ending-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-alternative-ending/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-alternative-ending",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-different-ending-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-different-ending/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-different-ending",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-different-ending-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-different-ending/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-different-ending",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-different-ending-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-different-ending/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-different-ending",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-agree-disagree-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-agree-disagree/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-agree-disagree",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-agree-disagree-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-agree-disagree/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-agree-disagree",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-agree-disagree-option-agree",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-agree-disagree/option-agree",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-agree-disagree",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-agree-disagree-option-disagree",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-agree-disagree/option-disagree",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-agree-disagree",
    "usedByComponent": "ChoiceRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-agree-disagree-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-agree-disagree/completion-feedback",
    "category": "completion_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-agree-disagree",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-listening-behavior-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-listening-behavior/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-listening-behavior",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-listening-behavior-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-listening-behavior/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-listening-behavior",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-listening-behavior-option-focus",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-listening-behavior/option-focus",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-listening-behavior",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-listening-behavior-option-notes",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-listening-behavior/option-notes",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-listening-behavior",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-listening-behavior-option-distracted",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-listening-behavior/option-distracted",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-listening-behavior",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-listening-behavior-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-listening-behavior/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-listening-behavior",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-improvement-checklist-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-improvement-checklist/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-improvement-checklist",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-improvement-checklist-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-improvement-checklist/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-improvement-checklist",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-improvement-checklist-option-listening",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-improvement-checklist/option-listening",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-improvement-checklist",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-improvement-checklist-option-reading",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-improvement-checklist/option-reading",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-improvement-checklist",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-improvement-checklist-option-writing",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-improvement-checklist/option-writing",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-improvement-checklist",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-improvement-checklist-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-improvement-checklist/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-improvement-checklist",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-competitions-assessment-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-competitions-assessment/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-competitions-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-competitions-assessment-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-competitions-assessment/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-competitions-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-competitions-assessment-option-learn",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-competitions-assessment/option-learn",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-competitions-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-competitions-assessment-option-team",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-competitions-assessment/option-team",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-competitions-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-competitions-assessment-option-challenge",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-competitions-assessment/option-challenge",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-competitions-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-competitions-assessment-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-competitions-assessment/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-competitions-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-encouragement-assessment-instruction",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-encouragement-assessment/instruction",
    "category": "instruction",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-encouragement-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-encouragement-assessment-prompt",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-encouragement-assessment/prompt",
    "category": "prompt",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-encouragement-assessment",
    "usedByComponent": "ActivityPlayerClient"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-encouragement-assessment-option-superb",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-encouragement-assessment/option-superb",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-encouragement-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-encouragement-assessment-option-good",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-encouragement-assessment/option-good",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-encouragement-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-encouragement-assessment-option-self",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-encouragement-assessment/option-self",
    "category": "option",
    "deliveryProfile": "formal_educational",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-encouragement-assessment",
    "usedByComponent": "SelfAssessmentRenderer"
  },
  {
    "semanticKey": "king-of-hearts-yacoub-encouragement-assessment-completion-feedback",
    "relativeBasePath": "lessons/magdi-yacoub/king-of-hearts-yacoub-encouragement-assessment/completion-feedback",
    "category": "participation_feedback",
    "deliveryProfile": "warm_egyptian_feedback",
    "lessonSlug": "magdi-yacoub",
    "screenId": "yacoub-encouragement-assessment",
    "usedByComponent": "ActivityPlayerClient"
  }
];
