"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'react-qr-code';

export default function PrintCertificate() {
  const { id } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        const response = await fetch(`/api/author/certificate-detail?id=${id}`);
        const data = await response.json();
        if (data.certificate) {
          setCert(data.certificate);
        } else {
          setError(data.error || 'Failed to load certificate');
        }
      } catch (e: any) {
        setError(e.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (cert && !loading) {
      // Auto trigger print dialog after rendering completes
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cert, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-sm">Menyiapkan Dokumen Sertifikat...</p>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400 p-6">
        <div className="text-center max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <p className="font-bold text-lg mb-2">Error</p>
          <p className="text-sm text-zinc-500 mb-6">{error || 'Certificate not found'}</p>
          <button onClick={() => window.close()} className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 font-bold transition-all">
            Tutup Halaman
          </button>
        </div>
      </div>
    );
  }

  // Determine Editor in Chief & Signatures based on Journal
  const journalName = cert.journal || '';
  let eic = {
    name: 'Dr. Bahkrul Khair Alam, M.Si',
    title: 'Pemimpin Redaksi – APASIFIC',
    photo: '/images/org/member-15-1783582450456.jpeg'
  };

  let qrData = `https://www.apasific.org/verify/certificate/${cert.id}`;

  if (journalName.includes('AJITE') || journalName.includes('IT & Engineering')) {
    qrData = 'https://www.apasific.org/journals/ajite';
    eic = {
      name: 'DR. Eko Cahyo Mayndarto, SE, M.Si, Ak',
      title: 'Editor in Chief – AJITE',
      photo: '/images/org/member-34-1783583131708.jpeg'
    };
  } else if (journalName.includes('AJBA') || journalName.includes('Management and Business Administration')) {
    qrData = 'https://www.apasific.org/journals/ajba';
    eic = {
      name: 'Dr. Arfan Ikhsan Lubis, SE, M.Si, CATr',
      title: 'Editor in Chief – AJBA',
      photo: '/images/org/member-5-1783581594909.jpeg'
    };
  }

  // Left signature for ASIACERT President
  const director = {
    name: 'Dr. Arfan Ikhsan Lubis, SE, M.Si, CATr',
    title: 'President ASIACERT',
    photo: '/images/org/member-5-1783581594909.jpeg'
  };

  return (
    <div className="bg-[#FAF9F6] text-zinc-900 min-h-screen flex items-center justify-center p-4 print:p-0 font-serif" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* Print Control Overlay (Hidden in print) */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-all text-sm flex items-center gap-1">
          Cetak Sertifikat
        </button>
        <button onClick={() => window.close()} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-2 px-4 rounded shadow-lg transition-all text-sm">
          Tutup
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
      `}} />

      {/* Landscape Certificate Border Wrapper */}
      <div id="print-certificate-container" className="w-[297mm] h-[210mm] bg-[#FAF9F6] border-[16px] border-double border-[#b59441] p-10 flex flex-col justify-between relative shadow-2xl overflow-hidden print:shadow-none print:border-[16px]">
        
        {/* Elegant Corner Ornaments (CSS styling) */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-[#b59441]"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-[#b59441]"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-[#b59441]"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-[#b59441]"></div>

        {/* Certificate Watermark Background */}
        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-apasific.png" alt="watermark" className="w-[120mm] h-auto object-contain" />
        </div>

        {/* Top Header Section */}
        <div className="text-center relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center gap-2 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-apasific.png" alt="ASIA Logo" className="h-36 w-auto object-contain print:h-32 mb-2" />
            <div className="text-center font-sans">
              <h2 className="text-5xl font-extrabold tracking-widest text-[#b59441] leading-none" style={{ fontFamily: 'Arial, sans-serif' }}>ASIA</h2>
              <p className="text-2xl font-bold tracking-wider text-[#2e5d9e] uppercase mt-2 print:text-[24px]" style={{ fontFamily: 'Arial, sans-serif' }}>Association of Asia Pacific Academician</p>
            </div>
          </div>
          <div className="w-full max-w-[200mm] h-[2px] bg-gradient-to-r from-transparent via-[#b59441] to-transparent mt-2"></div>
        </div>

        {/* Middle Body Section */}
        <div className="text-center relative z-10 my-auto flex flex-col items-center px-12">
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-[#b59441] uppercase mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Certificate of Publication
          </h1>
          
          <p className="text-sm font-sans tracking-wider uppercase text-zinc-500 mb-6">
            This is proudly presented to
          </p>
          
          <h3 className="text-6xl md:text-7xl text-zinc-800 border-b-2 border-[#b59441]/40 pb-2 px-12 inline-block mb-6" style={{ fontFamily: "'Great Vibes', cursive", fontWeight: 400 }}>
            {cert.author}
          </h3>
          
          <p className="text-sm leading-relaxed max-w-[240mm] text-zinc-600 font-sans px-4">
            in recognition and appreciation for the successful publication of the outstanding research paper entitled:
          </p>
          
          <p className="text-lg font-bold text-zinc-800 italic mt-4 max-w-[240mm] leading-snug">
            &ldquo;{cert.title}&rdquo;
          </p>

          <p className="text-sm text-zinc-500 font-sans tracking-wide mt-4">
            published in <strong className="text-zinc-700">{cert.journal}</strong> &mdash; <strong>{cert.edition}</strong> on {cert.date}.
          </p>

        </div>

        {/* Bottom Group: Absolute Layout for Independent Positioning */}
        <div className="mt-auto w-full relative min-h-[220px]">
          
          {/* Left Signature (Anchored to left margin) */}
          <div className="absolute left-12 bottom-6 flex flex-col items-center text-center z-10">
            <div className="mb-2 opacity-80 mix-blend-multiply">
              <QRCode value={`Digitally Signed by:\n${director.name}\n${director.title}`} size={72} level="L" fgColor="#3f3f46" />
            </div>
            <div className="w-[260px] h-[1.5px] bg-zinc-400 mb-2 mt-2"></div>
            <p className="font-bold text-[18px] text-zinc-800 leading-tight whitespace-nowrap">{director.name}</p>
            <p className="text-[14px] text-zinc-500 leading-none mt-1.5 whitespace-nowrap">{director.title}</p>
          </div>

          {/* Center Group (QR + Seal, anchored to center) */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center z-10">
            {/* Center: Verification & QR */}
            <div className="flex flex-col items-center text-center mb-2">
              <div className="bg-white p-1.5 border border-zinc-300 rounded shadow-sm mb-1">
                <QRCode value={qrData} size={64} level="M" />
              </div>
              <div className="text-[9px] text-zinc-500 leading-normal font-sans">
                <p className="font-bold text-[#b59441] mb-0.5 uppercase tracking-wider">Verification</p>
                <p className="font-mono text-[8px]">ID: {cert.id}</p>
              </div>
            </div>
            
            {/* Center: Gold Seal Emblem */}
            <div className="relative w-24 h-24 flex items-center justify-center pointer-events-none select-none">
              {/* Gold Ribbon backing */}
              <div className="absolute bottom-[-10px] left-[25px] w-5 h-16 bg-[#a18131] rotate-[-15deg] origin-top"></div>
              <div className="absolute bottom-[-10px] right-[25px] w-5 h-16 bg-[#b59441] rotate-[15deg] origin-top"></div>
              {/* Circular Gold Medal */}
              <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] border-4 border-[#b59441] shadow-lg flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-dashed border-[#b59441]/50 flex flex-col items-center justify-center text-center">
                  <span className="text-[7px] font-bold text-[#8a681d] uppercase tracking-tighter leading-none">ASIA</span>
                  <span className="text-[6px] text-[#8a681d]/80 font-sans uppercase font-bold tracking-tighter mt-1">OFFICIAL</span>
                  <span className="text-[6px] text-[#8a681d]/80 font-sans uppercase font-bold tracking-tighter">SEAL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Signature (Anchored to right margin) */}
          <div className="absolute right-12 bottom-6 flex flex-col items-center text-center z-10">
            <div className="mb-2 opacity-80 mix-blend-multiply">
              <QRCode value={`Digitally Signed by:\n${eic.name}\n${eic.title}`} size={72} level="L" fgColor="#3f3f46" />
            </div>
            <div className="w-[260px] h-[1.5px] bg-zinc-400 mb-2 mt-2"></div>
            <p className="font-bold text-[18px] text-zinc-800 leading-tight whitespace-nowrap">{eic.name}</p>
            <p className="text-[14px] text-zinc-500 leading-none mt-1.5 whitespace-nowrap">{eic.title}</p>
          </div>

        </div>

      </div>

      {/* Media print styles to format print output correctly to landscape A4 */}
      <style>{`
        @media print {
          /* Hide print page headers, footers and navigation */
          aside,
          header,
          nav,
          .navbar,
          #navbar,
          .topbar-enterprise,
          .sidebar-enterprise,
          button,
          .fixed {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Set A4 Landscape Page */
          @page {
            size: A4 landscape;
            margin: 0;
          }

          /* Force body background and settings */
          body, html {
            height: auto !important;
            background: #FAF9F6 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Reset absolute containers */
          div[style*="display: flex"], 
          div[style*="flex: 1"],
          main {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Force exactly A4 print size */
          #print-certificate-container {
            width: 297mm !important;
            height: 210mm !important;
            border-[16px] border-double border-[#b59441] !important;
            box-shadow: none !important;
            margin: 0 !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

    </div>
  );
}
