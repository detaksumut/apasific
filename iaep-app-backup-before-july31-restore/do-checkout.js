const { spawnSync } = require('child_process');
const result = spawnSync('git', ['checkout', 'HEAD', '--', 'src/app/layout.tsx'], {
  encoding: 'utf-8'
});
console.log("Status:", result.status);
console.log("Stdout:", result.stdout);
console.log("Stderr:", result.stderr);
if (result.error) {
  console.error("Error:", result.error);
  process.exit(1);
}
if (result.status !== 0) {
  process.exit(1);
}
