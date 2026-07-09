const { execSync } = require('child_process');
try {
  execSync('git checkout HEAD -- src/app/layout.tsx');
  console.log("Restored");
} catch(e) {
  console.error(e.message);
  console.error(e.stderr?.toString());
}
