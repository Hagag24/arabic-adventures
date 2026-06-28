# Audio Remediation Blueprint

This blueprint outlines the target architecture and the step-by-step phases required to resolve the runtime playback defects across all student activities.

---

## 1. Target Architecture (TO-BE)

We propose a unified, contract-based audio architecture where all components and renderers consume a central audio contract resolved from the activity payload.

```mermaid
flowchart TD
  Payload["StudentActivityPayload<br/>(from Server)"] -->|Resolve| Contract["ActivityAudioContract<br/>(activity-audio-contract.ts)"]
  Contract -->|Pass down| AR["ActivityRenderer"]
  AR -->|Render speaker buttons| Renderer["Choice / Matching / Ordering Renderer"]
  Renderer -->|playKey()| Orchestrator["AudioOrchestrator"]
  Orchestrator -->|Verify key in manifest| Manifest["audio-manifest.json"]
  Manifest -->|Load and play| WAV["Local WAV file"]
```

### The `ActivityAudioContract` Interface

The central contract is defined as follows:

```typescript
export type ActivityAudioContract = {
  instructionKey?: string;
  questionKey: string;
  answerKeys: Record<string, string>;
  correctFeedbackKey?: string;
  retryFeedbackKey?: string;
  participationFeedbackKey?: string;
  completionFeedbackKey?: string;
};
```

---

## 2. Implementation Phases

### Phase 1: Normalize Activity Audio Metadata
* **Objective:** Ensure all activity definitions have consistent and predictable audio metadata fields.
* **Files to Modify:** `src/content/lesson-activity-definitions.ts`
* **Changes:** Ensure all activity items have valid identifiers and narration keys.
* **Validation:** Run the static audit script.

### Phase 2: Create One Authoritative Audio-Contract Resolver
* **Objective:** Implement the `resolveActivityAudioContract` function to dynamically construct and validate semantic keys.
* **Files to Modify:** `src/audio/runtime/activity-audio-contract.ts`
* **Changes:** Add resolver function, prefix mapping, and validation checks.
* **Validation:** Compile and typecheck.

### Phase 3: Pass the Contract through ActivityRenderer
* **Objective:** Update `ActivityRenderer` and its props to receive and propagate the resolved contract.
* **Files to Modify:** `src/components/activity/ActivityRenderer.tsx`
* **Changes:** Add `audioContract` to `ActivityRendererProps` and pass it to all child renderers.
* **Validation:** Typecheck the component tree.

### Phase 4: Bind Every Active Renderer
* **Objective:** Update all game renderers to play audio from the contract and render speaker buttons unconditionally to avoid hydration mismatches.
* **Files to Modify:**
  * `src/components/activity/renderers/ChoiceRenderer.tsx`
  * `src/components/activity/renderers/MatchingRenderer.tsx`
  * `src/components/activity/renderers/OrderingRenderer.tsx`
  * `src/components/activity/renderers/ChecklistRenderer.tsx`
  * `src/components/activity/renderers/SelfAssessmentRenderer.tsx`
* **Changes:** Use `audioContract.answerKeys[optionKey]` instead of `option.narrationKey`.
* **Validation:** Run playwright e2e tests.

### Phase 5: Correct Question Autoplay Lifecycle
* **Objective:** Ensure question audio plays exactly once on genuine screen entry and handles late manifest loading or audio unlocking correctly.
* **Files to Modify:** `src/components/activity/ActivityPlayerClient.tsx`
* **Changes:** Update autoplay effect to bind to `contract.questionKey`.
* **Validation:** Verify in browser.

---

## 3. File-by-File Change Matrix

| Exact Path | Current Responsibility | Current Defect | Proposed Modification | Why Required | Dependencies | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/audio/runtime/activity-audio-contract.ts` | None | New File | Implement `resolveActivityAudioContract` | To act as the single source of truth for key resolution. | None | **Low** |
| `src/components/activity/ActivityPlayerClient.tsx` | Player Shell | Autoplay bound to missing fields | Use `contract.questionKey` for autoplay; add development-only diagnostics. | To guarantee autoplay on all screens. | Contract Resolver | **Medium** |
| `src/components/activity/ActivityRenderer.tsx` | Game Router | Does not pass contract | Accept `audioContract` and pass it to child renderers. | To propagate the contract to renderers. | Contract Resolver | **Low** |
| `src/components/activity/renderers/ChoiceRenderer.tsx` | Choice UI | Uses missing narration keys | Use `audioContract.answerKeys` and render speaker buttons unconditionally. | To fix playback and hydration mismatch. | ActivityRenderer | **Medium** |
| `src/components/activity/renderers/MatchingRenderer.tsx` | Matching UI | Uses missing narration keys | Use `audioContract.answerKeys`. | To fix option playback. | ActivityRenderer | **Medium** |
| `src/components/activity/renderers/OrderingRenderer.tsx` | Ordering UI | Uses missing narration keys | Use `audioContract.answerKeys`. | To fix item playback. | ActivityRenderer | **Medium** |
| `src/components/activity/renderers/ChecklistRenderer.tsx` | Checklist UI | Uses missing narration keys | Use `audioContract.answerKeys`. | To fix option playback. | ActivityRenderer | **Medium** |
| `src/components/activity/renderers/SelfAssessmentRenderer.tsx` | SelfAssessment UI | Uses missing narration keys | Use `audioContract.answerKeys`. | To fix emotion option playback. | ActivityRenderer | **Medium** |

---

## 4. Validation Blueprint

### Static Audit
We will run `pnpm audio:runtime:audit` which does the following:
* Discovers all 47 activity screens.
* Resolves the contract for each screen.
* Asserts that 100% of the resolved keys exist in the production manifest and have valid physical WAV files.

### Manual & E2E Verification
We will run `pnpm test:e2e` and `pnpm audio:verify:published` to verify:
* Question autoplay on screen entry.
* Audio plays when option cards or speaker buttons are clicked.
* Correct spoken feedback plays upon submission.

---

The complete current-state audio architecture and the proposed remediation blueprint are ready for user review.

No runtime, content, manifest, or audio asset was modified during this analysis.
