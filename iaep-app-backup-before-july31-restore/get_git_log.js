const { execSync } = require('child_process');
const fs = require('fs');
try {
  const output = execSync('git log --since="2026-07-31 00:00:00" --until="2026-08-01 12:00:00" --format="%H|%ad|%s" --date=iso', { cwd: 'd:/Users/apasific/iaep-app' }).toString();
  fs.writeFileSync('d:/Users/apasific/iaep-app/git_log_output.txt', output);
} catch (e) {
  fs.writeFileSync('d:/Users/apasific/iaep-app/git_log_output.txt', e.message);
}
