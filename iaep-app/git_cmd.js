const { execSync } = require('child_process');

try {
  const stdout = execSync('git status', { encoding: 'utf8' });
  console.log('GIT STATUS OUTPUT:\n', stdout);
} catch (error) {
  console.error('Error running git status:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout);
  if (error.stderr) console.error('stderr:', error.stderr);
}
