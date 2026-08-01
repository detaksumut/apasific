import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const oldContent = execSync('git show dac06b1372c6bd3e6b350f183e62702a76881c65:src/app/journal/page.tsx', { encoding: 'utf-8' });
    const tmpPath = path.join(process.cwd(), 'old_journal_page.txt');
    fs.writeFileSync(tmpPath, oldContent);
    return NextResponse.json({ ok: true, path: tmpPath });
  } catch (e: any) {
    return NextResponse.json({ error: e.toString() });
  }
}
