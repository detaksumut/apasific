const { execSync } = require('child_process');
try {
  const content = execSync('git show HEAD:src/app/page.tsx', { cwd: 'd:\\\\Users\\\\apasific\\\\iaep-app', maxBuffer: 1024*1024*10 }).toString();
  require('fs').writeFileSync('d:\\\\Users\\\\apasific\\\\iaep-app\\\\head_page.txt', content);
} catch (e) {
  require('fs').writeFileSync('d:\\\\Users\\\\apasific\\\\iaep-app\\\\head_page.txt', e.toString());
}
