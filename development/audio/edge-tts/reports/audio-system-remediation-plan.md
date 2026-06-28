# AUDIO SYSTEM REMEDIATION PLAN

This plan outlines the target architecture updates and the phased, lesson-by-lesson execution steps required to fix the remaining audio defects on the student website.

---

## 1. Lesson-by-Lesson Execution Plan

We implement a phased roll-out to ensure stability. No changes will be applied to the second lesson until Stage 1 is fully completed, verified, and approved by the user.

### Stage 1: Ancient Egyptian Teacher (`ancient-egyptian-teacher`)
* **Objective:** Repair all audio bindings, autoplay lifecycles, and option click handles in the first lesson.
* **Steps:**
  1. Update key resolver (`resolveActivityAudioContract`) to support sub-round options inside `event-ordering` (multi_round).
  2. Pass `audioContract` to `MultiRoundRenderer` in `ActivityRenderer.tsx`.
  3. Bind audio handles in `MultiRoundRenderer.tsx` for ordering options (item move and manual speaker buttons).
  4. Update the static audit script (`audit-all-runtime-audio.ts`) to also check sub-round option keys and alert if any are missing from the manifest.
  5. Run the static audit script to verify Lesson 1. (Note: Since Round B option audios are missing from the manifest/filesystem, the audit script will print warnings. We will register this as a known generation gap to be filled when the user runs the generation pipeline).
  6. Perform manual/browser verification sweep on Lesson 1 screens using `verify-lesson1-audio-sweep.ts`.
  7. Stop and return a complete Stage 1 validation report for user review.

### Stage 2: Magdi Yacoub (`magdi-yacoub`)
* **Objective:** Apply the proven architecture to the second lesson after Stage 1 receives explicit approval.
* **Steps:**
  1. Pass `audioContract` to `AgreeDisagreeRenderer` in `ActivityRenderer.tsx`.
  2. Bind audio handles in `AgreeDisagreeRenderer.tsx` for "Agree" and "Disagree" cards (play on selection and manual speaker buttons).
  3. Run the static audit script to verify Lesson 2.
  4. Perform manual/browser verification sweep on Lesson 2 screens using `verify-remaining-audio.ts`.

---

## 2. File-Change Matrix

Below is the proposed modifications for each file, classified by action priority.

| Exact Path | Current Status | Confirmed Defect | Proposed Modification | Why Required | Risk | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/audio/runtime/activity-audio-contract.ts` | Untracked | Lacks sub-round configuration traversal | Update `resolveActivityAudioContract` to parse `activity.configuration.rounds` and map sub-round option narration keys to `answerKeys`. | To enable option-level audio resolution for multi-round activities. | Low | **MUST_CHANGE** |
| `src/components/activity/ActivityRenderer.tsx` | Modified | Does not pass `audioContract` to `MultiRound` and `AgreeDisagree` | Add `audioContract` prop to `<MultiRoundRenderer>` and `<AgreeDisagreeRenderer>` elements. | To propagate resolved audio keys to the respective renderers. | Low | **MUST_CHANGE** |
| `src/components/activity/renderers/MultiRoundRenderer.tsx` | Modified | Lacks audio handlers and speaker buttons for ordering options | Add `audioContract` to props. Implement click/move play handles and conditional `🔊` speaker buttons for ordering options using `audioContract.answerKeys[optKey]`. | To fix audio playback in the `event-ordering` activity. | Medium | **MUST_CHANGE** |
| `src/components/activity/renderers/AgreeDisagreeRenderer.tsx` | Unmodified | Lacks audio handlers and speaker buttons for agree/disagree options | Add `audioContract` to props. Implement click play handles and conditional `🔊` speaker buttons for "Agree" and "Disagree" options using `audioContract.answerKeys[optKey]`. | To fix audio playback in the `yacoub-agree-disagree` activity. | Medium | **MUST_CHANGE** |
| `scripts/audit-all-runtime-audio.ts` | Untracked | Does not audit sub-round or agree/disagree options | Update script to extract sub-round options and agree/disagree options during static manifest coverage check. | To prevent silent binding failures in future audits. | Low | **MUST_CHANGE** |
| `development/audio/tools/generate-script-index.ts` | Unmodified | Skips sub-round config options during index generation | Update tool to traverse `configuration.rounds` and add sub-round option narration keys to the script index. | To ensure future TTS generation runs capture Round B options. | Low | **MUST_CHANGE** |
| `src/components/activity/ActivityPlayerClient.tsx` | Modified | None | No change required (already refactored with correct autoplay and feedback sequence). | - | Low | **NO_CHANGE** |
| `src/components/activity/renderers/ChoiceRenderer.tsx` | Modified | None | No change required (already refactored with option click play and isolated speaker buttons). | - | Low | **NO_CHANGE** |
| `src/components/activity/renderers/ChecklistRenderer.tsx` | Modified | None | No change required. | - | Low | **NO_CHANGE** |
| `src/components/activity/renderers/MatchingRenderer.tsx` | Modified | None | No change required. | - | Low | **NO_CHANGE** |
| `src/components/activity/renderers/OrderingRenderer.tsx` | Modified | None | No change required. | - | Low | **NO_CHANGE** |
| `src/components/activity/renderers/SelfAssessmentRenderer.tsx` | Modified | None | No change required. | - | Low | **NO_CHANGE** |
| `src/audio/runtime/AudioProvider.tsx` | Modified | None | No change required. | - | Low | **NO_CHANGE** |
| `src/audio/runtime/audio-orchestrator.ts` | Modified | None | No change required (single channel cancellation and feedback sequencing works as intended). | - | Low | **NO_CHANGE** |
| `src/server/services/activity-service.ts` | Modified | None | No change required (evaluator feedback keys map perfectly to database columns). | - | Low | **NO_CHANGE** |
| `package.json` | Modified | None | No change required. | - | Low | **NO_CHANGE** |

---

## 3. Remediation Blueprint Details (Stage 1 & 2 Blueprint)

### Phase 1: Update key resolver and renderer props (Stage 1 Dependency)
* **Objective:** Allow key resolver to traverse `configuration.rounds` and update `ActivityRenderer` to pass the resolved contract down.
* **Component-level change:**
  * Update `activity-audio-contract.ts` to:
    ```typescript
    if (activity.configuration?.rounds) {
      for (const round of activity.configuration.rounds) {
        if (round.options) {
          for (const opt of round.options) {
            answerKeys[opt.optionKey] = opt.narrationKey || `${prefix}-${activity.slug}-option-${opt.optionKey}`;
          }
        }
      }
    }
    ```
  * Propagate `audioContract={audioContract}` to `<MultiRoundRenderer>` and `<AgreeDisagreeRenderer>` in `ActivityRenderer.tsx`.

### Phase 2: Bind MultiRoundRenderer (Stage 1 Objective)
* **Objective:** Implement click-to-play option audio and manual speaker buttons inside `MultiRoundRenderer.tsx` (for rounds of type `ordering`).
* **Component-level change:**
  * Import `useAudio` and retrieve `playKey` and `stop`.
  * In the move handlers (`moveItem`), call `stop()`, then `playKey(...)` for the moved option's resolved key.
  * Render the manual `🔊` speaker button on each option card (using `type="button"` and stopping click propagation).

### Phase 3: Bind AgreeDisagreeRenderer (Stage 2 Objective)
* **Objective:** Implement click-to-play option audio and manual speaker buttons inside `AgreeDisagreeRenderer.tsx`.
* **Component-level change:**
  * Import `useAudio` and retrieve `playKey` and `stop`.
  * In the select handler (`handleSelect`), call `stop()`, then `playKey(...)` for the selected option's resolved key.
  * Render the manual `🔊` speaker button on the Agree and Disagree cards.

### Phase 4: Run audit and sweep checks (Stage 1 & 2 Verification)
* **Static Verification:** Run `npx.cmd tsx scripts/audit-all-runtime-audio.ts` to assert that all defined keys exist in the manifest and have WAV files (except the known missing Round B options).
* **Browser Verification:** Start the dev server in the background and run:
  * Stage 1 Sweep: `npx.cmd tsx scripts/verify-lesson1-audio-sweep.ts`
  * Stage 2 Sweep: `npx.cmd tsx scripts/verify-remaining-audio.ts`

---

The remediation plan is ready for user review. No code has been modified in this phase.

**ANALYSIS_STATUS = READY_FOR_USER_REVIEW**
**IMPLEMENTATION_STARTED = NO**
**AUDIO_REGENERATION_STARTED = NO**
