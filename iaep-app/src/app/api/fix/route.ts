import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    const cwd = process.cwd();
    const out = execSync('node "C:\\\\Users\\\\BI News\\\\.gemini\\\\antigravity-ide\\\\brain\\\\2566467c-b530-4a04-ba68-68c322f792d8\\\\scratch\\\\cleanup_nav.js"', { cwd, encoding: 'utf-8' });
    
    // Auto commit and push
    execSync('git add .', { cwd });
    let commitOutput = "No commit made";
    try {
      commitOutput = execSync('git commit -m "fix: cleanup duplicate nav links"', { cwd, encoding: 'utf-8' });
    } catch(e) {}
    
    const pushOutput = execSync('git push', { cwd, encoding: 'utf-8' });

    return NextResponse.json({ success: true, scriptOutput: out, commitOutput, pushOutput });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stderr: e.stderr?.toString() });
  }
}
