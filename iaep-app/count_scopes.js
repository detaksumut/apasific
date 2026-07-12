const fs = require('fs');
const path = require('path');
const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

let totalScopes = 0;
let fileScopes = [];

for (const file of files) {
  try {
    const content = fs.readFileSync(path.join(publicDir, file), 'utf8');
    const scopeSection = content.split('2. Scope of the Discipline</h2>')[1];
    if (scopeSection) {
      const ulContent = scopeSection.split('<ul')[1].split('</ul>')[0];
      const items = ulContent.match(/<li>(.*?)<\/li>/g);
      if (items) {
        fileScopes.push(file + ': ' + items.length + ' scopes');
        totalScopes += items.length;
      }
    }
  } catch(e) {}
}

const journalsFile = path.join(__dirname, 'src', 'app', 'dashboard', 'submit', 'page.tsx');
let submitScopesTotal = 0;
try {
  const content = fs.readFileSync(journalsFile, 'utf8');
  const matches = content.match(/scopes:\s*\[(.*?)\]/g);
  if (matches) {
     matches.forEach(m => {
       const count = (m.match(/'/g) || []).length / 2;
       submitScopesTotal += count;
     });
  }
} catch (e) {}

fs.writeFileSync('scopes_count.txt', `Total scopes in HTML files: ${totalScopes}\nDetails:\n${fileScopes.join('\n')}\n\nTotal scopes in submit/page.tsx: ${submitScopesTotal}`);
