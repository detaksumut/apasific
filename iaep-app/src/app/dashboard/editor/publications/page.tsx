"use client";

import React, { useState, useEffect } from 'react';
import Link from 'react-link';
import { createClient } from '@/utils/supabase/client';
import { Printer, Plus, FileText, CheckCircle } from 'lucide-react';

export default function PublicationsPage() {
  const [supabase] = useState(() => createClient());
  const [journals, setJournals] = useState<any[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [publishedArticles, setPublishedArticles] = useState<any[]>([]);
  const [acceptedArticles, setAcceptedArticles] = useState<any[]>([]);

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

  useEffect(() => {
    if (selectedJournal) {
      // Mock fetching logic for accepted and published articles based on selected journal
      async function fetchArticles() {
        const { data: accepted } = await supabase
          .from('submissions')
          .select('*')
          .eq('journal_id', selectedJournal.id)
          .in('status', ['Accepted', 'accepted']);
        
        if (accepted) setAcceptedArticles(accepted);
      }
      fetchArticles();
    }
  }, [selectedJournal, supabase]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Generate Cover & Publikasi Jurnal</h1>
          <p className="text-zinc-400 mt-2 text-sm">Kelola penerbitan naskah, susun edisi berkala, dan cetak sampul depan (cover) jurnal.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah Edisi/Issue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pilih Jurnal</label>
          <select 
            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
            onChange={(e) => {
              const j = journals.find(x => x.id === e.target.value);
              setSelectedJournal(j || null);
            }}
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
            <div className="relative h-full flex flex-col p-8 z-10">
              <div className="flex justify-center mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-apasific.png" alt="Logo" className="h-16 object-contain" />
              </div>
              
              <h2 className="text-2xl font-bold text-teal-950 text-center uppercase tracking-widest font-serif leading-tight">
                {selectedJournal?.name || "JURNAL AGAMA DAN PERADABAN ISLAM"}
              </h2>
              
              <div className="mt-6 flex justify-center">
                <div className="bg-teal-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md">
                  Vol. 1, No. 1, 2026
                </div>
              </div>

              <div className="mt-8">
                <p className="text-teal-950/50 text-[10px] font-bold tracking-widest uppercase mb-2">Daftar Isi / TOC:</p>
                <div className="space-y-2">
                  <p className="text-teal-950/70 text-xs italic">Belum ada artikel terbit.</p>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-teal-200/50 flex justify-between text-[10px] font-bold text-teal-950/50">
                <span>P-ISSN: -</span>
                <span>E-ISSN: -</span>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700 shadow-xl">
            <Printer className="w-4 h-4" /> Cetak / Unduh Cover (A4)
          </button>
        </div>

        {/* Right Column: Articles Lists */}
        <div className="flex-1 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 bg-zinc-800/20">
              <h3 className="text-zinc-300 text-sm font-bold uppercase tracking-widest">
                Artikel Yang Terbit di Edisi Ini ({publishedArticles.length})
              </h3>
            </div>
            {publishedArticles.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-500 text-sm italic">Belum ada naskah artikel yang diterbitkan pada edisi ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {publishedArticles.map(a => (
                  <div key={a.id} className="p-4">{a.title}</div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800/80 bg-zinc-800/20">
              <h3 className="text-zinc-300 text-sm font-bold uppercase tracking-widest">
                Naskah Siap Terbit (Accepted) ({acceptedArticles.length})
              </h3>
            </div>
            {acceptedArticles.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-500 text-sm italic">Tidak ada naskah berstatus "Accepted" yang menunggu diterbitkan.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {acceptedArticles.map((article: any) => (
                  <div key={article.id} className="p-4 hover:bg-zinc-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm line-clamp-2">{article.title}</h4>
                      <p className="text-zinc-500 text-xs mt-1">Author ID: {article.author_id}</p>
                    </div>
                    <button className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#c9a84c] hover:bg-[#e8c97a] rounded-lg transition-colors">
                      <Plus className="w-3 h-3" /> Masukkan ke Edisi
                    </button>
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
