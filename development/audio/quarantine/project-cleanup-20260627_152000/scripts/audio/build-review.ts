import fs from "fs";
import path from "path";
import {
  AUDITION_PHRASES,
  VOICES,
  STYLES,
  SFX_KEYS,
} from "./audition-definition";

const AUDIT_JSON = path.resolve(
  process.cwd(),
  "artifacts/audio/reports/candidate-integrity-audit.json",
);
const REVIEW_DIR = path.resolve(process.cwd(), "artifacts/audio/review");
const CATALOG_PATH = path.join(REVIEW_DIR, "review-catalog.json");
const RESULTS_PATH = path.join(REVIEW_DIR, "review-results.json");
const HTML_PATH = path.join(REVIEW_DIR, "index.html");

interface AuditItem {
  candidateId: string;
  semanticKey: string;
  voice: string;
  style: string;
  wavExists: boolean;
  mp3Exists: boolean;
  wavSize: number;
  mp3Size: number;
  wavHash: string;
  mp3Hash: string;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  normalizationStatus: "PASSED" | "FAILED" | "NOT_RUN";
  status: string;
  details: string;
}

interface AuditReport {
  summary: unknown;
  candidates: AuditItem[];
  sfx: Array<{
    key: string;
    wavExists: boolean;
    mp3Exists: boolean;
    duration: number;
    status: string;
  }>;
}

interface ReviewRecord {
  candidateId: string;
  status: "PENDING_HUMAN_REVIEW" | "APPROVED" | "REJECTED";
  favorite: boolean;
  issues: {
    pronunciation: boolean;
    clarity: boolean;
    speed: boolean;
    egyptianDelivery: boolean;
    extraWords: boolean;
    cutBeginning: boolean;
    cutEnding: boolean;
  };
  notes: string;
  source: "HUMAN" | "AUTOMATED_TEST";
  updatedAt: string;
}

// 1. SANITIZE AND MIGRATED REVIEW RESULTS
function loadAndSanitizeReviews(
  candidates: AuditItem[],
): Record<string, ReviewRecord> {
  const reviews: Record<string, ReviewRecord> = {};

  interface RawReviewEntry {
    status?: string;
    favorite?: boolean;
    issues?: {
      pronunciation?: boolean;
      clarity?: boolean;
      speed?: boolean;
      egyptianDelivery?: boolean;
      extraWords?: boolean;
      cutBeginning?: boolean;
      cutEnding?: boolean;
    };
    notes?: string;
    source?: string;
    updatedAt?: string;
  }

  if (fs.existsSync(RESULTS_PATH)) {
    try {
      const raw = fs.readFileSync(RESULTS_PATH, "utf-8");
      const loaded = JSON.parse(raw) as Record<string, RawReviewEntry>;

      // We back up the existing file before cleaning it
      const backupPath = RESULTS_PATH + `.bak-${Date.now()}`;
      fs.writeFileSync(backupPath, raw, "utf-8");
      console.log(`Backed up existing review-results.json to: ${backupPath}`);

      // Sanitize reviews
      for (const [id, entry] of Object.entries(loaded)) {
        const item = entry;

        // Identify and remove automated test reviews
        const isAutomated =
          item.source === "AUTOMATED_TEST" ||
          item.notes?.includes("Excellent natural Egyptian vocal delivery") ||
          id.includes("canary");

        if (isAutomated) {
          console.log(`Removing automated test record for ID: ${id}`);
          continue;
        }

        // Handle ambiguous origin (no source and status approved/rejected)
        if (
          !item.source &&
          (item.status === "APPROVED" || item.status === "REJECTED")
        ) {
          console.warn(
            `Ambiguous origin for candidate review ID: ${id}. Resetting status to PENDING_HUMAN_REVIEW.`,
          );
          item.status = "PENDING_HUMAN_REVIEW";
        }

        // Map old candidate ID format if any
        let finalId = id;
        if (!id.includes("::")) {
          const parts = id.split("-");
          const voice = parts[0];
          let style = "";
          let key = "";

          if (id.includes("normal-educational")) {
            style = "normal-educational";
            key = id.replace(`${voice}-normal-educational-`, "");
          } else if (id.includes("calm-slow")) {
            style = "calm-slow";
            key = id.replace(`${voice}-calm-slow-`, "");
          }

          if (voice && style && key) {
            finalId = `${key}::${voice}::${style}`;
            console.log(`Migrated old ID format: "${id}" -> "${finalId}"`);
          }
        }

        reviews[finalId] = {
          candidateId: finalId,
          status: (item.status === "PENDING"
            ? "PENDING_HUMAN_REVIEW"
            : item.status || "PENDING_HUMAN_REVIEW") as ReviewRecord["status"],
          favorite: !!item.favorite,
          issues: {
            pronunciation: !!item.issues?.pronunciation,
            clarity: !!item.issues?.clarity,
            speed: !!item.issues?.speed,
            egyptianDelivery: !!item.issues?.egyptianDelivery,
            extraWords: !!item.issues?.extraWords,
            cutBeginning: !!item.issues?.cutBeginning,
            cutEnding: !!item.issues?.cutEnding,
          },
          notes: item.notes || "",
          source: (item.source || "HUMAN") as ReviewRecord["source"],
          updatedAt: item.updatedAt || new Date().toISOString(),
        };
      }
    } catch {
      console.warn(
        "Could not read or parse review-results.json, starting fresh.",
      );
    }
  }

  // Pre-populate missing candidates as PENDING_HUMAN_REVIEW
  for (const c of candidates) {
    if (!reviews[c.candidateId]) {
      reviews[c.candidateId] = {
        candidateId: c.candidateId,
        status: "PENDING_HUMAN_REVIEW",
        favorite: false,
        issues: {
          pronunciation: false,
          clarity: false,
          speed: false,
          egyptianDelivery: false,
          extraWords: false,
          cutBeginning: false,
          cutEnding: false,
        },
        notes: "",
        source: "HUMAN",
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Save sanitized results back to disk
  fs.mkdirSync(REVIEW_DIR, { recursive: true });
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(reviews, null, 2), "utf-8");
  return reviews;
}

function main() {
  if (!fs.existsSync(AUDIT_JSON)) {
    console.error(
      `❌ Audit report not found at ${AUDIT_JSON}. Please run the candidate integrity audit first.`,
    );
    process.exit(1);
  }

  const auditReport = JSON.parse(
    fs.readFileSync(AUDIT_JSON, "utf-8"),
  ) as AuditReport;
  const reviews = loadAndSanitizeReviews(auditReport.candidates);

  // 1. Build speech groups catalog
  interface CatalogSpeechVariant {
    candidateId: string;
    voice: string;
    style: string;
    wavMasterPath: string;
    mp3ReviewPath: string;
    spokenTextHash: string;
    wavHash: string;
    mp3Hash: string;
    durationSeconds: number;
    sampleRate: number;
    channels: number;
    normalizationStatus: "PASSED" | "FAILED" | "NOT_RUN";
    reviewStatus: "PENDING_HUMAN_REVIEW" | "APPROVED" | "REJECTED";
  }

  interface CatalogSpeechGroup {
    semanticKey: string;
    category: string;
    displayText: string;
    spokenText: string;
    variants: CatalogSpeechVariant[];
  }

  const speechGroups: CatalogSpeechGroup[] = [];
  let totalSpeechCandidates = 0;

  for (const phrase of AUDITION_PHRASES) {
    const variants: CatalogSpeechVariant[] = [];

    for (const voice of VOICES) {
      for (const style of STYLES) {
        const candidateId = `${phrase.semanticKey}::${voice}::${style}`;
        const auditItem = auditReport.candidates.find(
          (c) => c.candidateId === candidateId,
        );

        if (!auditItem) {
          throw new Error(
            `Expected candidate ID not found in audit: ${candidateId}`,
          );
        }

        const reviewRecord = reviews[candidateId] || {
          status: "PENDING_HUMAN_REVIEW",
          favorite: false,
        };

        variants.push({
          candidateId,
          voice,
          style,
          wavMasterPath: `/candidates/${voice}/${style}/masters/${phrase.semanticKey}.wav`,
          mp3ReviewPath: `/candidates/${voice}/${style}/delivery/${phrase.semanticKey}.mp3`,
          spokenTextHash: phrase.spokenTextHash,
          wavHash: auditItem.wavHash || "",
          mp3Hash: auditItem.mp3Hash || "",
          durationSeconds: auditItem.durationSeconds || 0,
          sampleRate: auditItem.sampleRate || 0,
          channels: auditItem.channels || 0,
          normalizationStatus: auditItem.normalizationStatus,
          reviewStatus: reviewRecord.status,
        });
        totalSpeechCandidates++;
      }
    }

    if (variants.length !== 8) {
      throw new Error(
        `Phrase group ${phrase.semanticKey} does not have exactly 8 variants (actual: ${variants.length})`,
      );
    }

    speechGroups.push({
      semanticKey: phrase.semanticKey,
      category: phrase.category,
      displayText: phrase.displayText,
      spokenText: phrase.spokenText,
      variants,
    });
  }

  // 2. Build SFX catalog
  interface CatalogSfxItem {
    semanticKey: string;
    displayName: string;
    mp3ReviewPath: string;
    durationSeconds: number;
    reviewStatus: string;
  }
  const sfx: CatalogSfxItem[] = [];
  for (const sfxKey of SFX_KEYS) {
    const auditSfx = auditReport.sfx.find((s) => s.key === sfxKey);
    if (!auditSfx) {
      throw new Error(`Expected SFX key not found in audit: ${sfxKey}`);
    }
    sfx.push({
      semanticKey: `sfx.${sfxKey}`,
      displayName: sfxKey,
      mp3ReviewPath: `/candidates/sfx/${sfxKey}.mp3`,
      durationSeconds: auditSfx.duration || 0,
      reviewStatus: "APPROVED",
    });
  }

  // Verify catalog requirements
  if (speechGroups.length !== 8) {
    throw new Error(
      `Expected exactly 8 speech groups, but got ${speechGroups.length}`,
    );
  }
  if (totalSpeechCandidates !== 64) {
    throw new Error(
      `Expected exactly 64 speech variants, but got ${totalSpeechCandidates}`,
    );
  }
  if (sfx.length !== 5) {
    throw new Error(`Expected exactly 5 SFX assets, but got ${sfx.length}`);
  }

  const catalog = {
    version: 1,
    generatedAt: new Date().toISOString(),
    speechGroups,
    sfx,
  };

  // Save canonical catalog
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), "utf-8");
  console.log(`Canonical catalog saved to ${CATALOG_PATH}`);

  // Generate beautiful grouped UI HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقييم أصوات المرشحين والمؤثرات - مغامرات العربية</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Outfit:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0f766e;
      --primary-light: #f0fdfa;
      --primary-border: #ccfbf1;
      --secondary: #b45309;
      --secondary-light: #fef3c7;
      --accent: #4f46e5;
      --bg: #fafaf9;
      --card-bg: #ffffff;
      --text: #1c1917;
      --text-muted: #78716c;
      --border: #e7e5e4;
      --success: #16a34a;
      --error: #dc2626;
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    }
    body {
      font-family: 'Tajawal', system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .header-banner {
      background: linear-gradient(135deg, #0f766e, #134e4a);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-bottom: 4px solid #0d9488;
      box-shadow: var(--shadow);
    }
    .header-banner h1 {
      margin: 0 0 10px 0;
      font-size: 2.2rem;
      font-weight: 700;
    }
    .header-banner p {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }
    .container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 20px;
    }
    
    /* Section 1 styling */
    .summary-card {
      background: var(--card-bg);
      border-radius: 16px;
      border: 1px solid var(--border);
      padding: 24px;
      margin-bottom: 40px;
      box-shadow: var(--shadow);
    }
    .section-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--primary);
      margin: 0 0 20px 0;
      border-bottom: 2px solid var(--primary-border);
      padding-bottom: 10px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .stat-box {
      background: var(--primary-light);
      border: 1px solid var(--primary-border);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .stat-val {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 0.95rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    
    /* Section 2 styling (Phrase groups) */
    .phrase-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .phrase-group {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: var(--shadow);
      transition: border-color 0.2s;
    }
    .phrase-group.expanded {
      border-color: var(--primary);
    }
    .phrase-header {
      background: #f8f6f5;
      padding: 20px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      transition: background-color 0.2s;
    }
    .phrase-header:hover {
      background: #f1efed;
    }
    .phrase-title {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .phrase-arabic {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text);
    }
    .phrase-key {
      font-family: 'Outfit', sans-serif;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .arrow-icon {
      font-size: 1.2rem;
      transition: transform 0.2s;
    }
    .phrase-group.expanded .arrow-icon {
      transform: rotate(180deg);
    }
    
    .phrase-body {
      display: none;
      padding: 24px;
      border-top: 1px solid var(--border);
    }
    .phrase-group.expanded .phrase-body {
      display: block;
    }
    
    .group-controls {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      border: 1px solid var(--border);
      background: white;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s;
    }
    .btn:hover {
      background: #f5f5f4;
    }
    .btn.primary {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
    .btn.primary:hover {
      background: #0d9488;
    }
    .btn.stop {
      background: var(--error);
      color: white;
      border-color: var(--error);
    }
    .btn.stop:hover {
      background: #b91c1c;
    }
    
    /* Comparison Grid */
    .comparison-grid {
      display: grid;
      grid-template-columns: 120px 1fr 1fr;
      gap: 16px;
      align-items: stretch;
      margin-bottom: 20px;
    }
    .grid-header-cell {
      font-weight: 700;
      color: var(--primary);
      font-size: 0.95rem;
      text-align: center;
      padding: 10px;
      background: var(--primary-light);
      border: 1px solid var(--primary-border);
      border-radius: 8px;
    }
    .voice-row-label {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      background: #f5f5f4;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 1rem;
      text-transform: capitalize;
    }
    .variant-cell {
      background: white;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      transition: all 0.2s;
    }
    .variant-cell.playing {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }
    
    .player-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .play-control-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: var(--primary);
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.1s, background-color 0.15s;
    }
    .play-control-btn:hover {
      transform: scale(1.05);
      background: #0d9488;
    }
    .play-control-btn:active {
      transform: scale(0.95);
    }
    .duration-lbl {
      font-family: 'Outfit', sans-serif;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    
    /* Favorite toggle */
    .fav-btn {
      background: transparent;
      border: none;
      font-size: 1.4rem;
      cursor: pointer;
      color: #d6d3d1;
      transition: color 0.15s;
      padding: 0;
      margin-right: auto;
    }
    .fav-btn.active {
      color: #e11d48;
    }
    
    /* Approve / Reject buttons */
    .vote-row {
      display: flex;
      gap: 8px;
    }
    .vote-option-btn {
      flex: 1;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid var(--border);
      background: white;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
    }
    .vote-option-btn.approve {
      color: var(--success);
      border-color: #bbf7d0;
    }
    .vote-option-btn.approve.selected {
      background: #dcfce7;
      border-color: var(--success);
    }
    .vote-option-btn.reject {
      color: var(--error);
      border-color: #fecaca;
    }
    .vote-option-btn.reject.selected {
      background: #fee2e2;
      border-color: var(--error);
    }
    
    /* Issues check list */
    .issues-container {
      border-top: 1px solid var(--border);
      padding-top: 10px;
    }
    .issues-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .issues-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .issue-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
      cursor: pointer;
      user-select: none;
    }
    .issue-label input {
      margin: 0;
    }
    
    /* Notes input */
    .notes-area {
      width: 100%;
      height: 48px;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 6px;
      box-sizing: border-box;
      font-family: inherit;
      font-size: 0.8rem;
      resize: none;
    }
    
    /* Section 3 styling */
    .sfx-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .sfx-card {
      background: white;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      box-shadow: var(--shadow);
      text-align: center;
    }
    .sfx-name {
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 12px;
      text-transform: capitalize;
    }
    
    /* Section 4 summary */
    .summary-boxes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
    }
    .summary-box {
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      border: 1px solid var(--border);
    }
    .summary-box.approved {
      background: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
    }
    .summary-box.rejected {
      background: #fef2f2;
      border-color: #fecaca;
      color: #991b1b;
    }
    .summary-box.pending {
      background: #f5f5f4;
      border-color: var(--border);
      color: #44403c;
    }
    .summary-num {
      font-family: 'Outfit', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .summary-txt {
      font-size: 0.95rem;
      font-weight: 600;
    }
    
    /* Issues counter breakdown */
    .issues-breakdown {
      margin-top: 30px;
      background: white;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .issues-breakdown h3 {
      margin: 0 0 15px 0;
      font-size: 1.1rem;
      color: var(--text);
    }
    .issues-breakdown-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
    }
    .issue-count-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f5f5f4;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .issue-count-val {
      font-weight: 700;
      color: var(--primary);
    }
    
    .save-status-bar {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #1e293b;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1000;
      font-weight: 600;
      font-size: 0.95rem;
      transform: translateY(100px);
      transition: transform 0.3s;
    }
    .save-status-bar.show {
      transform: translateY(0);
    }
  </style>
</head>
<body>

  <div class="header-banner">
    <h1>بوابة تقييم الأصوات المرشحة والمؤثرات 🎙️</h1>
    <p>مغامرات العربية - مراجعة وإغلاق العينات الصوتية (البوابة الأولى والثانية)</p>
  </div>

  <div class="container">
    
    <!-- SECTION 1: اختيار الصوت وطريقة الإلقاء -->
    <div class="summary-card">
      <h2 class="section-title">1. اختيار الصوت وطريقة الإلقاء</h2>
      <div class="summary-grid">
        <div class="stat-box">
          <div class="stat-val">8</div>
          <div class="stat-label">جمل للمقارنة</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">4</div>
          <div class="stat-label">أصوات مرشحة</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">2</div>
          <div class="stat-label">طريقتان للإلقاء</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">64</div>
          <div class="stat-label">نسخة صوتية</div>
        </div>
      </div>
    </div>

    <!-- SECTION 2: مراجعة الكلام العربي -->
    <div class="summary-card" style="background: transparent; border: none; padding: 0; box-shadow: none;">
      <h2 class="section-title">2. مراجعة الكلام العربي</h2>
      
      <div class="phrase-list" id="phraseList">
        <!-- Rendered in script -->
      </div>
    </div>

    <!-- SECTION 3: مؤثرات مساعدة اختيارية -->
    <div class="summary-card" style="margin-top: 40px;">
      <h2 class="section-title">3. مؤثرات مساعدة اختيارية</h2>
      <div class="sfx-grid" id="sfxList">
        <!-- Rendered in script -->
      </div>
    </div>

    <!-- SECTION 4: ملخص الاختيار -->
    <div class="summary-card" style="margin-top: 40px;">
      <h2 class="section-title">4. ملخص الاختيار</h2>
      
      <div class="summary-boxes">
        <div class="summary-box approved">
          <div class="summary-num" id="sumApproved">0</div>
          <div class="summary-txt">تم قبولها</div>
        </div>
        <div class="summary-box rejected">
          <div class="summary-num" id="sumRejected">0</div>
          <div class="summary-txt">تم رفضها</div>
        </div>
        <div class="summary-box pending">
          <div class="summary-num" id="sumPending">64</div>
          <div class="summary-txt">قيد الانتظار</div>
        </div>
      </div>

      <div class="issues-breakdown">
        <h3>إجمالي المشاكل المرصودة</h3>
        <div class="issues-breakdown-list" id="issuesList">
          <!-- Rendered in script -->
        </div>
      </div>
    </div>

  </div>

  <div class="save-status-bar" id="saveBar">
    <span>💾 جاري حفظ التقييمات تلقائياً...</span>
  </div>

  <script>
    let catalog = {};
    let reviews = {};
    let activeAudio = null;
    let seqTimeout = null;

    async function loadData() {
      try {
        const catRes = await fetch("/api/candidates");
        catalog = await catRes.json();
        
        const revRes = await fetch("/api/reviews");
        reviews = await revRes.json();

        renderPage();
        updateSummary();
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }

    function toggleGroup(index) {
      const el = document.getElementById(\`group-\${index}\`);
      el.classList.toggle("expanded");
    }

    function stopAllAudio() {
      if (activeAudio) {
        activeAudio.pause();
        activeAudio = null;
      }
      if (seqTimeout) {
        clearTimeout(seqTimeout);
        seqTimeout = null;
      }
      document.querySelectorAll(".play-control-btn").forEach(btn => {
        btn.innerHTML = "▶";
      });
      document.querySelectorAll(".variant-cell").forEach(c => {
        c.classList.remove("playing");
      });
    }

    function togglePlay(url, candidateId) {
      const cell = document.getElementById(\`cell-\${candidateId.replace(/::/g, '_')}\`);
      const btn = cell.querySelector(".play-control-btn");
      
      if (activeAudio && activeAudio.src.endsWith(url)) {
        if (activeAudio.paused) {
          activeAudio.play();
          btn.innerHTML = "⏸";
          cell.classList.add("playing");
        } else {
          activeAudio.pause();
          btn.innerHTML = "▶";
          cell.classList.remove("playing");
        }
      } else {
        stopAllAudio();
        activeAudio = new Audio(url);
        activeAudio.play();
        btn.innerHTML = "⏸";
        cell.classList.add("playing");
        
        activeAudio.addEventListener("ended", () => {
          btn.innerHTML = "▶";
          cell.classList.remove("playing");
          activeAudio = null;
        });
      }
    }

    function playSequence(semanticKey, style) {
      stopAllAudio();
      
      const group = catalog.speechGroups.find(g => g.semanticKey === semanticKey);
      if (!group) return;

      const variants = group.variants.filter(v => v.style === style);
      let idx = 0;

      function playNext() {
        if (idx >= variants.length) {
          stopAllAudio();
          return;
        }

        const v = variants[idx];
        const cell = document.getElementById(\`cell-\${v.candidateId.replace(/::/g, '_')}\`);
        const btn = cell.querySelector(".play-control-btn");

        activeAudio = new Audio(v.mp3ReviewPath);
        activeAudio.play();
        btn.innerHTML = "⏸";
        cell.classList.add("playing");

        activeAudio.addEventListener("ended", () => {
          btn.innerHTML = "▶";
          cell.classList.remove("playing");
          idx++;
          // Space playbacks by 500ms
          seqTimeout = setTimeout(playNext, 500);
        });

        activeAudio.addEventListener("error", () => {
          btn.innerHTML = "▶";
          cell.classList.remove("playing");
          idx++;
          seqTimeout = setTimeout(playNext, 500);
        });
      }

      playNext();
    }

    async function setReviewStatus(candidateId, status) {
      if (!reviews[candidateId]) reviews[candidateId] = createEmptyReview(candidateId);
      reviews[candidateId].status = status;
      
      // Toggle CSS visual selected states
      const cell = document.getElementById(\`cell-\${candidateId.replace(/::/g, '_')}\`);
      cell.querySelectorAll(".vote-option-btn").forEach(btn => {
        btn.classList.remove("selected");
      });
      if (status === "APPROVED") {
        cell.querySelector(".vote-option-btn.approve").classList.add("selected");
      } else if (status === "REJECTED") {
        cell.querySelector(".vote-option-btn.reject").classList.add("selected");
      }
      
      await saveReviews();
      updateSummary();
    }

    async function toggleFavorite(candidateId) {
      if (!reviews[candidateId]) reviews[candidateId] = createEmptyReview(candidateId);
      reviews[candidateId].favorite = !reviews[candidateId].favorite;

      const cell = document.getElementById(\`cell-\${candidateId.replace(/::/g, '_')}\`);
      const favBtn = cell.querySelector(".fav-btn");
      if (reviews[candidateId].favorite) {
        favBtn.classList.add("active");
        favBtn.innerHTML = "♥";
      } else {
        favBtn.classList.remove("active");
        favBtn.innerHTML = "♡";
      }

      await saveReviews();
      updateSummary();
    }

    async function toggleIssue(candidateId, issueKey) {
      if (!reviews[candidateId]) reviews[candidateId] = createEmptyReview(candidateId);
      reviews[candidateId].issues[issueKey] = !reviews[candidateId].issues[issueKey];
      await saveReviews();
      updateSummary();
    }

    async function updateNotes(candidateId, value) {
      if (!reviews[candidateId]) reviews[candidateId] = createEmptyReview(candidateId);
      reviews[candidateId].notes = value;
      await saveReviews();
    }

    function createEmptyReview(candidateId) {
      return {
        candidateId,
        status: "PENDING_HUMAN_REVIEW",
        favorite: false,
        issues: {
          pronunciation: false,
          clarity: false,
          speed: false,
          egyptianDelivery: false,
          extraWords: false,
          cutBeginning: false,
          cutEnding: false,
        },
        notes: "",
        source: "HUMAN",
        updatedAt: new Date().toISOString()
      };
    }

    let saveTimer = null;
    function saveReviews() {
      return new Promise((resolve, reject) => {
        if (saveTimer) clearTimeout(saveTimer);
        
        const saveBar = document.getElementById("saveBar");
        saveBar.classList.add("show");

        saveTimer = setTimeout(async () => {
          try {
            const res = await fetch("/api/reviews", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(reviews)
            });
            if (res.ok) {
              console.log("Reviews saved successfully");
              resolve(true);
            } else {
              throw new Error("Failed to save");
            }
          } catch (e) {
            console.error("Save error", e);
            reject(e);
          } finally {
            saveBar.classList.remove("show");
          }
        }, 500);
      });
    }

    function renderPage() {
      const phraseList = document.getElementById("phraseList");
      const voices = ["callirrhoe", "kore", "enceladus", "puck"];
      
      phraseList.innerHTML = catalog.speechGroups.map((group, gIdx) => {
        const escapedKey = group.semanticKey.replace(/\\./g, '_');
        return \`
          <div class="phrase-group" id="group-\${gIdx}">
            <div class="phrase-header" onclick="toggleGroup(\${gIdx})">
              <div class="phrase-title">
                <span class="phrase-arabic">\${group.displayText}</span>
                <span class="phrase-key">\${group.semanticKey}</span>
              </div>
              <div class="arrow-icon">▼</div>
            </div>
            <div class="phrase-body">
              <p style="font-size: 1.1rem; font-weight: 500; margin-bottom: 20px; color: var(--text-muted);">
                النطق المشكّل: <span style="color: var(--primary); font-weight: 700;">\&nbsp;\${group.spokenText}</span>
              </p>
              
              <div class="group-controls">
                <button class="btn primary" onclick="playSequence('\${group.semanticKey}', 'normal-educational')">◀ تشغيل الكل عادي متتابعاً</button>
                <button class="btn primary" onclick="playSequence('\${group.semanticKey}', 'calm-slow')">◀ تشغيل الكل هادئ متتابعاً</button>
                <button class="btn stop" onclick="stopAllAudio()">■ إيقاف التشغيل</button>
              </div>

              <div class="comparison-grid">
                <div class="grid-header-cell">الصوت</div>
                <div class="grid-header-cell">عادي تعليمي (Normal Educational)</div>
                <div class="grid-header-cell">تعليمي هادئ وبطيء (Calm Slow)</div>

                \${voices.map(voice => {
                  const normalVar = group.variants.find(v => v.voice === voice && v.style === "normal-educational");
                  const calmVar = group.variants.find(v => v.voice === voice && v.style === "calm-slow");

                  return '<div class="voice-row-label">' + voice + '</div>' +
                         renderVariantCell(normalVar) +
                         renderVariantCell(calmVar);
                }).join("")}
              </div>
            </div>
          </div>
        \`;
      }).join("");

      // Render SFX
      const sfxGrid = document.getElementById("sfxList");
      sfxGrid.innerHTML = catalog.sfx.map(s => \`
        <div class="sfx-card">
          <div class="sfx-name">\${s.displayName}</div>
          <audio controls src="\${s.mp3ReviewPath}" style="width: 100%;"></audio>
        </div>
      \`).join("");
    }

    function renderVariantCell(v) {
      if (!v) return '<div class="variant-cell" style="background: #fafaf9; opacity: 0.5;">غير متوفر</div>';
      
      const rev = reviews[v.candidateId] || createEmptyReview(v.candidateId);
      const isApproved = rev.status === "APPROVED";
      const isRejected = rev.status === "REJECTED";
      const isFav = !!rev.favorite;
      const htmlId = v.candidateId.replace(/::/g, '_');

      return \`
        <div class="variant-cell" id="cell-\${htmlId}">
          <div class="player-row">
            <button class="play-control-btn" onclick="togglePlay('\${v.mp3ReviewPath}', '\${v.candidateId}')">▶</button>
            <span class="duration-lbl">\${v.durationSeconds.toFixed(2)} ثانية</span>
            <button class="fav-btn \${isFav ? 'active' : ''}" onclick="toggleFavorite('\${v.candidateId}')">\${isFav ? '♥' : '♡'}</button>
          </div>

          <div class="vote-row">
            <button class="vote-option-btn approve \${isApproved ? 'selected' : ''}" onclick="setReviewStatus('\${v.candidateId}', 'APPROVED')">قبول 👍</button>
            <button class="vote-option-btn reject \${isRejected ? 'selected' : ''}" onclick="setReviewStatus('\${v.candidateId}', 'REJECTED')">رفض 👎</button>
          </div>

          <div class="issues-container">
            <div class="issues-title">المشاكل والعيوب:</div>
            <div class="issues-grid">
              <label class="issue-label">
                <input type="checkbox" \${rev.issues.pronunciation ? 'checked' : ''} onchange="toggleIssue('\${v.candidateId}', 'pronunciation')">
                نطق خاطئ
              </label>
              <label class="issue-label">
                <input type="checkbox" \${rev.issues.clarity ? 'checked' : ''} onchange="toggleIssue('\${v.candidateId}', 'clarity')">
                غير واضح
              </label>
              <label class="issue-label">
                <input type="checkbox" \${rev.issues.speed ? 'checked' : ''} onchange="toggleIssue('\${v.candidateId}', 'speed')">
                سرعة غير مناسبة
              </label>
              <label class="issue-label">
                <input type="checkbox" \${rev.issues.egyptianDelivery ? 'checked' : ''} onchange="toggleIssue('\${v.candidateId}', 'egyptianDelivery')">
                لهجة غير مصرية
              </label>
              <label class="issue-label" style="grid-column: 1 / -1;">
                <input type="checkbox" \${rev.issues.extraWords ? 'checked' : ''} onchange="toggleIssue('\${v.candidateId}', 'extraWords')">
                إضافة كلام زائد
              </label>
              <label class="issue-label">
                <input type="checkbox" \${rev.issues.cutBeginning ? 'checked' : ''} onchange="toggleIssue('\${v.candidateId}', 'cutBeginning')">
                قطع البداية
              </label>
              <label class="issue-label">
                <input type="checkbox" \${rev.issues.cutEnding ? 'checked' : ''} onchange="toggleIssue('\${v.candidateId}', 'cutEnding')">
                قطع النهاية
              </label>
            </div>
          </div>

          <textarea class="notes-area" placeholder="أضف ملاحظات تفصيلية هنا..." oninput="updateNotes('\${v.candidateId}', this.value)">\${rev.notes}</textarea>
        </div>
      \`;
    }

    function updateSummary() {
      let approved = 0;
      let rejected = 0;
      let pending = 0;

      const issueCounts = {
        pronunciation: 0,
        clarity: 0,
        speed: 0,
        egyptianDelivery: 0,
        extraWords: 0,
        cutBeginning: 0,
        cutEnding: 0,
      };

      const favsByVoice = {};
      const favsByStyle = {};

      for (const phrase of catalog.speechGroups) {
        for (const v of phrase.variants) {
          const rev = reviews[v.candidateId] || { status: "PENDING_HUMAN_REVIEW", favorite: false, issues: {} };
          
          if (rev.status === "APPROVED") approved++;
          else if (rev.status === "REJECTED") rejected++;
          else pending++;

          if (rev.favorite) {
            favsByVoice[v.voice] = (favsByVoice[v.voice] || 0) + 1;
            favsByStyle[v.style] = (favsByStyle[v.style] || 0) + 1;
          }

          if (rev.issues?.pronunciation) issueCounts.pronunciation++;
          if (rev.issues?.clarity) issueCounts.clarity++;
          if (rev.issues?.speed) issueCounts.speed++;
          if (rev.issues?.egyptianDelivery) issueCounts.egyptianDelivery++;
          if (rev.issues?.extraWords) issueCounts.extraWords++;
          if (rev.issues?.cutBeginning) issueCounts.cutBeginning++;
          if (rev.issues?.cutEnding) issueCounts.cutEnding++;
        }
      }

      document.getElementById("sumApproved").innerHTML = approved;
      document.getElementById("sumRejected").innerHTML = rejected;
      document.getElementById("sumPending").innerHTML = pending;

      // Render issues list
      const issuesList = document.getElementById("issuesList");
      const issueLabels = {
        pronunciation: "عيوب نطق",
        clarity: "نطق غير واضح",
        speed: "مشاكل سرعة",
        egyptianDelivery: "لهجة غير مصرية",
        extraWords: "كلام زائد",
        cutBeginning: "قطع البداية",
        cutEnding: "قطع النهاية",
      };

      issuesList.innerHTML = Object.keys(issueCounts).map(key => \`
        <div class="issue-count-item">
          <span>\${issueLabels[key]}</span>
          <span class="issue-count-val">\${issueCounts[key]}</span>
        </div>
      \`).join("");
    }

    window.addEventListener("load", loadData);
  </script>
</body>
</html>`;

  fs.writeFileSync(HTML_PATH, htmlContent, "utf-8");
  console.log(
    `Grouped comparison index.html generated successfully: ${HTML_PATH}`,
  );
}

main();
