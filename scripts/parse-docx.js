import fs from 'fs';
import path from 'path';

const xmlPath = 'scripts/temp_docx/word/document.xml';
if (!fs.existsSync(xmlPath)) {
  console.error("document.xml not found!");
  process.exit(1);
}

const xml = fs.readFileSync(xmlPath, 'utf8');

// Simple regex to extract all <w:t>...</w:t> tags which contain text
const matches = xml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
const textList = matches.map(m => m.replace(/<w:t[^>]*>|<\/w:t>/g, ''));

// Join paragraphs: usually <w:p> contains multiple <w:r> which contain <w:t>.
// A better way is to find <w:p> blocks first.
const pMatches = xml.match(/<w:p[^>]*>.*?<\/w:p>/g) || [];
const paragraphs = pMatches.map(p => {
  const tMatches = p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
  return tMatches.map(m => m.replace(/<w:t[^>]*>|<\/w:t>/g, '')).join('');
}).filter(p => p.trim().length > 0);

fs.writeFileSync('scripts/workbook-text.txt', paragraphs.join('\n'), 'utf8');
console.log(`Extracted ${paragraphs.length} paragraphs to scripts/workbook-text.txt`);
