"use client";
import React, { useState } from 'react';
import { submitManuscript } from '@/app/actions/submission';
import { PlagiarismChecker } from '@/components/PlagiarismChecker';
import { FileText, Upload, Send, Languages, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface AuthorData {
  id: string;
  full_name: string;
  email: string;
  affiliation: string;
  country: string;
  orcid: string;
}

const JOURNALS = [
  {
    id: '1',
    name: 'Jurnal Agama dan Peradaban Islam',
    scopes: ['Studi Islam', 'Akidah dan Akhlak', 'Tafsir Al-Qur\'an', 'Hadis', 'Tasawuf', 'Peradaban Islam', 'Pemikiran Islam', 'Pendidikan Islam']
  },
  {
    id: '2',
    name: 'Jurnal Audit Kebijakan Publik',
    scopes: ['Audit Kebijakan Publik', 'Evaluasi Kebijakan', 'Tata Kelola Pemerintahan', 'Pengawasan Publik', 'Reformasi Birokrasi', 'Administrasi Publik', 'Akuntabilitas Publik']
  },
  {
    id: '3',
    name: 'Jurnal Ekonomi dan Bisnis',
    scopes: ['Manajemen Bisnis', 'Akuntansi', 'Ilmu Ekonomi', 'Keuangan', 'Ekonomi Syariah', 'Pemasaran', 'Ekonomi Internasional', 'Ekonomi Regional', 'Keuangan dan Perbankan']
  },
  {
    id: '4',
    name: 'Jurnal Hukum dan Keadilan',
    scopes: ['Hukum Perdata', 'Hukum Pidana', 'Hukum Tata Negara', 'Hukum Administrasi Negara', 'Hukum Bisnis', 'Hukum Internasional', 'Sistem Peradilan', 'Keadilan Sosial']
  },
  {
    id: '5',
    name: 'Jurnal Ilmu Pertanian dan Agribisnis',
    scopes: ['Agroteknologi dan Agronomi', 'Ekonomi Pertanian dan Agribisnis', 'Ketahanan dan Teknologi Pangan', 'Pertanian Presisi (Smart Agriculture)', 'Penyuluhan dan Pemberdayaan Petani', 'Teknologi Hasil Pertanian', 'Sistem Pertanian Terpadu', 'Pengelolaan Sumber Daya Alam', 'Kehutanan Sosial dan Agroforestri']
  },
  {
    id: '6',
    name: 'Jurnal Pendidikan dan Pembelajaran',
    scopes: ['Pendidikan Dasar', 'Pendidikan Menengah', 'Pendidikan Tinggi', 'Kurikulum', 'Teknologi Pendidikan', 'Manajemen Pendidikan', 'Evaluasi Pembelajaran', 'Inovasi Pembelajaran']
  },
  {
    id: '7',
    name: 'Jurnal Riset Multidisiplin dan Inovasi',
    scopes: ['Artificial Intelligence & Machine Learning', 'Green Technology & Energi Terbarukan', 'Digital Economy & E-Commerce', 'Kesehatan Masyarakat & Digital Health', 'Keamanan Siber (Cyber Security)', 'Internet of Things (IoT) & Smart Cities', 'Sustainable Development Goals (SDGs)', 'Mitigasi Perubahan Iklim']
  },
  {
    id: '8',
    name: 'Jurnal Teknik dan Teknologi',
    scopes: ['Teknik Sipil', 'Teknik Mesin', 'Teknik Elektro', 'Teknik Industri', 'Teknologi Informasi', 'Sistem Informasi', 'Kecerdasan Buatan', 'Rekayasa Perangkat Lunak']
  }
];

export default function AuthorSubmit() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const [formData, setFormData] = useState({
    journal_id: '1',
    publicationType: 'international',
    selectedScope: '',
    customScope: '',
    title: '',
    abstract: '',
    abstract_en: '',
    keywords: '',
    cover_letter: '',
    bibliography: '',
    funding_source: '',
    conflict_of_interest: false,
    ai_disclosure_type: 'none',
    ai_disclosure_statement: ''
  });

  const [authors, setAuthors] = useState<AuthorData[]>([
    { id: Math.random().toString(), full_name: '', email: '', affiliation: '', country: '', orcid: '' }
  ]);

  const [files, setFiles] = useState({
    titlePage: null as File | null,
    anonymous: null as File | null,
    supporting: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAuthorChange = (index: number, field: keyof AuthorData, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, { id: Math.random().toString(), full_name: '', email: '', affiliation: '', country: '', orcid: '' }]);
  };

  const removeAuthor = (index: number) => {
    if (authors.length > 1) {
      const newAuthors = [...authors];
      newAuthors.splice(index, 1);
      setAuthors(newAuthors);
    }
  };

  const moveAuthor = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newAuthors = [...authors];
      const temp = newAuthors[index];
      newAuthors[index] = newAuthors[index - 1];
      newAuthors[index - 1] = temp;
      setAuthors(newAuthors);
    } else if (direction === 'down' && index < authors.length - 1) {
      const newAuthors = [...authors];
      const temp = newAuthors[index];
      newAuthors[index] = newAuthors[index + 1];
      newAuthors[index + 1] = temp;
      setAuthors(newAuthors);
    }
  };

  const handleAutoTranslate = async () => {
    if (!formData.abstract || formData.abstract.trim().length < 10) {
      alert("Silakan isi Abstrak (Bahasa Indonesia) terlebih dahulu dengan lengkap.");
      return;
    }
    
    setIsTranslating(true);
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(formData.abstract)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      let translatedText = '';
      if (data && data[0]) {
        data[0].forEach((item: any) => {
          if (item[0]) translatedText += item[0];
        });
      }
      
      if (translatedText) {
        setFormData(prev => ({ ...prev, abstract_en: translatedText }));
      }
    } catch (error) {
      alert("Gagal menerjemahkan secara otomatis.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!files.titlePage || !files.anonymous) {
      setError("File Title Page dan Naskah Anonim wajib diunggah.");
      window.scrollTo(0, 0);
      return;
    }

    if (authors.some(a => !a.full_name || !a.email || !a.affiliation)) {
      setError("Semua penulis wajib memiliki Nama, Email, dan Afiliasi.");
      window.scrollTo(0, 0);
      return;
    }

    if (!formData.bibliography || formData.bibliography.trim().length < 50) {
      setError("Daftar Pustaka wajib diisi (minimal 50 karakter).");
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);

    const form = new FormData();
    const finalScope = formData.selectedScope === 'Lainnya' ? formData.customScope : formData.selectedScope;
    const finalTitle = formData.publicationType !== 'international' ? `[${formData.publicationType.toUpperCase()}] ${formData.title}` : formData.title;
    
    form.append('journalId', formData.journal_id);
    form.append('title', finalTitle);
    
    const metadataObj = {
      abstract: formData.abstract,
      abstract_en: formData.abstract_en,
      keywords: `Scope: ${finalScope}, ${formData.keywords}`,
      cover_letter: formData.cover_letter,
      bibliography: formData.bibliography,
      funding_source: formData.funding_source,
      conflict_of_interest: formData.conflict_of_interest,
      ai_disclosure_type: formData.ai_disclosure_type,
      ai_disclosure_statement: formData.ai_disclosure_type !== 'none' ? formData.ai_disclosure_statement : null,
      publication_type: formData.publicationType,
      authors: authors
    };
    
    form.append('abstract', JSON.stringify(metadataObj));
    
    form.append('file', files.titlePage);
    if (files.anonymous) form.append('anonymousFile', files.anonymous);
    if (files.supporting) form.append('supportingFile', files.supporting);

    try {
      const res = await submitManuscript(form);
      if (res.success) {
        setSuccess(true);
        window.scrollTo(0, 0);
      } else {
        setError(res.error || "Gagal mengirim naskah.");
        window.scrollTo(0, 0);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem.");
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center animate-in fade-in duration-700">
        <div className="bg-black/60 border border-green-500/30 p-12 rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.15)]">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Send className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-4xl font-serif text-white font-bold mb-6">Pengiriman Berhasil!</h2>
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed">Naskah Anda beserta data metadata penulis lengkap telah berhasil dikirimkan ke tim editorial APASIFIC.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold text-lg rounded-xl hover:from-amber-500 hover:to-yellow-400 transition-colors"
          >
            Submit Artikel Lainnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="mb-12">
        <h1 className="text-4xl font-serif text-amber-500 font-bold tracking-wide mb-3">Submit Artikel Baru</h1>
        <p className="text-zinc-400 text-lg">Lengkapi formulir metadata di bawah ini dengan seksama untuk memastikan kelancaran proses publikasi Anda.</p>
      </div>

      <div className="bg-black/60 border border-amber-500/20 rounded-2xl overflow-hidden shadow-xl mb-12">
        <div className="bg-amber-900/30 px-8 py-5 border-b border-amber-500/30 flex items-center gap-3">
          <FileText className="w-6 h-6 text-amber-500" />
          <div>
            <h3 className="font-bold text-amber-500 text-lg">Alat Cek Plagiarisme (Pra-Submit)</h3>
            <p className="text-sm text-zinc-400 mt-1">Gunakan alat ini untuk memastikan artikel Anda bebas plagiarisme sebelum disubmit secara resmi ke tim editorial.</p>
          </div>
        </div>
        <div className="p-4">
          <PlagiarismChecker />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-black/60 border border-amber-500/30 rounded-2xl shadow-2xl divide-y divide-zinc-800/80">
        
        {/* SECTION 1: METADATA */}
        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl border border-amber-500/40">1</div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Metadata Artikel</h2>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl text-base font-medium mb-10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="block text-base font-bold text-amber-500">Pilih Jurnal Tujuan <span className="text-red-500">*</span></label>
              <select 
                name="journal_id" value={formData.journal_id} 
                onChange={(e) => {
                  handleChange(e);
                  setFormData(prev => ({ ...prev, selectedScope: '', customScope: '' }));
                }} required
                className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
              >
                <option value="" disabled>-- Pilih Jurnal --</option>
                {JOURNALS.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="block text-base font-bold text-amber-500">Pilih Scope Jurnal <span className="text-red-500">*</span></label>
              <select 
                name="selectedScope" value={formData.selectedScope} onChange={handleChange} required
                className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
              >
                <option value="" disabled>-- Pilih Scope --</option>
                {JOURNALS.find(j => j.id === formData.journal_id)?.scopes.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Lainnya">Lainnya (Tulis Sendiri)</option>
              </select>
              {formData.selectedScope === 'Lainnya' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text" name="customScope" value={formData.customScope} onChange={handleChange} required
                    className="w-full bg-zinc-900/80 border border-amber-500/50 rounded-xl px-5 py-4 text-white text-base focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    placeholder="Ketikkan scope/bidang spesifik Anda..."
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-10">
            <label className="block text-base font-bold text-amber-500">Pilih Paket Publikasi <span className="text-red-500">*</span></label>
            <select 
              name="publicationType" value={formData.publicationType} onChange={handleChange} required
              className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
            >
              <option value="international">Publikasi Jurnal Internasional (Non SINTA)</option>
              <option value="jurnal_kuliah">Jurnal Perkuliahan (Non SINTA)</option>
              <option value="sinta_6">Publikasi Jurnal SINTA 6</option>
              <option value="sinta_5">Publikasi Jurnal SINTA 5</option>
              <option value="sinta_4">Publikasi Jurnal SINTA 4</option>
              <option value="sinta_3">Publikasi Jurnal SINTA 3</option>
              <option value="sinta_2">Publikasi Jurnal SINTA 2</option>
              <option value="sinta_1">Publikasi Jurnal SINTA 1</option>
            </select>
            <p className="text-sm text-zinc-500 mt-2 pl-1">* Biaya dan fasilitas masing-masing paket akan diinformasikan lebih lanjut oleh editor.</p>
          </div>

          <div className="space-y-3 mb-10">
            <label className="block text-base font-bold text-amber-500">Judul Artikel <span className="text-red-500">*</span></label>
            <input
              type="text" name="title" required value={formData.title} onChange={handleChange}
              className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-lg font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              placeholder="Ketik judul lengkap naskah Anda di sini..."
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="block text-base font-bold text-amber-500">Abstrak (Bahasa Indonesia) <span className="text-red-500">*</span></label>
              <textarea 
                name="abstract" required value={formData.abstract} onChange={handleChange} rows={8} 
                className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none" 
                placeholder="Tuliskan isi dari Abstrak naskah Anda berbahasa Indonesia..."
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-base font-bold text-amber-500">Abstract (English) <span className="text-red-500">*</span></label>
                <button 
                  type="button" onClick={handleAutoTranslate} disabled={isTranslating || !formData.abstract}
                  className="text-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 font-medium"
                >
                  <Languages className="w-4 h-4" /> {isTranslating ? 'Menerjemahkan...' : 'Auto Translate'}
                </button>
              </div>
              <textarea 
                name="abstract_en" required value={formData.abstract_en} onChange={handleChange} rows={8} 
                className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none" 
                placeholder="Write your translated English abstract here..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-base font-bold text-amber-500">Kata Kunci (Keywords) <span className="text-red-500">*</span></label>
            <input 
              type="text" name="keywords" required value={formData.keywords} onChange={handleChange} 
              className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" 
              placeholder="Contoh: kecerdasan buatan, ekonomi digital, kebijakan fiskal (pisahkan dengan koma)" 
            />
          </div>
        </div>

        {/* SECTION 2: AUTHORS */}
        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl border border-amber-500/40">2</div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Daftar Penulis</h2>
          </div>
          
          <div className="space-y-8">
            {authors.map((author, index) => (
              <div key={author.id} className="p-6 md:p-8 bg-zinc-900/50 border border-zinc-700/80 rounded-2xl relative group hover:border-amber-500/40 transition-colors">
                <div className="absolute right-6 top-6 flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => moveAuthor(index, 'up')} disabled={index === 0} className="p-2 text-zinc-400 bg-black/40 rounded hover:text-amber-500 hover:bg-black/60 disabled:opacity-30 transition-all"><ChevronUp className="w-5 h-5" /></button>
                  <button type="button" onClick={() => moveAuthor(index, 'down')} disabled={index === authors.length - 1} className="p-2 text-zinc-400 bg-black/40 rounded hover:text-amber-500 hover:bg-black/60 disabled:opacity-30 transition-all"><ChevronDown className="w-5 h-5" /></button>
                  <div className="w-px h-8 bg-zinc-700 mx-1"></div>
                  <button type="button" onClick={() => removeAuthor(index)} disabled={authors.length === 1} className="p-2 text-zinc-400 bg-black/40 rounded hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
                
                <h4 className="font-bold text-amber-500 text-lg mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  {index === 0 ? "Penulis Pertama (Koresponden)" : `Penulis Ke-${index + 1}`}
                </h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-300">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input type="text" required value={author.full_name} onChange={e => handleAuthorChange(index, 'full_name', e.target.value)} className="w-full bg-black/60 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="Gelar dan nama lengkap" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-300">Alamat Email <span className="text-red-500">*</span></label>
                    <input type="email" required value={author.email} onChange={e => handleAuthorChange(index, 'email', e.target.value)} className="w-full bg-black/60 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="email@institusi.edu" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-300">Afiliasi / Institusi <span className="text-red-500">*</span></label>
                    <input type="text" required value={author.affiliation} onChange={e => handleAuthorChange(index, 'affiliation', e.target.value)} className="w-full bg-black/60 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors" placeholder="Nama universitas atau lembaga" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-300">ID ORCID <span className="text-zinc-500 font-normal">(Opsional)</span></label>
                    <input type="text" value={author.orcid} onChange={e => handleAuthorChange(index, 'orcid', e.target.value)} placeholder="0000-0000-0000-0000" className="w-full bg-black/60 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors" />
                  </div>
                </div>
              </div>
            ))}
            
            <button type="button" onClick={addAuthor} className="w-full py-5 mt-2 border-2 border-dashed border-amber-500/40 rounded-2xl text-amber-500 text-lg font-bold hover:bg-amber-500/10 flex items-center justify-center gap-3 transition-all hover:border-amber-500 group">
              <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" /> Tambah Penulis Lainnya <span className="text-sm font-normal text-amber-500/70 ml-1">(Jika penulis lebih dari satu orang)</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: OTHER DETAILS */}
        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl border border-amber-500/40">3</div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Detail Tambahan</h2>
          </div>

          <div className="space-y-3 mb-10">
            <label className="block text-base font-bold text-amber-500">Daftar Pustaka (Bibliography) <span className="text-red-500">*</span></label>
            <textarea 
              name="bibliography" required value={formData.bibliography} onChange={handleChange} rows={6}
              className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
              placeholder="Paste seluruh daftar referensi, sitasi, dan pustaka dari naskah Anda di sini (Format APA/IEEE disarankan)..."
            />
          </div>

          <div className="space-y-3 mb-10">
            <label className="block text-base font-bold text-amber-500">Surat Pengantar untuk Editor (Cover Letter) <span className="text-zinc-500 font-normal">(Opsional)</span></label>
            <textarea 
              name="cover_letter" value={formData.cover_letter} onChange={handleChange} rows={4}
              className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base leading-relaxed focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-colors"
              placeholder="Jelaskan secara singkat apa temuan utama dari riset Anda dan mengapa cocok untuk jurnal ini..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="block text-base font-bold text-amber-500">Deklarasi Penggunaan AI</label>
              <select 
                name="ai_disclosure_type" value={formData.ai_disclosure_type} onChange={handleChange} 
                className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-amber-500 outline-none transition-colors"
              >
                <option value="none">Tidak menggunakan AI</option>
                <option value="grammar">Hanya untuk perbaikan tata bahasa & ejaan</option>
                <option value="drafting">Sebagai asisten dalam menyusun draf awal</option>
                <option value="data">Digunakan dalam proses analisis data/coding</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-base font-bold text-amber-500">Sumber Pendanaan <span className="text-zinc-500 font-normal">(Opsional)</span></label>
              <input 
                type="text" name="funding_source" value={formData.funding_source} onChange={handleChange} 
                className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-amber-500 outline-none transition-colors"
                placeholder="Contoh: Hibah Penelitian Kemdikbudristek 2024..."
              />
            </div>
          </div>
          
          <div>
            <label className="flex items-start gap-5 p-6 bg-amber-900/10 border border-amber-500/30 rounded-xl cursor-pointer hover:bg-amber-900/20 transition-colors group">
              <div className="mt-1 flex-shrink-0">
                <input type="checkbox" name="conflict_of_interest" checked={formData.conflict_of_interest} onChange={handleChange} className="w-5 h-5 accent-amber-500 rounded focus:ring-amber-500" />
              </div>
              <div>
                <strong className="text-amber-500 block text-lg mb-1 group-hover:text-amber-400 transition-colors">Deklarasi Bebas Konflik Kepentingan</strong>
                <p className="text-base text-zinc-400 leading-relaxed">
                  Dengan mencentang kotak ini, saya selaku penulis menjamin dan menyatakan bahwa tidak ada benturan atau konflik kepentingan finansial, personal, maupun profesional yang dapat mempengaruhi objektivitas penelitian dari naskah yang disubmit ini.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 4: FILE UPLOAD */}
        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl border border-amber-500/40">4</div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Unggah Berkas Naskah</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative overflow-hidden group border-2 border-dashed border-zinc-600 bg-zinc-900/50 rounded-2xl p-8 text-center hover:border-amber-500/80 hover:bg-amber-900/10 transition-all">
              <Upload className="w-10 h-10 text-amber-500 mx-auto mb-4 group-hover:-translate-y-1 transition-transform" />
              <label className="block text-lg font-bold text-white mb-2">Title Page <span className="text-red-500">*</span></label>
              <p className="text-sm text-zinc-400 mb-6">Berkas naskah utuh yang <strong className="text-amber-500">mencantumkan</strong> nama dan afiliasi seluruh penulis.</p>
              <input type="file" required onChange={e => setFiles({...files, titlePage: e.target.files?.[0] || null})} className="w-full text-sm text-zinc-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 file:cursor-pointer cursor-pointer" />
            </div>

            <div className="relative overflow-hidden group border-2 border-dashed border-zinc-600 bg-zinc-900/50 rounded-2xl p-8 text-center hover:border-amber-500/80 hover:bg-amber-900/10 transition-all">
              <Upload className="w-10 h-10 text-amber-500 mx-auto mb-4 group-hover:-translate-y-1 transition-transform" />
              <label className="block text-lg font-bold text-white mb-2">Naskah Anonim <span className="text-red-500">*</span></label>
              <p className="text-sm text-zinc-400 mb-6">Berkas naskah yang <strong className="text-amber-500">telah dihapus</strong> nama dan afiliasinya (untuk Blind Review).</p>
              <input type="file" required onChange={e => setFiles({...files, anonymous: e.target.files?.[0] || null})} className="w-full text-sm text-zinc-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 file:cursor-pointer cursor-pointer" />
            </div>

            <div className="relative overflow-hidden group border-2 border-dashed border-zinc-700 bg-zinc-900/30 rounded-2xl p-8 text-center hover:border-zinc-500 hover:bg-zinc-800/50 transition-all">
              <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-4 group-hover:-translate-y-1 transition-transform" />
              <label className="block text-lg font-bold text-white mb-2">Data Pendukung <span className="text-zinc-500 font-normal">(Opsional)</span></label>
              <p className="text-sm text-zinc-400 mb-6">Grafik resolusi tinggi, Dataset, Lampiran Excel, atau Tabel Ekstra.</p>
              <input type="file" onChange={e => setFiles({...files, supporting: e.target.files?.[0] || null})} className="w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 file:cursor-pointer cursor-pointer" />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="p-8 lg:p-12 bg-black/80">
          <button 
            type="submit" disabled={loading}
            className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-black font-extrabold py-5 px-8 rounded-xl hover:from-amber-500 hover:to-yellow-400 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] text-xl"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                Memproses Pengiriman...
              </span>
            ) : (
              <><Send className="w-7 h-7" /> Kirim Naskah Sekarang</>
            )}
          </button>
          <p className="text-center text-zinc-500 mt-6 text-sm">Dengan menekan tombol kirim, Anda menyetujui seluruh Syarat & Ketentuan publikasi yang berlaku di RJRAKP.</p>
        </div>
      </form>
    </div>
  );
}
