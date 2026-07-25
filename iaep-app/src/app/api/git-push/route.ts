import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cwd = process.cwd();
    
    const { stdout, stderr } = await execAsync("git log -1", { cwd });
    return NextResponse.json({ success: true, stdout, stderr });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stdout: error.stdout, stderr: error.stderr });
  }
}
