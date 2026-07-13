"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Eye, 
  Download, 
  BookOpen, 
  Info, 
  DollarSign, 
  Plus,
  CheckCircle2
} from 'lucide-react';

export default function Submissions() {
  const [activeTab, setActiveTab] = useState<'aktif' | 'arsip'>('aktif');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('submissions')
            .select('*, journals(name)')
            .eq('author_id', user.id)
            .order('created_at', { ascending: false });
            
          if (!error && data) {
            setSubmissions(data);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubmissions();
  }, []);

  const activeSubmissions = submissions.filter(s => !['Published', 'Rejected'].includes(s.status));
  const archivedSubmissions = submissions.filter(s => ['Published', 'Rejected'].includes(s.status));
  
  const currentDisplayList = activeTab === 'aktif' ? activeSubmissions : archivedSubmissions;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif text-emerald-500 font-bold tracking-wide mb-3">Submisi</h1>
        <p className="text-zinc-400 text-lg">Kelola dan pantau proses evaluasi berkas naskah artikel Anda.</p>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Main Content */}
        <div className="flex-1 space-y-8">
          
          {/* Reward Banner */}
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 flex gap-5 items-start">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-1">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-emerald-400 font-bold text-lg mb-2">Karya Anda Sangat Berharga: Program Reward & Apresiasi Penulis</h3>
              <p className="text-zinc-300 leading-relaxed text-sm">
                Semua naskah jurnal yang diterbitkan di sistem <strong>APASIFIC</strong> didistribusikan secara terbuka (Open Access) untuk pembaca secara gratis demi menjaga integritas akademik. Sebagai bentuk apresiasi, APASIFIC akan memberikan <strong className="text-emerald-400">Reward khusus</strong> kepada Penulis yang artikelnya berhasil diindeks di lembaga indeksasi jurnal dunia bergengsi (seperti Scopus, dll.) atau mencapai rekor unduhan tertinggi (top record download). Pastikan data rekening Anda sudah diisi dengan benar pada menu <Link href="/dashboard/profile" className="text-emerald-500 font-bold hover:underline">Profil & Rekening</Link> agar kami dapat menyalurkan reward secara berkala.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-px">
            <button 
              onClick={() => setActiveTab('aktif')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'aktif' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              Antrean Aktif <span className="ml-2 bg-zinc-800 text-zinc-400 py-0.5 px-2 rounded-full text-xs">{activeSubmissions.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('arsip')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'arsip' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              Arsip <span className="ml-2 bg-emerald-500/20 text-emerald-500 py-0.5 px-2 rounded-full text-xs">{archivedSubmissions.length}</span>
            </button>
          </div>

          {/* Submissions List Box */}
          <div className="bg-black/40 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                {activeTab === 'aktif' ? 'Antrean Submisi Aktif' : 'Arsip Submisi Saya'}
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Cari naskah..." 
                  className="bg-black/50 border border-zinc-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 w-64"
                />
              </div>
            </div>
            
            <div className="divide-y divide-zinc-800/80">
              {isLoading ? (
                <div className="p-12 text-center text-zinc-500">Memuat naskah...</div>
              ) : currentDisplayList.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p>Tidak ada naskah di kategori ini.</p>
                </div>
              ) : (
                currentDisplayList.map((sub, idx) => (
                  <div key={idx} className="p-6 hover:bg-zinc-900/30 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">#{sub.id.split('-')[0]}</span>
                          <span className="text-xs font-bold text-emerald-600/70">{sub.journals?.name || 'Jurnal'}</span>
                          <span className="text-xs text-zinc-500">Dikirim: {new Date(sub.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2 leading-snug">
                          {sub.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-4">
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {sub.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Link href={`/dashboard/submissions/${sub.id}`} className="px-4 py-2 border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Lacak Proses
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Widgets */}
        <div className="w-full lg:w-80 space-y-6">

          <div className="bg-black/40 border border-zinc-800 rounded-xl p-6">
            <h4 className="font-bold text-white flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Panduan Penulis
            </h4>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              Lihat petunjuk lengkap untuk penulis sebelum mempersiapkan dan mengirimkan naskah Anda agar sesuai dengan kriteria editorial.
            </p>
            <a href="#" className="text-sm text-emerald-500 font-bold hover:underline flex items-center gap-1">
              Lihat Panduan Penulis &rsaquo;
            </a>
          </div>

          <div className="bg-black/40 border border-zinc-800 rounded-xl p-6">
            <h4 className="font-bold text-white flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-emerald-500" /> Template Naskah
            </h4>
            <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
              Unduh template naskah resmi Microsoft Word yang digunakan oleh jurnal ini untuk memformat struktur penulisan artikel Anda.
            </p>
            <button className="w-full py-2.5 border border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-300 rounded-lg flex items-center justify-center gap-2 text-sm transition-all">
              <Download className="w-4 h-4" /> Unduh Template Naskah
            </button>
          </div>

          <div className="bg-black/40 border border-zinc-800 rounded-xl p-6">
            <h4 className="font-bold text-white flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-emerald-500" /> Kebijakan Jurnal
            </h4>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              Lihat kebijakan resmi jurnal terkait dengan etika publikasi ilmiah, proses penelaahan sejawat, kebijakan penarikan naskah, dan anti-plagiarisme.
            </p>
            <a href="#" className="text-sm text-emerald-500 font-bold hover:underline flex items-center gap-1">
              Lihat Kebijakan Etika &rsaquo;
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
