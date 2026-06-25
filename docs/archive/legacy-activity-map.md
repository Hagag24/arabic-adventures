# Final Activity Map

This document defines the implementation map for all three journeys, structured stage-by-stage with respective interactions, audio dependencies, evaluation rules, and persistence policies.

---

## Journey 1: أسرار المعلم المصري القديم (`ancient-egyptian-teacher`)
* **Theme**: Ancient Egypt / History
* **Achievement Title**: مستكشف الحضارة
* **Stage 1: استعد (prepare)**
  * **Activity**: `arabic-self-assessment`
  * **Interaction**: `self_assessment` (Multiple cards for feelings, extra reading, classroom attention, etc.)
  * **Audio**: None
  * **Evaluation Rule**: Ungraded
  * **Persistence**: `COMPLETION_ONLY`
* **Stage 2: توقّع (predict)**
  * **Activity**: `titles-generation`
  * **Interaction**: `three_answers` (Student invents 3 titles)
  * **Audio**: None
  * **Evaluation Rule**: Ungraded, completes upon submitting 3 non-empty responses. Shows model answers:
    1. مكانة المعلم في مصر القديمة
    2. الكاتب المصري القديم ودوره في نشر العلم
    3. اكتشاف مقبرة معلم قديم
  * **Persistence**: `FULL_RESPONSE`
* **Stage 3: استمع (listen)**
  * **Activity**: `best-title-choice`
  * **Interaction**: `single_choice` (Choose the best title for the news report)
  * **Audio**: `ancient-egyptian-teacher-main` (Egyptian-delivered news report narration)
  * **Evaluation Rule**: Graded. Correct option: "المعلم المصري القديم ودوره في الحضارة"
  * **Persistence**: `FULL_RESPONSE`
* **Stage 4: افهم (understand)**
  * **Activity 1**: `main-idea-choice`
    * **Interaction**: `single_choice`
    * **Evaluation**: Graded. Correct option: "احترام المعلم المصري القديم ودوره في نشر العلم"
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 2**: `comprehension-questions`
    * **Interaction**: `fill_in_the_blank` (Questions about discovery site, reason of importance, etc.)
    * **Evaluation**: Graded. Normalizes spaces and Arabic diacritics.
    * **Persistence**: `FULL_RESPONSE`
* **Stage 5: العب بالكلمات (word-play)**
  * **Activity 1**: `synonym-matching`
    * **Interaction**: `matching` (Match words: عالم ⟷ باحث, مقبرة ⟷ مدفن)
    * **Evaluation**: Graded.
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 2**: `antonyms-detailed`
    * **Interaction**: `matching` (Match words: مكانة ⟷ تجاهل, احترام ⟷ ازدراء, تقدير ⟷ إهمال, معلم ⟷ تلميذ)
    * **Evaluation**: Graded. Antonym correctness strictly verified.
    * **Persistence**: `FULL_RESPONSE`
* **Stage 6: رتّب الأحداث (sequence-events)**
  * **Activity**: `event-ordering`
  * **Interaction**: `ordering` (Two sets of ordering tasks: museum presentation and scribe's life cycle)
  * **Audio**: None
  * **Evaluation Rule**: Graded. Correct sequence validated on the server.
  * **Persistence**: `FULL_RESPONSE`
* **Stage 7: فكّر وأبدع (think-and-create)**
  * **Activity 1**: `what-if-reflection`
    * **Interaction**: `long_text` (What if the tomb was never found?)
    * **Evaluation**: Ungraded. Shows model answer: "لما عرفنا مكانة الكاتب..."
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 2**: `discovery-results`
    * **Interaction**: `three_answers` (Two results of the discovery)
    * **Evaluation**: Ungraded.
    * **Persistence**: `FULL_RESPONSE`
* **Stage 8: راجع إنجازك (review-achievement)**
  * **Activity**: `character-event-identification`
  * **Interaction**: `matching` (Match: أهم شخصية ⟷ الكاتب أو المعلم, أهم حدث ⟷ اكتشاف المقبرة)
  * **Audio**: None
  * **Evaluation Rule**: Graded.
  * **Persistence**: `FULL_RESPONSE`

---

## Journey 2: ملك القلوب (`king-of-hearts`)
* **Theme**: Humanity / Giving
* **Achievement Title**: صانع الأمل
* **Stage 1: استعد (prepare)**
  * **Activity 1**: `yacoub-praise-assessment`
    * **Interaction**: `self_assessment` (Feelings when receiving praise)
    * **Persistence**: `COMPLETION_ONLY`
  * **Activity 2**: `yacoub-score-motivation`
    * **Interaction**: `self_assessment` (Reason for wanting high marks in Arabic)
    * **Persistence**: `COMPLETION_ONLY`
* **Stage 2: توقّع (predict)**
  * **Activity**: `yacoub-title-prediction`
  * **Interaction**: `short_text` (Predicting story content from title)
  * **Evaluation Rule**: Ungraded.
  * **Persistence**: `FULL_RESPONSE`
* **Stage 3: استمع (listen)**
  * **Activity 1**: `yacoub-stages-ordering`
    * **Interaction**: `ordering` (Order core events of the audio biography)
    * **Audio**: `king-of-hearts-main` (Egyptian-delivered biography narration)
    * **Evaluation Rule**: Graded.
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 2**: `yacoub-return-year`
    * **Interaction**: `fill_in_the_blank` (Year he returned to Egypt)
    * **Evaluation Rule**: Graded. Correct answer: "2009"
    * **Persistence**: `FULL_RESPONSE`
* **Stage 4: افهم (understand)**
  * **Activity 1**: `yacoub-surgeon-calmness`
    * **Interaction**: `single_choice` (Why the surgeon should be calm)
    * **Evaluation**: Graded. Correct: "لديه القدرة على تحقيق النجاح"
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 2**: `yacoub-alternative-solution`
    * **Interaction**: `single_choice` (Alternative way to help الصعيد)
    * **Evaluation**: Graded. Correct: "تدريب أطباء محليين في الصعيد"
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 3**: `yacoub-insist-reason`
    * **Interaction**: `fill_in_the_blank` (Why did he insist on building the center?)
    * **Evaluation**: Graded. Normalized checks. Correct: "لمساعدة الفقراء وعلاج المرضى"
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 4**: `yacoub-biggest-challenge`
    * **Interaction**: `fill_in_the_blank` (Challenge faced)
    * **Evaluation**: Graded. Correct: "نقص المال والإمكانيات"
    * **Persistence**: `FULL_RESPONSE`
* **Stage 5: العب بالكلمات (word-play)**
  * **Activity 1**: `yacoub-new-word`
    * **Interaction**: `short_text` (Word and sentence formulation)
    * **Evaluation**: Ungraded.
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 2**: `yacoub-arabic-practical-use`
    * **Interaction**: `single_choice` (Practical benefit of Arabic)
    * **Evaluation**: Graded. Correct: "المساعدة على النجاح في المواد الأخرى"
    * **Persistence**: `FULL_RESPONSE`
* **Stage 6: رتّب الأحداث (sequence-events)**
  * **Activity**: `yacoub-life-ordering`
  * **Interaction**: `ordering` (Reorder life milestones: birth ➔ love for medicine ➔ travel ➔ treatment ➔ societal impact)
  * **Evaluation Rule**: Graded.
  * **Persistence**: `FULL_RESPONSE`
* **Stage 7: فكّر وأبدع (think-and-create)**
  * **Activity 1**: `yacoub-problem-solutions`
    * **Interaction**: `problem_solution` (Identify problem: "نقص الإمكانيات" and two solutions)
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 2**: `yacoub-funding-alternatives`
    * **Interaction**: `long_text` (Solutions if no funding existed)
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 3**: `yacoub-character-opinion`
    * **Interaction**: `long_text` (Opinion on Dr. Yacoub as role model)
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 4**: `yacoub-interview-questions`
    * **Interaction**: `three_answers` (Three questions to ask him)
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 5**: `yacoub-story-retell`
    * **Interaction**: `retell_story` (Retell story in own words)
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 6**: `yacoub-humanitarian-project`
    * **Interaction**: `story_builder` (Design own project: Problem ➔ Solution ➔ Ending)
    * **Persistence**: `FULL_RESPONSE`
  * **Activity 7**: `yacoub-student-problem`
    * **Interaction**: `problem_solution` (Student procrastination problem & plan)
    * **Persistence**: `FULL_RESPONSE`
* **Stage 8: راجع إنجازك (review-achievement)**
  * **Activity 1**: `yacoub-agree-disagree`
    * **Interaction**: `agree_disagree` (Agree/disagree with statements: "الإصرار سبب النجاح", "العمل الإنساني أهم من الشهرة")
    * **Persistence**: `COMPLETION_ONLY`
  * **Activity 2**: `yacoub-listening-behavior`
    * **Interaction**: `checklist` (Correct listening behaviors checklist)
    * **Persistence**: `COMPLETION_ONLY`
  * **Activity 3**: `yacoub-improvement-checklist`
    * **Interaction**: `self_assessment` (Skills improved)
    * **Persistence**: `COMPLETION_ONLY`
  * **Activity 4**: `yacoub-encouragement-assessment`
    * **Interaction**: `self_assessment` (Parent & teacher encouragement checklist)
    * **Persistence**: `COMPLETION_ONLY`

---

## Journey 3: جسدي أمانة (`my-body-is-a-trust`)
* **Theme**: Safety / Safeguarding
* **Achievement Title**: بطل الأمان
* **Stage 1: استعد (prepare)**
  * **Activity 1**: `safety-arabic-feelings`
    * **Interaction**: `self_assessment` (Arabic class interest)
    * **Persistence**: `COMPLETION_ONLY`
  * **Activity 2**: `safety-arabic-importance`
    * **Interaction**: `self_assessment` (Importance of Arabic)
    * **Persistence**: `COMPLETION_ONLY`
* **Stage 2: توقّع (predict)**
  * **Activity**: `safety-title-reaction`
  * **Interaction**: `self_assessment` (Title prediction checklist)
  * **Persistence**: `COMPLETION_ONLY`
* **Stage 3: استمع (listen)**
  * **Activity 1**: `safety-private-parts`
    * **Interaction**: `single_choice` (Private parts definition)
    * **Audio**: `my-body-is-a-trust-main` (Reassuring child-safety audio story)
    * **Evaluation Rule**: Graded. Correct: "أجزاء لا يحق لأي شخص آخر أن يراها أو يلمسها"
    * **Persistence**: `COMPLETION_ONLY` (Safeguarding enforcement)
  * **Activity 2**: `safety-privacy-meaning`
    * **Interaction**: `single_choice` (Meaning of privacy)
    * **Evaluation Rule**: Graded. Correct: "أن يكون لكل شخص شيء يخصه وحده"
    * **Persistence**: `COMPLETION_ONLY` (Safeguarding enforcement)
* **Stage 4: افهم (understand)**
  * **Activity 1**: `safety-abuse-action`
    * **Interaction**: `single_choice` (What to do if abused/uncomfortable)
    * **Evaluation**: Graded. Correct: "يصرخ ويطلب المساعدة"
    * **Persistence**: `COMPLETION_ONLY` (Safeguarding: NO RESPONSE DATA STORED)
  * **Activity 2**: `safety-uncomfortable-touch`
    * **Interaction**: `single_choice` (What to do if touched uncomfortably)
    * **Evaluation**: Graded. Correct: "يخبر من يثق به"
    * **Persistence**: `COMPLETION_ONLY` (Safeguarding: NO RESPONSE DATA STORED)
  * **Activity 3**: `safety-word-bank-fill`
    * **Interaction**: `fill_in_the_blank` (Drag/drop matching: أمان, إيذاء, خصوصية, كفّ, خطأ)
    * **Evaluation**: Graded.
    * **Persistence**: `FULL_RESPONSE` (Generic sentences, no personal data)
* **Stage 5: العب بالكلمات (word-play)**
  * **Activity**: `safety-word-sentence`
  * **Interaction**: `short_text` (Put word "خصوصية" in sentence)
  * **Evaluation**: Ungraded.
  * **Persistence**: `COMPLETION_ONLY` (Safeguarding: NO RESPONSE DATA STORED)
* **Stage 6: رتّب الأحداث (sequence-events)**
  * **Activity**: `safety-representation-choice`
  * **Interaction**: `single_choice` (Transforming text to drawing, story, or summary choice)
  * **Evaluation**: Graded. Correct: "أعبر عنه في صورة أخرى مثل رسم أو قصة أو ملخص"
  * **Persistence**: `COMPLETION_ONLY` (Safeguarding)
* **Stage 7: فكّر وأبدع (think-and-create)**
  * **Activity 1**: `safety-alternative-ending`
    * **Interaction**: `creative_ending` (Suggest alternative ending)
    * **Persistence**: `COMPLETION_ONLY` (Safeguarding: NEVER store children's personal endings)
  * **Activity 2**: `safety-story-summary`
    * **Interaction**: `retell_story` (Summarize text in own words)
    * **Persistence**: `COMPLETION_ONLY` (Safeguarding)
  * **Activity 3**: `safety-story-retell`
    * **Interaction**: `retell_story` (Retell story)
    * **Persistence**: `COMPLETION_ONLY` (Safeguarding)
  * **Activity 4**: `safety-ending-rethought`
    * **Interaction**: `creative_ending` (Re-suggest alternative endings)
    * **Persistence**: `COMPLETION_ONLY` (Safeguarding)
  * **Activity 5**: `safety-double-endings`
    * **Interaction**: `creative_ending` (Write two distinct endings)
    * **Persistence**: `COMPLETION_ONLY` (Safeguarding)
* **Stage 8: راجع إنجازك (review-achievement)**
  * **Activity 1**: `safety-classroom-attention`
    * **Interaction**: `self_assessment` (Classroom attention level)
    * **Persistence**: `COMPLETION_ONLY`
  * **Activity 2**: `safety-listening-rules`
    * **Interaction**: `checklist` (Listening behavior checkboxes)
    * **Persistence**: `COMPLETION_ONLY`
  * **Activity 3**: `safety-final-self-checks`
    * **Interaction**: `self_assessment` (Self evaluation of safety understanding J3 P26-28)
    * **Persistence**: `COMPLETION_ONLY`
