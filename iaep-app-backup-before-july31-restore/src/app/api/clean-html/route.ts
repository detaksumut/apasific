import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);
    let deletedCount = 0;
    const deletedFiles: string[] = [];

    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(publicDir, file);
        try {
            fs.unlinkSync(filePath);
            deletedFiles.push(file);
            deletedCount++;
        } catch (e) {
            console.error(`Gagal menghapus ${file}:`, e);
        }
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Pembersihan selesai',
        total_dihapus: deletedCount,
        file_dihapus: deletedFiles
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
