import fs from 'fs';
import path from 'path';

console.log("Checking files on D:\\");
const files = fs.readdirSync('D:\\');
console.log("All PDF/DOCX files:");
console.log(files.filter(f => f.endsWith('.pdf') || f.endsWith('.docx')));
