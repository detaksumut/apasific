"use client";
import React, { useState, useEffect } from 'react';
import { Award, Download, Printer } from 'lucide-react';

export default function Certificates() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { getCurrentUser } = await import('@/app/actions/auth');
        let user = await getCurrentUser();
        
        if (!user) {
            window.location.href = '/auth/login';
            return;
        }

        const { getUserCertificates } = await import('@/app/actions/editor');
        const res = await getUserCertificates(user.id);
        if (res.success && res.certificates) {
          setCertificates(res.certificates);
        }
      } catch (e) {
        console.error("Failed to load certificates", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, []);


  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Premium Banner Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-10 md:p-14 mb-12 shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Award className="w-64 h-64 text-emerald-500 transform rotate-12" />
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-6">
            <Award className="w-4 h-4" /> Sertifikasi Akademis
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white font-bold mb-4 leading-tight">
            Apresiasi Riset & Publikasi
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            Unduh dan kelola sertifikat penghargaan resmi atas kontribusi keilmuan Anda dalam memublikasikan naskah riset terbaik di ekosistem <strong className="text-emerald-400">APASIFIC</strong>.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
        <h3 className="text-zinc-500 font-bold uppercase tracking-wider text-sm">
          Daftar Sertifikat Terbit ({certificates.length})
        </h3>
      </div>

      {/* Grid of Certificates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-black/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-colors group flex flex-col h-full">
            
            {/* Certificate Thumbnail / Mockup */}
            <div className="bg-zinc-900 p-6 flex items-center justify-center border-b border-zinc-800">
              <div className="w-full aspect-[1.414] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-8 border-[#222] shadow-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                {/* Certificate inner styling */}
                <div className="absolute inset-2 border border-zinc-700/50 p-2">
                  <div className="w-full h-full border border-emerald-500/20 flex flex-col items-center justify-center text-center px-4">
                    <Award className="w-8 h-8 text-emerald-500/40 mb-3" />
                    <h5 className="text-emerald-500/80 font-serif text-xl font-bold tracking-widest uppercase mb-1">Sertifikat</h5>
                    <p className="text-zinc-500/60 text-[8px] uppercase tracking-widest mb-4">Publikasi Artikel Ilmiah</p>
                    <div className="w-16 h-px bg-emerald-500/30 mb-4"></div>
                    <p className="text-zinc-300 font-bold text-sm mb-2">Penulis Utama</p>
                    <p className="text-zinc-500 text-[8px] line-clamp-2 max-w-[80%] leading-tight italic">
                      "{cert.title}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold px-2 py-1 bg-zinc-800 text-zinc-300 rounded uppercase tracking-wider">
                  {cert.journal}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Terbit
                </span>
              </div>
              
              <h4 className="text-lg font-bold text-white mb-6 leading-snug line-clamp-2 flex-grow group-hover:text-emerald-400 transition-colors">
                {cert.title}
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Edisi Jurnal</p>
                  <p className="text-sm font-semibold text-zinc-300">{cert.edition}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Tanggal Terbit</p>
                  <p className="text-sm font-semibold text-zinc-300">{cert.date}</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between mt-auto">
                <div className="text-xs text-zinc-500 font-mono">
                  ID: {cert.id}
                </div>
                <button 
                  onClick={() => window.open(`/dashboard/certificates/print/${cert.id}`, '_blank')}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-emerald-600 hover:text-black text-zinc-300 font-bold py-2.5 px-5 rounded-lg transition-all text-sm group/btn"
                >
                  <Printer className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" /> Cetak / Unduh PDF
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
