import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Communicate } from 'edge-tts-ts';

const OUTPUT_DIR = path.resolve('public/audio/approved');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'audio_manifest.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const speechRequests = [
  {
    assetKey: 'ancient-egyptian-teacher-main',
    spokenText: 'بدأَ المتحفُ المصريُّ مشروعاً كبيراً لتطويرِ القاعةِ التي تعرضُ تاريخَ التعليمِ والكتابةِ في مصرَ القديمةِ. وفي هذا العرضِ، يظهرُ دورُ المعلّمِ المصريِّ القديمِ، الذي كان يُسمّى "الكاتب". كان هذا الكاتبُ يجلسُ في وقارٍ على وسادةٍ، ويحملُ بيدِهِ لوحةً خشبيةً وأدواتِ الكِتابةِ المصنوعةِ من الخشبِ والريشِ. وكان الكُتّابُ يدوّنون علومَهُم وأفكارَهُم على أوراقِ البرديِّ التي عُثِرَ عليها لاحقاً في مقابرِ العلماءِ. لقد حظِيَ الكاتبُ بمكانةٍ عظيمةٍ في مجتمعِهِ، لأنَّهُ كان ينشرُ العِلمَ والمعرفةَ ويُسهمُ في بناءِ الحضارةِ وتدوينِ التاريخِ.',
    voiceId: 'ar-EG-ShakirNeural',
    locale: 'ar-EG',
    gender: 'male'
  },
  {
    assetKey: 'king-of-hearts-main',
    spokenText: 'ولدَ الدكتور مجدي يعقوب في مصرَ، وكان والدُهُ طبيباً جراحاً ناجحاً. تعلّمَ مجدي من والدِهِ حبَّ مساعدةِ الناسِ والتعاطفَ مع المرضى، فقررَ أن يصبحَ طبيباً ليعالجَ قلوبَ الأطفالِ والكِبارِ. سافرَ الطبيبُ الشابُّ إلى بريطانيا ليتعلمَ ويكتسبَ الخبرةَ العالميةَ. واجتهدَ لسنواتٍ طويلةٍ حتى أصبحَ من أشهرِ جراحي القلبِ في العالمِ، وحصلَ على لقبِ "سير" تكريماً لجهودِهِ الإنسانيةِ. ورغم شهرتِهِ الكبيرةِ، قررَ العودةَ إلى مصرَ في عامِ ألفينِ وتسعةٍ. واختارَ مدينةَ أسوانَ الهادئةَ ليبني فيها مركزاً عالمياً لجراحاتِ القلبِ، لعلاجِ المرضى بالمليونِ وبالمجّانِ، ورسمِ البسمةِ على وجوهِ المرضى وأطفالِ مصرَ الطيبين.',
    voiceId: 'ar-EG-ShakirNeural',
    locale: 'ar-EG',
    gender: 'male'
  },
  {
    assetKey: 'my-body-is-a-trust-main',
    spokenText: 'أنا طفلٌ ذكيٌّ، وأعرفُ أنَّ جسدي مميزٌ ولهُ خصوصيةٌ كبيرةٌ. عندما يحضنُني والدي أو ترفعُني والدتي عالياً، أشعرُ بالأمانِ والسعادةِ؛ وهذه هي اللمساتُ الطيبةُ التي يحبُّها قلبي. لكنني تعلّمتُ درساً مهماً جداً: إذا حاولَ أيُّ شخصٍ أن يلمسَني بطريقةٍ تجعلُني أشعرُ بالضيقِ أو الخوفِ، فهذهِ لمسةٌ غيرُ طيبةٍ. في تلكَ اللحظةِ، يجبُ أن أكونَ شجاعاً وأقولَ لهُ بصوتٍ واضحٍ: "كُفَّ عن هذا!". وأبتعدَ فوراً، وأسرعَ لأُخبرَ بابا وماما أو أيَّ شخصٍ بالغٍ أثقُ بهِ. البوحُ هو ما يحميني، والحديثُ عن هذا ليسَ خطئي أبداً، بل هو خطأُ من حاولَ إيذائي.',
    voiceId: 'ar-EG-SalmaNeural',
    locale: 'ar-EG',
    gender: 'female'
  }
];

function computeHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function generateSpeech(req) {
  const fileName = `${req.assetKey}.mp3`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  console.log(`Generating speech for [${req.assetKey}] using voice [${req.voiceId}]...`);
  
  try {
    const communicate = new Communicate(req.spokenText, { voice: req.voiceId });
    const chunks = [];
    for await (const chunk of communicate.stream()) {
      if (chunk.type === 'audio') {
        chunks.push(chunk.data);
      }
    }
    
    if (chunks.length === 0) {
      throw new Error("No audio chunks received from Edge TTS API.");
    }
    
    const buffer = Buffer.concat(chunks);
    fs.writeFileSync(filePath, buffer);
    const fileHash = computeHash(buffer);
    // rough estimate or we can estimate based on word count: ~130 words/minute
    
    // An average Egyptian speaker reads MSA at around 130 words per minute
    const wordCount = req.spokenText.split(/\s+/).length;
    const estimatedDuration = (wordCount / 130) * 60;

    console.log(`Saved: ${fileName} (${buffer.length} bytes, Hash: ${fileHash}, Est. Duration: ${estimatedDuration.toFixed(1)}s)`);
    
    return {
      assetKey: req.assetKey,
      provider: 'EdgeTTS',
      providerVoiceId: req.voiceId,
      locale: req.locale,
      spokenText: req.spokenText,
      durationSeconds: Math.round(estimatedDuration * 10) / 10,
      fileHash: fileHash,
      generationVersion: '1.0.0',
      status: 'APPROVED', // Marks as approved by the generation pipeline
      filePath: `/audio/approved/${fileName}`
    };
  } catch (err) {
    console.error(`Error generating [${req.assetKey}]: ${err.message}`);
    throw err;
  }
}

async function main() {
  const manifest = {};
  for (const req of speechRequests) {
    try {
      const asset = await generateSpeech(req);
      manifest[req.assetKey] = asset;
    } catch {
      console.error(`Aborting generation due to error on ${req.assetKey}`);
      process.exit(1);
    }
  }
  
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Audio manifest written to: ${MANIFEST_PATH}`);
  console.log("All audio generated successfully!");
}

main();
