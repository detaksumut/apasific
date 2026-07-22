"use client";
import React, { useState, useEffect } from 'react';
import { submitManuscript } from '@/app/actions/submission';
import { createClient } from '@/utils/supabase/client';
import { PlagiarismChecker } from '@/components/PlagiarismChecker';
import { FileText, Upload, Send, Languages, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface AuthorData {
  id: string;
  full_name: string;
  email: string;
  affiliation: string;
  country: string;
  orcid: string;
  academic_id: string;
  google_scholar: string;
  sinta: string;
  scopus: string;
  wos: string;
}

const JOURNALS = [
  {
    id: '5f6bca5a-39e2-442b-a2e0-5b3f35614b4e',
    name: 'AJAF - Akuntansi, Audit & Perpajakan',
    scopes: ['Akuntansi', 'Audit', 'Perpajakan', 'Keuangan', 'Tata Kelola Perusahaan', 'Sistem Informasi Akuntansi']
  },
  {
    id: '4f4ad30b-1fab-4c43-ab96-227f0d7d5977',
    name: 'AJED - Ekonomi Pembangunan & Keuangan',
    scopes: ['Ekonomi Pembangunan', 'Ekonomi Regional', 'Kebijakan Publik', 'Ekonomi Internasional', 'Ketenagakerjaan']
  },
  {
    id: '71809c3b-44dd-46cb-a553-636fe1395b46',
    name: 'AJEP - Jurnal Pendidikan',
    scopes: ['Pendidikan Dasar', 'Pendidikan Menengah', 'Pendidikan Tinggi', 'Kurikulum', 'Teknologi Pendidikan', 'Evaluasi Pembelajaran']
  },
  {
    id: 'bdbd934b-a76b-42a5-8553-2444b2b7b45a',
    name: 'AJCE - Teknik Sipil, Mesin & Elektro',
    scopes: ['Teknik Sipil', 'Teknik Mesin', 'Teknik Elektro', 'Infrastruktur', 'Ilmu Material', 'Energi Terbarukan']
  },
  {
    id: '31f8f2cc-7036-40cd-8f7c-fedf25eda4ec',
    name: 'AJAFR - Pertanian, Kehutanan & Perikanan',
    scopes: ['Agroteknologi', 'Agribisnis', 'Kehutanan', 'Perikanan', 'Ketahanan Pangan', 'Lingkungan Pertanian']
  },
  {
    id: '1e64461f-a671-431b-a739-2c01b4b865ac',
    name: 'AJADM - Seni, Desain & Media Kreatif',
    scopes: ['Seni Rupa', 'Desain Komunikasi Visual', 'Media Kreatif', 'Seni Pertunjukan', 'Kajian Budaya']
  },
  {
    id: 'c212a65d-a0dc-4410-879a-352932014a52',
    name: 'AJIR - Ilmu Politik & Hubungan Internasional',
    scopes: ['Ilmu Politik', 'Hubungan Internasional', 'Kebijakan Luar Negeri', 'Studi Keamanan', 'Demokrasi']
  },
  {
    id: '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d',
    name: 'AJCS - Pengabdian Kepada Masyarakat (PKM)',
    scopes: ['Pemberdayaan Masyarakat', 'Inovasi Sosial', 'Penerapan Teknologi Tepat Guna', 'Pelatihan dan Pendampingan']
  },
  {
    id: 'ad2edb51-7f51-455c-9000-6aaab590387f',
    name: 'AJBA - Manajemen, Bisnis dan Administrasi',
    scopes: ['Manajemen Bisnis', 'Administrasi Bisnis', 'Pemasaran', 'Sumber Daya Manusia', 'Kewirausahaan', 'Perilaku Organisasi']
  },
  {
    id: 'a1dbfeee-da95-4565-9373-330feeca7901',
    name: 'AJLS - Ilmu Hukum & Hak Asasi Manusia',
    scopes: ['Hukum Perdata', 'Hukum Pidana', 'Hukum Tata Negara', 'Hukum Internasional', 'Sosiologi Hukum', 'Hak Asasi Manusia']
  },
  {
    id: 'bdff93b5-9e6a-43ec-9ae1-633001cbfba1',
    name: 'AJPH - Kedokteran, Kesehatan Masyarakat & Keperawatan',
    scopes: ['Kedokteran', 'Kesehatan Masyarakat', 'Keperawatan', 'Epidemiologi', 'Kebijakan Kesehatan']
  },
  {
    id: '033cce77-8836-492c-8fff-a27a911b4701',
    name: 'AJITE - Ilmu Komputer & Teknologi Informasi',
    scopes: ['Ilmu Komputer', 'Teknologi Informasi', 'Kecerdasan Buatan', 'Rekayasa Perangkat Lunak', 'Sistem Informasi', 'Keamanan Siber']
  },
  {
    id: '8fc81b02-780f-4611-869b-294a3f9b7749',
    name: 'AJSSH - Sosiologi & Ilmu Pengetahuan Budaya',
    scopes: ['Sosiologi', 'Antropologi', 'Sejarah', 'Ilmu Komunikasi', 'Filsafat', 'Ilmu Pengetahuan Budaya']
  },
  {
    id: '08c59804-37e5-476f-9166-5d86f3dabc0d',
    name: 'AJES - Ilmu Lingkungan & Keberlanjutan',
    scopes: ['Ilmu Lingkungan', 'Keberlanjutan', 'Mitigasi Perubahan Iklim', 'Konservasi Alam', 'AMDAL']
  },
  {
    id: '5c3b5789-043a-48b4-89de-792599db95ac',
    name: 'AJTHM - Pariwisata & Manajemen Perhotelan',
    scopes: ['Pariwisata', 'Manajemen Perhotelan', 'Ekowisata', 'Pemasaran Pariwisata', 'Gastronomi']
  },
  {
    id: '00270d77-49ea-447e-804e-2a0c44c66fa3',
    name: 'AJIS - Disiplin Ilmu Agama dan Peradaban Islam',
    scopes: ['Studi Islam', 'Peradaban Islam', 'Pendidikan Islam', 'Hukum Keluarga Islam', 'Tafsir dan Hadis', 'Ekonomi Syariah']
  }
];

export default function AuthorSubmit() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const [formData, setFormData] = useState({
    journal_id: '5f6bca5a-39e2-442b-a2e0-5b3f35614b4e',
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
    ai_disclosure_statement: '',
    phone: ''
  });

  useEffect(() => {
    const fetchUserPhone = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Try from user metadata first
          if (user.user_metadata?.phone) {
            setFormData(prev => ({ ...prev, phone: user.user_metadata.phone }));
            return;
          }
          // Try from profiles table
          const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single();
          if (profile?.phone) {
            setFormData(prev => ({ ...prev, phone: profile.phone }));
          }
        }
      } catch (e) {
        console.error("Error fetching user phone", e);
      }
    };
    fetchUserPhone();
  }, []);

  const [authors, setAuthors] = useState<AuthorData[]>([
    { id: '1', full_name: '', email: '', affiliation: '', country: '', orcid: '', academic_id: '', google_scholar: '', sinta: '', scopus: '', wos: '' }
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

  const handleAbstractBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!value) return;
    
    // Rapihkan teks hasil copy-paste dari PDF (hapus line-break tunggal tapi pertahankan paragraf)
    const cleaned = value
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map(p => p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
      .join('\n\n');
      
    setFormData(prev => ({ ...prev, [name]: cleaned }));
  };

  const handleAuthorChange = (index: number, field: keyof AuthorData, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, { id: Math.random().toString(), full_name: '', email: '', affiliation: '', country: '', orcid: '', academic_id: '', google_scholar: '', sinta: '', scopus: '', wos: '' }]);
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
    form.append('phone', formData.phone);
    
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
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-400 text-black font-bold text-lg rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition-colors"
          >
            Submit Artikel Lainnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div className="mb-12">
        <h1 className="text-4xl text-[#c9a84c] font-bold tracking-wide mb-3">Submit Artikel Baru</h1>
        <p className="text-[#8888aa] text-lg">Lengkapi formulir metadata di bawah ini dengan seksama untuk memastikan kelancaran proses publikasi Anda.</p>
      </div>

      <div className="bg-[#111120] border border-[#c9a84c]/20 rounded-2xl overflow-hidden shadow-xl mb-12">
        <div className="bg-[#18182e] px-8 py-5 border-b border-[#c9a84c]/30 flex items-center gap-3">
          <FileText className="w-6 h-6 text-[#c9a84c]" />
          <div>
            <h3 className="font-bold text-[#c9a84c] text-lg">Alat Cek Plagiarisme (Pra-Submit)</h3>
            <p className="text-sm text-[#8888aa] mt-1">Gunakan alat ini untuk memastikan artikel Anda bebas plagiarisme sebelum disubmit secara resmi ke tim editorial.</p>
          </div>
        </div>
        <div className="p-4">
          <PlagiarismChecker />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111120] border border-[#c9a84c]/30 rounded-2xl shadow-2xl divide-y divide-zinc-800/80">
        
        {/* SECTION 1: METADATA */}
        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center font-bold text-xl border border-[#c9a84c]/40">1</div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Metadata Artikel</h2>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl text-base font-medium mb-10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="block text-base font-bold text-[#c9a84c]">Pilih Jurnal Tujuan <span className="text-red-500">*</span></label>
              <select 
                name="journal_id" value={formData.journal_id} 
                onChange={(e) => {
                  handleChange(e);
                  setFormData(prev => ({ ...prev, selectedScope: '', customScope: '' }));
                }} required style={{ padding: '1rem' }}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-colors cursor-pointer"
              >
                <option value="" disabled>-- Pilih Jurnal --</option>
                {JOURNALS.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="block text-base font-bold text-[#c9a84c]">Pilih Scope Jurnal <span className="text-red-500">*</span></label>
              <select 
                name="selectedScope" value={formData.selectedScope} onChange={handleChange} required style={{ padding: '1rem' }}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-colors cursor-pointer"
              >
                <option value="" disabled>-- Pilih Scope --</option>
                {JOURNALS.find(j => j.id === formData.journal_id)?.scopes.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Lainnya">Lainnya (Tulis Sendiri)</option>
              </select>
              {formData.selectedScope === 'Lainnya' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text" name="customScope" value={formData.customScope} onChange={handleChange} required style={{ padding: '1rem' }}
                    className="w-full bg-[#0a0a14] border border-[#c9a84c]/50 rounded-xl px-5 py-4 text-white text-base focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] shadow-[0_0_15px_rgba(201,168,76,0.1)]"
                    placeholder="Ketikkan scope/bidang spesifik Anda..."
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <label className="block text-base font-bold text-[#c9a84c]">Pilih Paket Publikasi <span className="text-red-500">*</span></label>
            <select 
              name="publicationType" value={formData.publicationType} onChange={handleChange} required style={{ padding: '1rem' }}
              className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-colors cursor-pointer"
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
            <p className="text-sm text-[#8888aa] mt-2 pl-1">* Biaya dan fasilitas masing-masing paket akan diinformasikan lebih lanjut oleh editor.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="block text-base font-bold text-[#c9a84c]">Judul Artikel <span className="text-red-500">*</span></label>
              <input
                type="text" name="title" required value={formData.title} onChange={handleChange} style={{ padding: '1rem' }}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-lg font-medium focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-colors"
                placeholder="Ketik judul lengkap naskah Anda di sini..."
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="block text-base font-bold text-[#c9a84c]">Nomor WhatsApp <span className="text-red-500">*</span></label>
              <input
                type="tel" name="phone" required value={formData.phone} onChange={handleChange} style={{ padding: '1rem' }}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-lg font-medium focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-colors"
                placeholder="+62 812-3456-7890 (Untuk Notifikasi Update)"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="block text-base font-bold text-[#c9a84c]">Abstrak (Bahasa Indonesia) <span className="text-red-500">*</span></label>
              <textarea 
                name="abstract" required value={formData.abstract} onChange={handleChange} onBlur={handleAbstractBlur} rows={8} style={{ padding: '1rem' }}
                data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false"
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base leading-relaxed focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-colors resize-none" 
                placeholder="Tuliskan isi dari Abstrak naskah Anda berbahasa Indonesia..."
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex justify-between items-center">
                <label className="block text-base font-bold text-[#c9a84c]">Abstract (English) <span className="text-red-500">*</span></label>
                <button 
                  type="button" onClick={handleAutoTranslate} disabled={isTranslating || !formData.abstract}
                  className="text-sm bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30 px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 font-medium"
                >
                  <Languages className="w-4 h-4" /> <span>{isTranslating ? 'Menerjemahkan...' : 'Auto Translate'}</span>
                </button>
              </div>
              <textarea 
                name="abstract_en" required value={formData.abstract_en} onChange={handleChange} onBlur={handleAbstractBlur} rows={8} style={{ padding: '1rem' }}
                data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false"
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base leading-relaxed focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-colors resize-none" 
                placeholder="Write your translated English abstract here..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className="block text-base font-bold text-[#c9a84c]">Kata Kunci (Keywords) <span className="text-red-500">*</span></label>
            <input 
              type="text" name="keywords" required value={formData.keywords} onChange={handleChange} style={{ padding: '1rem' }}
              className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-colors" 
              placeholder="Contoh: kecerdasan buatan, ekonomi digital, kebijakan fiskal (pisahkan dengan koma)" 
            />
          </div>
        </div>

        {/* SECTION 2: AUTHORS */}
        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center font-bold text-xl border border-[#c9a84c]/40">2</div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Daftar Penulis</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {authors.map((author, index) => (
              <div key={author.id} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', backgroundColor: '#0a0a14', border: '1px solid #3f3f46', borderRadius: '1rem', position: 'relative' }}>
                <div className="absolute right-6 top-6 flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => moveAuthor(index, 'up')} disabled={index === 0} className="p-2 text-[#8888aa] bg-black/40 rounded hover:text-[#c9a84c] hover:bg-black/60 disabled:opacity-30 transition-all"><ChevronUp className="w-5 h-5" /></button>
                  <button type="button" onClick={() => moveAuthor(index, 'down')} disabled={index === authors.length - 1} className="p-2 text-[#8888aa] bg-black/40 rounded hover:text-[#c9a84c] hover:bg-black/60 disabled:opacity-30 transition-all"><ChevronDown className="w-5 h-5" /></button>
                  <div className="w-px h-8 bg-zinc-700 mx-1"></div>
                  <button type="button" onClick={() => removeAuthor(index)} disabled={authors.length === 1} className="p-2 text-[#8888aa] bg-black/40 rounded hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
                
                <h4 className="font-bold text-[#c9a84c] text-lg mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#c9a84c] rounded-full"></div>
                  {index === 0 ? "Penulis Pertama (Koresponden)" : `Penulis Ke-${index + 1}`}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="block text-sm font-bold text-zinc-300">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input type="text" required value={author.full_name} onChange={e => handleAuthorChange(index, 'full_name', e.target.value)} className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors" placeholder="Gelar dan nama lengkap" style={{ padding: '0.75rem 1rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="block text-sm font-bold text-zinc-300">Alamat Email <span className="text-red-500">*</span></label>
                    <input type="email" required value={author.email} onChange={e => handleAuthorChange(index, 'email', e.target.value)} className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors" placeholder="email@institusi.edu" style={{ padding: '0.75rem 1rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="block text-sm font-bold text-zinc-300">Afiliasi / Institusi <span className="text-red-500">*</span></label>
                    <input type="text" required value={author.affiliation} onChange={e => handleAuthorChange(index, 'affiliation', e.target.value)} className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors" placeholder="Nama universitas atau lembaga" style={{ padding: '0.75rem 1rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="block text-sm font-bold text-zinc-300">ID Akademik / NIDN <span className="text-zinc-500 font-normal">(Opsional)</span></label>
                    <input type="text" value={author.academic_id} onChange={e => handleAuthorChange(index, 'academic_id', e.target.value)} placeholder="NIDN / NIDK / ID Universitas" className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors" style={{ padding: '0.75rem 1rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="block text-sm font-bold text-zinc-300">ID ORCID <span className="text-zinc-500 font-normal">(Opsional)</span></label>
                    <input type="text" value={author.orcid} onChange={e => handleAuthorChange(index, 'orcid', e.target.value)} placeholder="0000-0000-0000-0000" className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors" style={{ padding: '0.75rem 1rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="block text-sm font-bold text-zinc-300">Google Scholar ID <span className="text-zinc-500 font-normal">(Opsional)</span></label>
                    <input type="text" value={author.google_scholar} onChange={e => handleAuthorChange(index, 'google_scholar', e.target.value)} placeholder="ID Google Scholar" className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors" style={{ padding: '0.75rem 1rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="block text-sm font-bold text-zinc-300">SINTA ID <span className="text-zinc-500 font-normal">(Opsional)</span></label>
                    <input type="text" value={author.sinta} onChange={e => handleAuthorChange(index, 'sinta', e.target.value)} placeholder="ID SINTA" className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors" style={{ padding: '0.75rem 1rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="block text-sm font-bold text-zinc-300">SCOPUS ID <span className="text-zinc-500 font-normal">(Opsional)</span></label>
                    <input type="text" value={author.scopus} onChange={e => handleAuthorChange(index, 'scopus', e.target.value)} placeholder="ID SCOPUS" className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors" style={{ padding: '0.75rem 1rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="block text-sm font-bold text-zinc-300">Web of Science (WoS) ID <span className="text-zinc-500 font-normal">(Opsional)</span></label>
                    <input type="text" value={author.wos} onChange={e => handleAuthorChange(index, 'wos', e.target.value)} placeholder="ID ResearcherID / WoS" className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-[#c9a84c] outline-none transition-colors" style={{ padding: '0.75rem 1rem' }} />
                  </div>
                </div>
              </div>
            ))}
            
            <button type="button" onClick={addAuthor} className="w-full py-5 mt-2 border-2 border-dashed border-[#c9a84c]/40 rounded-2xl text-[#c9a84c] text-lg font-bold hover:bg-[#c9a84c]/10 flex items-center justify-center gap-3 transition-all hover:border-[#c9a84c] group">
              <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" /> <span>Tambah Penulis Lainnya</span> <span className="text-sm font-normal text-[#c9a84c]/70 ml-1">(Jika penulis lebih dari satu orang)</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: OTHER DETAILS */}
        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center font-bold text-xl border border-[#c9a84c]/40">3</div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Detail Tambahan</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <label className="block text-base font-bold text-[#c9a84c]">Daftar Pustaka (Bibliography) <span className="text-red-500">*</span></label>
            <textarea 
              name="bibliography" required value={formData.bibliography} onChange={handleChange} rows={6} style={{ padding: '1rem' }}
              data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false"
              className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base leading-relaxed focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] outline-none transition-colors"
              placeholder="Paste seluruh daftar referensi, sitasi, dan pustaka dari naskah Anda di sini (Format APA/IEEE disarankan)..."
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <label className="block text-base font-bold text-[#c9a84c]">Surat Pengantar untuk Editor (Cover Letter) <span className="text-[#8888aa] font-normal">(Opsional)</span></label>
            <textarea 
              name="cover_letter" value={formData.cover_letter} onChange={handleChange} rows={4} style={{ padding: '1rem' }}
              data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false"
              className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base leading-relaxed focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] outline-none transition-colors"
              placeholder="Jelaskan secara singkat apa temuan utama dari riset Anda dan mengapa cocok untuk jurnal ini..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="block text-base font-bold text-[#c9a84c]">Deklarasi Penggunaan AI</label>
              <select 
                name="ai_disclosure_type" value={formData.ai_disclosure_type} onChange={handleChange} style={{ padding: '1rem' }}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-[#c9a84c] outline-none transition-colors"
              >
                <option value="none">Tidak menggunakan AI</option>
                <option value="grammar">Hanya untuk perbaikan tata bahasa & ejaan</option>
                <option value="drafting">Sebagai asisten dalam menyusun draf awal</option>
                <option value="data">Digunakan dalam proses analisis data/coding</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="block text-base font-bold text-[#c9a84c]">Sumber Pendanaan <span className="text-[#8888aa] font-normal">(Opsional)</span></label>
              <input 
                type="text" name="funding_source" value={formData.funding_source} onChange={handleChange} style={{ padding: '1rem' }}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-5 py-4 text-white text-base focus:border-[#c9a84c] outline-none transition-colors"
                placeholder="Contoh: Hibah Penelitian Kemdikbudristek 2024..."
              />
            </div>
          </div>
          
          <div>
            <label className="flex items-start gap-5 p-6 bg-[#c9a84c]/5 border border-[#c9a84c]/30 rounded-xl cursor-pointer hover:bg-[#c9a84c]/10 transition-colors group">
              <div className="mt-1 flex-shrink-0">
                <input type="checkbox" name="conflict_of_interest" checked={formData.conflict_of_interest} onChange={handleChange} className="w-5 h-5 accent-[#c9a84c] rounded focus:ring-[#c9a84c]" />
              </div>
              <div>
                <strong className="text-[#c9a84c] block text-lg mb-1 group-hover:text-[#c9a84c]/80 transition-colors">Deklarasi Bebas Konflik Kepentingan</strong>
                <p className="text-base text-[#8888aa] leading-relaxed">
                  Dengan mencentang kotak ini, saya selaku penulis menjamin dan menyatakan bahwa tidak ada benturan atau konflik kepentingan finansial, personal, maupun profesional yang dapat mempengaruhi objektivitas penelitian dari naskah yang disubmit ini.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION 4: FILE UPLOAD */}
        <div className="p-8 lg:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center font-bold text-xl border border-[#c9a84c]/40">4</div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Unggah Berkas Naskah</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="relative overflow-hidden group border-2 border-dashed border-zinc-600 bg-[#0a0a14] rounded-2xl p-8 text-center hover:border-[#c9a84c]/80 hover:bg-[#c9a84c]/5 transition-all">
              <Upload className="w-10 h-10 text-[#c9a84c] mx-auto mb-4 group-hover:-translate-y-1 transition-transform" />
              <label className="block text-lg font-bold text-white mb-2">Title Page <span className="text-red-500">*</span></label>
              <p className="text-sm text-[#8888aa] mb-6">Berkas naskah utuh yang <strong className="text-[#c9a84c]">mencantumkan</strong> nama dan afiliasi seluruh penulis.</p>
              <input type="file" required onChange={e => setFiles({...files, titlePage: e.target.files?.[0] || null})} className="w-full text-sm text-zinc-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c9a84c] file:text-black hover:file:bg-[#b0923d] file:cursor-pointer cursor-pointer" />
            </div>

            <div className="relative overflow-hidden group border-2 border-dashed border-zinc-600 bg-[#0a0a14] rounded-2xl p-8 text-center hover:border-[#c9a84c]/80 hover:bg-[#c9a84c]/5 transition-all">
              <Upload className="w-10 h-10 text-[#c9a84c] mx-auto mb-4 group-hover:-translate-y-1 transition-transform" />
              <label className="block text-lg font-bold text-white mb-2">Naskah Anonim <span className="text-red-500">*</span></label>
              <p className="text-sm text-[#8888aa] mb-6">Berkas naskah yang <strong className="text-[#c9a84c]">telah dihapus</strong> nama dan afiliasinya (untuk Blind Review).</p>
              <input type="file" required onChange={e => setFiles({...files, anonymous: e.target.files?.[0] || null})} className="w-full text-sm text-zinc-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#c9a84c] file:text-black hover:file:bg-[#b0923d] file:cursor-pointer cursor-pointer" />
            </div>

            <div className="relative overflow-hidden group border-2 border-dashed border-zinc-700 bg-[#0a0a14] rounded-2xl p-8 text-center hover:border-zinc-500 hover:bg-zinc-800/50 transition-all">
              <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-4 group-hover:-translate-y-1 transition-transform" />
              <label className="block text-lg font-bold text-white mb-2">Data Pendukung <span className="text-[#8888aa] font-normal">(Opsional)</span></label>
              <p className="text-sm text-[#8888aa] mb-6">Grafik resolusi tinggi, Dataset, Lampiran Excel, atau Tabel Ekstra.</p>
              <input type="file" onChange={e => setFiles({...files, supporting: e.target.files?.[0] || null})} className="w-full text-sm text-[#8888aa] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 file:cursor-pointer cursor-pointer" />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="p-8 lg:p-12 bg-black/80">
          <button 
            type="submit" disabled={loading}
            className="w-full flex justify-center items-center gap-3 bg-gradient-to-r from-[#c9a84c] via-[#c9a84c] to-[#b0923d] text-black font-extrabold py-5 px-8 rounded-xl hover:from-[#c9a84c] hover:to-[#a08230] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(201,168,76,0.25)] hover:shadow-[0_0_40px_rgba(201,168,76,0.4)] text-xl"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses Pengiriman...</span>
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Send className="w-7 h-7" /> 
                <span>Kirim Naskah Sekarang</span>
              </span>
            )}
          </button>
          <p className="text-center text-zinc-500 mt-6 text-sm">Dengan menekan tombol kirim, Anda menyetujui seluruh Syarat & Ketentuan publikasi yang berlaku di ASIA.</p>
        </div>
      </form>
    </div>
  );
}
