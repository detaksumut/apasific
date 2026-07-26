import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cwd = process.cwd();
    const logs: string[] = [];
    
    const gitDir = await execAsync("git rev-parse --show-toplevel", { cwd }).catch(e => e);
    logs.push(`Git top level: ${gitDir.stdout || gitDir.message}`);
    
    const gitStatus = await execAsync("git status --porcelain", { cwd }).catch(e => e);
    logs.push(`Git porcelain status: ${gitStatus.stdout || gitStatus.message}`);
    
    const gitDiff = await execAsync("git diff", { cwd }).catch(e => e);
    logs.push(`Git diff length: ${gitDiff.stdout?.length || 0}`);
    
    logs.push("Running: git add -A");
    const addRes = await execAsync("git add -A", { cwd });
    logs.push(`Add stdout: ${addRes.stdout}, stderr: ${addRes.stderr}`);
    
    logs.push("Running: git commit");
    const commitRes = await execAsync('git commit -m "Replace deprecated marquee HTML tag with standard CSS keyframes animation to fix TypeScript JSX error"', { cwd }).catch(e => e);
    logs.push(`Commit stdout: ${commitRes.stdout || commitRes.message}, stderr: ${commitRes.stderr || ""}`);
    
    logs.push("Running: git push origin main");
    const pushRes = await execAsync("git push origin main", { cwd });
    logs.push(`Push stdout: ${pushRes.stdout}, stderr: ${pushRes.stderr}`);
    
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stdout: error.stdout, stderr: error.stderr });
  }
}
