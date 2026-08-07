const { execSync } = require('child_process');
try {
  execSync('git add .');
  try {
    execSync('git commit -m "fix: make hamburger menu work on Next.js client-side route transitions"');
  } catch (e) {
    console.log("No changes to commit");
  }
  const o = execSync('git push', { encoding: 'utf-8' });
  console.log(o);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
