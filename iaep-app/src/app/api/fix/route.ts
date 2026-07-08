import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const files = [
      'asiacert.html', 'boc.html', 'research.html', 'conference.html',
      'publication.html', 'mobility.html', 'competition.html', 'community.html',
      'quality.html', 'academy.html', 'young.html', 'awards.html'
    ];

    let log = [];

    files.forEach(file => {
      const filePath = path.join(publicDir, file);
      if (!fs.existsSync(filePath)) return;

      let html = fs.readFileSync(filePath, 'utf-8');

      if (html.includes('hero-leaders-row')) {
        log.push(file + ' already processed');
        return;
      }

      if (html.includes('class="boc-hero-logo"')) {
        html = html.replace(/<div class="boc-hero-logo">\\s*<img([^>]+)>\\s*<\\/div>/, (match, imgAttrs) => {
          return `
        <div class="hero-leaders-row">
          <div class="hero-ketua-container" id="hero-ketua-container"></div>
          <div style="text-align: center; margin: 0;">
            <img ${imgAttrs} style="width: 250px; height: auto; animation: pulse-glow 4s infinite;" />
          </div>
          <div class="hero-sek-container" id="hero-sek-container"></div>
        </div>`;
        });
        fs.writeFileSync(filePath, html, 'utf-8');
        log.push(file + ' updated BOC logo');
      } else if (html.includes('class="page-hero-logo"')) {
        html = html.replace(/<img([^>]+)class="page-hero-logo"([^>]+)>/, (match, before, after) => {
          let cleanMatch = match.replace(/margin-bottom:\\s*\\\\d+px;?/g, 'margin-bottom: 0;');
          return `
        <div class="hero-leaders-row">
          <div class="hero-ketua-container" id="hero-ketua-container"></div>
          <div style="text-align: center; margin: 0;">
            ${cleanMatch}
          </div>
          <div class="hero-sek-container" id="hero-sek-container"></div>
        </div>`;
        });
        fs.writeFileSync(filePath, html, 'utf-8');
        log.push(file + ' updated standard logo');
      }
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
