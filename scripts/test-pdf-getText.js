import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

async function run() {
  const dataBuffer = fs.readFileSync('D:\\شيت.pdf');
  const uint8 = new Uint8Array(dataBuffer);
  const res = new pdfModule.PDFParse(uint8);
  
  console.log("Calling load...");
  await res.load();
  
  console.log("Calling getText...");
  const text = await res.getText();
  console.log("text type:", typeof text);
  console.log("text value:", text);
  
  // If it's an array of pages or an object
  if (text && typeof text === 'object') {
    console.log("text keys:", Object.keys(text));
  }
}

run().catch(e => console.error(e));
