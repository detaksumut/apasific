"use client";

import React, { useEffect, useRef, useState } from 'react';

interface SecurePdfViewerProps {
  url: string;
}

export default function SecurePdfViewer({ url }: SecurePdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagesRendered, setPagesRendered] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Dynamically load pdfjs from CDN
        if (!(window as any).pdfjsLib) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.async = true;
          document.body.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load PDF.js library'));
          });
        }

        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;
        setTotalPages(pdf.numPages);
        
        const container = containerRef.current;
        if (!container) return;
        
        container.innerHTML = ''; // Clear previous canvases

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (!isMounted) break;
          const page = await pdf.getPage(pageNum);
          
          // Calculate scale to fit width at high resolution
          const viewportOriginal = page.getViewport({ scale: 1 });
          const containerWidth = container.clientWidth || 800;
          const scale = containerWidth / viewportOriginal.width;
          const viewport = page.getViewport({ scale: scale * 2.0 }); // 2x resolution for sharpness
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.width = '100%';
          canvas.style.height = 'auto';
          canvas.style.marginBottom = '20px';
          canvas.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          canvas.style.borderRadius = '4px';
          
          container.appendChild(canvas);
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          
          await page.render(renderContext).promise;
          
          if (isMounted) {
            setPagesRendered(prev => prev + 1);
          }
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("PDF Rendering Error:", err);
          setError(err.message || 'Gagal memuat dokumen PDF.');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [url]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Load pdf-lib from CDN
      if (!(window as any).PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load pdf-lib library'));
        });
      }

      const { PDFDocument, rgb, degrees } = (window as any).PDFLib;
      
      // Fetch the original PDF
      const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
      
      // Load the PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Fetch and embed the logo
      const logoUrl = window.location.origin + '/logo-apasific.png';
      const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
      const logoImage = await pdfDoc.embedPng(logoBytes);
      
      const pages = pdfDoc.getPages();
      
      // Add Image Watermark to all pages
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Target width of the watermark
        const watermarkWidth = 400; 
        const watermarkHeight = (logoImage.height / logoImage.width) * watermarkWidth;
        
        // Draw the logo in the exact center
        page.drawImage(logoImage, {
          x: width / 2 - watermarkWidth / 2,
          y: height / 2 - watermarkHeight / 2,
          width: watermarkWidth,
          height: watermarkHeight,
          opacity: 0.35, // Increased opacity for better visibility
        });
        
        // Add a secondary smaller text watermark at the bottom to guarantee visibility
        page.drawText('Downloaded from APASIFIC', {
          x: width / 2 - 100,
          y: 30,
          size: 12,
          color: rgb(0, 0, 0),
          opacity: 0.5,
        });
      }
      
      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'Article_ASIA_Watermarked.pdf';
      link.click();
      
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Gagal mendownload PDF. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Top Toolbar */}
      <div className="bg-[#12121f] border-b border-[#c9a84c]/30 px-4 py-3 flex justify-between items-center shrink-0 z-20">
        <div className="text-white font-semibold text-sm">
          Mode Baca Cerdas (Anti-Copy)
        </div>

        <button 
          onClick={handleDownload}
          disabled={isDownloading || loading}
          className="bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold py-1.5 px-4 rounded shadow transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses Watermark...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* PDF Viewport */}
      <div 
        className="w-full flex-grow overflow-y-auto bg-[#e5e7eb] p-4 relative" 
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        onContextMenu={(e) => e.preventDefault()} // Disable right click
        onCopy={(e) => e.preventDefault()}       // Disable copy shortcut
        onKeyDown={(e) => {
          // Disable Ctrl+P, Ctrl+S
          if (e.ctrlKey && (e.key === 'p' || e.key === 's')) {
            e.preventDefault();
          }
        }}
        tabIndex={0}
      >
        {/* Visual Watermark Overlay on the Screen */}
        <div className="pointer-events-none fixed inset-0 z-10 flex justify-center items-center opacity-20 overflow-hidden">
          <img src="/logo-apasific.png" alt="Watermark" className="w-[300px] md:w-[400px] drop-shadow-lg" />
        </div>

        {/* Loading Indicator */}
        {loading && pagesRendered === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#e5e7eb] z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-700 font-semibold">Memuat Dokumen PDF yang Diamankan...</p>
          </div>
        )}

        {/* Progress Indicator */}
        {loading && totalPages > 0 && (
          <div className="sticky top-0 z-20 w-full flex justify-center mb-4">
            <div className="bg-black/70 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm">
              Memuat halaman {pagesRendered} dari {totalPages}...
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="flex flex-col items-center justify-center h-full text-red-600 bg-red-50 p-6 rounded-lg border border-red-200">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold">{error}</p>
            <p className="text-sm mt-2 text-red-500">File mungkin rusak atau tidak dapat diakses.</p>
          </div>
        )}
        
        {/* Canvas Container */}
        <div 
          ref={containerRef} 
          className="w-full max-w-4xl mx-auto flex flex-col items-center pointer-events-none relative z-0"
        >
          {/* Rendered pages will be injected here as <canvas> */}
        </div>
      </div>
    </div>
  );
}
