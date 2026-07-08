"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const rjrakpDbUrl = 'https://abmjieqcumlskannfkdl.supabase.co';
const rjrakpDbKey = 'sb_publishable_Zvx-3Ezgb1jnAZsDGXyUOg_96PqXzRN';
const supabase = createClient(rjrakpDbUrl, rjrakpDbKey);

export default function ArticlePaywall() {
  const params = useParams();
  const id = params?.id as string;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBankPopup, setShowBankPopup] = useState(false);
  const [isWaitingAdmin, setIsWaitingAdmin] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  
  const [article, setArticle] = useState({
    title: "The Impact of Artificial Intelligence on Regional Economic Policies in ASEAN",
    author: "Dr. Budi Santoso, M.Sc",
    journal: "Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP)",
    date: "July 2026",
    abstract: "This paper examines the transformative effects of Artificial Intelligence (AI) integration within the economic sectors of ASEAN member states...",
    keywords: ["Artificial Intelligence", "ASEAN Economy", "Economic Policy"],
    price: 50000,
    orcid: "",
    doi: "",
    views: 0,
    downloads: 0,
    pdf_url: ""
  });

  useEffect(() => {
    if (!id || id === '1045') {
      setLoading(false);
      return;
    }

    async function fetchRealArticle() {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select(`
            id,
            title,
            abstract,
            keywords,
            view_count,
            download_count,
            article_authors ( full_name, orcid ),
            journals ( name ),
            publications ( publication_date, pdf_url, doi )
          `)
          .eq('id', id)
          .single();

        if (data && !error) {
          const authors = data.article_authors?.map((a: any) => a.full_name).join(", ");
          const orcids = data.article_authors?.map((a: any) => a.orcid).filter(Boolean);
          const firstOrcid = orcids && orcids.length > 0 ? orcids[0] : "";
          
          const pubDate = data.publications?.[0]?.publication_date;
          const pdfUrl = data.publications?.[0]?.pdf_url;
          const doi = data.publications?.[0]?.doi;
          
          setArticle({
            title: data.title || "",
            author: authors || "Unknown Author",
            journal: (Array.isArray(data.journals) ? data.journals[0]?.name : (data.journals as any)?.name) || "Rumah Jurnal Riset, Analisis dan Keadilan Publik (RJRAKP)",
            date: pubDate ? new Date(pubDate).toLocaleDateString('id-ID') : "Baru saja dipublikasi",
            abstract: data.abstract || "Abstrak tidak tersedia.",
            keywords: data.keywords ? data.keywords.split(',') : [],
            price: 50000,
            pdf_url: pdfUrl,
            orcid: firstOrcid,
            doi: doi || "",
            views: data.view_count || 0,
            downloads: data.download_count || 0
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRealArticle();
  }, [id]);

  useEffect(() => {
    // Listen for admin approval from another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'apasific_payment_approved') {
        setIsWaitingAdmin(false);
        setHasPaid(true);
        // Automatically download or alert
        alert("Persetujuan diterima dari Admin! Mengunduh PDF...");
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handlePayment = () => {
    setShowBankPopup(true);
  };

  const handleConfirmTransfer = () => {
    setShowBankPopup(false);
    setIsWaitingAdmin(true);
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center text-[#c9a84c] bg-[#05050a] font-bold">Memuat detail artikel...</div>;
  }

  return (
    <div className="min-h-screen text-[#e8e8f0] font-sans pt-24 pb-20 bg-[#05050a]">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Back Navigation */}
        <button onClick={() => window.history.back()} className="inline-flex items-center text-[#c9a84c] hover:text-[#e8c97a] mb-8 font-bold transition-colors bg-transparent border-none cursor-pointer">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>

        {/* Article Header */}
        <div className="mb-10">
          <div className="inline-block px-3 py-1 bg-[#1a1a2e] text-[#c9a84c] rounded-full text-xs font-bold mb-4 border border-[#c9a84c]/30">
            {article.journal} • {article.date}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-['Cinzel'] mb-6 leading-tight text-white">
            {article.title}
          </h1>
          <div className="flex flex-col text-lg text-gray-400 mt-2 gap-2">
            <span className="font-bold text-gray-200 text-xl">{article.author}</span>
            <span className="text-sm flex items-center gap-2 text-gray-400">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Rumah Jurnal Riset Analisis dan Keadilan Publik, Indonesia
            </span>
            {article.orcid && (
              <a href={`https://orcid.org/${article.orcid}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#A6CE39] hover:underline mt-1 w-fit">
                <div className="bg-[#A6CE39] rounded-full p-0.5">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 01-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.44h2.297c3.272 0 4.022-2.484 4.022-3.72 0-2.016-1.284-3.72-4.097-3.72h-2.222z"/>
                  </svg>
                </div>
                ORCID: {article.orcid}
              </a>
            )}
            
            {article.doi && (
              <div className="mt-4 pt-4 border-t border-gray-800 text-sm">
                <span className="font-bold text-gray-300">DOI: </span>
                <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] hover:underline">
                  https://doi.org/{article.doi}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Abstract */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-[#0d0d1a] rounded-2xl p-8 border border-gray-800 shadow-xl">
              <h2 className="text-2xl font-bold text-[#c9a84c] mb-4">Abstract</h2>
              <p className="text-gray-300 leading-relaxed text-lg text-justify">
                {article.abstract}
              </p>
              
              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#1a1a2e] text-gray-300 text-sm rounded border border-gray-700">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
            
            {/* Blurred Content Teaser */}
            <section className="relative rounded-2xl p-8 border border-gray-800 overflow-hidden bg-[#0d0d1a]">
              <div className="blur-sm opacity-50 select-none">
                <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
                <p className="mb-4">The rapid advancement of artificial intelligence technologies has fundamentally altered the landscape of global economics. In the context of the Association of Southeast Asian Nations (ASEAN)...</p>
                <p>Furthermore, early adopters of AI-driven analytics have reported significant gains in operational efficiency. This paper seeks to quantify these gains across multiple sectors...</p>
              </div>
              
              {/* Waiting for Admin Overlay */}
              {isWaitingAdmin && !hasPaid && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05050a]/90 backdrop-blur-sm z-40">
                  <div className="bg-[#12121f] p-8 rounded-2xl border border-[#c9a84c]/50 text-center shadow-2xl max-w-md mx-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent animate-pulse"></div>
                    <div className="inline-block p-4 rounded-full bg-[#1a1a2e] mb-6">
                      <svg className="w-10 h-10 text-[#c9a84c] animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Menunggu Verifikasi Admin</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Kami sedang memverifikasi bukti transfer Anda. Mohon jangan tutup halaman ini. Akses akan terbuka otomatis sesaat lagi.
                    </p>
                  </div>
                </div>
              )}

              {/* Paywall Overlay */}
              {!hasPaid && !isWaitingAdmin && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#05050a] via-[#05050a]/80 to-transparent">
                  <div className="bg-[#12121f] p-8 rounded-2xl border border-[#c9a84c]/30 text-center shadow-2xl max-w-md mx-auto mt-20">
                    <svg className="w-12 h-12 text-[#c9a84c] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="text-xl font-bold text-white mb-2">Read Full Article</h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Purchase this article to unlock the full text PDF. The revenue directly supports the author and APASIFIC.
                    </p>
                    <button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-[#c9a84c] text-black font-bold py-3 rounded-lg hover:bg-[#e8c97a] transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                    >
                      {isProcessing ? (
                        "Processing Secure Payment..."
                      ) : (
                        `Purchase Article (Rp ${article.price.toLocaleString('id-ID')})`
                      )}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Secure APASIFIC Gateway
                    </div>
                  </div>
                </div>
              )}
              
              {hasPaid && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05050a]/90 backdrop-blur-sm">
                  <div className="bg-green-900/20 p-8 rounded-2xl border border-green-500/30 text-center shadow-2xl max-w-md mx-auto">
                    <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-white mb-2">Access Granted</h3>
                    <p className="text-green-200 text-sm mb-6">
                      Thank you for your purchase. The author has been credited.
                    </p>
                    <button 
                      onClick={() => {
                        if ((article as any).pdf_url) {
                          window.open((article as any).pdf_url, '_blank');
                        } else {
                          alert('Dokumen PDF tidak ditemukan untuk artikel ini.');
                        }
                      }}
                      className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Full PDF
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Metrics & Citation */}
          <div className="space-y-6">
            <div className="bg-[#0d0d1a] rounded-xl p-6 border border-gray-800">
              <h3 className="text-[#c9a84c] font-bold mb-4 uppercase text-sm tracking-widest">Metrik</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                  <span className="text-gray-400">Pemandangan</span>
                  <span className="font-bold text-white">{article.views.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                  <span className="text-gray-400">Unduhan</span>
                  <span className="font-bold text-white">{article.downloads.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Kutipan</span>
                  <span className="font-bold text-white">0</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a2e] rounded-xl p-6 border border-[#c9a84c]/20">
              <h3 className="text-white font-bold mb-2 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Author Royalty Program
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                APASIFIC directly rewards authors for their scholarly contributions. A percentage of every purchase goes straight to the author's designated bank account.
              </p>
              <div className="text-xs font-bold text-[#c9a84c] uppercase tracking-wide">Support Academic Excellence</div>
            </div>
          </div>
        </div>
        
        {/* Bank Transfer Modal Popup */}
        {showBankPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#12121f] rounded-2xl border border-[#c9a84c]/40 shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in duration-300">
              <div className="text-center mb-6">
                <svg className="w-12 h-12 text-[#c9a84c] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="text-2xl font-bold text-white mb-2">Instruksi Pembayaran</h3>
                <p className="text-gray-400 text-sm">
                  Silakan lakukan transfer sebesar <span className="font-bold text-[#c9a84c]">Rp {(article.price || 50000).toLocaleString('id-ID')}</span> ke rekening resmi kami di bawah ini:
                </p>
              </div>

              <div className="bg-[#0a0a0f] rounded-xl p-6 border border-gray-800 mb-6 space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Nama Pemilik Rekening</div>
                  <div className="text-lg font-bold text-white">Association of Asia Pacific Academician</div>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Bank Tujuan</div>
                  <div className="text-lg font-bold text-white">Bank Negara Indonesia (BNI)</div>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Nomor Rekening (A/C No)</div>
                  <div className="text-2xl font-black text-[#c9a84c] tracking-wider">7006002218</div>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Swift Code</div>
                  <div className="text-lg font-bold text-white tracking-widest">BNINIDJA</div>
                </div>
              </div>

              {/* Upload Bukti Transfer */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-200 mb-3">Unggah Bukti Transfer (Wajib)</label>
                <div className="border-2 border-dashed border-[#c9a84c]/60 bg-[#1a1a2e] rounded-xl p-8 text-center hover:bg-[#c9a84c]/10 hover:border-[#c9a84c] transition-all duration-300 relative group cursor-pointer shadow-inner">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {proofFile ? (
                    <div className="text-[#c9a84c] font-bold text-base flex flex-col items-center justify-center gap-3">
                      <div className="p-3 bg-green-500/20 rounded-full">
                        <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      {proofFile.name}
                      <span className="text-xs text-gray-400 font-normal">Klik untuk mengganti file</span>
                    </div>
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center group-hover:text-white transition-colors">
                      <div className="p-4 bg-[#c9a84c]/10 rounded-full mb-3 group-hover:bg-[#c9a84c]/20 transition-colors border border-[#c9a84c]/30">
                        <svg className="w-8 h-8 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <span className="font-bold text-base mb-1">Bukti Transfer!</span>
                      <span className="text-xs text-gray-400">Maksimal 5MB (JPG/PNG)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowBankPopup(false)}
                  className="flex-1 bg-transparent border border-gray-600 text-gray-400 font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmTransfer}
                  disabled={!proofFile}
                  className="flex-1 bg-[#c9a84c] text-black font-bold py-3 rounded-lg hover:bg-[#e8c97a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Saya Sudah Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
