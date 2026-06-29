# Content Conversion Rules - Phase 00

This document outlines the core structural principles and rules for content conversion and imports as the application moves beyond Phase 00.

---

## 1. Separation of Concerns

* **Student Content Separation**: Student-facing content, prompts, guides, and activity text are separated from answer keys, grading heuristics, and validation scripts.
* **Server-Only Answer Keys**: Answer keys and correct responses must remain server-side resources. They must never be bundled into Client Components or exposed in client-side bundles.

---

## 2. Educational Tagging vs. Interaction Types

* **Educational Skill Tags**: Educational milestones are classified by skill tags (e.g. `reading_comprehension`, `vocabulary_acquisition`, `listening_skills`).
* **Interaction Types**: The interface interaction type (e.g. `single_choice`, `text_ordering`, `audio_matching`) is treated as a separate property. This enables separating the visual presentation layout from the target educational learning outcome.

---

## 3. Assessment & Grading Heuristics

* **Self-Assessment**: Exercises categorized as self-assessments (e.g. reflection prompts, personal predictions) are not graded or assigned scores.
* **Open Responses**: Short text answers, creative writing, and voice recordings require human (teacher) review. No automated grading will make final assertions on creative or open-ended responses.

---

## 4. Privacy & Access Controls

* **Restricted Responses**: Student workbook answers, voice recordings, and activity logs represent sensitive personal data. Access to these resources must be restricted to authenticated owners (the student) and authorized managers (their teacher).
* **Audio Resource Assets**: Audio content (pronunciations, story readings) will be referenced using approved, optimized static media assets stored in persistent directories on the server.

---

## 5. Phase 00 Constraints

* **No Premature Imports**: Complete textbook content, real multiple-choice questions, and workbook assets are not imported in Phase 00.
* **Structural Previews**: The database contains only structural journey and stage maps. No activities or workbook answers exist in the database or client code at this stage.
