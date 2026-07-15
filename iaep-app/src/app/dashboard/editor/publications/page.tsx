"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Printer, Plus, FileText, CheckCircle, Award, BookOpen, Send } from 'lucide-react';

export default function PublicationsPage() {
  const [supabase] = useState(() => createClient());
  const [journals, setJournals] = useState<any[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [publishedArticles, setPublishedArticles] = useState<any[]>([]);
  const [acceptedArticles, setAcceptedArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchJournals() {
      const { data } = await supabase.from('journals').select('*');
      if (data) {
        setJournals(data);
        if (data.length > 0) setSelectedJournal(data[0]);
      }
    }
    fetchJournals();
  }, [supabase]);

  const loadData = async () => {
    if (!selectedJournal) return;
    setIsLoading(true);
    try {
      const { getPublicationsData } = await import('@/app/actions/editor');
      const res = await getPublicationsData(selectedJournal.id);
      if (res.success) {
        setAcceptedArticles(res.acceptedArticles || []);
        setPublishedArticles(res.publishedArticles || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedJournal]);

  const handlePublish = async (submissionId: string) => {
    if (!selectedJournal) return;
    const confirmPublish = confirm("Apakah Anda yakin ingin menerbitkan naskah ini? Proses ini akan mengubah status naskah menjadi Published dan menerbitkan Sertifikat Publikasi secara resmi.");
    if (!confirmPublish) return;

    try {
      const { publishArticle } = await import('@/app/actions/editor');
      const res = await publishArticle(submissionId, selectedJournal.id);
      if (res.success) {
        alert("Berhasil menerbitkan artikel dan menghasilkan Sertifikat Publikasi!");
        loadData();
      } else {
        alert("Gagal menerbitkan artikel: " + res.error);
      }
    } catch (e: any) {
      alert("Terjadi kesalahan: " + e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Generate Cover & Publikasi Jurnal</h1>
          <p className="text-zinc-400 mt-2 text-sm">Kelola penerbitan naskah yang siap terbit, susun edisi berkala, dan terbitkan sertifikat untuk submitter.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Edisi / Volume baru
        </button>
      </div>

      {/* Selector Jurnal & Edisi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pilih Jurnal</label>
          <select 
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
            onChange={(e) => {
              const j = journals.find(x => x.id === e.target.value);
              setSelectedJournal(j || null);
            }}
            value={selectedJournal?.id || ""}
          >
            {journals.map(j => (
              <option key={j.id} value={j.id}>{j.name}</option>
            ))}
          </select>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pilih Volume</label>
          <select className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all">
            <option>Vol. 1 (2026)</option>
          </select>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pilih Nomor/Issue</label>
          <select className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all">
            <option>No. 1 - Edisi Perdana Januari-Juni 2026</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Live Preview Cover */}
        <div className="w-full lg:w-[400px] shrink-0">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Live Preview Cover Jurnal</h3>
          
          <div className="bg-white rounded-xl aspect-[1/1.414] shadow-2xl relative overflow-hidden border-8 border-white group transition-transform hover:scale-[1.02] duration-300">
            {/* Pattern Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50/50" />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] stroke-teal-600 fill-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect x="30" y="30" width="40" height="40" transform="rotate(0 50 50)" strokeWidth="0.25" />
              <rect x="30" y="30" width="40" height="40" transform="rotate(45 50 50)" strokeWidth="0.25" />
              <circle cx="50" cy="50" r="28" strokeWidth="0.25" />
            </svg>
            
            {/* Cover Content */}
            <div className="relative h-full flex flex-col p-8 z-10 text-teal-950">
              <div className="flex justify-center mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-apasific.png" alt="Logo" className="h-16 object-contain" onError={(e)=>{(e.target as any).src="https://apasific.org/logo-apasific.png"}} />
              </div>
              
              <h2 className="text-xl font-bold text-teal-950 text-center uppercase tracking-widest font-serif leading-tight">
                {selectedJournal?.name || "JURNAL AGAMA DAN PERADABAN ISLAM"}
              </h2>
              
              <div className="mt-6 flex justify-center">
                <div className="bg-teal-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-md">
                  Vol. 1, No. 1, 2026
                </div>
              </div>

              {/* Dynamic Table of Contents */}
              <div className="mt-8 flex-grow">
                <p className="text-teal-950/50 text-[9px] font-bold tracking-widest uppercase mb-2 border-b border-teal-200 pb-1">Daftar Isi / TOC:</p>
                <div className="space-y-3">
                  {publishedArticles.length === 0 ? (
                    <p className="text-teal-950/70 text-xs italic">Belum ada artikel terbit.</p>
                  ) : (
                    publishedArticles.slice(0, 4).map((a, idx) => (
                      <div key={a.id} className="text-[10px] leading-snug">
                        <p className="font-semibold text-teal-950 line-clamp-1">{idx+1}. {a.title}</p>
                        <p className="text-teal-950/65 italic font-medium ml-3">— {a.profiles?.full_name}</p>
                      </div>
                    ))
                  )}
                  {publishedArticles.length > 4 && (
                    <p className="text-teal-950/50 text-[9px] italic ml-3">dan {publishedArticles.length - 4} naskah lainnya...</p>
                  )}
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-teal-200/50 flex justify-between text-[10px] font-bold text-teal-950/50">
                <span>P-ISSN: -</span>
                <span>E-ISSN: -</span>
              </div>
            </div>
          </div>
          
          <button onClick={() => window.print()} className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700 shadow-xl">
            <Printer className="w-4 h-4" /> Cetak / Unduh Cover (A4)
          </button>
        </div>

        {/* Right Column: Articles Lists */}
        <div className="flex-1 space-y-6">
          
          {/* Naskah Siap Terbit */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 bg-zinc-800/20 flex justify-between items-center">
              <h3 className="text-zinc-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Naskah Siap Terbit (Pemeriksaan Final Selesai)
              </h3>
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs rounded-full font-bold">{acceptedArticles.length}</span>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center text-zinc-500 text-sm">Memuat naskah...</div>
            ) : acceptedArticles.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-500 text-sm italic">Tidak ada naskah yang menunggu untuk diterbitkan.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {acceptedArticles.map((article: any) => (
                  <div key={article.id} className="p-5 hover:bg-zinc-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <h4 className="text-white font-semibold text-sm leading-snug">{article.title}</h4>
                      <p className="text-zinc-400 text-xs font-medium">Penulis: {article.profiles?.full_name}</p>
                    </div>
                    <button 
                      onClick={() => handlePublish(article.id)}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-black bg-[#c9a84c] hover:bg-[#e8c97a] rounded-lg transition-colors shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" /> Terbitkan Artikel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Artikel Yang Terbit */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 bg-zinc-800/20 flex justify-between items-center">
              <h3 className="text-zinc-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Artikel Yang Terbit di Edisi Ini
              </h3>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-full font-bold">{publishedArticles.length}</span>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center text-zinc-500 text-sm">Memuat naskah...</div>
            ) : publishedArticles.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-500 text-sm italic">Belum ada naskah artikel yang diterbitkan pada edisi ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {publishedArticles.map((article: any) => (
                  <div key={article.id} className="p-5 hover:bg-zinc-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <h4 className="text-zinc-300 font-medium text-sm leading-snug">{article.title}</h4>
                      <p className="text-zinc-500 text-xs">Penulis: {article.profiles?.full_name}</p>
                    </div>
                    <Link 
                      href="/dashboard/certificates"
                      target="_blank"
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" /> Sertifikat Terbit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
