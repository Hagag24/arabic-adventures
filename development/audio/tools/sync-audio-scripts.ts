import fs from "fs";
import path from "path";
import { allActivities } from "../../../src/content/lesson-activity-definitions";
import { audioScripts } from "../../../src/audio/content/audio-script-index";

const publicAudioDir = path.resolve(process.cwd(), "public/audio/v1");

// Helper to lookup dynamic text from activities
function findTextFor(key: string, category: string): string | null {
  if (key === "global.welcome.01") {
    return "أَهْلًا بِكَ يا بَطَل! هَلْ أَنْتَ جاهِزٌ لِنَبْدَأَ رِحْلَتَنا في اللُّغَةِ العَرَبِيَّة؟ هَيَّا بِنَا!";
  }
  if (key === "global.feedback.correct.01") {
    return "أَحْسَنْتَ يا بَطَل! الإِجَابَةُ صَحِيحَة.";
  }
  if (key === "global.feedback.retry.01") {
    return "وَلا يِهِمَّك يا بَطَل، الحَلّ مِش صَحّ. فَكِّر بِهُدوء وَجَرِّب تاني.";
  }
  if (key === "global.feedback.completion.01") {
    return "بَرافو يا بَطَل! خَلَّصْت النَّشاط بِنَجاح.";
  }
  if (key === "global.feedback.participation.01") {
    return "شُكْرًا لِمُشارَكَتَك، تَمّ حِفْظ إِجابَتَك.";
  }
  if (key === "lessons.ancient-egyptian-teacher.story") {
    return 'بدأَ المتحفُ المصريُّ مشروعاً كبيراً لتطويرِ القاعةِ التي تعرضُ تاريخَ التعليمِ والكتابةِ في مصرَ القديمةِ. وفي هذا العرضِ، يظهرُ دورُ المعلّمِ المصريِّ القديمِ، الذي كان يُسمّى "الكاتب". كان هذا الكاتبُ يجلسُ في وقارٍ على وسادةٍ، ويحملُ بيدِهِ لوحةً خشبيةً وأدواتِ الكِتابةِ المصنوعةِ من الخشبِ والريشِ. وكان الكُتّابُ يدوّنون علومَهُم وأفكارَهُم على أوراقِ البرديِّ التي عُثِرَ عليها لاحقاً in مقابرِ العلماءِ. لقد حظِيَ الكاتبُ بمكانةٍ عظيمةٍ في مجتمعِهِ، لأنَّهُ كان ينشرُ العِلمَ والمعرفةَ ويُسهمُ في بناءِ الحضارةِ وتدوينِ التاريخِ.';
  }
  if (key === "lessons.magdi-yacoub.story") {
    return 'ولدَ الدكتور مجدي يعقوب في مصرَ، وكان والدُهُ طبيباً جراحاً ناجحاً. تعلّمَ مجدي من والدِهِ حبَّ مساعدةِ الناسِ والتعاطفَ مع المرضى، فقررَ أن يصبحَ طبيباً ليعالجَ قلوبَ الأطفالِ والكِبارِ. سافرَ الطبيبُ الشابُّ إلى بريطانيا ليتعلمَ ويكتسبَ الخبرةَ العالميةَ. واجتهدَ لسنواتٍ طويلةٍ حتى أصبحَ من أشهرِ جراحي القلبِ في العالمِ، وحصلَ على لقبِ "سير" تكريماً لجهودِهِ الإنسانيةِ. ورغم شهرتِهِ الكبيرةِ، قررَ العودةَ إلى مصرَ في عامِ ألفينِ وتسعةٍ. واختارَ مدينةَ أسوانَ الهادئةَ ليبني فيها مركزاً عالمياً لجراحاتِ القلبِ، لعلاجِ المرضى بالمليونِ وبالمجّانِ، ورسمِ البسمةِ على وجوهِ المرضى وأطفالِ مصرَ الطيبين.';
  }
  if (key === "lessons.ancient-egyptian-teacher.result") {
    return "لقد أنهيتَ دَرْسَ المعلّمِ المصريِّ القديمِ بالكاملِ بنجاحٍ وحصلتَ على وسامِ مُستكشِفِ الحضارَةِ!";
  }
  if (key === "lessons.magdi-yacoub.result") {
    return "لقد أنهيتَ دَرْسَ حِوارٍ مع الدكتور مجدي يعقوب بالكاملِ بنجاحٍ وحصلتَ على وسامِ صانِعِ الأملِ!";
  }

  // Dynamic Lookup
  if (category === "instruction") {
    const act = allActivities.find((a) => a.instructionAudioKey === key);
    return act ? act.instruction : null;
  }
  if (category === "prompt") {
    const act = allActivities.find((a) => a.promptAudioKey === key);
    return act ? act.prompt : null;
  }
  if (category === "option") {
    for (const act of allActivities) {
      if (act.options) {
        const opt = act.options.find((o) => o.narrationKey === key);
        if (opt) return opt.label;
      }
      if (act.type === "multi_round" && act.configuration?.rounds) {
        for (const round of act.configuration.rounds) {
          if (round.options) {
            const opt = round.options.find((o: any) => o.narrationKey === key);
            if (opt) return opt.label;
          }
        }
      }
    }
  }
  if (
    category === "completion_feedback" ||
    category === "participation_feedback"
  ) {
    const act = allActivities.find((a) => a.completionFeedbackAudioKey === key);
    if (act) {
      return act.type === "self_assessment"
        ? "شُكْرًا لِمُشارَكَتَك، تَمّ حِفْظ إِجابَتَك."
        : "بَرافو يا بَطَل! خَلَّصْت النَّشاط بِنَجاح.";
    }
  }

  return null;
}

function main() {
  console.log(
    `🎙️ Syncing ${audioScripts.length} audio scripts to public/audio/v1/ ...`,
  );

  let createdCount = 0;
  let skippedCount = 0;
  let missingTextCount = 0;

  for (const scriptDef of audioScripts) {
    const txtPath = path.join(
      publicAudioDir,
      `${scriptDef.relativeBasePath}.txt`,
    );

    // Determine the authoritative Arabic text
    const text = findTextFor(scriptDef.semanticKey, scriptDef.category);
    if (!text) {
      console.warn(
        `⚠️ Warning: Could not find spoken text for key "${scriptDef.semanticKey}"`,
      );
      missingTextCount++;
      continue;
    }

    fs.mkdirSync(path.dirname(txtPath), { recursive: true });

    let shouldWrite = false;
    if (!fs.existsSync(txtPath) || fs.statSync(txtPath).size === 0) {
      shouldWrite = true;
    } else {
      const existingText = fs.readFileSync(txtPath, "utf-8").trim();
      if (existingText !== text.trim()) {
        shouldWrite = true;
      }
    }

    if (shouldWrite) {
      fs.writeFileSync(txtPath, text, "utf-8");
      createdCount++;
    } else {
      skippedCount++;
    }
  }

  console.log("\n📊 SYNC REPORT:");
  console.log(`- Created scripts: ${createdCount}`);
  console.log(`- Skipped (existing): ${skippedCount}`);
  console.log(`- Missing text errors: ${missingTextCount}`);
  console.log("✅ Sync complete!");
}

main();
