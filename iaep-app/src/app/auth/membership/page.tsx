"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import Image from "next/image";

const formatDateYYMMDD = (dateString?: string | null, addYears: number = 0) => {
  const d = dateString ? new Date(dateString) : new Date();
  d.setFullYear(d.getFullYear() + addYears);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${yyyy}`; // Format diubah menjadi MM/YYYY untuk memperjelas masa berlaku 3 tahun
};

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
    discipline: "",
  });

  const [buktiTransfer, setBuktiTransfer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Members Table State
  const [members, setMembers] = useState<any[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [selectedMemberCard, setSelectedMemberCard] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 10;

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
        const img = new window.Image();
        img.src = reader.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setBuktiTransfer(compressedDataUrl);
        };

        img.onerror = () => {
          // If it's not an image (e.g. PDF), just use the raw base64
          // but warn if it's too large
          if (file.size > 2 * 1024 * 1024) {
            alert("File dokumen terlalu besar (Maks 2MB). Silakan gunakan format Gambar (JPG/PNG) agar bisa dikompres otomatis.");
            e.target.value = '';
          } else {
            setBuktiTransfer(reader.result as string);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch('/api/membership');
        const data = await res.json();
        if (data.applications) {
          // Only show approved members in this public list
          const approvedMembers = data.applications.filter((member: any) => member.status === 'Approved');
          setMembers(approvedMembers);
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
    
    const executeDownload = () => {
      const card = document.getElementById(cardId);
      if (card && (window as any).domtoimage) {
        (window as any).domtoimage.toJpeg(card, { quality: 0.95, bgcolor: '#000000' }).then((dataUrl: string) => {
          try {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `ASIA_Card_${side}_${selectedMemberCard?.id?.split('-')[0] || 'Member'}.jpg`;
            link.click();
          } catch (e) {
            console.error("Download error:", e);
            alert("Gagal mengunduh kartu. Coba gunakan perangkat lain atau muat ulang halaman.");
          } finally {
            if (btn) btn.innerHTML = originalText;
          }
        }).catch((err: any) => {
          console.error("Image generation error:", err);
          alert("Gagal memproses kartu. " + (err.message || ""));
          if (btn) btn.innerHTML = originalText;
        });
      } else {
        if (btn) btn.innerHTML = originalText;
      }
    };

    if ((window as any).domtoimage) {
      executeDownload();
    } else {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js";
      script.onload = executeDownload;
      script.onerror = () => {
        alert("Gagal memuat library dom-to-image.");
        if (btn) btn.innerHTML = originalText;
      };
      document.body.appendChild(script);
    }
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
      
      const response = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let result;
      const textResponse = await response.text();
      try {
        result = JSON.parse(textResponse);
      } catch (err) {
        if (response.status === 413) {
          throw new Error("File Bukti Transfer terlalu besar. Mohon perkecil ukuran foto di bawah 2MB.");
        }
        throw new Error("Terjadi kesalahan pada server (Error 500/413). Mohon perkecil ukuran foto/dokumen Anda dan coba lagi.");
      }

      if (!response.ok) {
        throw new Error(result?.error || "Gagal mendaftar");
      }


      window.location.href = "/auth/pending-approval";
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-[#e8e8f0] flex flex-col items-center relative overflow-hidden" style={{ padding: '40px 16px' }}>
      <style dangerouslySetInnerHTML={{ __html: "@import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');" }} />
      
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
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Disiplin Keilmuan</label>
                  <input type="text" name="discipline" value={formData.discipline} onChange={handleChange} placeholder="Mis. Manajemen Keuangan" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
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
            
            {/* The Card (3D Flip Container) */}
            <div className="w-full max-w-sm mx-auto group cursor-pointer" style={{ perspective: '1000px', aspectRatio: '1.586/1' }}>
              <div className="relative w-full h-full transition-transform duration-700 group-hover:[transform:rotateY(180deg)]" style={{ transformStyle: 'preserve-3d' }}>
                
                {/* FRONT SIDE */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 bg-cover bg-center"
                  style={{ backgroundImage: 'url(/ASIA_under1MB.png)', borderRadius: '16px', backfaceVisibility: 'hidden' }}
                >
                  {/* LOGO & TEXT */}
                  <div className="absolute flex items-center gap-2.5 drop-shadow-2xl" style={{ top: '3%', left: '5%' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-apasific.png" alt="ASIA Logo" className="w-[45px] h-[45px] object-contain rounded-full border-2 border-[#e5c058]/30 shadow-[0_0_15px_rgba(229,192,88,0.4)]" />
                    <div className="flex flex-col uppercase tracking-[0.15em] font-serif text-gray-100 drop-shadow-md" style={{ fontSize: '9px' }}>
                      <span className="leading-tight">Association of Asia Pacific</span>
                      <span className="leading-tight">Academician</span>
                    </div>
                  </div>

                  {/* DATES */}
                  <div className="absolute flex flex-col gap-1 text-white font-bold text-right drop-shadow-md" style={{ top: '8%', right: '5%', fontSize: '8px' }}>
                    <div className="flex items-center justify-between gap-3 w-24">
                      <span className="uppercase text-left leading-tight tracking-widest">MEMBER<br/>SINCE</span>
                      <span style={{ fontSize: '10px' }}>{formatDateYYMMDD(null, 0)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 w-24">
                      <span className="uppercase text-left leading-tight tracking-widest">VALID<br/>THRU</span>
                      <span style={{ fontSize: '10px' }}>{formatDateYYMMDD(null, 3)}</span>
                    </div>
                  </div>

                  {/* CHIP (Dipindah ke atas No ID) */}
                  <div className="absolute opacity-90 drop-shadow-md flex justify-end" style={{ bottom: '18%', right: '5%' }}>
                    <svg width="36" height="26" viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="30" rx="5" fill="url(#chipGradient)" stroke="#8b6508" strokeWidth="0.5" />
                      <path d="M0 10 h12 M0 20 h12 M28 10 h12 M28 20 h12 M12 0 v30 M28 0 v30 M12 15 h16" stroke="#8b6508" strokeWidth="0.8" fill="none" />
                      <defs>
                        <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#e5c058" />
                          <stop offset="50%" stopColor="#fef0a1" />
                          <stop offset="100%" stopColor="#c59837" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* NAME, CITIZENSHIP */}
                  <div className="absolute flex flex-col gap-0 text-white font-bold uppercase drop-shadow-md tracking-wider whitespace-nowrap" style={{ top: '62%', left: '8%', fontSize: '11px' }}>
                    <div className="flex items-center leading-none">
                      <div className="w-[80px]">NAME</div>
                      <div className="mr-1">:</div>
                      <div className="truncate max-w-[160px]">{formData.fullName || "NAMA ANDA DI SINI"}</div>
                    </div>
                    <div className="flex items-center leading-none -mt-2">
                      <div className="w-[80px]">CITIZENSHIP</div>
                      <div className="mr-1">:</div>
                      <div className="truncate max-w-[160px]">{formData.country || "INDONESIA"}</div>
                    </div>
                  </div>

                  {/* ACADEMIC ID LOGOS (VERTICAL LEFT) */}
                  {formData.internationalId && (
                    <div className="absolute flex flex-col gap-1.5 drop-shadow-lg" style={{ top: '22%', left: '0' }}>
                      {/* ORCID */}
                      <div className="w-5 h-5 bg-[#A6CE39] rounded-full flex items-center justify-center text-white font-serif font-bold shadow-md" style={{ fontSize: '11px' }}>iD</div>
                      {/* Google Scholar */}
                      <div className="w-5 h-5 bg-[#4285F4] rounded-sm flex items-center justify-center shadow-md">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg>
                      </div>
                      {/* Scopus */}
                      <div className="w-5 h-5 bg-[#FF8200] rounded-sm flex items-center justify-center text-white font-sans font-bold italic shadow-md" style={{ fontSize: '12px' }}>S</div>
                      {/* Web of Science */}
                      <div className="w-5 h-5 bg-[#5C2D91] rounded-sm flex items-center justify-center text-white font-serif font-bold shadow-md" style={{ fontSize: '12px' }}>W</div>
                    </div>
                  )}

                  {/* ID NUMBER */}
                  <div className="absolute text-white font-bold tracking-wider drop-shadow-md text-right flex items-baseline" style={{ bottom: '8%', right: '3%', fontSize: '9px' }}>
                    <span>ID. ASIA-VII-</span>
                    <span style={{ fontFamily: '"DotGothic16", monospace', fontSize: '12px', letterSpacing: '0.15em', fontWeight: 'normal', backgroundColor: 'black', color: '#00ff00', padding: '0 4px', borderRadius: '2px', marginLeft: '4px' }}>0000001</span>
                  </div>
                </div>

                {/* BACK SIDE */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 bg-cover bg-center"
                  style={{ backgroundImage: 'url(/cardasia1.png)', borderRadius: '16px', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {/* LOGO & TEXT */}
                  <div className="absolute flex items-center gap-2.5 drop-shadow-2xl" style={{ top: '3%', left: '5%' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-apasific.png" alt="ASIA Logo" className="w-[45px] h-[45px] object-contain rounded-full border-2 border-[#e5c058]/30 shadow-[0_0_15px_rgba(229,192,88,0.4)]" />
                    <div className="flex flex-col uppercase tracking-[0.15em] font-serif text-gray-100 drop-shadow-md" style={{ fontSize: '9px' }}>
                      <span className="leading-tight">Association of Asia Pacific</span>
                      <span className="leading-tight">Academician</span>
                    </div>
                  </div>


                  
                  {/* Text Information (Perfectly Aligned) */}
                  <div className="absolute flex flex-col gap-0 text-white font-bold uppercase drop-shadow-md tracking-wider whitespace-nowrap" style={{ top: '55%', left: '6%', fontSize: '9px' }}>
                    <div className="flex items-center leading-none">
                      <div className="w-[65px] text-left">NAME</div>
                      <div className="mr-1">:</div>
                      <div className="truncate max-w-[180px]">{formData.fullName || "ARFAN IKHSAN LUBIS"}</div>
                    </div>
                    <div className="flex items-center leading-none -mt-2">
                      <div className="w-[65px] text-left">CITIZENSHIP</div>
                      <div className="mr-1">:</div>
                      <div className="truncate max-w-[180px]">{formData.country || "INDONESIA"}</div>
                    </div>
                    <div className="flex items-center leading-none -mt-2">
                      <div className="w-[65px] text-left">VALID THRU</div>
                      <div className="mr-1">:</div>
                      <div>{formatDateYYMMDD(null, 3)}</div>
                    </div>
                  </div>

                  {/* ACADEMIC ID LOGOS (VERTICAL RIGHT) - BACK */}
                  {formData.internationalId && (
                    <div className="absolute flex flex-col gap-1.5 drop-shadow-lg" style={{ top: '22%', right: '4%' }}>
                      {/* ORCID */}
                      <div className="w-5 h-5 bg-[#A6CE39] rounded-full flex items-center justify-center text-white font-serif font-bold shadow-md" style={{ fontSize: '11px' }}>iD</div>
                      {/* Google Scholar */}
                      <div className="w-5 h-5 bg-[#4285F4] rounded-sm flex items-center justify-center shadow-md">
                        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg>
                      </div>
                      {/* Scopus */}
                      <div className="w-5 h-5 bg-[#FF8200] rounded-sm flex items-center justify-center text-white font-sans font-bold italic shadow-md" style={{ fontSize: '12px' }}>S</div>
                      {/* Web of Science */}
                      <div className="w-5 h-5 bg-[#5C2D91] rounded-sm flex items-center justify-center text-white font-serif font-bold shadow-md" style={{ fontSize: '12px' }}>W</div>
                    </div>
                  )}

                  {/* QR Code */}
                  <div className="absolute bg-white p-1 rounded-md shadow-xl flex items-center justify-center" style={{ bottom: '10%', right: '4%', width: '16%', aspectRatio: '1/1' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.apasific.org`} crossOrigin="anonymous" alt="QR Code" className="w-full h-full object-contain" />
                  </div>

                  {/* Footer Vision Removed */}
                </div>

              </div>
            </div>

            <p className="text-gray-500 text-center" style={{ fontSize: '12px', marginTop: '24px', maxWidth: '320px' }}>
              Arahkan kursor ke kartu (hover) untuk melihat bagian belakang kartu.
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
                  <th className="py-4 px-6 text-gray-300 font-semibold uppercase tracking-wider text-xs">Disiplin Keilmuan</th>
                  <th className="py-4 px-6 text-gray-300 font-semibold uppercase tracking-wider text-xs">Institusi/Universitas</th>
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
                        <td className="py-4 px-6 text-gray-400 text-sm">{member.discipline || '-'}</td>
                        <td className="py-4 px-6 text-gray-400 text-sm">{member.university || '-'}</td>
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
              <div id="print-card-front" className="w-full relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] print:shadow-none border border-[#c9a84c]/40 print:border-none bg-cover bg-center" style={{ backgroundImage: 'url(/ASIA_under1MB.png)', borderRadius: '16px', aspectRatio: '1.586/1' }}>
                
                {/* LOGO & TEXT */}
                <div className="absolute flex items-center gap-2.5 drop-shadow-2xl" style={{ top: '3%', left: '5%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-apasific.png" alt="ASIA Logo" className="w-[45px] h-[45px] object-contain rounded-full border-2 border-[#e5c058]/30 shadow-[0_0_15px_rgba(229,192,88,0.4)]" />
                  <div className="flex flex-col uppercase tracking-[0.15em] font-serif text-gray-100 drop-shadow-md" style={{ fontSize: '9px' }}>
                    <span className="leading-tight">Association of Asia Pacific</span>
                    <span className="leading-tight">Academician</span>
                  </div>
                </div>

                {/* DATES */}
                <div className="absolute flex flex-col gap-1 text-white font-bold text-right drop-shadow-md" style={{ top: '8%', right: '5%', fontSize: '8px' }}>
                  <div className="flex items-center justify-between gap-3 w-24">
                    <span className="uppercase text-left leading-tight tracking-widest">MEMBER<br/>SINCE</span>
                    <span style={{ fontSize: '10px' }}>{formatDateYYMMDD(selectedMemberCard.created_at, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 w-24">
                    <span className="uppercase text-left leading-tight tracking-widest">VALID<br/>THRU</span>
                    <span style={{ fontSize: '10px' }}>{formatDateYYMMDD(selectedMemberCard.created_at, 3)}</span>
                  </div>
                </div>

                {/* CHIP (Dipindah ke atas No ID) */}
                <div className="absolute opacity-90 drop-shadow-md flex justify-end" style={{ bottom: '18%', right: '5%' }}>
                  <svg width="36" height="26" viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="30" rx="5" fill="url(#chipGradient2)" stroke="#8b6508" strokeWidth="0.5" />
                    <path d="M0 10 h12 M0 20 h12 M28 10 h12 M28 20 h12 M12 0 v30 M28 0 v30 M12 15 h16" stroke="#8b6508" strokeWidth="0.8" fill="none" />
                    <defs>
                      <linearGradient id="chipGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#e5c058" />
                        <stop offset="50%" stopColor="#fef0a1" />
                        <stop offset="100%" stopColor="#c59837" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* NAME & CITIZENSHIP */}
                <div className="absolute flex flex-col gap-0 text-white font-bold uppercase drop-shadow-md tracking-wider whitespace-nowrap" style={{ top: '62%', left: '8%', fontSize: '11px' }}>
                  <div className="flex items-center leading-none">
                    <div className="w-[80px]">NAME</div>
                    <div className="mr-1">:</div>
                    <div>{selectedMemberCard.full_name || "NAMA ANDA DI SINI"}</div>
                  </div>
                  <div className="flex items-center leading-none -mt-2">
                    <div className="w-[80px]">CITIZENSHIP</div>
                    <div className="mr-1">:</div>
                    <div>{selectedMemberCard.country || "INDONESIA"}</div>
                  </div>
                </div>

                {/* ACADEMIC ID LOGOS (VERTICAL LEFT) - MODAL FRONT */}
                {(selectedMemberCard.university?.includes("ORCID/Scopus") || selectedMemberCard) && (
                  <div className="absolute flex flex-col gap-1.5 drop-shadow-lg" style={{ top: '22%', left: '0' }}>
                    {/* ORCID */}
                    <div className="w-5 h-5 bg-[#A6CE39] rounded-full flex items-center justify-center text-white font-serif font-bold shadow-md" style={{ fontSize: '11px' }}>iD</div>
                    {/* Google Scholar */}
                    <div className="w-5 h-5 bg-[#4285F4] rounded-sm flex items-center justify-center shadow-md">
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg>
                    </div>
                    {/* Scopus */}
                    <div className="w-5 h-5 bg-[#FF8200] rounded-sm flex items-center justify-center text-white font-sans font-bold italic shadow-md" style={{ fontSize: '12px' }}>S</div>
                    {/* Web of Science */}
                    <div className="w-5 h-5 bg-[#5C2D91] rounded-sm flex items-center justify-center text-white font-serif font-bold shadow-md" style={{ fontSize: '12px' }}>W</div>
                  </div>
                )}

                {/* ID NUMBER */}
                <div className="absolute text-white font-bold tracking-wider drop-shadow-md text-right flex items-baseline" style={{ bottom: '8%', right: '3%', fontSize: '9px' }}>
                  {(() => {
                    const fullId = selectedMemberCard.international_id || "ASIA-VII-0000001";
                    const lastDash = fullId.lastIndexOf('-');
                    if (lastDash === -1) {
                      return <span style={{ fontFamily: '"DotGothic16", monospace', fontSize: '12px', letterSpacing: '0.15em', fontWeight: 'normal', backgroundColor: 'black', color: '#00ff00', padding: '0 4px', borderRadius: '2px' }}>ID. {fullId}</span>;
                    }
                    const prefix = fullId.substring(0, lastDash + 1);
                    const num = fullId.substring(lastDash + 1);
                    return (
                      <>
                        <span>ID. {prefix}</span>
                        <span style={{ fontFamily: '"DotGothic16", monospace', fontSize: '12px', letterSpacing: '0.15em', fontWeight: 'normal', backgroundColor: 'black', color: '#00ff00', padding: '0 4px', borderRadius: '2px', marginLeft: '4px' }}>{num}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Back Card */}
              <div id="print-card-back" className="w-full relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] print:shadow-none border border-[#c9a84c]/40 print:border-none bg-cover bg-center" style={{ backgroundImage: 'url(/cardasia1.png)', borderRadius: '16px', aspectRatio: '1.586/1' }}>
                
                {/* LOGO & TEXT */}
                <div className="absolute flex items-center gap-2.5 drop-shadow-2xl" style={{ top: '3%', left: '5%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-apasific.png" alt="ASIA Logo" className="w-[45px] h-[45px] object-contain rounded-full border-2 border-[#e5c058]/30 shadow-[0_0_15px_rgba(229,192,88,0.4)]" />
                  <div className="flex flex-col uppercase tracking-[0.15em] font-serif text-gray-100 drop-shadow-md" style={{ fontSize: '9px' }}>
                    <span className="leading-tight">Association of Asia Pacific</span>
                    <span className="leading-tight">Academician</span>
                  </div>
                </div>


                
                {/* Text Information (Perfectly Aligned) */}
                <div className="absolute flex flex-col gap-0 text-white font-bold uppercase drop-shadow-md tracking-wider whitespace-nowrap" style={{ top: '55%', left: '6%', fontSize: '9px' }}>
                  <div className="flex items-center leading-none">
                    <div className="w-[65px] text-left">NAME</div>
                    <div className="mr-1">:</div>
                    <div>{selectedMemberCard.full_name || "ARFAN IKHSAN LUBIS"}</div>
                  </div>
                  <div className="flex items-center leading-none -mt-2">
                    <div className="w-[65px] text-left">CITIZENSHIP</div>
                    <div className="mr-1">:</div>
                    <div>{selectedMemberCard.country || "INDONESIA"}</div>
                  </div>
                  <div className="flex items-center leading-none -mt-2">
                    <div className="w-[65px] text-left">VALID THRU</div>
                    <div className="mr-1">:</div>
                    <div>{selectedMemberCard ? formatDateYYMMDD(selectedMemberCard.created_at, 3) : formatDateYYMMDD(null, 3)}</div>
                  </div>
                </div>

                {/* ACADEMIC ID LOGOS (VERTICAL RIGHT) - MODAL BACK */}
                {(selectedMemberCard.university?.includes("ORCID/Scopus") || selectedMemberCard) && (
                  <div className="absolute flex flex-col gap-1.5 drop-shadow-lg" style={{ top: '22%', right: '4%' }}>
                    {/* ORCID */}
                    <div className="w-5 h-5 bg-[#A6CE39] rounded-full flex items-center justify-center text-white font-serif font-bold shadow-md" style={{ fontSize: '11px' }}>iD</div>
                    {/* Google Scholar */}
                    <div className="w-5 h-5 bg-[#4285F4] rounded-sm flex items-center justify-center shadow-md">
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg>
                    </div>
                    {/* Scopus */}
                    <div className="w-5 h-5 bg-[#FF8200] rounded-sm flex items-center justify-center text-white font-sans font-bold italic shadow-md" style={{ fontSize: '12px' }}>S</div>
                    {/* Web of Science */}
                    <div className="w-5 h-5 bg-[#5C2D91] rounded-sm flex items-center justify-center text-white font-serif font-bold shadow-md" style={{ fontSize: '12px' }}>W</div>
                  </div>
                )}

              <div className="absolute bg-white rounded-md p-1 shadow-lg" style={{ bottom: '6%', right: '6%', width: '48px', height: '48px' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.apasific.org`} crossOrigin="anonymous" alt="QR Code" className="w-full h-full object-contain" />
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
