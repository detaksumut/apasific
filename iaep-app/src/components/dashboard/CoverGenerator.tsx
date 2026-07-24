"use client";
import { useState, useRef, useEffect } from 'react';
import { getAssignedVolumeAndIssue } from '@/app/actions/editor';
import DynamicCover from '@/components/DynamicCover';

interface CoverGeneratorProps {
  submission: any;
  generatedDoi?: string;
}

export default function CoverGenerator({ submission, generatedDoi }: CoverGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState<string>(submission?.cover_theme || 'forest');
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
         const text = await getAssignedVolumeAndIssue(submissionId, journalId);
         const today = new Date();
         setDynamicVolText(`${text}, ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`);
       } catch (e) {
         console.warn("Failed to fetch dynamic volume", e);
       }
    }
    fetchVol();
  }, [journalId, submissionId]);
  
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
  
  const themes: Record<string, { bg: string, accent: string, text: string }> = {
    blue: { bg: '#0d1b2a', accent: '#415a77', text: '#e0e1dd' },
    red: { bg: '#370617', accent: '#9d0208', text: '#ffba08' },
    gold: { bg: '#c9a84c', accent: '#0d0d1a', text: '#0d0d1a' },
    forest: { bg: '#1B4332', accent: '#2D6A4F', text: '#D8F3DC' },
    purple: { bg: '#240046', accent: '#5A189A', text: '#E0AAFF' },
    teal: { bg: '#004E64', accent: '#00A5CF', text: '#9FFFCB' },
    orange: { bg: '#9C6644', accent: '#B08968', text: '#EDE0D4' },
    slate: { bg: '#2B2D42', accent: '#8D99AE', text: '#EDF2F4' },
    crimson: { bg: '#641220', accent: '#A11D33', text: '#F3DFE3' },
    ocean: { bg: '#023047', accent: '#219EBC', text: '#8ECAE6' },
    midnight: { bg: '#000000', accent: '#333333', text: '#FFFFFF' },
    indigo: { bg: '#312244', accent: '#4D194D', text: '#E0B1CB' },
    olive: { bg: '#4C5C68', accent: '#C5C3C6', text: '#46494C' },
    maroon: { bg: '#590D22', accent: '#800F2F', text: '#FFB3C6' },
    coffee: { bg: '#3C2F2F', accent: '#BE9B7B', text: '#FFF4E6' },
    moss: { bg: '#283618', accent: '#606C38', text: '#FEFAE0' }
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

    // Match aspect-[1/1.5] used in DynamicCover
    const width = 1240;
    const height = 1860;
    canvas.width = width;
    canvas.height = height;

    const journalCode = journalName ? journalName.split(' ')[0].toUpperCase() : '';
    
    let bgUrl = '/coverPKM.png';
    if (customBgUrl) {
      bgUrl = customBgUrl;
    } else if (journalCode === 'AJITE') {
      bgUrl = '/coverAJITE.png';
    } else if (journalCode === 'AJAF') {
      bgUrl = '/coverAJAF.png';
    }

    try {
      const bgImg = new Image();
      bgImg.src = bgUrl;
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
      });
      ctx.drawImage(bgImg, 0, 0, width, height);
      
      // Black overlay 10%
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
    } catch (err) {
      ctx.fillStyle = '#06142e';
      ctx.fillRect(0, 0, width, height);
    }

    // Journal Name (top-[50cqw] left-[8cqw])
    const jName = journalName ? journalName.split(' ')[0].toUpperCase() : '';
    ctx.fillStyle = '#f0c05a';
    ctx.font = 'bold 55px "Times New Roman", serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillText(jName, width * 0.08, width * 0.50 + 55);

    // Article Title & Subtitle (top-[58cqw] left-[8cqw] w-[38cqw])
    const titleX = width * 0.08;
    let currentY = width * 0.58 + 35;
    const maxTitleW = width * 0.38;

    if (title && title.includes(':')) {
      const parts = title.split(':');
      const mainTitle = parts[0].trim() + ':';
      const subTitle = parts.slice(1).join(':').trim();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 35px Arial, sans-serif';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      currentY = wrapText(ctx, mainTitle, titleX, currentY, maxTitleW, 46);

      currentY += 12; // Gap antara judul utama dan sub-judul

      ctx.fillStyle = '#e4e4e7';
      ctx.font = '26px Arial, sans-serif';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      wrapText(ctx, subTitle, titleX, currentY, maxTitleW, 36);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '500 35px Arial, sans-serif';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      wrapText(ctx, title || "Untitled Article", titleX, currentY, maxTitleW, 48);
    }

    // DOI (top-[17cqw] left-[33cqw])
    if (generatedDoi) {
      ctx.fillStyle = '#f0c05a';
      ctx.font = 'bold 27px Arial, sans-serif';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1;
      const doiY = width * 0.17 + 27;
      ctx.fillText("DOI", width * 0.33, doiY);
      
      ctx.fillStyle = '#e4e4e7'; // zinc-200
      ctx.font = '32px monospace';
      ctx.fillText(generatedDoi, width * 0.33, doiY + 40);
    }

    // Volume & Edition (top-[137.5cqw] left-[26cqw] / left-[52cqw])
    // dynamicVolText is usually "Vol 1 No 1, July 2026"
    const volParts = dynamicVolText ? dynamicVolText.split(',') : [];
    let part1 = volParts[0] ? volParts[0].trim().toUpperCase() : "VOL 1 NO 1";
    let part2 = volParts[1] ? volParts[1].trim().toUpperCase() : "JULY 2026";
    
    ctx.fillStyle = '#d4d4d8';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const botY = width * 1.375 + 22;
    
    // To match DynamicCover's two-line layout roughly, we'll split them if possible,
    // but the canvas version can just render them side-by-side matching the grid
    ctx.fillText(part1, width * 0.26, botY);
    ctx.fillText(part2, width * 0.52, botY);
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
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-xl flex flex-row gap-8 mt-6">
      {/* Settings Panel */}
      <div className="flex-1 min-w-0 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Auto-Cover Studio</h3>
          <p className="text-sm text-gray-600">Generate cover jurnal profesional secara otomatis dari metadata artikel tanpa perlu aplikasi desain eksternal.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Pilih Tema / Latar Belakang</label>
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(themes).map(([key, val]) => (
                <button 
                  key={key}
                  onClick={() => { setTheme(key); setCustomBgUrl(null); }}
                  className={`w-8 h-8 rounded-full border-[3px] ${theme === key && !customBgUrl ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'} transition-all`}
                  style={{ backgroundColor: val.bg }}
                  title={`Theme: ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                />
              ))}
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              
              <label 
                className={`flex items-center justify-center w-8 h-8 rounded-full border-[3px] cursor-pointer transition-all ${customBgUrl ? 'border-indigo-500 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.4)] bg-indigo-100' : 'border-dashed border-gray-300 opacity-60 hover:opacity-100 hover:border-gray-500 bg-gray-100'}`}
                title="Unggah Pattern / Background Bebas"
              >
                <span className="text-sm font-bold text-gray-700">+</span>
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

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data Metadata (Ditarik Otomatis)</h4>
            <ul className="text-sm text-gray-800 space-y-2">
              <li className="flex gap-2"><span className="w-16 font-semibold text-gray-500 shrink-0">Jurnal:</span> <span className="flex-1 break-words line-clamp-2">{journalName || '-'}</span></li>
              {scope && <li className="flex gap-2"><span className="w-16 font-semibold text-gray-500 shrink-0">Scope:</span> <span className="flex-1 break-words line-clamp-2">{scope}</span></li>}
              <li className="flex gap-2"><span className="w-16 font-semibold text-gray-500 shrink-0">Judul:</span> <span className="flex-1 break-words line-clamp-2">{title || '-'}</span></li>
              <li className="flex gap-2"><span className="w-16 font-semibold text-gray-500 shrink-0">Author:</span> <span className="flex-1 break-words line-clamp-1">{author || '-'}</span></li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800 text-xs mt-4">
             <span className="font-bold">Panduan:</span> Silakan lihat pratinjau (preview) hasil generate cover di sebelah kanan. Ubah tema warna jika perlu. Jika sudah pas dan cocok, klik tombol di bawah untuk menerapkan.
          </div>
          
          {submission?.cover_file_url && (
             <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center justify-between text-green-800 text-sm">
                <div className="flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                   Cover Telah Diterapkan
                </div>
                <a href={submission.cover_file_url} target="_blank" rel="noopener noreferrer" className="hover:text-green-900 underline font-medium">Lihat Cover</a>
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
      <div className="flex-1 flex justify-center items-center bg-gray-100 rounded-lg p-6 overflow-hidden border border-gray-200">
        {/* Canvas disembunyikan tapi tetap dipakai untuk upload file syarat sistem */}
        <canvas 
          ref={canvasRef} 
          className="hidden"
        />
        
        {/* Preview menggunakan desain DynamicCover terbaru */}
        <div className="w-full max-w-[320px]">
          {(() => {
            return (
              <DynamicCover 
                title={title}
                author={author}
                journalName={journalName}
                doi={generatedDoi || ""}
                volume={""}
                edisi={""}
                month={""}
                year={""}
                customBgUrl={customBgUrl}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}
