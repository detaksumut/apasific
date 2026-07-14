import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    // Extract the <nav class="navbar" id="navbar">...</nav> block from layout.tsx
    const navStart = layoutContent.indexOf('<nav class="navbar" id="navbar">');
    const navEnd = layoutContent.indexOf('</nav>', navStart) + '</nav>'.length;
    
    if (navStart === -1 || navEnd === -1) {
      return NextResponse.json({ error: "Could not find nav block in layout.tsx" }, { status: 500 });
    }

    const newNavBlock = layoutContent.substring(navStart, navEnd);

    // Read all html files in public/
    const publicDir = path.join(process.cwd(), "public");
    const files = fs.readdirSync(publicDir).filter(f => f.endsWith(".html"));

    const results = [];

    for (const file of files) {
      const filePath = path.join(publicDir, file);
      const htmlContent = fs.readFileSync(filePath, "utf-8");

      const oldNavStart = htmlContent.indexOf('<nav class="navbar" id="navbar">');
      const oldNavEnd = htmlContent.indexOf('</nav>', oldNavStart) + '</nav>'.length;

      if (oldNavStart !== -1 && oldNavEnd !== -1) {
        const updatedHtml = htmlContent.substring(0, oldNavStart) + newNavBlock + htmlContent.substring(oldNavEnd);
        fs.writeFileSync(filePath, updatedHtml, "utf-8");
        results.push({ file, success: true, updated: true });
      } else {
        results.push({ file, success: true, updated: false, reason: "No nav block found" });
      }
    }

    return NextResponse.json({ success: true, message: "HTML files updated", results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
