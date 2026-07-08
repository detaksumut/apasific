import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
    const fixedFiles: string[] = [];

    files.forEach(file => {
      const filePath = path.join(publicDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      let modified = false;
      if (content.includes('Regional Chapters')) {
        content = content.replace(
          /<a href="[^"]*regional-chapters[^"]*">\s*<span class="dd-icon">◈<\/span>\s*Regional Chapters\s*<\/a>/g,
          '<a href="/certification"><span class="dd-icon">◈</span> Certification Structure</a>'
        );
        modified = true;
      }
      
      if (content.includes('Journal Structure')) {
        content = content.replace(
          /<a href="\/journal"><span class="dd-icon">◈<\/span>\s*Journal Structure\s*<\/a>/g,
          '<a href="/journal"><span class="dd-icon">◈</span> Journal Editorial Board</a>'
        );
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        fixedFiles.push(file);
      }
    });

    return NextResponse.json({ success: true, message: `Fixed ${fixedFiles.length} HTML files!`, fixedFiles });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
