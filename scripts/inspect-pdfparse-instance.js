import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');

const dataBuffer = fs.readFileSync('D:\\شيت.pdf');
const res = new pdfModule.PDFParse(dataBuffer);

console.log("res keys:", Object.keys(res));
console.log("res.doc keys:", Object.keys(res.doc || {}));
console.log("res.doc prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(res.doc || {})));
console.log("res prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(res)));

// Check if we can get text
for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(res))) {
  if (typeof res[key] === 'function') {
    console.log(`Method res.${key}`);
  }
}
