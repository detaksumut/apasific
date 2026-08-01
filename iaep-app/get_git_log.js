const { execSync } = require('child_process');
const fs = require('fs');
try {
  const output = execSync('git log -n 5 -p src/app/journal/page.tsx', { encoding: 'utf-8' });
  fs.writeFileSync('d:/Users/apasific/iaep-app/git_log_journal.txt', output);
} catch (e) {
  fs.writeFileSync('d:/Users/apasific/iaep-app/git_log_journal.txt', e.toString());
}
