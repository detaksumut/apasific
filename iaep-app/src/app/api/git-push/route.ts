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
    logs.push(`Add: ${addRes.stdout}, ${addRes.stderr}`);
    
    logs.push("Running: git commit");
    const commitRes = await execAsync('git commit -m "Integrate Zenodo live views into combined metrics chart"', { cwd }).catch(e => e);
    logs.push(`Commit: ${commitRes.stdout || commitRes.message}`);
    
    logs.push("Running: git pull --rebase origin main");
    const pullRes = await execAsync("git pull --rebase origin main", { cwd }).catch(e => e);
    logs.push(`Pull: ${pullRes.stdout || pullRes.message}, ${pullRes.stderr || ""}`);
    
    logs.push("Running: git push origin main");
    const pushRes = await execAsync("git push origin main", { cwd });
    logs.push(`Push: ${pushRes.stdout}, ${pushRes.stderr}`);
    
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stdout: error.stdout, stderr: error.stderr });
  }
}
