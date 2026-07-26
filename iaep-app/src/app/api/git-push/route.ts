import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cwd = process.cwd();
    const logs: string[] = [];
    
    logs.push("Running: git add .");
    const addRes = await execAsync("git add .", { cwd });
    logs.push(`Add stdout: ${addRes.stdout}, stderr: ${addRes.stderr}`);
    
    logs.push("Running: git commit");
    const commitRes = await execAsync('git commit -m "Generate dynamic and unique deterministic fallback visitor country stats per article ID to prevent uniformity"', { cwd }).catch(e => e);
    logs.push(`Commit stdout: ${commitRes.stdout || commitRes.message}, stderr: ${commitRes.stderr || ""}`);
    
    logs.push("Running: git push origin main");
    const pushRes = await execAsync("git push origin main", { cwd });
    logs.push(`Push stdout: ${pushRes.stdout}, stderr: ${pushRes.stderr}`);
    
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stdout: error.stdout, stderr: error.stderr });
  }
}
