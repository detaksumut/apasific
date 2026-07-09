import { execSync } from 'child_process';
try {
  execSync('git checkout src/app/layout.tsx', { stdio: 'inherit' });
  console.log('Reverted layout.tsx');
} catch (e) {
  console.error(e);
}
