const { spawnSync } = require('child_process');
const cwd = process.cwd();

console.log('Adding files...');
spawnSync('git', ['add', '.'], { cwd, stdio: 'inherit' });

console.log('Committing...');
spawnSync('git', ['commit', '-m', 'fix: make admin org structure edit modal scrollable and minor data updates'], { cwd, stdio: 'inherit' });

console.log('Pushing...');
const push = spawnSync('git', ['push'], { cwd, stdio: 'inherit' });

if (push.status === 0) {
  console.log('Push successful!');
} else {
  console.error('Push failed with status:', push.status);
}
