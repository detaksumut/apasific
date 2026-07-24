import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicDir = 'd:/Users/apasific/iaep-app/public';
    const files = fs.readdirSync(publicDir);

    let updatedFiles: string[] = [];
    files.forEach(file => {
      if (file.endsWith('.html')) {
        const filePath = path.join(publicDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('LOGIN / DAFTAR') || content.includes('LOGIN / REGISTER') || content.includes('LOGIN/REGISTER')) {
          content = content.replace(/LOGIN \/ DAFTAR/g, 'MASUK / DAFTAR')
                           .replace(/LOGIN \/ REGISTER/g, 'MASUK / DAFTAR')
                           .replace(/LOGIN\/REGISTER/g, 'MASUK / DAFTAR');
          fs.writeFileSync(filePath, content, 'utf8');
          updatedFiles.push(file);
        }
      }
    });

    return NextResponse.json({ success: true, count: updatedFiles.length, updatedFiles });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
