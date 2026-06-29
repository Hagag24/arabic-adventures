/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('public/audio/v1/audio-manifest.json', 'utf8'));
const out = {};
Object.entries(manifest).forEach(([k,v]) => {
  if (v.text && (v.text.includes('رسم') || v.text.includes('قرأ') || v.text.includes('كتب') || v.text.includes('ستمع') || v.text.includes('أرسم') || v.text.includes('أقرأ') || v.text.includes('أكتب'))) {
    out[k] = v.text;
  }
});
fs.writeFileSync('verbs_extracted.json', JSON.stringify(out, null, 2));
