import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cwd = process.cwd();
    
    // Add all files
    await execAsync("git add .", { cwd });
    
    // Commit
    const commitMsg = "feat: complete architectural overhaul, clean db, UUID fixes, static HTML sync, and comprehensive README blueprint";
    try {
      await execAsync(`git commit -m "${commitMsg}"`, { cwd });
    } catch (e: any) {
      if (e.stdout && e.stdout.includes("nothing to commit")) {
        return NextResponse.json({ success: true, message: "Nothing to commit. Changes may have already been pushed." });
      }
      throw e;
    }
    
    // Push
    let stdout = "";
    let stderr = "";
    try {
       const res = await execAsync("git push", { cwd });
       stdout = res.stdout;
       stderr = res.stderr;
    } catch(pushErr: any) {
       return NextResponse.json({ success: false, message: "Push failed", error: pushErr.message, stdout: pushErr.stdout, stderr: pushErr.stderr });
    }

    return NextResponse.json({ success: true, message: "Successfully pushed to GitHub", output: stdout, errorOutput: stderr });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stdout: error.stdout, stderr: error.stderr });
  }
}
