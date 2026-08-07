const { execSync } = require('child_process');
try {
  // Revert one more commit back, to before e477a72
  execSync('git reset --hard HEAD~1', { cwd: __dirname, stdio: 'inherit' });
  console.log("Berhasil mundur satu commit lagi.");
} catch (e) {
  console.log(e.toString());
}
