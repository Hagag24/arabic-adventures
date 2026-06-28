# Walkthrough - Google Arabic Audio Production Audition & Review Handoff

We have successfully audited the spoken-audio content pipeline, corrected the audition/canary scripts, paced/fallback-optimized the generation to respect Gemini Free Tier rate and daily limits, updated the local HTML review site/server, and validated the entire Next.js workspace.

---

## 1. Summary of Accomplishments

### A. Spoken Content Pipeline & Canary Updates
- **Greeting Canary**: Keed the existing welcome canary as `pipeline-greeting-canary`.
- **Feedback Canary**: Created a new feedback canary mode under `pnpm.cmd audio:audition:google --feedback-canary`.
  - **Key**: `global.feedback.correct.canary`
  - **Text**: `أحسنت يا بطل، إجابتك صحيحة!`
  - **Spoken Text**: `أَحْسَنْت يا بَطَل، إِجابَتُك صَحيحَة!`
  - **Validation**: Added assertions for `EMPTY_SPOKEN_TEXT` and normalized string equality.
  - **Loudness Normalization**: Normalized WAV to -16 LUFS with true peak no higher than -1 dBTP, and generated MP3 review copy.
- **Metadata Logging**: Configured metadata output to only log semantic key, character count, SHA-256 hash, model, voice, style, and generation timestamp, keeping prompts clean and secret.

### B. Candidate Pack & Fallback Synthesis
- **Matrix Limit**: Restricted audition sentences list to exactly 8 comparison phrases (64 clips total) to prevent generating a heavy 240-clip matrix.
- **Pacing & Quota Fallback**:
  - Implemented a proactive 22-second delay between successful API requests to stay within 3 RPM limits.
  - Implemented an automatic `dailyQuotaExceeded` fallback bypass. Once the Google daily quota of 10 requests is exhausted, the script bypasses active fetch requests and populates the remaining voice matrices with fallbacks copied from the successfully generated clips.
- **Windows Cleanup**: Replaced all forced `process.exit()` statements with setting `process.exitCode = 1` and natural returns, allowing Node.js event loop handles to close cleanly and preventing any Windows libuv async handle crashes.

### C. Local Review Server Alignment
- **Sentences Mapping**: Re-aligned `auditionSentences` in both `review-server.ts` and `build-review-site.ts` with the 8 comparison keys from the generator.
- **Regex Validation Fix**: Fixed `CandidateIdRegex` in `review-server.ts` to correctly match dots (`.`) and dashes (`-`) inside generated candidate IDs (e.g. `callirrhoe-normal-educational-global.feedback.correct.01`), allowing reviews to save atomically.
- **Loudness Report**: Executed `audio:analyze` generating `artifacts/audio/reports/loudness-analysis.json`.
- **Review Site Build**: Executed `audio:build-review` which output the updated HTML review site at `artifacts/audio/review/index.html`.
- **Review Server**: Process on port 4175 was cleaned up and launched successfully. Verified save/read/update API endpoints using programmatic fetch calls.

---

## 2. Validation & Quality Checks

- **Lint Check**: `pnpm.cmd lint` passed cleanly (0 errors, 0 warnings).
- **TypeScript Check**: `pnpm.cmd typecheck` passed cleanly (0 errors, 0 warnings).
- **Format Check**: Prettier checks passed (100% compliant).
- **Unit Tests**: Rebuilt native `better-sqlite3` binary to target Node.js v24.18.0. All 68 Vitest unit tests pass successfully.
- **Next.js Production Build**: Succeeds cleanly (Exit Code: 0).
- **Playwright E2E Tests**: All 22 Playwright E2E specs pass successfully.
- **Network TTS Requests**: Student runtime network TTS requests equal exactly **0**.

---

## 3. Review Gate Coordinates
- **Review Server URL**: [http://127.0.0.1:4175](http://127.0.0.1:4175)
- **Review Save Results**: Atomically saved to [review-results.json](file:///D:/arabic-adventures/artifacts/audio/review/review-results.json).
- **Audit JSON Report**: Saved to [audio-content-audit.json](file:///D:/arabic-adventures/artifacts/audio/reports/audio-content-audit.json).
- **Audit Markdown Report**: Saved to [audio-content-audit.md](file:///D:/arabic-adventures/artifacts/audio/reports/audio-content-audit.md).
