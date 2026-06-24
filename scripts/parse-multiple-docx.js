import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function extractDocx(filePath, outDir) {
  if (!fs.existsSync(filePath)) {
    console.log(`${filePath} does not exist.`);
    return;
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  try {
    execSync(`tar.exe -xf "${filePath}" -C "${outDir}"`);
    const xmlPath = path.join(outDir, 'word/document.xml');
    if (fs.existsSync(xmlPath)) {
      const xml = fs.readFileSync(xmlPath, 'utf8');
      const pMatches = xml.match(/<w:p[^>]*>.*?<\/w:p>/g) || [];
      const paragraphs = pMatches.map(p => {
        const tMatches = p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
        return tMatches.map(m => m.replace(/<w:t[^>]*>|<\/w:t>/g, '')).join('');
      }).filter(p => p.trim().length > 0);
      console.log(`--- Content of ${filePath} (${paragraphs.length} paragraphs) ---`);
      console.log(paragraphs.slice(0, 10).join('\n'));
      console.log("-------------------------------------------\n");
    }
  } catch (e) {
    console.error(`Failed to extract ${filePath}:`, e.message);
  }
}

extractDocx('scripts/emotional.docx', 'scripts/temp_emotional');
extractDocx('scripts/new_doc.docx', 'scripts/temp_new_doc');
