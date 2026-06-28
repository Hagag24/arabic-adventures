const fs = require('fs');
const content = fs.readFileSync('src/audio/content/audio-script-index.ts', 'utf8');

// very basic regex to extract keys and text
// format: "key": { text: "..." } or similar
const regex = /"([^"]+)":\s*{\s*[^}]*?text:\s*"([^"]+)"/g;
let match;
const results = {};

while ((match = regex.exec(content)) !== null) {
  const key = match[1];
  const text = match[2];
  if (text.length < 30) {
    results[key] = text;
  }
}

fs.writeFileSync('development/audio/edge-tts/reports/short-texts.json', JSON.stringify(results, null, 2));
console.log('Done');
