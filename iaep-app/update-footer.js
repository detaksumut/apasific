const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

const target = '<p>© 2025 Association of Asia Pacific Academician (ASIA). All rights reserved.</p>';
const replacement = '<p>© 2025 Association of Asia Pacific Academician (ASIA). All rights reserved. <span style="display: block; font-size: 11px; opacity: 0.7; margin-top: 4px;">Developed by <strong>PT. Bernas Sumut Jaya</strong> • Dilindungi Hak Cipta.</span></p>';

files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated footer in ${file}`);
    } else {
      console.log(`Target not found in ${file}`);
    }
  }
});
