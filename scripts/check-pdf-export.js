import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
console.log("pdfModule type:", typeof pdf);
console.log("pdfModule keys:", Object.keys(pdf));
console.log("pdfModule default type:", typeof pdf.default);
