import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    const cwd = process.cwd();
    execSync('git add .', { cwd });
    let commitOutput = "No commit made";
    try {
      commitOutput = execSync('git commit -m "feat: expand certification section with ASIACERT-BOC leadership and 10 certification fields"', { cwd, encoding: 'utf-8' });
    } catch(e) {}
    const pushOutput = execSync('git push', { cwd, encoding: 'utf-8' });
    return NextResponse.json({ success: true, commitOutput, pushOutput });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stderr: e.stderr?.toString() });
  }
}
