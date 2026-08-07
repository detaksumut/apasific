const fs = require('fs');
const path = require('path');
const publicDir = 'd:/Users/apasific/iaep-app/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  let modified = false;
  if (content.includes('Regional Chapters')) {
    content = content.replace(
      /<a href="[^"]*regional-chapters[^"]*">\s*<span class="dd-icon">◈<\/span>\s*Regional Chapters\s*<\/a>/g,
      '<a href="/certification"><span class="dd-icon">◈</span> Certification Structure</a>'
    );
    modified = true;
  }
  
  if (content.includes('Strategic Partners')) {
    content = content.replace(
      /<a href="[^"]*strategic-partners[^"]*">\s*<span class="dd-icon">◈<\/span>\s*Strategic Partners\s*<\/a>/g,
      '<a href="/journal"><span class="dd-icon">◈</span> Journal Structure</a>'
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + file);
  }
});
console.log('All done!');
