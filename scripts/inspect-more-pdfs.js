import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');
const pdf = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);

async function inspectFolder(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      await inspectFolder(filePath);
    } else if (file.endsWith('.pdf')) {
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
        console.log(`Snippet (first 300 chars):`);
        console.log(text.trim().substring(0, 300));
        console.log(`==========================================\n`);
      } catch (e) {
        console.log(`Error parsing ${filePath}: ${e.message}`);
      }
    }
  }
}

async function run() {
  console.log("Inspecting D:\\Luminova-Edu\\pdf\\");
  await inspectFolder('D:\\Luminova-Edu\\pdf\\');
  console.log("Inspecting D:\\Digital learning\\");
  await inspectFolder('D:\\Digital learning\\');
}

run();
