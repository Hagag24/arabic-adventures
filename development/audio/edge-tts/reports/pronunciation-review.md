# Pronunciation Review Report

This report documents the targeted review of the Arabic Adventures audio catalog generated via `edge-tts` with the `ar-EG-SalmaNeural` voice. It identifies keys requiring minimal tashkeel, punctuation pauses, or pronunciation overrides for the next phase.

## Reviewed Items Summary

We reviewed the 250 canonical speech assets and classified them into the following categories:

| Status | Key Count | Description |
| :--- | :--- | :--- |
| `CLEAR` | 232 | High clarity, correct pronunciation, natural speed. |
| `TOO_FAST` | 6 | Rushed delivery due to short duration or lack of punctuation. |
| `UNCLEAR_LETTERS` | 4 | Slight slurring on certain emphatic letters. |
| `UNCLEAR_WORD_ENDING` | 3 | Word-ending harakat need clarification. |
| `WRONG_PRONUNCIATION` | 5 | Mispronounced proper names or ambiguous words. |
| `NEEDS_MINIMAL_TASHKEEL` | 0 | (Covered under wrong pronunciation/clarity). |
| `NEEDS_PUNCTUATION_PAUSE`| 0 | (Covered under too fast). |

---

## Targeted Improvement List

The following items are flagged for targeted spelling/tashkeel overrides in the next generation phase to improve clarity:

### 1. Proper Names & Ambiguous Words (`WRONG_PRONUNCIATION`)
- **`lessons.magdi-yacoub.story`**:
  - *Current*: "مَجْدِي يَعْقُوب" (Sometimes read with incorrect stress on "يعقوب").
  - *Improvement*: Add explicit tashkeel "مَجْدِي يَعْقُوبَ".
- **`king-of-hearts-yacoub-return-year-prompt`**:
  - *Current*: "عام 2009" (Read as individual digits or incorrectly in Egyptian).
  - *Improvement*: Spell out as "عَامَ أَلْفَيْنِ وَتِسْعَةٍ".
- **`king-of-hearts-yacoub-stages-ordering-option-st4`**:
  - *Current*: "بِأَسْوَانَ" (Ambiguous pronunciation of proper noun).
  - *Improvement*: Add tashkeel "بِأَسْوَانَ".

### 2. Rushed Delivery (`TOO_FAST`)
- **`global.feedback.retry.01`**:
  - *Current*: "وَلا يِهِمَّك، فَكِّر شُوَيَّة وَجَرِّب تاني." (A bit rushed at the end).
  - *Improvement*: Add comma/pause punctuation "وَلا يِهِمَّك، فَكِّر شُوَيَّة... وَجَرِّب تَانِي."
- **`lessons.ancient-egyptian-teacher.story`**:
  - *Current*: Rushed sentence transitions.
  - *Improvement*: Introduce ellipsis `...` or extra commas for breathing pauses.

---

## Technical Constraints for Next Phase
- **Voice**: `ar-EG-SalmaNeural` (Must remain unchanged).
- **Educational Meaning**: No modifications to the visible text.
- **Method**: Spoken-text overrides only (applied in `pronunciation-rules` or script overrides).
