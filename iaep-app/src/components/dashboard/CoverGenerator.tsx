"use client";
import { useState, useRef, useEffect } from 'react';

interface CoverGeneratorProps {
  submission: any;
  generatedDoi?: string;
}

export default function CoverGenerator({ submission, generatedDoi }: CoverGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<'blue' | 'red' | 'gold'>('blue');
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [dynamicVolText, setDynamicVolText] = useState<string>('');
  
  const title = submission?.title || 'Untitled Article';
  const journalName = submission?.journals?.name || submission?.journalName || 'INTERNATIONAL JOURNAL';
  const submissionId = submission?.id || 'Unknown';
  const journalId = submission?.journal_id || submission?.journals?.id || '';

  useEffect(() => {
    async function fetchVol() {
       if (!journalId) return;
       try {
         const { getNextVolumeAndIssue } = await import('@/app/actions/editor');
         const res = await getNextVolumeAndIssue(journalId);
         const today = new Date();
         setDynamicVolText(`${res.volume} ${res.issue}, ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`);
       } catch (e) {
         console.warn("Failed to fetch dynamic volume", e);
       }
    }
    fetchVol();
  }, [journalId]);
  
  let extractedAuthor = submission?.author || 'Unknown Author';
  let scope = '';
  try {
    if (submission?.abstract) {
      const parsed = JSON.parse(submission.abstract);
      if (parsed.scope) {
         scope = parsed.scope;
      } else if (parsed.keywords) {
         const kw = parsed.keywords;
         if (kw.includes('Scope:') && kw.includes(', Kata Kunci:')) {
             scope = kw.split(', Kata Kunci:')[0].replace('Scope:', '').trim();
         } else if (kw.includes('Scope:')) {
             scope = kw.split('Scope:')[1].split(',')[0].trim();
         } else {
             scope = kw.split(',')[0].trim();
         }
      }
      if (parsed.authors && Array.isArray(parsed.authors) && parsed.authors.length > 0) {
         extractedAuthor = parsed.authors.map((a: any) => a.full_name || a.name).join(', ');
      }
    }
  } catch(e) {}
  
  const author = extractedAuthor === 'Unknown Author' && submission?.profiles?.full_name ? submission.profiles.full_name : extractedAuthor;
  
  const themes = {
    blue: { bg: '#0d1b2a', accent: '#415a77', text: '#e0e1dd' },
    red: { bg: '#370617', accent: '#9d0208', text: '#ffba08' },
    gold: { bg: '#c9a84c', accent: '#0d0d1a', text: '#0d0d1a' },
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY;
  };

  const drawCover = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1240;
    const height = 1754;
    canvas.width = width;
    canvas.height = height;

    const currentTheme = themes[theme];

    if (customBgUrl) {
      try {
        const bgImg = new Image();
        bgImg.src = customBgUrl;
        await new Promise((resolve, reject) => {
          bgImg.onload = resolve;
          bgImg.onerror = reject;
        });
        ctx.drawImage(bgImg, 0, 0, width, height);
      } catch (err) {
        ctx.fillStyle = currentTheme.bg;
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = currentTheme.bg;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    ctx.fillStyle = currentTheme.accent;
    ctx.fillRect(0, 0, width, 220);
    
    try {
      const logoImg = new Image();
      logoImg.src = '/apasific.png';
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      ctx.drawImage(logoImg, (width / 2) - 80, 30, 160, 160);
    } catch(err) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOGO', width / 2, 110);
    }

    ctx.fillStyle = currentTheme.text;
    ctx.textAlign = 'center';
    ctx.font = 'bold 54px "Times New Roman", serif';
    const journalY = 320;
    wrapText(ctx, journalName, width / 2, journalY, width - 100, 60);

    if (scope) {
      ctx.fillStyle = '#ccc';
      ctx.font = 'italic 28px Arial, sans-serif';
      ctx.fillText(`Focus & Scope: ${scope}`, width / 2, 400);
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 72px "Times New Roman", serif';
    const titleY = scope ? 500 : 450;
    
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    const nextY = wrapText(ctx, title.trim(), width / 2, titleY, width - 160, 85);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = currentTheme.text;
    ctx.font = '40px Arial, sans-serif';
    wrapText(ctx, author, width / 2, nextY + 60, width - 200, 50);

    const tableY = nextY + 220;
    const tableWidth = 1000;
    const tableX = (width - tableWidth) / 2;
    const headerHeight = 60;
    const bodyHeight = 120;

    ctx.fillStyle = currentTheme.accent;
    ctx.fillRect(tableX, tableY, tableWidth, headerHeight);
    
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(tableX, tableY + headerHeight, tableWidth, bodyHeight);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeRect(tableX, tableY, tableWidth, headerHeight + bodyHeight);

    const dividerX = tableX + (tableWidth * 0.65);
    ctx.beginPath();
    ctx.moveTo(dividerX, tableY);
    ctx.lineTo(dividerX, tableY + headerHeight + bodyHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tableX, tableY + headerHeight);
    ctx.lineTo(tableX + tableWidth, tableY + headerHeight);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("PUBLICATION RECORD", tableX + (tableWidth * 0.65) / 2, tableY + 40);
    ctx.fillText("DIGITAL OBJECT IDENTIFIER", dividerX + (tableWidth * 0.35) / 2, tableY + 40);

    const today = new Date();
    ctx.textAlign = 'left';
    ctx.fillStyle = theme === 'gold' ? '#000' : '#fff';
    ctx.font = 'italic 26px Arial, sans-serif';
    
    const fallbackVolText = `Vol 1 No 1, ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`;
    const volText = dynamicVolText || fallbackVolText;
    
    ctx.fillText(volText, tableX + 25, tableY + headerHeight + 45);

    ctx.font = 'bold 24px Arial, sans-serif';
    const displayTitle = title.length > 70 ? title.substring(0, 67) + '...' : title;
    wrapText(ctx, `Judul: ${displayTitle}`, tableX + 25, tableY + headerHeight + 85, (tableWidth * 0.65) - 50, 32);

    ctx.textAlign = 'left';
    ctx.fillStyle = theme === 'gold' ? '#000' : '#fff';
    ctx.font = 'bold 28px Arial, sans-serif';
    if (generatedDoi) {
      ctx.fillText(`DOI: ${generatedDoi}`, dividerX + 30, tableY + headerHeight + (bodyHeight / 2) + 10);
    } else {
      ctx.fillText("DOI: ______________", dividerX + 30, tableY + headerHeight + (bodyHeight / 2) + 10);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = currentTheme.accent;
    ctx.fillRect(0, height - 160, width, 160);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillText('ASSOCIATION OF ASIA PACIFIC ACADEMICIAN (APASIFIC)', width / 2, height - 85);
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText(`ID: ${submissionId}`, width / 2, height - 35);
  };

  useEffect(() => {
    drawCover();
  }, [title, author, journalName, theme, scope, customBgUrl, generatedDoi, dynamicVolText]);

  const attachCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setGenerating(true);
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
         alert("Gagal memproses gambar.");
         setGenerating(false);
         return;
      }
      
      const formData = new FormData();
      formData.append('file', blob, `Cover_${submissionId}.png`);
      formData.append('submissionId', submissionId);
      
      try {
        const res = await fetch('/api/upload-cover', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
           alert("Berhasil! Cover telah dibajukan / dilampirkan ke naskah ini.");
        } else {
           alert("Gagal melampirkan cover: " + data.error);
        }
      } catch (err) {
        alert("Error server saat melampirkan cover.");
      } finally {
        setGenerating(false);
      }
    }, 'image/png');
  };

  return (
    <div className="bg-[#11111a] border border-gray-800 p-6 rounded-xl shadow-xl flex flex-row gap-8 mt-6">
      {/* Settings Panel */}
      <div className="flex-1 min-w-0 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Auto-Cover Studio</h3>
          <p className="text-sm text-gray-400">Generate cover jurnal profesional secara otomatis dari metadata artikel tanpa perlu aplikasi desain eksternal.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pilih Tema / Latar Belakang</label>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => { setTheme('blue'); setCustomBgUrl(null); }}
                className={`w-12 h-12 rounded-full border-4 ${theme === 'blue' && !customBgUrl ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'} transition-all bg-[#0d1b2a]`}
                title="Navy Blue (Solid)"
              />
              <button 
                onClick={() => { setTheme('red'); setCustomBgUrl(null); }}
                className={`w-12 h-12 rounded-full border-4 ${theme === 'red' && !customBgUrl ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'} transition-all bg-[#370617]`}
                title="Crimson Red (Solid)"
              />
              <button 
                onClick={() => { setTheme('gold'); setCustomBgUrl(null); }}
                className={`w-12 h-12 rounded-full border-4 ${theme === 'gold' && !customBgUrl ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'} transition-all bg-[#c9a84c]`}
                title="Royal Gold (Solid)"
              />
              
              <div className="w-px h-8 bg-gray-700 mx-1"></div>
              
              <label 
                className={`flex items-center justify-center w-12 h-12 rounded-full border-4 cursor-pointer transition-all ${customBgUrl ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)] bg-gray-600' : 'border-dashed border-gray-500 opacity-60 hover:opacity-100 hover:border-white bg-gray-800'}`}
                title="Unggah Pattern / Background Bebas"
              >
                <span className="text-xl font-bold text-white">+</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setCustomBgUrl(url);
                    }
                  }} 
                />
              </label>
            </div>
          </div>

          <div className="bg-[#0a0a0f] p-4 rounded-lg border border-gray-800">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data Metadata (Ditarik Otomatis)</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex gap-2"><span className="w-16 font-semibold text-gray-600 shrink-0">Jurnal:</span> <span className="flex-1 break-words line-clamp-2">{journalName || '-'}</span></li>
              {scope && <li className="flex gap-2"><span className="w-16 font-semibold text-gray-600 shrink-0">Scope:</span> <span className="flex-1 break-words line-clamp-2">{scope}</span></li>}
              <li className="flex gap-2"><span className="w-16 font-semibold text-gray-600 shrink-0">Judul:</span> <span className="flex-1 break-words line-clamp-2">{title || '-'}</span></li>
              <li className="flex gap-2"><span className="w-16 font-semibold text-gray-600 shrink-0">Author:</span> <span className="flex-1 break-words line-clamp-1">{author || '-'}</span></li>
            </ul>
          </div>
          
          <div className="bg-blue-900/30 border border-blue-700/50 p-3 rounded-lg text-blue-300 text-xs mt-4">
             <span className="font-bold">Panduan:</span> Silakan lihat pratinjau (preview) hasil generate cover di sebelah kanan. Ubah tema warna jika perlu. Jika sudah pas dan cocok, klik tombol di bawah untuk menerapkan.
          </div>
          
          {submission?.cover_file_url && (
             <div className="bg-green-900/30 border border-green-700/50 p-3 rounded-lg flex items-center justify-between text-green-400 text-sm">
                <div className="flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                   Cover Telah Diterapkan
                </div>
                <a href={submission.cover_file_url} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">Lihat Cover</a>
             </div>
          )}
        </div>

        <button 
          onClick={attachCover}
          disabled={generating}
          className="w-full bg-[#c9a84c] hover:bg-[#b0923d] text-black font-bold py-3 px-6 rounded shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          {generating ? 'Memproses...' : (submission?.cover_file_url ? 'Perbarui Cover' : 'Sudah Pas? Terapkan ke Naskah')}
        </button>
      </div>

      {/* Canvas Preview Area */}
      <div className="flex-1 flex justify-center items-center bg-black/60 rounded-lg p-6 overflow-hidden border border-gray-800">
        <canvas 
          ref={canvasRef} 
          className="w-full h-auto max-w-[320px] object-contain shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded"
          style={{ aspectRatio: '1 / 1.414' }}
        />
      </div>
    </div>
  );
}
