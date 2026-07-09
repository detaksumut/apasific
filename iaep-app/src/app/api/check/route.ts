import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cwd = process.cwd();
    let buildOutput = "Build success";
    try {
      buildOutput = execSync('npx next build', { cwd, encoding: 'utf-8' });
    } catch(e: any) {
      fs.writeFileSync(path.join(cwd, 'public', 'next-errors.txt'), (e.stdout?.toString() || "") + "\n" + (e.stderr?.toString() || "") + "\n" + e.message);
      return NextResponse.json({ success: false, msg: 'wrote errors to next-errors.txt' });
    }
    
    fs.writeFileSync(path.join(cwd, 'public', 'next-errors.txt'), buildOutput);
    return NextResponse.json({ success: true, buildOutput });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
