import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    const cwd = process.cwd();
    
    // Add, Commit, Push
    execSync('git add .', { cwd });
    let commitOutput = "No commit made (possibly no changes)";
    try {
      commitOutput = execSync('git commit -m "feat: enhance article view with ORCID, DOI, real metrics; add flag-based multi-language support"', { cwd, encoding: 'utf-8' });
    } catch(e) {}
    
    const pushOutput = execSync('git push', { cwd, encoding: 'utf-8' });
    
    return NextResponse.json({ success: true, msg: "Pushed!", commitOutput, pushOutput });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stderr: e.stderr?.toString() });
  }
}
