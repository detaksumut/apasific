const { execSync } = require('child_process');
try {
  const log = execSync('git log -n 10 --oneline', { cwd: 'd:\\\\Users\\\\apasific\\\\iaep-app' }).toString();
  require('fs').writeFileSync('d:\\\\Users\\\\apasific\\\\iaep-app\\\\git_log_dump.txt', log);
} catch (e) {
  require('fs').writeFileSync('d:\\\\Users\\\\apasific\\\\iaep-app\\\\git_log_dump.txt', e.toString());
}
