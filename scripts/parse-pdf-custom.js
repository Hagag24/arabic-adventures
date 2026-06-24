import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

console.log("Checking PDFParse type:", typeof pdfModule.PDFParse);
if (pdfModule.PDFParse) {
  const filePath = 'D:\\شيت.pdf';
  try {
    const dataBuffer = fs.readFileSync(filePath);
    // Let's try calling it or calling new on it
    console.log("Invoking as function:");
    try {
      const res = pdfModule.PDFParse(dataBuffer);
      console.log("Success invoking as function, result:", res);
    } catch(e) {
      console.log("Failed as function:", e.message);
    }
    
    console.log("Invoking as constructor:");
    try {
      const res = new pdfModule.PDFParse(dataBuffer);
      console.log("Success invoking as constructor, result keys:", Object.keys(res));
    } catch(e) {
      console.log("Failed as constructor:", e.message);
    }
  } catch (err) {
    console.log("File read error:", err.message);
  }
}
