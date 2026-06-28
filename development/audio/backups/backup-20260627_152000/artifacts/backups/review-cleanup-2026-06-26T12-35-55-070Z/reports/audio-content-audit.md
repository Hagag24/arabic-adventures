# Audio Content Audit Report

This report presents the findings of the audit of the Arabic spoken-audio content pipeline.

## 1. Audit Q&A

1. **Where did the greeting Canary text come from?**
   It comes from the hardcoded constant `CANARY_TEXT` in [audition-google.ts](file:///D:/arabic-adventures/scripts/audio/audition-google.ts#L14-L15).

2. **Is the Canary text hardcoded?**
   Yes.

3. **Is it loaded from an inventory item?**
   No.

4. **Does `--canary` ignore a passed semantic key?**
   Yes, it always synthesizes `CANARY_TEXT` using the voice `Kore`.

5. **What exact final string is sent to Gemini?**
   The final string sent to the API is structured as:
   ```text
   [Performance Instructions]

   Delivery Style: [style] — [pace description]

   TEXT TO SPEAK VERBATIM:
   [Arabic Text]
   ```
   For example, for a feedback item:
   ```text
   Use warm natural Egyptian Arabic.
   Sound encouraging, friendly, and happy.
   Do not shout. Do not exaggerate. Never sound disappointed or harsh.
   Do not add words, delete words, explain the sentence, repeat the sentence, or announce the performance instructions.
   Read only the Arabic text supplied under TEXT TO SPEAK VERBATIM.

   Delivery Style: normal_educational — speak at a natural educational pace.

   TEXT TO SPEAK VERBATIM:
   أَحْسَنْت يا بَطَل، إِجابَتُك صَحيحَة!
   ```

6. **Are performance directions structurally separated from spoken text?**
   Yes, via newlines and the `TEXT TO SPEAK VERBATIM:` marker.

7. **Can the model accidentally read the instructions?**
   No, the instructions explicitly command the model to only read the verbatim text under the marker, and the API response contains only the audio of the spoken phrase.

8. **Are spoken feedback and SFX using separate semantic keys?**
   Yes. SFX uses keys like `global.sfx.correct` and `global.sfx.incorrect`, while spoken feedback uses keys like `global.feedback.correct.01`.

9. **Are any inventory entries empty?**
   No. There are 0 empty spokenText entries.

10. **Are any inventory entries duplicated?**
    No. The inventory generation script deduplicates by key automatically.

11. **Are there placeholder strings?**
    No. There are 0 placeholders (like "TODO" or "placeholder") in the spokenText fields.

12. **Are any file paths being passed as text?**
    No. The only occurrences of slashes are plain punctuation (e.g. `الكاتب / المعلم المصري القديم`), not file paths.

13. **Are all 47 activity screens covered?**
    Yes, all 47 activity screens are present in the activity definitions and processed into the inventory.

14. **Are question options included when the UI allows playing them?**
    Yes, option narration keys are extracted and processed.

15. **Are ungraded self-assessment screens treated separately from correct/incorrect questions?**
    Yes, they play neutral participation feedback (`completionFeedbackAudioKey` mapped to `global.feedback.completion.01` or similar), not graded correct/incorrect sequences.

## 2. Inventory Stats

- **Total unique semantic audio items**: 241
- **Unmapped screens**: 0 (all 47 activities covered)
- **Duplicate keys**: 0
- **Empty spokenText**: 0
