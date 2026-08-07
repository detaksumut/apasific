import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cwd = process.cwd();
    const log: string[] = [];

    // Step 1: git add .
    log.push("Running: git add .");
    const addRes = await execAsync("git add .", { cwd });
    if (addRes.stdout) log.push(`Add stdout: ${addRes.stdout}`);
    if (addRes.stderr) log.push(`Add stderr: ${addRes.stderr}`);

    // Step 2: git commit
    log.push("Running: git commit");
    try {
      const commitRes = await execAsync('git commit -m "Update metrics real calculation and recover articles mapping"', { cwd });
      if (commitRes.stdout) log.push(`Commit stdout: ${commitRes.stdout}`);
      if (commitRes.stderr) log.push(`Commit stderr: ${commitRes.stderr}`);
    } catch (commitErr: any) {
      log.push(`Commit status: ${commitErr.message || commitErr}`);
    }

    // Step 3: git push
    log.push("Running: git push");
    const pushRes = await execAsync("git push", { cwd });
    if (pushRes.stdout) log.push(`Push stdout: ${pushRes.stdout}`);
    if (pushRes.stderr) log.push(`Push stderr: ${pushRes.stderr}`);

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message, 
      stdout: error.stdout, 
      stderr: error.stderr 
    });
  }
}
