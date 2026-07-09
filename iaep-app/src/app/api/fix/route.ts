import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    const cwd = process.cwd();
    execSync('git add .', { cwd });
    let commitOutput = "No commit made";
    try {
      commitOutput = execSync('git commit -m "fix: add position relative and z-index to make mobile hamburger menu clickable"', { cwd, encoding: 'utf-8' });
    } catch(e) {}
    const pushOutput = execSync('git push', { cwd, encoding: 'utf-8' });
    return NextResponse.json({ success: true, commitOutput, pushOutput });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stderr: e.stderr?.toString(), stdout: e.stdout?.toString() });
  }
}
