const fs = require('fs');
const path = require('path');

const publicAudioDir = path.resolve(process.cwd(), 'public/audio/v1');
const manifestPath = path.resolve(publicAudioDir, 'audio-manifest.json');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const files = fs.readdirSync(publicAudioDir).filter(f => f.endsWith('.wav'));

const byteRate = 24000 * 2 * 1; // 24kHz, 16-bit mono

const results = files.map(f => {
  const stat = fs.statSync(path.join(publicAudioDir, f));
  const durationSec = (stat.size - 44) / byteRate;
  const key = f.replace('.wav', '');
  const manifestEntry = manifest[key] || {};
  return {
    file: f,
    key,
    size: stat.size,
    durationSec,
    text: manifestEntry.text || "NO_TEXT"
  };
});

results.sort((a,b) => a.durationSec - b.durationSec);

console.log("SHORTEST AUDIO CLIPS (< 1.5 seconds):");
const shortClips = results.filter(r => r.durationSec < 1.5);
shortClips.forEach(r => {
  console.log(`${r.durationSec.toFixed(3)}s | ${r.key} | "${r.text}"`);
});

fs.writeFileSync(
  path.join(process.cwd(), 'development/audio/edge-tts/reports/audio-duration-report.json'),
  JSON.stringify(results, null, 2)
);
console.log("Wrote report to audio-duration-report.json");
