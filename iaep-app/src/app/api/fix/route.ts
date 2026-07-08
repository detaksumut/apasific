import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Restore the file from before it was corrupted
    execSync('git checkout 7908fa7 public/main.js', { encoding: 'utf-8' });
    
    // Now apply the patch properly
    const mainJsPath = path.join(process.cwd(), 'public', 'main.js');
    let mainJs = fs.readFileSync(mainJsPath, 'utf-8');

    const replaceStart = "    const logo = document.querySelector('.page-hero-logo, .boc-hero-logo img');";
    const replaceEnd = "    localStorage.setItem(";

    const startIndex = mainJs.indexOf(replaceStart);
    const endIndex = mainJs.indexOf(replaceEnd);

    if (startIndex !== -1 && endIndex !== -1) {
      const newBody = `
    // 1. KETUA CARD
    const ketuaContainer = document.getElementById('hero-ketua-container');
    if (data.ketuaNama && ketuaContainer) {
      ketuaContainer.innerHTML = '';
      const ketuaCard = document.createElement('div');
      ketuaCard.className = 'hero-leader-card ketua';
      ketuaCard.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; padding: 12px; text-align: center; width: 220px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);';
      ketuaCard.setAttribute('data-aos', 'fade-right');
      
      const photoUrl = data.ketuaPhoto || 'logo-apasific.png';
      ketuaCard.innerHTML = \`
        <img src="\${photoUrl}" style="width: 100%; height: 230px; object-fit: cover; border-radius: 8px; border: 1.5px solid #c9a84c; margin-bottom: 12px; box-shadow: 0 4px 15px rgba(201,168,76,0.2);" />
        <div style="color: #fff; font-family: 'Cinzel', serif; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 6px; line-height: 1.3;">\${data.ketuaNama}</div>
        <div style="color: #c9a84c; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px;">\${data.ketuaJabatan || 'HEAD'}</div>
        <div style="color: rgba(255,255,255,0.4); font-size: 10px;">\${data.ketuaNegara || ''}</div>
      \`;
      ketuaContainer.appendChild(ketuaCard);
    }

    // 2. SEKRETARIS CARD
    const sekContainer = document.getElementById('hero-sek-container');
    if (data.sekNama && sekContainer) {
      sekContainer.innerHTML = '';
      const sekCard = document.createElement('div');
      sekCard.className = 'hero-leader-card sek';
      sekCard.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 12px; text-align: center; width: 220px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);';
      sekCard.setAttribute('data-aos', 'fade-left');
      
      const sekPhotoUrl = data.sekretarisPhoto || data.sekPhoto || 'logo-apasific.png';
      sekCard.innerHTML = \`
        <img src="\${sekPhotoUrl}" style="width: 100%; height: 230px; object-fit: cover; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.3); margin-bottom: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);" />
        <div style="color: #fff; font-family: 'Cinzel', serif; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 6px; line-height: 1.3;">\${data.sekNama}</div>
        <div style="color: rgba(255,255,255,0.6); font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px;">\${data.sekJabatan || 'SECRETARY'}</div>
        <div style="color: rgba(255,255,255,0.4); font-size: 10px;">\${data.sekNegara || ''}</div>
      \`;
      sekContainer.appendChild(sekCard);
    }

`;

      mainJs = mainJs.substring(0, startIndex) + newBody + mainJs.substring(endIndex);
      fs.writeFileSync(mainJsPath, mainJs, 'utf-8');
      return NextResponse.json({ success: true, message: 'main.js restored and patched' });
    }

    return NextResponse.json({ success: false, message: 'Could not find markers', startIndex, endIndex });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
