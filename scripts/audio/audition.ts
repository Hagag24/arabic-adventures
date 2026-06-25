import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { AzureSpeechProvider } from "../../src/audio/generation/azure-speech-provider";

// Load environment variables
dotenv.config();

const CANDIDATES = [
  { id: "salma-normal", voice: "ar-EG-SalmaNeural", speed: "0%" },
  { id: "salma-slow", voice: "ar-EG-SalmaNeural", speed: "-8%" },
  { id: "shakir-normal", voice: "ar-EG-ShakirNeural", speed: "0%" },
  { id: "shakir-slow", voice: "ar-EG-ShakirNeural", speed: "-8%" },
];

const TEST_SCRIPTS = [
  { id: "main-idea", text: "ما الفكرة الرئيسة لهذا الخبر؟" },
  { id: "best-title", text: "اختر العنوان الأنسب للنص المسموع." },
  { id: "ordering-events", text: "رتّب الأحداث التالية ترتيبًا صحيحًا." },
  { id: "aswan-center", text: "أُنشئ مركز القلب لخدمة أهالي الصعيد." },
  { id: "dr-yacoub", text: "الدكتور مجدي يعقوب." },
  { id: "feelings-happy", text: "أشعر بالحماس والرغبة في المعرفة والاستكشاف." },
  { id: "feedback-excellent", text: "إجابة ممتازة، أحسنت!" },
  { id: "feedback-retry", text: "جرّب مرة أخرى، أنت قريب من الإجابة." },
  {
    id: "feedback-completion",
    text: "شكرًا لمشاركتك، يمكنك الانتقال إلى النشاط التالي.",
  },
  {
    id: "multipart-question",
    text: "استمع إلى القصة بعناية، ثم حدد الشخصيات الرئيسة ومكان حدوث القصة والزمان الذي دارت فيه الأحداث بالتفصيل.",
  },
  {
    id: "ordering-instruction",
    text: "رتّب الجمل التالية ترتيبًا صحيحًا بناءً على ما سمعته في النص.",
  },
  {
    id: "self-assessment-question",
    text: "ما شعورك قبل حصة اللغة العربية اليوم؟",
  },
  {
    id: "model-answer",
    text: "نموذج للإجابة المقترحة: بدأ المتحف المصري مشروعًا كبيرًا لتطوير تاريخ التعليم والكتابة في مصر القديمة.",
  },
  {
    id: "year-2009",
    text: "قرر الدكتور مجدي يعقوب العودة إلى مصر وتأسيس مركز القلب في عام 2009.",
  },
  {
    id: "word-aswan",
    text: "تتميز مدينة أسوان بجمالها الطبيعي وهدوئها الساحر على ضفاف النيل.",
  },
  {
    id: "word-alsaid",
    text: "أُنشئ مركز جراحة القلب في أسوان لخدمة أهالي الصعيد وكل مصر.",
  },
  {
    id: "word-maqbara",
    text: "عُثر على أوراق البردي الهامة داخل المقبرة القديمة لعلماء مصر.",
  },
  {
    id: "word-hadara",
    text: "ساهم الكاتب المصري القديم في تدوين التاريخ وبناء الحضارة العظيمة.",
  },
  // Pronunciation Audit Words
  { id: "audit-magdi-yacoub", text: "مَجدي يَعقوب" },
  { id: "audit-aswan", text: "أَسوان" },
  { id: "audit-alsaid", text: "الصَّعيد" },
  { id: "audit-albardiyya", text: "البَرديّة" },
  { id: "audit-alhadara", text: "الحَضارة" },
  { id: "audit-almaqbara", text: "المَقبرة" },
  { id: "audit-aljiraha", text: "الجِراحة" },
  { id: "audit-alinsaniyya", text: "الإنسانيّة" },
  { id: "audit-alisrar", text: "الإصرار" },
  { id: "audit-alimkaniyyat", text: "الإمكانيّات" },
  { id: "audit-almoallem", text: "المعلّم" },
];

async function runAudition() {
  if (!process.env.AZURE_SPEECH_KEY) {
    console.error("==================================================");
    console.error("ERROR: Missing required developer credentials!");
    console.error("Please configure the following environment variables:");
    console.error("- AZURE_SPEECH_KEY");
    console.error("- AZURE_SPEECH_REGION");
    console.error("==================================================");
    process.exit(1);
  }

  console.log("Starting Audition Generation Pipeline (Gate 2)...");

  const provider = new AzureSpeechProvider();
  const baseDir = path.resolve(process.cwd(), "artifacts/audio/audition");

  // Clean / Create audition folder structure
  fs.mkdirSync(baseDir, { recursive: true });
  for (const cand of CANDIDATES) {
    fs.mkdirSync(path.join(baseDir, cand.id), { recursive: true });
  }

  interface AuditionCandidateResult {
    file: string;
    durationMs: number;
    sha256: string;
  }

  interface AuditionIndexEntry {
    id: string;
    text: string;
    candidates: Record<string, AuditionCandidateResult>;
  }

  const indexData: AuditionIndexEntry[] = [];

  for (const script of TEST_SCRIPTS) {
    console.log(`\nSynthesizing: "${script.text}"`);
    const scriptIndexEntry: AuditionIndexEntry = {
      id: script.id,
      text: script.text,
      candidates: {},
    };

    for (const cand of CANDIDATES) {
      const fileName = `${script.id}.mp3`;
      const outputPath = path.join(baseDir, cand.id, fileName);

      try {
        const result = await provider.synthesize(
          script.text,
          cand.voice,
          cand.speed,
          outputPath,
        );

        scriptIndexEntry.candidates[cand.id] = {
          file: `./${cand.id}/${fileName}`,
          durationMs: result.durationMs,
          sha256: result.sha256,
        };

        console.log(`  ✔ [${cand.id}] generated successfully.`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ❌ [${cand.id}] failed to generate:`, msg);
      }
    }
    indexData.push(scriptIndexEntry);
  }

  // Write index JSON
  fs.writeFileSync(
    path.join(baseDir, "audition-index.json"),
    JSON.stringify(indexData, null, 2),
    "utf-8",
  );
  console.log(
    `\n✔ Saved audition index data to artifacts/audio/audition/audition-index.json`,
  );

  // Build the summary HTML review page
  let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير تجربة أداء الأصوات - مغامرات العربية</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; padding: 2rem; color: #1e293b; }
    h1 { color: #0d9488; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 2rem; background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    th, td { padding: 1rem; text-align: right; border-bottom: 1px solid #f1f5f9; }
    th { background: #0f766e; color: white; }
    tr:hover { background: #f8fafc; }
    audio { width: 220px; }
  </style>
</head>
<body>
  <h1>تقرير تجربة أداء الأصوات لراوي القصة المصري 🎙️</h1>
  <p style="text-align: center; color: #64748b;">قارن بين مرشحي الصوت Salma و Shakir بالسرعة العادية والمخفضة (-8%) للموافقة على أحدهما.</p>

  <table>
    <thead>
      <tr>
        <th>النص العربي</th>
        <th>سلمى (عادي)</th>
        <th>سلمى (بطيء -8%)</th>
        <th>شاكر (عادي)</th>
        <th>شاكر (بطيء -8%)</th>
      </tr>
    </thead>
    <tbody>`;

  for (const item of indexData) {
    html += `
      <tr>
        <td style="font-weight: bold;">${item.text}</td>
        <td>
          ${item.candidates["salma-normal"] ? `<audio controls src="./salma-normal/${item.id}.mp3"></audio>` : "غير متاح"}
        </td>
        <td>
          ${item.candidates["salma-slow"] ? `<audio controls src="./salma-slow/${item.id}.mp3"></audio>` : "غير متاح"}
        </td>
        <td>
          ${item.candidates["shakir-normal"] ? `<audio controls src="./shakir-normal/${item.id}.mp3"></audio>` : "غير متاح"}
        </td>
        <td>
          ${item.candidates["shakir-slow"] ? `<audio controls src="./shakir-slow/${item.id}.mp3"></audio>` : "غير متاح"}
        </td>
      </tr>`;
  }

  html += `
    </tbody>
  </table>
</body>
</html>`;

  fs.writeFileSync(path.join(baseDir, "audition-summary.html"), html, "utf-8");
  console.log(
    `✔ Saved audition summary HTML to artifacts/audio/audition/audition-summary.html`,
  );
}

// Trigger audition run
runAudition().catch((err) => {
  console.error("Audition script execution crash:", err);
  process.exit(1);
});
