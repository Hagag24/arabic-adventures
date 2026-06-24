import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

const pdfDir = 'D:\\';
const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

async function parseAll() {
  for (const file of files) {
    const filePath = path.join(pdfDir, file);
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const uint8 = new Uint8Array(dataBuffer);
      const res = new pdfModule.PDFParse(uint8);
      await res.load();
      const textObj = await res.getText();
      const text = textObj.text || '';
      console.log(`==========================================`);
      console.log(`File: ${file}`);
      console.log(`Length: ${text.length}`);
      console.log(`Snippet (first 500 chars):`);
      console.log(text.trim().substring(0, 500));
      console.log(`==========================================\n`);
    } catch (e) {
      console.error(`Failed to parse ${file}:`, e.message);
    }
  }
}

parseAll();
