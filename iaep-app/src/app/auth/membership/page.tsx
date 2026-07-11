"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import Image from "next/image";

export default function MajesticMembershipPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    academicLevel: "S2",
    internationalId: "",
    university: "",
  });

  const [buktiTransfer, setBuktiTransfer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Members Table State
  const [members, setMembers] = useState<any[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [selectedMemberCard, setSelectedMemberCard] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 20;

  const countries = [
    "Indonesia", "Malaysia", "Singapore", "Thailand", "Vietnam", 
    "Philippines", "Japan", "South Korea", "China", "India", "Australia", "Other"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiTransfer(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCountryCode = (country: string) => {
    const map: Record<string, string> = {
      "Indonesia": "ID", "Malaysia": "MY", "Singapore": "SG", "Thailand": "TH", 
      "Vietnam": "VN", "Philippines": "PH", "Japan": "JP", "South Korea": "KR", 
      "China": "CN", "India": "IN", "Australia": "AU"
    };
    return map[country] || "XX";
  };
  
  const getLevelCode = (lvl: string) => {
    if (lvl === "Institusi") return "INS";
    return lvl || "XX";
  };

  const currentYear = new Date().getFullYear().toString().slice(2);
  const previewCountryCode = getCountryCode(formData.country);
  const previewLevelCode = getLevelCode(formData.academicLevel);
  const previewId = `ASIA-${previewCountryCode}${currentYear}-${previewLevelCode}001`;

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch('/api/membership');
        const data = await res.json();
        if (data.applications) {
          // We can show all members or only approved. We show all by default for now.
          setMembers(data.applications);
        }
      } catch (err) {
        console.error("Failed to fetch members:", err);
      } finally {
        setIsMembersLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const downloadCard = (cardId: string, buttonId: string, side: string) => {
    const btn = document.getElementById(buttonId);
    const originalText = btn ? btn.innerHTML : '';
    if (btn) btn.innerHTML = "Memproses...";
    
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = () => {
      const card = document.getElementById(cardId);
      if (card) {
        (window as any).html2canvas(card, { scale: 3, backgroundColor: null, useCORS: true }).then((canvas: any) => {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `ASIA_Card_${side}_${selectedMemberCard?.id?.split('-')[0] || 'Member'}.jpg`;
          link.click();
          if (btn) btn.innerHTML = originalText;
        });
      }
    };
    document.body.appendChild(script);
  };


  const totalPages = Math.ceil(members.length / membersPerPage);
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.academicLevel === 'Institusi') {
      alert('Institutions must establish an MoU with ASIA. Redirecting to Admin contact...');
      return;
    }
    
    if (!buktiTransfer) {
      alert("Harap upload bukti transfer terlebih dahulu.");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        buktiTransfer,
      };
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal mendaftar");
      }

      const textMessage = `New Member\nNama: ${formData.fullName}\nEmail: ${formData.email}\nNo. HP: ${formData.phone}\nAsal Negara: ${formData.country}\nInstitusi: ${formData.university}\nTingkat: ${formData.academicLevel}\n\nMohon verifikasi pendaftaran saya.\n*(Harap lampirkan foto/file bukti transfer Anda di chat ini)*`;
      const waUrl = `https://wa.me/62811665212?text=${encodeURIComponent(textMessage)}`;
      
      alert("Pendaftaran Berhasil! Anda akan diarahkan ke WhatsApp Admin untuk konfirmasi.");
      document.cookie = "mock_user=member; path=/";
      window.location.href = waUrl;
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-[#e8e8f0] flex flex-col items-center relative overflow-hidden" style={{ padding: '40px 16px' }}>
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 bg-[#c9a84c] rounded-full mix-blend-color-dodge filter blur-[128px] opacity-20 animate-blob z-0" style={{ width: '384px', height: '384px' }}></div>
      <div className="absolute top-0 right-1/4 bg-[#c9a84c] rounded-full mix-blend-color-dodge filter blur-[128px] opacity-10 animate-blob animation-delay-2000 z-0" style={{ width: '384px', height: '384px' }}></div>

      <div className="w-full mx-auto relative z-10" style={{ maxWidth: '1280px', width: '100%' }}>
        
        <Link href="/">
          <div className="flex items-center group cursor-pointer w-fit" style={{ marginBottom: '32px', gap: '12px' }}>
            <div className="rounded-full border-2 border-[#c9a84c] flex items-center justify-center text-[#c9a84c] group-hover:bg-[#c9a84c] group-hover:text-black transition-all" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </div>
            <span className="font-semibold text-gray-400 group-hover:text-white transition-colors">Kembali ke Beranda</span>
          </div>
        </Link>

        <div className="w-full flex flex-col items-center justify-center text-center mx-auto" style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h1 className="font-bold tracking-tight text-center" style={{ fontFamily: 'Cinzel, serif', fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>
            Keanggotaan Eksklusif <span className="text-[#c9a84c]">ASIA</span>
          </h1>
          <p className="text-gray-400 mx-auto text-center" style={{ fontSize: '18px', maxWidth: '672px', textAlign: 'center' }}>
            Bergabunglah dengan lingkaran elit akademisi Asia Pasifik. Isi formulir di bawah ini untuk segera membuat Kartu Anggota Akademik Internasional resmi Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-[1200px] mx-auto">
          
          {/* Left Column: Form Inputs */}
          <div className="flex-1 bg-[#0d0d1a]/80 border border-[#c9a84c]/20 shadow-2xl backdrop-blur-md w-full" style={{ padding: '32px', borderRadius: '16px' }}>
            <h2 className="font-bold text-[#c9a84c] border-b border-gray-800" style={{ fontSize: '24px', marginBottom: '24px', paddingBottom: '16px', textAlign: 'center' }}>Formulir Pendaftaran Keanggotaan</h2>
            
            <div className="mt-4">
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Nama Lengkap (beserta Gelar)</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Mis. Prof. Dr. Budi Santoso, M.Sc." className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
                </div>
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>ID Akademik Internasional (Opsional)</label>
                  <input type="text" name="internationalId" value={formData.internationalId} onChange={handleChange} placeholder="Mis. ORCID, Scopus ID, WOS" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} />
                </div>

                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Alamat Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nama@universitas.edu" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
                </div>
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Phone / WhatsApp</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+62 812-3456-7890" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
                </div>

                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Negara Asal</label>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all appearance-none" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required>
                    <option value="" disabled className="bg-[#12121f]">Pilih Negara</option>
                    {countries.map(c => <option key={c} value={c} className="bg-[#12121f]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Tingkat Pendidikan</label>
                  <select name="academicLevel" value={formData.academicLevel} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all appearance-none" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required>
                    <option value="S2" className="bg-[#12121f]">S2 (Magister)</option>
                    <option value="S3" className="bg-[#12121f]">S3 (Doctorate)</option>
                    <option value="Profesor" className="bg-[#12121f]">Profesor</option>
                    <option value="Praktisi" className="bg-[#12121f]">Praktisi (Professional)</option>
                    <option value="Institusi" className="bg-[#12121f]">Institusi (Organization)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Universitas / Institusi</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="Mis. Universitas Nasional" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
                </div>
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Kata Sandi</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 karakter" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required minLength={6} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payment & Card Preview */}
          <div className="w-full lg:w-[450px] flex flex-col gap-8">
            
            {/* Top Right: Payment Section */}
            <div>
                {formData.academicLevel === 'Institusi' ? (
                  <div className="bg-[#05050a]/80 border border-[#c9a84c]/40 text-center animate-fade-in shadow-[0_0_30px_rgba(201,168,76,0.15)]" style={{ borderRadius: '12px', padding: '24px' }}>
                    <div className="bg-yellow-900/50 text-yellow-500 flex items-center justify-center mx-auto border border-yellow-500/30" style={{ width: '48px', height: '48px', borderRadius: '50%', marginBottom: '12px' }}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-white" style={{ fontSize: '20px', marginBottom: '8px' }}>Diperlukan MoU</h3>
                    <p className="text-gray-400" style={{ fontSize: '14px', marginBottom: '16px' }}>
                      Institusi harus memiliki Memorandum of Understanding (MoU) dengan ASIA sebelum mendaftarkan beberapa anggota.
                    </p>
                    <div className="flex justify-center" style={{ gap: '12px' }}>
                      <button type="button" onClick={() => alert('Redirecting to Contact Page...')} className="bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-semibold transition-colors" style={{ padding: '8px 16px', borderRadius: '4px', fontSize: '14px' }}>Hubungi Admin</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#05050a]/80 border border-[#c9a84c]/40 text-center animate-fade-in shadow-[0_0_30px_rgba(201,168,76,0.15)]" style={{ borderRadius: '12px', padding: '24px' }}>
                    <h3 className="font-bold text-[#c9a84c]" style={{ fontSize: '16px', marginBottom: '12px' }}>INSTRUKSI PEMBAYARAN & AKTIVASI</h3>
                    <p className="text-gray-300" style={{ fontSize: '13px', marginBottom: '16px' }}>
                      Biaya Administrasi Ujian Sertifikasi / Membership sebesar <b>Rp 500.000</b> (berlaku 3 tahun) ditransfer ke rekening:
                    </p>
                    
                    <div className="bg-black/50 border border-gray-700 inline-block text-left w-full max-w-sm" style={{ padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                      <p className="text-gray-400 font-semibold" style={{ fontSize: '12px', marginBottom: '4px' }}>Association of Asia Pacific Academician</p>
                      <p className="text-gray-300 uppercase tracking-wider" style={{ fontSize: '12px', marginBottom: '4px' }}>Bank Negara Indonesia (BNI)</p>
                      <p className="font-mono text-[#4ade80]" style={{ fontSize: '18px', marginBottom: '4px', letterSpacing: '1px' }}>7006002218</p>
                      <p className="text-gray-500 uppercase tracking-wider" style={{ fontSize: '10px', marginBottom: '12px' }}>Swift Code: BNINIDJA</p>
                      
                      <div className="flex flex-col border-t border-gray-800" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-200 font-bold uppercase tracking-widest" style={{ fontSize: '13px' }}>Total Tagihan:</span>
                          <span className="font-extrabold text-[#c9a84c] drop-shadow-md" style={{ fontSize: '24px' }}>Rp 500.000</span>
                        </div>
                        <div className="flex justify-between items-center mt-3 bg-black/30 p-2 rounded-md border border-gray-700/50">
                          <span className="text-gray-300 font-semibold tracking-wide" style={{ fontSize: '13px' }}>Mata Uang Anda:</span>
                          <select className="bg-transparent text-[#c9a84c] hover:text-[#e8c97a] text-[15px] font-bold border-none outline-none cursor-pointer appearance-none text-right transition-colors">
                            <option className="bg-[#05050a]">≈ $ 33.00 USD (Dolar AS)</option>
                            <option className="bg-[#05050a]">≈ € 30.50 EUR (Euro)</option>
                            <option className="bg-[#05050a]">≈ RM 148.00 MYR (Ringgit)</option>
                            <option className="bg-[#05050a]">≈ $ 44.50 SGD (Dolar SG)</option>
                            <option className="bg-[#05050a]">≈ ¥ 5,100 JPY (Yen jepang)</option>
                            <option className="bg-[#05050a]">≈ ₹ 2,750 INR (Rupee India)</option>
                            <option className="bg-[#05050a]">≈ ฿ 1,150 THB (Baht Thailand)</option>
                            <option className="bg-[#05050a]">≈ ₫ 840,000 VND (Dong Vietnam)</option>
                            <option className="bg-[#05050a]">≈ $ 260 HKD (Dolar Hong Kong)</option>
                            <option className="bg-[#05050a]">≈ $ 55 NZD (Dolar Selandia Baru)</option>
                            <option className="bg-[#05050a]">≈ ৳ 3,900 BDT (Taka Bangladesh)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-left">
                        <label className="block text-gray-300 tracking-wider uppercase font-semibold mb-2" style={{ fontSize: '11px' }}>
                          Upload Bukti Transfer (Wajib)
                        </label>
                        <input 
                          type="file" 
                          accept="image/*,.pdf" 
                          onChange={handleFileChange}
                          required
                          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#c9a84c]/10 file:text-[#c9a84c] hover:file:bg-[#c9a84c]/20"
                        />
                        {buktiTransfer && <p className="text-green-400 mt-2 text-xs">✓ Bukti telah dipilih</p>}
                      </div>
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold tracking-wide uppercase shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50" style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '14px' }}>
                      {isLoading ? "Memproses..." : "Submit & Buat Kartu"}
                    </button>
                  </div>
                )}
              </div>

            {/* Bottom Right: Live Member Card */}
            <div className="flex flex-col items-center justify-start w-full max-w-[400px] mx-auto">
              <h3 className="text-gray-400 font-semibold text-center tracking-widest uppercase" style={{ marginBottom: '16px', fontSize: '14px' }}>Pratinjau Kartu Real-Time</h3>
            
            {/* The Card */}
            <div 
              className="w-full max-w-sm relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#c9a84c]/40 group transition-all duration-500 hover:shadow-[0_20px_60px_rgba(201,168,76,0.2)] bg-cover bg-center"
              style={{ backgroundImage: 'url(/card-bg.png)', borderRadius: '16px', padding: '24px', aspectRatio: '1.586/1' }}
            >
              {/* Card Dark Overlay so text is readable */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/60 to-[#0a0810]/80 z-0"></div>

              {/* Card Background Ornaments */}
              <div className="absolute bg-[#c9a84c] rounded-full mix-blend-overlay filter blur-[64px] opacity-40 z-0" style={{ right: '-64px', top: '-64px', width: '192px', height: '192px' }}></div>
              <div className="absolute bg-[#c9a84c] rounded-full mix-blend-overlay filter blur-[64px] opacity-30 z-0" style={{ left: '-64px', bottom: '-64px', width: '192px', height: '192px' }}></div>
              
              {/* Fake Chip */}
              <div className="absolute rounded bg-gradient-to-br from-[#e8c97a] to-[#9a7a30] opacity-90 flex items-center justify-center z-10 shadow-inner" style={{ left: '24px', top: '96px', width: '48px', height: '36px' }}>
                <div className="border border-black/20 rounded-sm" style={{ width: '32px', height: '20px' }}></div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[#c9a84c] font-bold tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif', fontSize: '14px' }}>ASIA</h4>
                    <p className="text-gray-400 uppercase tracking-wider max-w-[120px]" style={{ fontSize: '8px' }}>Association of Asia Pacific Academician</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-apasific.png" alt="Logo" className="object-contain drop-shadow-md" style={{ width: '52px', height: '52px' }} />
                </div>

                {/* Body / User Info */}
                <div className="mt-auto" style={{ paddingBottom: '8px' }}>
                  <p className="text-[#c9a84c] uppercase tracking-wider" style={{ fontSize: '10px', marginBottom: '4px' }}>Anggota Resmi</p>
                  <h2 className="font-bold text-white uppercase tracking-wide line-clamp-2 leading-snug drop-shadow-md" style={{ fontSize: '13px', minHeight: '32px', paddingRight: '12px' }}>
                    {formData.fullName || "NAMA ANDA DI SINI"}
                  </h2>
                  <div className="flex text-gray-300" style={{ gap: '16px', marginTop: '8px' }}>
                    <div>
                      <p className="uppercase text-gray-500" style={{ fontSize: '8px' }}>ID Akademik</p>
                      <p className="font-mono tracking-widest" style={{ fontSize: '12px' }}>{formData.internationalId || previewId}</p>
                    </div>
                    <div>
                      <p className="uppercase text-gray-500" style={{ fontSize: '8px' }}>Tingkat</p>
                      <p className="font-mono tracking-widest" style={{ fontSize: '12px' }}>{formData.academicLevel}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="absolute opacity-90 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ right: '24px', bottom: '24px', padding: '6px', borderRadius: '8px' }}>
                <QRCode
                  value="https://www.apasific.org"
                  size={36}
                  bgColor="transparent"
                  fgColor="#ffffff"
                  level="L"
                />
              </div>
            </div>

            <p className="text-gray-500 text-center" style={{ fontSize: '12px', marginTop: '24px', maxWidth: '320px' }}>
              Kartu ini akan terdaftar secara resmi di jaringan global ASIA setelah pembayaran dan verifikasi berhasil.
            </p>
          </div>
        </div>
      </form>

      {/* Members List Table Mockup */}
      <div className="w-full max-w-[1200px] mx-auto mt-16 animate-fade-in" style={{ marginTop: '64px' }}>
        <div className="bg-[#0d0d1a]/80 border border-[#c9a84c]/20 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="border-b border-gray-800" style={{ padding: '24px 32px' }}>
            <h2 className="font-bold text-[#c9a84c]" style={{ fontSize: '20px' }}>Daftar Anggota Terdaftar (Terbaru)</h2>
            <p className="text-gray-400" style={{ fontSize: '14px', marginTop: '4px' }}>Daftar di bawah ini merupakan pratinjau anggota yang telah tervalidasi.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-gray-800">
                  <th className="py-4 px-6 text-gray-300 font-semibold uppercase tracking-wider text-xs">Nama</th>
                  <th className="py-4 px-6 text-gray-300 font-semibold uppercase tracking-wider text-xs">Institusi/Universitas</th>
                  <th className="py-4 px-6 text-gray-300 font-semibold uppercase tracking-wider text-xs">No HP</th>
                  <th className="py-4 px-6 text-gray-300 font-semibold uppercase tracking-wider text-xs">Tanggal Terdaftar</th>
                  <th className="py-4 px-6 text-gray-300 font-semibold uppercase tracking-wider text-xs">Habis Masa Berlaku</th>
                  <th className="py-4 px-6 text-gray-300 font-semibold uppercase tracking-wider text-xs text-center">Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {isMembersLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Memuat data anggota...
                    </td>
                  </tr>
                ) : currentMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Belum ada anggota yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  currentMembers.map((member: any) => {
                    const regDate = new Date(member.created_at);
                    const expDate = new Date(regDate);
                    expDate.setFullYear(regDate.getFullYear() + 3);
                    
                    const formatOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
                    const regDateStr = regDate.toLocaleDateString('id-ID', formatOptions);
                    const expDateStr = expDate.toLocaleDateString('id-ID', formatOptions);

                    return (
                      <tr key={member.id} className="hover:bg-[#c9a84c]/5 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{member.full_name}</div>
                          <div className="text-gray-500 font-mono text-xs mt-1">{member.international_id || member.id.split('-')[0]}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-400 text-sm">{member.university}</td>
                        <td className="py-4 px-6 text-gray-400 font-mono text-sm">{member.phone}</td>
                        <td className="py-4 px-6 text-gray-400 text-sm">{regDateStr}</td>
                        <td className="py-4 px-6">
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 rounded px-2 py-1 text-xs font-semibold">
                            {expDateStr}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button onClick={() => setSelectedMemberCard(member)} className="text-[#c9a84c] hover:text-[#e8c97a] hover:scale-110 transition-transform bg-[#c9a84c]/10 p-2 rounded-full border border-[#c9a84c]/20" title="Lihat Kartu">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t border-gray-800 bg-black/20 p-4 flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                Menampilkan {indexOfFirstMember + 1} hingga {Math.min(indexOfLastMember, members.length)} dari {members.length} anggota
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md bg-[#05050a] border border-gray-700 text-gray-400 hover:text-white hover:border-[#c9a84c] disabled:opacity-50 disabled:hover:border-gray-700 disabled:hover:text-gray-400 transition-colors text-sm font-semibold"
                >
                  Sebelumnya
                </button>
                <div className="flex items-center px-2 text-[#c9a84c] font-semibold text-sm">
                  {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md bg-[#05050a] border border-gray-700 text-gray-400 hover:text-white hover:border-[#c9a84c] disabled:opacity-50 disabled:hover:border-gray-700 disabled:hover:text-gray-400 transition-colors text-sm font-semibold"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Download Card Modal */}
      {selectedMemberCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:bg-white print:p-0">
          <div className="bg-[#0d0d1a] print:bg-transparent border border-[#c9a84c]/30 print:border-none rounded-2xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col items-center relative print:p-0 print:shadow-none print:max-h-none print:overflow-visible">
            <button onClick={() => setSelectedMemberCard(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white print:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-[#c9a84c] text-lg font-bold uppercase tracking-widest mb-6 print:hidden">Pratinjau Kartu Digital</h3>
            
            <div id="print-card-area" className="flex flex-col gap-4 items-center print:gap-8" style={{ width: '100%', maxWidth: '384px' }}>
              
              {/* Front Card */}
              <div id="print-card-front" className="w-full relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] print:shadow-none border border-[#c9a84c]/40 print:border-none bg-cover bg-center" style={{ backgroundImage: 'url(/card-bg.png)', borderRadius: '16px', padding: '24px', aspectRatio: '1.586/1' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/60 to-[#0a0810]/80 z-0"></div>
                <div className="absolute bg-[#c9a84c] rounded-full mix-blend-overlay filter blur-[64px] opacity-40 z-0" style={{ right: '-64px', top: '-64px', width: '192px', height: '192px' }}></div>
                <div className="absolute bg-[#c9a84c] rounded-full mix-blend-overlay filter blur-[64px] opacity-30 z-0" style={{ left: '-64px', bottom: '-64px', width: '192px', height: '192px' }}></div>
                
                <div className="absolute rounded bg-gradient-to-br from-[#e8c97a] to-[#9a7a30] opacity-90 flex items-center justify-center z-10 shadow-inner" style={{ left: '24px', top: '96px', width: '48px', height: '36px' }}>
                  <div className="border border-black/20 rounded-sm" style={{ width: '32px', height: '20px' }}></div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[#c9a84c] font-bold tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif', fontSize: '14px' }}>ASIA</h4>
                      <p className="text-gray-400 uppercase tracking-wider max-w-[120px]" style={{ fontSize: '8px' }}>Association of Asia Pacific Academician</p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-apasific.png" alt="Logo" className="object-contain drop-shadow-md" style={{ width: '52px', height: '52px' }} />
                  </div>

                  <div className="mt-auto" style={{ paddingBottom: '8px' }}>
                    <p className="text-[#c9a84c] uppercase tracking-wider" style={{ fontSize: '10px', marginBottom: '4px' }}>Anggota Resmi</p>
                    <h2 className="font-bold text-white uppercase tracking-wide line-clamp-2 leading-snug drop-shadow-md" style={{ fontSize: '13px', minHeight: '32px', paddingRight: '12px' }}>
                      {selectedMemberCard.full_name}
                    </h2>
                    <div className="flex text-gray-300" style={{ gap: '16px', marginTop: '8px' }}>
                      <div>
                        <p className="uppercase text-gray-500" style={{ fontSize: '8px' }}>ID Akademik</p>
                        <p className="font-mono tracking-widest" style={{ fontSize: '12px' }}>{selectedMemberCard.international_id || selectedMemberCard.id.split('-')[0]}</p>
                      </div>
                      <div>
                        <p className="uppercase text-gray-500" style={{ fontSize: '8px' }}>Tingkat</p>
                        <p className="font-mono tracking-widest" style={{ fontSize: '12px' }}>{selectedMemberCard.academic_level}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute opacity-90 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ right: '24px', bottom: '24px', padding: '6px', borderRadius: '8px' }}>
                  <QRCode value="https://www.apasific.org" size={36} bgColor="transparent" fgColor="#ffffff" level="L" />
                </div>
              </div>

              {/* Back Card */}
              <div id="print-card-back" className="w-full relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] print:shadow-none border border-[#c9a84c]/40 print:border-none bg-cover bg-center" style={{ backgroundImage: 'url(/card-bg.png)', borderRadius: '16px', padding: '20px', aspectRatio: '1.586/1' }}>
                 <div className="absolute inset-0 bg-[#05050a]/95 z-0"></div>
                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <h4 className="text-[#c9a84c] font-bold tracking-widest uppercase mb-2 border-b border-[#c9a84c]/30 pb-1" style={{ fontSize: '11px' }}>Terms &amp; Conditions</h4>
                      <ol className="text-gray-300 list-decimal pl-3 space-y-1 font-serif" style={{ fontSize: '8px', lineHeight: '1.4' }}>
                        <li>Kartu ini diterbitkan oleh Association of Asia Pacific Academician (ASIA) dan tidak dapat dipindahtangankan.</li>
                        <li>Pemegang kartu ini adalah anggota resmi yang terikat dengan kode etik akademik, visi, dan misi ASIA.</li>
                        <li>Kartu ini sah digunakan sebagai tanda pengenal eksklusif untuk mengakses layanan, fasilitas, dan jurnal ASIA.</li>
                        <li>Jika kartu ini hilang atau disalahgunakan, harap segera melaporkan ke sekretariat ASIA di <span className="text-[#c9a84c]">info@apasific.org</span>.</li>
                      </ol>
                    </div>
                    <div className="flex justify-between items-end w-full px-2 mt-auto relative">
                      {/* Stamp Logo */}
                      <div className="absolute left-1/2 bottom-[20px] pointer-events-none opacity-80 z-0 flex items-center justify-center mix-blend-screen" style={{ width: '80px', height: '80px', transform: 'translateX(-50%) rotate(-15deg)' }}>
                        <img src="/logo-apasific.png" alt="Stamp" className="w-full h-full object-contain" style={{ filter: 'grayscale(100%) sepia(100%) hue-rotate(230deg) saturate(300%) brightness(1.2) contrast(1.5)' }} />
                      </div>

                      <div className="text-center w-[160px] relative z-10">
                         <div style={{ minHeight: '36px' }} className="flex items-end justify-center pb-1">
                           <span className="text-white font-bold leading-tight" style={{ fontSize: '7px', fontFamily: 'Arial, sans-serif' }}>DR. ARFAN IKHSAN LUBIS., SE., M.Si., CATr</span>
                         </div>
                         <div className="border-t border-[#c9a84c] pt-1 mt-1">
                           <p className="text-[#c9a84c] font-bold uppercase tracking-wider" style={{ fontSize: '7px', fontFamily: 'Arial, sans-serif' }}>President of ASIA</p>
                         </div>
                      </div>
                      
                      <div className="text-center w-[160px]">
                         <div style={{ minHeight: '36px' }} className="flex items-end justify-center pb-1">
                           <span className="text-white font-bold leading-tight" style={{ fontSize: '8px', fontFamily: 'Arial, sans-serif' }}>Dr. Ngatimin, M.Si</span>
                         </div>
                         <div className="border-t border-[#c9a84c] pt-1 mt-1">
                           <p className="text-[#c9a84c] font-bold uppercase tracking-wider" style={{ fontSize: '7px', fontFamily: 'Arial, sans-serif' }}>General Secretary</p>
                         </div>
                      </div>
                    </div>
                 </div>
              </div>

            </div>

            <div className="mt-10 flex gap-4 w-full print:hidden" style={{ marginTop: '32px' }}>
               <button id="btn-download-front" onClick={() => downloadCard('print-card-front', 'btn-download-front', 'Depan')} className="flex-1 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold tracking-wide uppercase py-3 rounded-lg shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all flex items-center justify-center gap-2" style={{ fontSize: '13px' }}>
                 <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Simpan Kartu Depan
               </button>
               <button id="btn-download-back" onClick={() => downloadCard('print-card-back', 'btn-download-back', 'Belakang')} className="flex-1 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold tracking-wide uppercase py-3 rounded-lg shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-all flex items-center justify-center gap-2" style={{ fontSize: '13px' }}>
                 <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Simpan Kartu Belakang
               </button>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * { visibility: hidden !important; }
              #print-card-area, #print-card-area * { visibility: visible !important; }
              #print-card-area { 
                position: absolute !important; 
                left: 50% !important; 
                top: 50% !important; 
                transform: translate(-50%, -50%) scale(1.8) !important; 
                margin: 0 !important; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page { margin: 0; size: landscape; }
            }
          `}} />
        </div>
      )}

    </div>
  );
}
