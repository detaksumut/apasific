import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cwd = process.cwd();
    
    const { stdout: addStdout, stderr: addStderr } = await execAsync("git add .", { cwd });
    const { stdout: commitStdout, stderr: commitStderr } = await execAsync('git commit -m "fix: resolve typescript build error in reviewer.ts"', { cwd }).catch(err => err);
    const { stdout: pushStdout, stderr: pushStderr } = await execAsync("git push", { cwd });
    
    return NextResponse.json({ 
      success: true, 
      add: { stdout: addStdout, stderr: addStderr },
      commit: { stdout: commitStdout, stderr: commitStderr },
      push: { stdout: pushStdout, stderr: pushStderr }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stdout: error.stdout, stderr: error.stderr });
  }
}
