'use client';

import React, { useState, useRef } from 'react';

interface TikTokArticleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    journal?: string;
    doi?: string;
    volume?: string | number;
    issue?: string | number;
    year?: string | number;
    authors?: string[];
  };
  displayAuthors?: string;
}

export const TikTokArticleShareModal: React.FC<TikTokArticleShareModalProps> = ({
  isOpen,
  onClose,
  article,
  displayAuthors = "APASIFIC Author"
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const articleUrl = typeof window !== 'undefined' ? window.location.href : 'https://apasific.org';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(articleUrl)}&color=c9a84c&bgcolor=070714`;

  const captionText = `📚 NEW PUBLICATION HIGHLIGHT!\n\nJudul: ${article.title}\nPenulis: ${displayAuthors}\nJurnal: ${article.journal || 'ASIA Journal'}\nDOI: https://doi.org/${article.doi || '10.xxxx'}\n\nBaca naskah lengkap: ${articleUrl}\n\n#APASIFIC #JurnalIlmiah #RisetAkademik #PublikasiInternasional #OpenScience #AsiaPacificAcademician`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}&quote=${encodeURIComponent(`📚 Publikasi Ilmiah APASIFIC: ${article.title}`)}`;
    window.open(fbUrl, '_blank', 'width=600,height=500');
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(captionText)}`;
    window.open(waUrl, '_blank');
  };

  const handleDownloadCanvas = async () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, '#05050f');
      grad.addColorStop(0.5, '#0b0c1b');
      grad.addColorStop(1, '#05050f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Gold border
      ctx.strokeStyle = '#c9a84c';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1020, 1860);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, 980, 1820);

      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 4) => {
        const words = text.split(' ');
        let line = '';
        let linesCount = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
            linesCount++;
            if (linesCount >= maxLines - 1 && n < words.length - 1) {
              ctx.fillText(line.trim() + '...', x, y);
              return y + lineHeight;
            }
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
        return y + lineHeight;
      };

      // Header Tag
      ctx.fillStyle = '#c9a84c';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦ ASSOCIATION OF ASIA PACIFIC ACADEMICIAN ✦', 540, 140);

      // Journal Badge Box
      ctx.fillStyle = '#16162a';
      ctx.beginPath();
      ctx.roundRect(140, 180, 800, 70, 35);
      ctx.fill();
      ctx.strokeStyle = '#c9a84c';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#e8c97a';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText((article.journal || 'ASIA ACADEMIC JOURNAL').toUpperCase(), 540, 226);

      // Article Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px Arial, sans-serif';
      const endTitleY = wrapText(article.title, 540, 350, 860, 68, 4);

      // Authors
      ctx.fillStyle = '#c9a84c';
      ctx.font = '32px Arial, sans-serif';
      ctx.fillText(`✍️ ${displayAuthors}`, 540, endTitleY + 40);

      // Quality Box
      const boxY = endTitleY + 110;
      ctx.fillStyle = 'rgba(22, 22, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(100, boxY, 880, 240, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#c9a84c';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('📊 AT-RQS SCIENTIFIC RIGOR PROFILE', 140, boxY + 55);

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 26px Arial, sans-serif';
      ctx.fillText('STATUS: PEER REVIEW VERIFIED', 140, boxY + 115);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText(`DOI: 10.xxxx/${article.doi || 'iaep.2026.verified'}`, 140, boxY + 165);
      ctx.fillText('Indexing: ASIA Index · Crossref · Google Scholar · Zenodo', 140, boxY + 205);

      // Load QR Code Image
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = qrCodeUrl;
      await new Promise((resolve) => {
        qrImg.onload = resolve;
        qrImg.onerror = resolve;
      });

      const qrY = boxY + 290;
      ctx.fillStyle = '#070714';
      ctx.fillRect(360, qrY, 360, 360);
      ctx.strokeStyle = '#c9a84c';
      ctx.lineWidth = 4;
      ctx.strokeRect(360, qrY, 360, 360);

      try {
        ctx.drawImage(qrImg, 380, qrY + 20, 320, 320);
      } catch (e) {}

      // Scan instruction
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e8c97a';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText('📱 SCAN UNTUK BACA NASKAH LENGKAP', 540, qrY + 420);

      // TikTok & Facebook Footer
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText('TikTok: @apasificacademician · Facebook: Muhibuddin A. Rahman', 540, qrY + 490);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '24px Arial, sans-serif';
      ctx.fillText('🌐 https://apasific.org · Integrated Academic Ecosystem Platform', 540, qrY + 540);

      const link = document.createElement('a');
      link.download = `APASIFIC-Story-${(article.journal || 'Journal').replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh kartu. Silakan salin caption manual.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0c16] border border-[#c9a84c]/50 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-white my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white bg-[#16162a] p-2 rounded-full border border-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 border border-[#c9a84c] flex items-center justify-center text-lg">
            🌐
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Diseminasi Naskah: TikTok & Facebook
            </h3>
            <p className="text-xs text-gray-400">
              Bagikan publikasi resmi ke Facebook, TikTok Story (9:16), Reels, dan WhatsApp.
            </p>
          </div>
        </div>

        {/* 9:16 Visual Preview Card */}
        <div className="bg-[#05050a] border border-[#c9a84c]/40 rounded-2xl p-5 mb-6 text-center space-y-3 relative overflow-hidden shadow-inner">
          <span className="text-[10px] font-bold text-[#c9a84c] uppercase tracking-widest block">
            ✦ ASSOCIATION OF ASIA PACIFIC ACADEMICIAN ✦
          </span>
          <span className="inline-block text-xs font-bold bg-[#16162a] text-[#e8c97a] border border-[#c9a84c]/50 px-3 py-1 rounded-full">
            {article.journal || 'ASIA Academic Journal'}
          </span>
          <h4 className="text-sm sm:text-base font-extrabold text-white line-clamp-3 leading-snug">
            {article.title}
          </h4>
          <p className="text-xs text-[#c9a84c]">
            ✍️ {displayAuthors}
          </p>

          <div className="bg-[#111120] border border-gray-800 rounded-xl p-3 text-left text-[11px] space-y-1 text-gray-300 max-w-md mx-auto">
            <div className="text-green-400 font-bold">STATUS: PEER REVIEW VERIFIED (AT-RQS)</div>
            <div className="text-gray-400 font-mono text-[10px]">DOI: https://doi.org/{article.doi || '10.xxxx'}</div>
          </div>

          <div className="flex justify-center py-2">
            <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24 border-2 border-[#c9a84c] rounded-lg p-1 bg-[#070714]" />
          </div>
          <p className="text-[10px] text-gray-400">Scan QR Code untuk membaca artikel lengkap</p>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleDownloadCanvas}
            disabled={downloading}
            className="w-full bg-[#c9a84c] hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            {downloading ? (
              <span>Memproses Kartu HD...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Unduh Kartu Story (9:16 PNG)</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareFacebook}
            className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Bagikan ke Facebook</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-[#25d366] hover:bg-[#20bd5a] text-black font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span>💬</span>
            <span>Kirim ke WhatsApp</span>
          </button>

          <button
            onClick={handleCopyCaption}
            className="w-full bg-[#16162a] hover:bg-[#20203a] text-white border border-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{copied ? '✅ Caption & Link Tersalin!' : 'Salin Teks & Tagar'}</span>
          </button>
        </div>

        {/* Official Channels Footer */}
        <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span>Official:</span>
            <a
              href="https://www.facebook.com/profile.php?id=61593446475544"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Facebook Official</span>
              <span>↗</span>
            </a>
            <span>•</span>
            <a
              href="https://www.tiktok.com/@apasificacademician"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c9a84c] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>TikTok (@apasificacademician)</span>
              <span>↗</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
