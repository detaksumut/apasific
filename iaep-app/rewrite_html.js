const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = [
  'asiacert.html', 'boc.html', 'research.html', 'conference.html',
  'publication.html', 'mobility.html', 'competition.html', 'community.html',
  'quality.html', 'academy.html', 'young.html', 'awards.html'
];

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has hero-leaders-row
  if (html.includes('hero-leaders-row')) return;

  let original = html;

  // Process BOC logo
  if (html.includes('class="boc-hero-logo"')) {
    html = html.replace(/<div class="boc-hero-logo">\s*<img([^>]+)>\s*<\/div>/, (match, imgAttrs) => {
      return `
        <div class="hero-leaders-row">
          <div class="hero-ketua-container" id="hero-ketua-container"></div>
          <div style="text-align: center; margin: 0;">
            <img ${imgAttrs} style="width: 250px; height: auto; animation: pulse-glow 4s infinite;" />
          </div>
          <div class="hero-sek-container" id="hero-sek-container"></div>
        </div>`;
    });
  } 
  // Process standard page-hero-logo
  else if (html.includes('class="page-hero-logo"')) {
    html = html.replace(/<img([^>]+)class="page-hero-logo"([^>]+)>/, (match, before, after) => {
      let cleanMatch = match.replace(/margin-bottom:\s*\d+px;?/g, 'margin-bottom: 0;');
      return `
        <div class="hero-leaders-row">
          <div class="hero-ketua-container" id="hero-ketua-container"></div>
          <div style="text-align: center; margin: 0;">
            ${cleanMatch}
          </div>
          <div class="hero-sek-container" id="hero-sek-container"></div>
        </div>`;
    });
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf-8');
    updatedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Successfully rewrote ${updatedCount} HTML files!`);
