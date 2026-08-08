"use client";

import React, { useEffect, useRef, useState } from 'react';

interface SecurePdfViewerProps {
  url: string;
  onDownload?: () => void;
}

export default function SecurePdfViewer({ url, onDownload }: SecurePdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load PDF Document
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
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1); // Reset to page 1 on new URL
        
      } catch (err: any) {
        if (isMounted) {
          console.error("PDF Loading Error:", err);
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

  // Render Current Page
  useEffect(() => {
    if (!pdfDoc) return;
    
    let isMounted = true;
    let renderTask: any = null;

    const renderPage = async () => {
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(currentPage);
        
        const container = containerRef.current;
        if (!container || !isMounted) return;
        
        // Calculate scale to fit container height/width to show full page (A4)
        const viewportOriginal = page.getViewport({ scale: 1 });
        const containerWidth = container.clientWidth || 800;
        const containerHeight = container.parentElement?.clientHeight || 900;
        
        // Scale to fit width so the page is fully readable, and let the container handle vertical scrolling
        const scale = containerWidth / viewportOriginal.width;
        
        const viewport = page.getViewport({ scale: scale * 2.0 }); // 2x resolution for sharpness
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = `${viewport.width / 2.0}px`; // half of 2x scale
        canvas.style.height = `${viewport.height / 2.0}px`;
        canvas.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        canvas.style.borderRadius = '4px';
        
        // Clear previous canvas
        container.innerHTML = ''; 
        container.appendChild(canvas);
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        renderTask = page.render(renderContext);
        await renderTask.promise;
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        // Ignore rendering cancelled exceptions
        if (err.name === 'RenderingCancelledException') return;
        
        if (isMounted) {
          console.error("PDF Rendering Error:", err);
          setError('Gagal merender halaman.');
          setLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      onDownload?.();
      
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

      const { PDFDocument, rgb } = (window as any).PDFLib;
      
      // Fetch the original PDF
      const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
      
      // Load the PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Fetch and embed the logo
      const logoUrl = window.location.origin + '/logobaru.png';
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

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Top Toolbar */}
      <div className="bg-[#12121f] border-b border-[#c9a84c]/30 px-4 py-3 flex flex-col sm:flex-row justify-between items-center shrink-0 z-20 gap-3">
        <div className="text-white font-semibold text-xs sm:text-sm text-center sm:text-left hidden sm:block">
          Mode Baca Cerdas
        </div>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex items-center gap-4 bg-black/50 px-4 py-1.5 rounded-full border border-gray-700/50 shadow-inner">
            <button 
              onClick={goToPrevPage} 
              disabled={currentPage === 1 || loading}
              className="text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-gray-200 text-xs sm:text-sm font-semibold min-w-[70px] text-center tracking-wide">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages || loading}
              className="text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <button 
          onClick={handleDownload}
          disabled={isDownloading || !pdfDoc}
          className="bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold py-1.5 px-4 rounded shadow transition-all flex items-center gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Proses...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </>
          )}
        </button>
      </div>

      {/* PDF Viewport */}
      <div 
        className="w-full flex-grow overflow-y-auto bg-[#e5e7eb] p-4 relative flex justify-center items-start" 
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
          <img src="/logobaru.png" alt="Watermark" className="w-[200px] md:w-[400px] drop-shadow-lg" />
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#e5e7eb] z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c9a84c] mb-4"></div>
            <p className="text-gray-600 text-sm font-semibold tracking-wide">Memuat Halaman {currentPage}...</p>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="flex flex-col items-center justify-center h-full text-red-600 bg-red-50 p-6 rounded-lg border border-red-200 relative z-20">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold text-center">{error}</p>
            <p className="text-sm mt-2 text-red-500 text-center">File mungkin rusak atau tidak dapat diakses.</p>
          </div>
        )}
        
        {/* Canvas Container */}
        <div 
          ref={containerRef} 
          className={`w-full max-w-4xl mx-auto flex flex-col items-center pointer-events-none relative z-0 transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        >
          {/* Rendered canvas will be injected here */}
        </div>
      </div>
    </div>
  );
}
