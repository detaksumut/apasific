import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const targetPath = path.join(process.cwd(), 'src/app/api/debug-check-article/route.ts');
  let status = "";
  try {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      status = "Successfully deleted debug-check-article/route.ts";
    } else {
      status = "File does not exist";
    }
  } catch (err: any) {
    status = "Error: " + err.message;
  }
  return NextResponse.json({ status });
}
