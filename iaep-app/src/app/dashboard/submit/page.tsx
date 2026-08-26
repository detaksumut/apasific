"use client";
import React, { useState, useEffect } from 'react';
import { submitManuscript } from '@/app/actions/submitManuscript';
import { createClient } from '@/utils/supabase/client';
import { PlagiarismChecker } from '@/components/PlagiarismChecker';
import { 
  FileText, Upload, Send, Languages, Plus, Trash2, ChevronUp, ChevronDown, 
  ShieldCheck, Cpu, Database, CheckSquare, Sparkles, BookOpen, AlertCircle
} from 'lucide-react';
import { CREDIT_ROLES, CRediTRole } from '@/domain/submission/SubmissionIntegrityPayload';

interface AuthorData {
  id: string;
  isCorresponding: boolean;
  apasificAuthId?: string;
  full_name: string;
  email: string;
  affiliation: string;
  country: string;
  orcid: string;
  orcidProvenance: 'AUTHENTICATED' | 'AUTHOR_CLAIMED';
  academic_id: string;
  google_scholar: string;
  sinta: string;
  scopus: string;
  wos: string;
  creditRoles: CRediTRole[];
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
  const [pendingAiAnalysis, setPendingAiAnalysis] = useState<any>(null);
  const [orcidSession, setOrcidSession] = useState<{ orcid?: string; authId?: string; name?: string } | null>(null);

  // Form State
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
    phone: '',
    
    // Extensible Research Taxonomy
    article_type: 'Original Research',
    research_approach: 'Quantitative',
    research_design: 'Cross-Sectional Empirical',
    
    // AI Transparency Record
    ai_used: false,
    ai_tools: [] as string[],
    ai_purposes: [] as string[],
    ai_affected_sections: [] as string[],
    ai_responsibility_accepted: false,
    ai_custom_notes: '',

    // Data Availability
    data_availability_status: 'UPON_REASONABLE_REQUEST',
    data_availability_statement: 'Data supporting the findings of this study are available from the corresponding author upon reasonable request.',
    data_repository_url: '',

    // Ethics Declaration
    ethics_status: 'NOT_REQUIRED',
    ethics_committee: '',
    ethics_protocol_number: '',
    ethics_informed_consent: false,

    // Funding & COI
    funding_status: 'NO_EXTERNAL_FUNDING',
    funding_agency: '',
    funding_grant_number: '',
    coi_status: 'NO_CONFLICT',
    coi_details: '',

    // Submission Integrity Pledge
    pledge_originality: false,
    pledge_no_dual_submission: false,
    pledge_coauthors_approved: false,
    pledge_accuracy_accepted: false
  });

  const [authors, setAuthors] = useState<AuthorData[]>([
    {
      id: '1',
      isCorresponding: true,
      apasificAuthId: '',
      full_name: '',
      email: '',
      affiliation: '',
      country: 'Indonesia',
      orcid: '',
      orcidProvenance: 'AUTHENTICATED',
      academic_id: '',
      google_scholar: '',
      sinta: '',
      scopus: '',
      wos: '',
      creditRoles: ['Conceptualization', 'Writing - Original Draft']
    }
  ]);

  const [files, setFiles] = useState({
    titlePage: null as File | null,
    anonymous: null as File | null,
    supporting: null as File | null
  });

  useEffect(() => {
    // 1. Fetch cookie for authenticated ORCID
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const authOrcid = getCookie('authenticated_orcid');
    const authId = getCookie('apasific_auth_id');
    const userName = getCookie('user_name');

    if (authOrcid) {
      setOrcidSession({ orcid: authOrcid, authId: authId || undefined, name: userName || undefined });
      setAuthors(prev => {
        const copy = [...prev];
        copy[0] = {
          ...copy[0],
          apasificAuthId: authId || copy[0].apasificAuthId,
          full_name: copy[0].full_name || userName || '',
          orcid: authOrcid,
          orcidProvenance: 'AUTHENTICATED'
        };
        return copy;
      });
    }

    const fetchUserPhone = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (user.user_metadata?.phone) {
            setFormData(prev => ({ ...prev, phone: user.user_metadata.phone }));
            return;
          }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleArrayToggle = (key: 'ai_tools' | 'ai_purposes' | 'ai_affected_sections', value: string) => {
    setFormData(prev => {
      const current = prev[key];
      const exists = current.includes(value);
      const updated = exists ? current.filter(item => item !== value) : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleAuthorChange = (index: number, field: keyof AuthorData, value: any) => {
    const newAuthors = [...authors];
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const handleCreditToggle = (authorIndex: number, role: CRediTRole) => {
    const newAuthors = [...authors];
    const currentRoles = newAuthors[authorIndex].creditRoles || [];
    const exists = currentRoles.includes(role);
    newAuthors[authorIndex].creditRoles = exists
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    setAuthors(newAuthors);
  };

  const addAuthor = () => {
    setAuthors([
      ...authors,
      {
        id: Math.random().toString(),
        isCorresponding: false,
        full_name: '',
        email: '',
        affiliation: '',
        country: 'Indonesia',
        orcid: '',
        orcidProvenance: 'AUTHOR_CLAIMED',
        academic_id: '',
        google_scholar: '',
        sinta: '',
        scopus: '',
        wos: '',
        creditRoles: ['Investigation']
      }
    ]);
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

  const isPledgeComplete = 
    formData.pledge_originality && 
    formData.pledge_no_dual_submission && 
    formData.pledge_coauthors_approved && 
    formData.pledge_accuracy_accepted;

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

    if (formData.ai_used && !formData.ai_responsibility_accepted) {
      setError("Anda wajib mencentang konfirmasi tanggung jawab penulis atas penggunaan AI.");
      window.scrollTo(0, 0);
      return;
    }

    if (!isPledgeComplete) {
      setError("Seluruh butir Pernyataan Integritas & Deklarasi Penyerahan Naskah wajib dicentang.");
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

    if (pendingAiAnalysis) {
      form.append('aiResult', JSON.stringify(pendingAiAnalysis));
    }

    // Comprehensive Structured Submission Payload
    const comprehensivePayload = {
      abstract: formData.abstract,
      abstract_en: formData.abstract_en,
      keywords: `Scope: ${finalScope}, ${formData.keywords}`,
      cover_letter: formData.cover_letter,
      bibliography: formData.bibliography,
      publication_type: formData.publicationType,
      
      // Layer 1: Research Taxonomy
      research_taxonomy: {
        article_type: formData.article_type,
        research_approach: formData.research_approach,
        research_design: formData.research_design
      },

      // Layer 1 & CRediT: Authors
      authors: authors.map((a, idx) => ({
        ...a,
        isCorresponding: idx === 0,
        orcidProvenance: idx === 0 && orcidSession?.orcid ? 'AUTHENTICATED' : (a.orcid ? 'AUTHOR_CLAIMED' : undefined)
      })),

      // Layer 2: AI Transparency Record
      ai_transparency_record: {
        used: formData.ai_used,
        tools: formData.ai_tools,
        purposes: formData.ai_purposes,
        affected_sections: formData.ai_affected_sections,
        author_responsibility_accepted: formData.ai_responsibility_accepted,
        custom_notes: formData.ai_custom_notes
      },

      // Layer 4: Data Availability
      data_availability: {
        status: formData.data_availability_status,
        statement: formData.data_availability_statement,
        repository_url: formData.data_repository_url
      },

      // Layer 2: Ethics
      ethics_declaration: {
        status: formData.ethics_status,
        committee_name: formData.ethics_committee,
        protocol_number: formData.ethics_protocol_number,
        informed_consent_confirmed: formData.ethics_informed_consent
      },

      // Layer 2: Funding & COI
      funding_declaration: {
        status: formData.funding_status,
        agency: formData.funding_agency,
        grant_number: formData.funding_grant_number
      },
      conflict_of_interest: {
        status: formData.coi_status,
        details: formData.coi_details
      },

      // Submission Pledge
      submission_pledge: {
        originality_confirmed: formData.pledge_originality,
        no_dual_submission: formData.pledge_no_dual_submission,
        coauthors_approved: formData.pledge_coauthors_approved,
        accuracy_accepted: formData.pledge_accuracy_accepted,
        timestamp: new Date().toISOString()
      }
    };

    form.append('abstract', JSON.stringify(comprehensivePayload));
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
          <h2 className="text-4xl font-serif text-white font-bold mb-6">Pengiriman Naskah Berhasil!</h2>
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
            Naskah Anda beserta <strong>Metadata 5-Layer, CRediT Roles, dan AI Transparency Record</strong> telah resmi dicatat ke dalam buku besar peristiwa (<em>Event Ledger</em>) APASIFIC.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-400 text-black font-bold text-lg rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition-colors"
          >
            Submit Naskah Lainnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 space-y-12">
      <div>
        <h1 className="text-4xl text-[#c9a84c] font-bold tracking-wide mb-3">Submit Naskah Ilmiah Baru</h1>
        <p className="text-[#8888aa] text-lg">
          Lengkapi formulir metadata riset terpadu di bawah ini sesuai standar mutu dan integritas <strong>APASIFIC Ecosystem v1.0</strong>.
        </p>
      </div>

      {/* Pre-submission Plagiarism Scanner */}
      <div className="bg-[#111120] border border-[#c9a84c]/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-[#18182e] px-8 py-5 border-b border-[#c9a84c]/30 flex items-center gap-3">
          <FileText className="w-6 h-6 text-[#c9a84c]" />
          <div>
            <h3 className="font-bold text-[#c9a84c] text-lg">Alat Cek Kemiripan Teks (Pra-Submit)</h3>
            <p className="text-sm text-[#8888aa] mt-1">Gunakan alat ini untuk memastikan artikel bebas dari tumpang tindih teks tanpa atribusi sebelum diserahkan resmi.</p>
          </div>
        </div>
        <div className="p-4">
          <PlagiarismChecker
            onAnalysisComplete={(result) => {
              setPendingAiAnalysis(result);
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111120] border border-[#c9a84c]/30 rounded-2xl shadow-2xl divide-y divide-zinc-800/80">
        
        {/* SECTION 1: RESEARCH IDENTITY & EXTENSIBLE TAXONOMY */}
        <div className="p-8 lg:p-12 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center font-bold text-xl border border-[#c9a84c]/40">1</div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Layer 1: Identitas &amp; Taksonomi Riset</h2>
              <p className="text-xs text-zinc-400">Penentuan jurnal target, cakupan scope, dan pendekatan metodologi naskah.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl text-base font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Jurnal, Scope, Package */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#c9a84c]">Pilih Jurnal Tujuan <span className="text-red-500">*</span></label>
              <select 
                name="journal_id" value={formData.journal_id} 
                onChange={(e) => {
                  handleChange(e);
                  setFormData(prev => ({ ...prev, selectedScope: '', customScope: '' }));
                }} required
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-4 py-3.5 text-white text-sm focus:border-[#c9a84c] outline-none"
              >
                {JOURNALS.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#c9a84c]">Pilih Scope Jurnal <span className="text-red-500">*</span></label>
              <select 
                name="selectedScope" value={formData.selectedScope} onChange={handleChange} required
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-4 py-3.5 text-white text-sm focus:border-[#c9a84c] outline-none"
              >
                <option value="" disabled>-- Pilih Scope --</option>
                {JOURNALS.find(j => j.id === formData.journal_id)?.scopes.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Lainnya">Lainnya (Tulis Sendiri)</option>
              </select>
              {formData.selectedScope === 'Lainnya' && (
                <input 
                  type="text" name="customScope" value={formData.customScope} onChange={handleChange} required
                  className="w-full mt-2 bg-[#0a0a14] border border-[#c9a84c]/50 rounded-xl px-4 py-3 text-white text-sm"
                  placeholder="Ketikkan scope/bidang spesifik Anda..."
                />
              )}
            </div>
          </div>

          {/* Extensible Taxonomy 3-Pillar */}
          <div className="p-5 bg-black/40 border border-[#c9a84c]/20 rounded-xl space-y-4">
            <h4 className="text-sm font-bold text-[#c9a84c] flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Extensible Research Classification (Rubric Anchor for AT-RQS™)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">Article Type</label>
                <select 
                  name="article_type" value={formData.article_type} onChange={handleChange}
                  className="w-full bg-[#111120] border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-xs"
                >
                  <option value="Original Research">Original Research Paper</option>
                  <option value="Review Article">Review / Synthesis Article</option>
                  <option value="Case Report">Case Study / Field Report</option>
                  <option value="Short Communication">Short Communication</option>
                  <option value="Perspective">Essay / Theoretical Perspective</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">Research Approach</label>
                <select 
                  name="research_approach" value={formData.research_approach} onChange={handleChange}
                  className="w-full bg-[#111120] border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-xs"
                >
                  <option value="Quantitative">Kuantitatif (Statistical / Empirical)</option>
                  <option value="Qualitative">Kualitatif (Interpretive / Phenomenological)</option>
                  <option value="Mixed-Methods">Mixed Methods (Kombinasi)</option>
                  <option value="Meta-Analysis / SLR">Systematic Review / PRISMA Meta-Analysis</option>
                  <option value="Conceptual / Theoretical">Kajian Konseptual / Teoretis</option>
                  <option value="Legal-Normative">Hukum Normatif (Doctrinal Legal)</option>
                  <option value="Experimental">Eksperimental Murni / Laboratorium</option>
                  <option value="Bibliometric">Bibliometrik / Scientometrics</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">Research Design</label>
                <input 
                  type="text" name="research_design" value={formData.research_design} onChange={handleChange}
                  className="w-full bg-[#111120] border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs"
                  placeholder="Contoh: Cross-Sectional, Case Study, Grounded Theory..."
                />
              </div>
            </div>
          </div>

          {/* Title & WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-bold text-[#c9a84c]">Judul Artikel Lengkap <span className="text-red-500">*</span></label>
              <input
                type="text" name="title" required value={formData.title} onChange={handleChange}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-4 py-3.5 text-white text-base focus:border-[#c9a84c] outline-none"
                placeholder="Ketik judul lengkap naskah Anda di sini..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#c9a84c]">Nomor WhatsApp <span className="text-red-500">*</span></label>
              <input
                type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-4 py-3.5 text-white text-base focus:border-[#c9a84c] outline-none"
                placeholder="+62 812-3456-7890"
              />
            </div>
          </div>

          {/* Dual Abstract */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#c9a84c]">Abstrak (Bahasa Indonesia) <span className="text-red-500">*</span></label>
              <textarea 
                name="abstract" required value={formData.abstract} onChange={handleChange} rows={6}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl p-4 text-white text-sm leading-relaxed focus:border-[#c9a84c] outline-none" 
                placeholder="Tuliskan isi dari Abstrak naskah Anda berbahasa Indonesia..."
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-[#c9a84c]">Abstract (English) <span className="text-red-500">*</span></label>
                <button 
                  type="button" onClick={handleAutoTranslate} disabled={isTranslating || !formData.abstract}
                  className="text-xs bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Languages className="w-3.5 h-3.5" /> <span>{isTranslating ? 'Menerjemahkan...' : 'Auto Translate'}</span>
                </button>
              </div>
              <textarea 
                name="abstract_en" required value={formData.abstract_en} onChange={handleChange} rows={6}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl p-4 text-white text-sm leading-relaxed focus:border-[#c9a84c] outline-none" 
                placeholder="Write your translated English abstract here..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-[#c9a84c]">Kata Kunci (Keywords) <span className="text-red-500">*</span></label>
            <input 
              type="text" name="keywords" required value={formData.keywords} onChange={handleChange}
              className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl px-4 py-3 text-white text-sm" 
              placeholder="Contoh: kecerdasan buatan, mitigasi risiko, model regresi (pisahkan dengan koma)" 
            />
          </div>
        </div>

        {/* SECTION 2: AUTHORS & CREDIT TAXONOMY */}
        <div className="p-8 lg:p-12 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center font-bold text-xl border border-[#c9a84c]/40">2</div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Layer 1: Daftar Penulis &amp; CRediT Roles</h2>
              <p className="text-xs text-zinc-400">Pengenal identitas peneliti, taksonomi peran kontribusi CRediT, dan keterhubungan ORCID.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {authors.map((author, index) => (
              <div key={author.id} className="p-6 bg-[#0a0a14] border border-zinc-700 rounded-2xl space-y-5 relative">
                
                {/* Author Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-[#c9a84c] text-base">
                      {index === 0 ? "Penulis 1 (Corresponding Author)" : `Penulis Pendamping (Co-Author ${index + 1})`}
                    </h4>
                    {index === 0 && orcidSession?.orcid ? (
                      <span className="px-2.5 py-0.5 bg-[#a3c94c]/15 text-[#a3c94c] border border-[#a3c94c]/30 rounded-full text-xs font-bold font-mono">
                        🟢 ORCID Authenticated: {orcidSession.orcid}
                      </span>
                    ) : (
                      author.orcid && (
                        <span className="px-2.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full text-xs font-mono">
                          🟡 AUTHOR CLAIMED
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => moveAuthor(index, 'up')} disabled={index === 0} className="p-1.5 text-zinc-400 bg-black/40 rounded hover:text-[#c9a84c] disabled:opacity-20"><ChevronUp className="w-4 h-4" /></button>
                    <button type="button" onClick={() => moveAuthor(index, 'down')} disabled={index === authors.length - 1} className="p-1.5 text-zinc-400 bg-black/40 rounded hover:text-[#c9a84c] disabled:opacity-20"><ChevronDown className="w-4 h-4" /></button>
                    {index > 0 && (
                      <button type="button" onClick={() => removeAuthor(index)} className="p-1.5 text-red-400 bg-black/40 rounded hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
                
                {/* Author Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-300">Nama Lengkap &amp; Gelar <span className="text-red-500">*</span></label>
                    <input 
                      type="text" required value={author.full_name} 
                      readOnly={index === 0 && !!orcidSession?.name}
                      onChange={e => handleAuthorChange(index, 'full_name', e.target.value)} 
                      className={`w-full bg-[#111120] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white text-sm ${index === 0 && orcidSession?.name ? 'opacity-90 font-semibold' : ''}`} 
                      placeholder="Nama lengkap penulis" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-300">Alamat Email <span className="text-red-500">*</span></label>
                    <input type="email" required value={author.email} onChange={e => handleAuthorChange(index, 'email', e.target.value)} className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white text-sm" placeholder="email@institusi.edu" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-zinc-300">Afiliasi / Universitas <span className="text-red-500">*</span></label>
                    <input type="text" required value={author.affiliation} onChange={e => handleAuthorChange(index, 'affiliation', e.target.value)} className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white text-sm" placeholder="Universitas / Lembaga Riset" />
                  </div>
                </div>

                {/* Optional Identifiers Enrichment */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] text-zinc-400">ORCID iD</label>
                    <input 
                      type="text" value={author.orcid} 
                      readOnly={index === 0 && !!orcidSession?.orcid}
                      onChange={e => handleAuthorChange(index, 'orcid', e.target.value)} 
                      placeholder="0000-0000-0000-0000" 
                      className="w-full bg-[#111120] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-mono" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-zinc-400">Scopus Author ID (Opt)</label>
                    <input type="text" value={author.scopus} onChange={e => handleAuthorChange(index, 'scopus', e.target.value)} placeholder="Scopus ID" className="w-full bg-[#111120] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-zinc-400">WoS ResearcherID (Opt)</label>
                    <input type="text" value={author.wos} onChange={e => handleAuthorChange(index, 'wos', e.target.value)} placeholder="WoS ID" className="w-full bg-[#111120] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] text-zinc-400">SINTA ID (Opt)</label>
                    <input type="text" value={author.sinta} onChange={e => handleAuthorChange(index, 'sinta', e.target.value)} placeholder="SINTA ID" className="w-full bg-[#111120] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-mono" />
                  </div>
                </div>

                {/* CRediT Contribution Roles Selector */}
                <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#c9a84c]">CRediT Contribution Roles (Pilih peran kontribusi penulis):</span>
                    <span className="text-[11px] text-zinc-400 font-mono">{author.creditRoles?.length || 0} Peran Dipilih</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CREDIT_ROLES.map(role => {
                      const isSelected = author.creditRoles?.includes(role);
                      return (
                        <button
                          key={role} type="button"
                          onClick={() => handleCreditToggle(index, role)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-[#c9a84c] text-black font-bold shadow-[0_0_10px_rgba(201,168,76,0.3)]' 
                              : 'bg-zinc-900/90 text-zinc-400 border border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ))}
            
            <button type="button" onClick={addAuthor} className="w-full py-4 border-2 border-dashed border-[#c9a84c]/40 rounded-2xl text-[#c9a84c] text-sm font-bold hover:bg-[#c9a84c]/10 flex items-center justify-center gap-2 transition-all">
              <Plus className="w-5 h-5" /> <span>Tambah Penulis Pendamping (Co-Author)</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: INTEGRITY, AI TRANSPARENCY & DATA AVAILABILITY */}
        <div className="p-8 lg:p-12 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center font-bold text-xl border border-[#c9a84c]/40">3</div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Layer 2 &amp; 4: Research Integrity &amp; Transparency</h2>
              <p className="text-xs text-zinc-400">Deklarasi transparansi AI, ketersediaan data empiris, etika riset, dan pendanaan.</p>
            </div>
          </div>

          {/* AI Transparency Record Sub-Panel */}
          <div className="p-6 bg-black/40 border border-[#c9a84c]/30 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="w-6 h-6 text-[#c9a84c]" />
                <div>
                  <h4 className="text-base font-bold text-white">AI Use &amp; Transparency Record™</h4>
                  <p className="text-xs text-zinc-400">Deklarasi resmi penggunaan kecerdasan buatan generatif dalam proses riset/penyusunan naskah.</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-zinc-300 font-semibold">{formData.ai_used ? 'Menggunakan AI' : 'Tidak Menggunakan AI'}</span>
                <input 
                  type="checkbox" name="ai_used" checked={formData.ai_used} onChange={handleChange}
                  className="w-5 h-5 accent-[#c9a84c] rounded"
                />
              </label>
            </div>

            {formData.ai_used && (
              <div className="space-y-5 pt-4 border-t border-zinc-800 animate-in fade-in">
                {/* Tools */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#c9a84c]">1. Tool AI yang Digunakan:</label>
                  <div className="flex flex-wrap gap-2">
                    {['ChatGPT (OpenAI)', 'Claude (Anthropic)', 'Gemini (Google)', 'Microsoft Copilot', 'Perplexity AI', 'Grammarly / QuillBot', 'Lainnya'].map(tool => (
                      <button
                        key={tool} type="button" onClick={() => handleArrayToggle('ai_tools', tool)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          formData.ai_tools.includes(tool) 
                            ? 'bg-[#c9a84c] text-black' 
                            : 'bg-zinc-900 border border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {tool}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purposes */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#c9a84c]">2. Tujuan Penggunaan:</label>
                  <div className="flex flex-wrap gap-2">
                    {['Language Editing / Grammar', 'Penerjemahan Bahasa', 'Literature Discovery', 'Bantuan Drafting Awal', 'Analisis Data / Statistik', 'Coding / Scripting', 'Visualisasi Grafik'].map(p => (
                      <button
                        key={p} type="button" onClick={() => handleArrayToggle('ai_purposes', p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          formData.ai_purposes.includes(p) 
                            ? 'bg-[#c9a84c] text-black' 
                            : 'bg-zinc-900 border border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Affected Sections */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#c9a84c]">3. Bagian Naskah yang Terbantu AI:</label>
                  <div className="flex flex-wrap gap-2">
                    {['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'Supplementary Materials'].map(sec => (
                      <button
                        key={sec} type="button" onClick={() => handleArrayToggle('ai_affected_sections', sec)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          formData.ai_affected_sections.includes(sec) 
                            ? 'bg-[#c9a84c] text-black' 
                            : 'bg-zinc-900 border border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Responsibility Statement */}
                <label className="flex items-start gap-3 p-4 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl cursor-pointer">
                  <input 
                    type="checkbox" name="ai_responsibility_accepted" 
                    checked={formData.ai_responsibility_accepted} onChange={handleChange} 
                    className="w-5 h-5 mt-0.5 accent-[#c9a84c] rounded flex-shrink-0" 
                  />
                  <div className="text-xs text-zinc-200 leading-relaxed">
                    <strong className="text-[#c9a84c] block mb-0.5">Author Responsibility &amp; Verification Confirmation</strong>
                    Selaku penulis, saya menyatakan telah menelaah, memverifikasi, dan menyetujui seluruh konten yang dihasilkan atau dimodifikasi oleh alat AI, serta memegang tanggung jawab penuh secara hukum dan akademik atas keaslian dan integritas naskah.
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Data Availability Statement */}
          <div className="p-6 bg-black/40 border border-zinc-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-[#c9a84c]" />
              <h4 className="text-base font-bold text-white">Data Availability Statement (Transparansi Data)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">Status Akses Data</label>
                <select 
                  name="data_availability_status" value={formData.data_availability_status} onChange={handleChange}
                  className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white text-xs"
                >
                  <option value="OPEN_REPOSITORY">Data Tersedia Terbuka di Repositori / Lampiran</option>
                  <option value="UPON_REASONABLE_REQUEST">Data Tersedia atas Permintaan Wajar ke Penulis Koresponden</option>
                  <option value="RESTRICTED_ETHICAL">Data Terbatas karena Alasan Etika, Privasi, atau Perjanjian Kerahasiaan</option>
                  <option value="NOT_APPLICABLE">Tidak Menggunakan Data Empiris (Studi Konseptual/Pustaka)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300">URL Repositori Data / DOI (Jika Terbuka)</label>
                <input 
                  type="url" name="data_repository_url" value={formData.data_repository_url} onChange={handleChange}
                  className="w-full bg-[#111120] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white text-xs"
                  placeholder="https://zenodo.org/record/... atau https://osf.io/..."
                />
              </div>
            </div>
          </div>

          {/* Ethics, Funding, and COI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-black/40 border border-zinc-800 rounded-xl space-y-3">
              <h5 className="text-xs font-bold text-[#c9a84c]">Persetujuan Etik (Ethics Clearance)</h5>
              <select 
                name="ethics_status" value={formData.ethics_status} onChange={handleChange}
                className="w-full bg-[#111120] border border-zinc-700 rounded-lg px-2.5 py-2 text-white text-xs"
              >
                <option value="NOT_REQUIRED">Tidak Memerlukan Izin Khusus (Non-Human/Non-Sensitive)</option>
                <option value="APPROVAL_OBTAINED">Telah Memperoleh Persetujuan Etik (Clearance)</option>
                <option value="EXEMPTION_GRANTED">Memperoleh Pengecualian Resmi (Exemption)</option>
                <option value="NOT_APPLICABLE">Not Applicable</option>
              </select>
              {formData.ethics_status === 'APPROVAL_OBTAINED' && (
                <input 
                  type="text" name="ethics_protocol_number" value={formData.ethics_protocol_number} onChange={handleChange}
                  placeholder="Nomor Protokol / Komite Etik..." className="w-full bg-[#111120] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              )}
            </div>

            <div className="p-5 bg-black/40 border border-zinc-800 rounded-xl space-y-3">
              <h5 className="text-xs font-bold text-[#c9a84c]">Sumber Pendanaan (Funding)</h5>
              <select 
                name="funding_status" value={formData.funding_status} onChange={handleChange}
                className="w-full bg-[#111120] border border-zinc-700 rounded-lg px-2.5 py-2 text-white text-xs"
              >
                <option value="NO_EXTERNAL_FUNDING">Riset Mandiri (Tanpa Dana Eksternal)</option>
                <option value="FUNDED">Didanai oleh Lembaga / Hibah Riset</option>
              </select>
              {formData.funding_status === 'FUNDED' && (
                <input 
                  type="text" name="funding_agency" value={formData.funding_agency} onChange={handleChange}
                  placeholder="Nama Lembaga / No. Hibah..." className="w-full bg-[#111120] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                />
              )}
            </div>

            <div className="p-5 bg-black/40 border border-zinc-800 rounded-xl space-y-3">
              <h5 className="text-xs font-bold text-[#c9a84c]">Konflik Kepentingan (COI)</h5>
              <select 
                name="coi_status" value={formData.coi_status} onChange={handleChange}
                className="w-full bg-[#111120] border border-zinc-700 rounded-lg px-2.5 py-2 text-white text-xs"
              >
                <option value="NO_CONFLICT">Bebas Konflik Kepentingan</option>
                <option value="COMPETING_INTERESTS_DECLARED">Terdapat Benturan Kepentingan</option>
              </select>
            </div>
          </div>

          {/* Bibliography & Cover Letter */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#c9a84c]">Daftar Pustaka (Bibliography) <span className="text-red-500">*</span></label>
              <textarea 
                name="bibliography" required value={formData.bibliography} onChange={handleChange} rows={5}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl p-4 text-white text-xs font-mono leading-relaxed"
                placeholder="Paste seluruh daftar referensi dari naskah Anda di sini..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#c9a84c]">Surat Pengantar untuk Editor (Cover Letter) <span className="text-zinc-500 font-normal">(Opsional)</span></label>
              <textarea 
                name="cover_letter" value={formData.cover_letter} onChange={handleChange} rows={3}
                className="w-full bg-[#0a0a14] border border-zinc-700/80 rounded-xl p-4 text-white text-sm"
                placeholder="Jelaskan signifikansi utama temuan Anda untuk redaksi..."
              />
            </div>
          </div>

        </div>

        {/* SECTION 4: FILE UPLOAD */}
        <div className="p-8 lg:p-12 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center font-bold text-xl border border-[#c9a84c]/40">4</div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Unggah Berkas Naskah</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-dashed border-zinc-600 bg-[#0a0a14] rounded-2xl p-6 text-center hover:border-[#c9a84c]">
              <Upload className="w-8 h-8 text-[#c9a84c] mx-auto mb-3" />
              <label className="block text-sm font-bold text-white mb-1">Title Page <span className="text-red-500">*</span></label>
              <p className="text-xs text-zinc-400 mb-4">Berkas lengkap mencantumkan identitas penulis.</p>
              <input type="file" required onChange={e => setFiles({...files, titlePage: e.target.files?.[0] || null})} className="w-full text-xs text-zinc-300 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#c9a84c] file:text-black cursor-pointer" />
            </div>

            <div className="border-2 border-dashed border-zinc-600 bg-[#0a0a14] rounded-2xl p-6 text-center hover:border-[#c9a84c]">
              <Upload className="w-8 h-8 text-[#c9a84c] mx-auto mb-3" />
              <label className="block text-sm font-bold text-white mb-1">Naskah Anonim <span className="text-red-500">*</span></label>
              <p className="text-xs text-zinc-400 mb-4">Berkas tanpa nama penulis (Blind Review).</p>
              <input type="file" required onChange={e => setFiles({...files, anonymous: e.target.files?.[0] || null})} className="w-full text-xs text-zinc-300 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#c9a84c] file:text-black cursor-pointer" />
            </div>

            <div className="border-2 border-dashed border-zinc-700 bg-[#0a0a14] rounded-2xl p-6 text-center hover:border-zinc-500">
              <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
              <label className="block text-sm font-bold text-white mb-1">Data Pendukung <span className="text-zinc-500 font-normal">(Opsional)</span></label>
              <p className="text-xs text-zinc-400 mb-4">Dataset, instrumen, atau lampiran ekstra.</p>
              <input type="file" onChange={e => setFiles({...files, supporting: e.target.files?.[0] || null})} className="w-full text-xs text-zinc-400 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        {/* SECTION 5: SUBMISSION INTEGRITY PLEDGE */}
        <div className="p-8 lg:p-12 space-y-6 bg-gradient-to-b from-[#111120] to-[#0a0a16]">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-[#c9a84c]" />
            <h3 className="text-xl font-bold text-white">Pernyataan Integritas Penyerahan Naskah Ilmiah</h3>
          </div>

          <div className="space-y-3 bg-black/40 border border-[#c9a84c]/20 p-5 rounded-xl text-xs text-zinc-300">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="pledge_originality" checked={formData.pledge_originality} onChange={handleChange} className="w-4 h-4 mt-0.5 accent-[#c9a84c] rounded" />
              <span><strong>Orisinalitas</strong>: Naskah ini adalah karya orisinal para penulis dan tidak mengandung plagiarisme atau fabrikasi data.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="pledge_no_dual_submission" checked={formData.pledge_no_dual_submission} onChange={handleChange} className="w-4 h-4 mt-0.5 accent-[#c9a84c] rounded" />
              <span><strong>Bebas Submisi Ganda</strong>: Naskah ini belum pernah dipublikasikan dan tidak sedang dalam proses telaah di jurnal lain.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="pledge_coauthors_approved" checked={formData.pledge_coauthors_approved} onChange={handleChange} className="w-4 h-4 mt-0.5 accent-[#c9a84c] rounded" />
              <span><strong>Persetujuan Seluruh Penulis</strong>: Seluruh penulis yang tercantum telah menelaah dan menyetujui versi akhir naskah ini.</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="pledge_accuracy_accepted" checked={formData.pledge_accuracy_accepted} onChange={handleChange} className="w-4 h-4 mt-0.5 accent-[#c9a84c] rounded" />
              <span><strong>Tanggung Jawab Data</strong>: Penulis memegang tanggung jawab mutlak atas akurasi data, etika, dan konten yang diserahkan.</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !isPledgeComplete}
            className="w-full py-5 bg-gradient-to-r from-[#c9a84c] via-[#e8c96a] to-[#c9a84c] text-black font-extrabold text-lg rounded-2xl hover:scale-[1.01] transition-all shadow-[0_4px_25px_rgba(201,168,76,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            <Send className="w-6 h-6" />
            <span>{loading ? "Memproses & Mencatat ke Event Ledger..." : "Kirimkan Naskah Resmi ke APASIFIC"}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
