import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    const cwd = process.cwd();
    
    // Check if there are changes
    const status = execSync('git status --porcelain', { cwd, encoding: 'utf-8' });
    
    if (!status.trim()) {
      return NextResponse.json({ success: true, msg: "No changes to commit." });
    }
    
    // Add, Commit, Push
    execSync('git add .', { cwd });
    execSync('git commit -m "feat: enhance article view with ORCID, DOI, real metrics; add flag-based multi-language support"', { cwd });
    const pushOutput = execSync('git push', { cwd, encoding: 'utf-8' });
    
    return NextResponse.json({ success: true, msg: "Changes pushed to GitHub successfully!", pushOutput });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stderr: e.stderr?.toString() });
  }
}
