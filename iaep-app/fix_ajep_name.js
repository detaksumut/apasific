const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  let html = fs.readFileSync(filePath, 'utf-8');
  const original = html;

  html = html.replace(/Pendidikan Dasar, Menengah &amp; Tinggi/g, 'Jurnal Pendidikan');

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf-8');
    updatedCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`\nDone. Updated ${updatedCount} file(s).`);
