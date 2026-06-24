import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

async function inspect(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const uint8 = new Uint8Array(dataBuffer);
    const res = new pdfModule.PDFParse(uint8);
    await res.load();
    const textObj = await res.getText();
    const text = textObj.text || '';
    console.log(`==========================================`);
    console.log(`Path: ${filePath}`);
    console.log(`Pages: ${res.doc ? res.doc.numPages : '?'}`);
    console.log(`Snippet (first 600 chars):`);
    console.log(text.trim().substring(0, 600));
    console.log(`==========================================\n`);
  } catch (e) {
    console.log(`Error parsing ${filePath}: ${e.message}`);
  }
}

async function run() {
  await inspect('D:\\مواطنه رقميه\\نص الاستماع.pdf');
  await inspect('D:\\مواطنه رقميه\\digital.pdf');
  await inspect('D:\\مواطنه رقميه\\Task.pdf');
  await inspect('D:\\اذاعة وتسجيل\\radio-task01.pdf');
  await inspect('D:\\اذاعة وتسجيل\\radio-task01_merged.pdf');
}

run();
