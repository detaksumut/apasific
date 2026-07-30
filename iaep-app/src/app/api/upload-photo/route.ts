import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file || !fileName) {
      return NextResponse.json({ error: "File and fileName are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Simpan langsung ke folder public/images
    const publicDir = path.join(process.cwd(), "public", "images");
    
    // Pastikan folder ada
    await fs.mkdir(publicDir, { recursive: true });
    
    const filePath = path.join(publicDir, fileName);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, path: `/images/${fileName}` });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
