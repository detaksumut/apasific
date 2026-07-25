import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cwd = process.cwd();
    
    // 1. Git add
    const addRes = await execAsync("git add -A", { cwd });
    
    // 2. Git commit
    let commitRes = { stdout: "", stderr: "" };
    try {
      commitRes = await execAsync('git commit -m "fix: resolve Author-Editor-Reviewer workflow synchronization bugs"', { cwd });
    } catch (e: any) {
      commitRes = { stdout: e.stdout || "", stderr: e.stderr || "Commit maybe nothing to commit: " + e.message };
    }
    
    // 3. Git push
    let pushRes = { stdout: "", stderr: "" };
    try {
      pushRes = await execAsync("git push", { cwd });
    } catch (e: any) {
      pushRes = { stdout: e.stdout || "", stderr: e.stderr || "Push failed: " + e.message };
    }
    
    return NextResponse.json({
      success: true,
      add: addRes,
      commit: commitRes,
      push: pushRes
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stdout: error.stdout, stderr: error.stderr });
  }
}
