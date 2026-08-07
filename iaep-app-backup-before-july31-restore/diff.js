const { execSync } = require('child_process');
try {
  const diff = execSync('git diff src/app/page.tsx', { cwd: 'd:\\\\Users\\\\apasific\\\\iaep-app' }).toString();
  require('fs').writeFileSync('d:\\\\Users\\\\apasific\\\\iaep-app\\\\diff.txt', diff);
} catch (e) {
  require('fs').writeFileSync('d:\\\\Users\\\\apasific\\\\iaep-app\\\\diff.txt', e.toString());
}
