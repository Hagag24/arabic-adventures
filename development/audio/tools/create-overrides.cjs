const fs = require('fs');
const path = require('path');

const publicAudioDir = path.resolve(process.cwd(), 'public/audio/v1');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file.endsWith('.txt')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const txtFiles = walk(publicAudioDir);
const overrides = {};

txtFiles.forEach(f => {
  const text = fs.readFileSync(f, 'utf8');
  let newText = text;
  let changed = false;

  if (text.includes('ارسم')) {
    newText = newText.replace(/ارسم/g, 'اُرْسُمْ');
    changed = true;
  }
  if (text.includes('اقرأ') || text.includes('إقرأ')) {
    newText = newText.replace(/اقرأ|إقرأ/g, 'اِقْرَأْ');
    changed = true;
  }
  if (text.includes('اكتب') || text.includes('إكتب')) {
    newText = newText.replace(/اكتب|إكتب/g, 'اُكْتُبْ');
    changed = true;
  }

  if (changed) {
    // get key from path
    // public\audio\v1\lessons\king-of-hearts-yacoub\activities\activity-1\prompt.txt -> lessons.king-of-hearts-yacoub.activities.activity-1.prompt
    const relativePath = path.relative(publicAudioDir, f);
    const key = relativePath.replace(/\\/g, '/').replace('.txt', '').replace(/\//g, '.');
    overrides[key] = newText;
  }
});

fs.writeFileSync('development/audio/edge-tts/spoken-text-overrides.json', JSON.stringify(overrides, null, 2), 'utf8');
console.log('Done, found ' + Object.keys(overrides).length + ' overrides.');
