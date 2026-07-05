const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

const replacement = '<p>© 2025 Association of Asia Pacific Academician (ASIA). All rights reserved. | Developed by PT. Bernas Sumut Jaya • Dilindungi Hak Cipta.</p>';

files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(publicDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace any version of the footer copyright paragraph (with or without the developer span)
    const regex = /<p>© 2025 Association of Asia Pacific Academician \(ASIA\)\. All rights reserved\..*?<\/p>/s;
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated footer in ${file}`);
    } else {
      console.log(`Target not found in ${file}`);
    }
  }
});
