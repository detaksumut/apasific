const { execSync } = require('child_process');
try {
  const log = execSync('git log --oneline -n 15', { cwd: __dirname }).toString();
  require('fs').writeFileSync('git_log_output.txt', log);
} catch (e) {
  require('fs').writeFileSync('git_log_output.txt', e.toString());
}
