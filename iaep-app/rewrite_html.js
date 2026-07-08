const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = [
  'asiacert.html', 'boc.html', 'research.html', 'conference.html',
  'publication.html', 'mobility.html', 'competition.html', 'community.html',
  'quality.html', 'academy.html', 'young.html', 'awards.html'
];

files.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has hero-leaders-row
  if (html.includes('hero-leaders-row')) return;

  // Find the logo image tag
  // It could be <img src="..." class="page-hero-logo" /> OR inside <div class="boc-hero-logo">
  
  if (html.includes('class="boc-hero-logo"')) {
    html = html.replace(/<div class="boc-hero-logo">\s*<img([^>]+)>\s*<\/div>/, (match, imgAttrs) => {
      return `
        <div class="hero-leaders-row">
          <div class="hero-ketua-container" id="hero-ketua-container"></div>
          <div style="text-align: center;">
            <img \${imgAttrs} style="width: 250px; height: auto; animation: pulse-glow 4s infinite;" />
          </div>
          <div class="hero-sek-container" id="hero-sek-container"></div>
        </div>`;
    });
  } else if (html.includes('class="page-hero-logo"')) {
    html = html.replace(/<img([^>]+)class="page-hero-logo"([^>]+)>/, (match, before, after) => {
      // Remove margin-bottom from the logo since the row handles spacing
      let cleanMatch = match.replace(/margin-bottom:\s*\d+px;?/g, '');
      return `
        <div class="hero-leaders-row">
          <div class="hero-ketua-container" id="hero-ketua-container"></div>
          <div style="text-align: center;">
            \${cleanMatch}
          </div>
          <div class="hero-sek-container" id="hero-sek-container"></div>
        </div>`;
    });
  }

  fs.writeFileSync(filePath, html, 'utf-8');
});

console.log('Successfully rewrote 12 HTML files with native hero-leaders-row grid!');
