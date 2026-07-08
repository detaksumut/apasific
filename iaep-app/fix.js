const { execSync } = require('child_process');
try {
  execSync('git restore src/app/globals.css');
  console.log("Restored successfully");
} catch(e) {
  console.log("Error", e.message);
}
