"use client";

import { useState } from "react";
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

  const [paymentAmount, setPaymentAmount] = useState(500000);
  const [buktiTransfer, setBuktiTransfer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      alert("Pendaftaran Berhasil! Admin akan segera memverifikasi bukti transfer Anda.");
      document.cookie = "mock_user=member; path=/";
      window.location.href = '/dashboard';
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
            <span className="font-semibold text-gray-400 group-hover:text-white transition-colors">Back to Home</span>
          </div>
        </Link>

        <div className="w-full flex flex-col items-center justify-center text-center mx-auto" style={{ marginBottom: '48px', textAlign: 'center' }}>
          <h1 className="font-bold tracking-tight text-center" style={{ fontFamily: 'Cinzel, serif', fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>
            Exclusive <span className="text-[#c9a84c]">ASIA Membership</span>
          </h1>
          <p className="text-gray-400 mx-auto text-center" style={{ fontSize: '18px', maxWidth: '672px', textAlign: 'center' }}>
            Join the elite circle of Asia Pacific academicians. Fill out the form below to instantly generate your official International Academic Member Card.
          </p>
        </div>

        <div className="flex flex-col gap-12 items-center justify-center w-full">
          
          {/* Top: Form */}
          <div className="bg-[#0d0d1a]/80 border border-[#c9a84c]/20 shadow-2xl backdrop-blur-md w-full max-w-[800px] mx-auto" style={{ padding: '32px', borderRadius: '16px' }}>
            <h2 className="font-bold text-[#c9a84c] border-b border-gray-800" style={{ fontSize: '24px', marginBottom: '24px', paddingBottom: '16px', textAlign: 'center' }}>Membership Application Form</h2>
            
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Full Name (with Titles)</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Prof. Dr. Budi Santoso, M.Sc." className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
                </div>
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>International Academic ID</label>
                  <input type="text" name="internationalId" value={formData.internationalId} onChange={handleChange} placeholder="e.g. ORCID, Scopus ID, WOS" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
                </div>

                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@university.edu" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
                </div>
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Phone / WhatsApp</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+62 812-3456-7890" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
                </div>

                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Country of Origin</label>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all appearance-none" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required>
                    <option value="" disabled className="bg-[#12121f]">Select Country</option>
                    {countries.map(c => <option key={c} value={c} className="bg-[#12121f]">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Graduate Level</label>
                  <select name="academicLevel" value={formData.academicLevel} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all appearance-none" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required>
                    <option value="S2" className="bg-[#12121f]">S2 (Magister)</option>
                    <option value="S3" className="bg-[#12121f]">S3 (Doctorate)</option>
                    <option value="Profesor" className="bg-[#12121f]">Profesor</option>
                    <option value="Praktisi" className="bg-[#12121f]">Praktisi (Professional)</option>
                    <option value="Institusi" className="bg-[#12121f]">Institusi (Organization)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>University / Institution</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="e.g. National University" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required />
                </div>
                <div>
                  <label className="block text-gray-300 tracking-wider uppercase font-semibold" style={{ fontSize: '12px', marginBottom: '8px' }}>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" className="w-full bg-[#05050a]/50 border border-gray-700 text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" style={{ width: '100%', borderRadius: '12px', padding: '14px 16px' }} required minLength={6} />
                </div>
              </div>

              <div style={{ paddingTop: '32px' }}>
                {formData.academicLevel === 'Institusi' ? (
                  <div className="bg-[#05050a]/80 border border-[#c9a84c]/40 text-center animate-fade-in shadow-[0_0_30px_rgba(201,168,76,0.15)]" style={{ borderRadius: '12px', padding: '24px' }}>
                    <div className="bg-yellow-900/50 text-yellow-500 flex items-center justify-center mx-auto border border-yellow-500/30" style={{ width: '48px', height: '48px', borderRadius: '50%', marginBottom: '12px' }}>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-white" style={{ fontSize: '20px', marginBottom: '8px' }}>MoU Required</h3>
                    <p className="text-gray-400" style={{ fontSize: '14px', marginBottom: '16px' }}>
                      Institutions must establish a Memorandum of Understanding (MoU) with ASIA before registering multiple members.
                    </p>
                    <div className="flex justify-center" style={{ gap: '12px' }}>
                      <button type="button" onClick={() => alert('Redirecting to Contact Page...')} className="bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-semibold transition-colors" style={{ padding: '8px 16px', borderRadius: '4px', fontSize: '14px' }}>Hubungi Admin</button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#05050a]/80 border border-[#c9a84c]/40 text-center animate-fade-in shadow-[0_0_30px_rgba(201,168,76,0.15)]" style={{ borderRadius: '12px', padding: '24px' }}>
                    <h3 className="font-bold text-[#c9a84c]" style={{ fontSize: '16px', marginBottom: '12px' }}>INSTRUKSI PEMBAYARAN & AKTIVASI</h3>
                    <p className="text-gray-300" style={{ fontSize: '13px', marginBottom: '16px' }}>
                      Biaya Administrasi Ujian Sertifikasi / Membership sebesar <b>Rp {paymentAmount.toLocaleString()}</b> (berlaku 3 tahun) ditransfer ke rekening:
                    </p>
                    
                    <div className="bg-black/50 border border-gray-700 inline-block text-left w-full max-w-sm" style={{ padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                      <p className="text-gray-400 font-semibold" style={{ fontSize: '12px', marginBottom: '4px' }}>Association of Asia Pacific Academician</p>
                      <p className="text-gray-300 uppercase tracking-wider" style={{ fontSize: '12px', marginBottom: '4px' }}>Bank Negara Indonesia (BNI)</p>
                      <p className="font-mono text-[#4ade80]" style={{ fontSize: '18px', marginBottom: '4px', letterSpacing: '1px' }}>7006002218</p>
                      <p className="text-gray-500 uppercase tracking-wider" style={{ fontSize: '10px', marginBottom: '12px' }}>Swift Code: BNINIDJA</p>
                      
                      <div className="flex justify-between items-center border-t border-gray-800" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                        <span className="text-gray-400" style={{ fontSize: '14px' }}>Total Tagihan:</span>
                        <span className="font-bold text-[#c9a84c]" style={{ fontSize: '20px' }}>Rp {paymentAmount.toLocaleString()}</span>
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
                      {isLoading ? "Memproses..." : "Submit & Generate Card"}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Bottom: Live Member Card */}
          <div className="flex flex-col items-center justify-start w-full max-w-[400px] mx-auto">
            <h3 className="text-gray-400 font-semibold text-center tracking-widest uppercase" style={{ marginBottom: '16px', fontSize: '14px' }}>Real-Time Card Preview</h3>
            
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
                  <img src="/logo-apasific.png" alt="Logo" className="object-contain" style={{ width: '48px', height: '48px' }} />
                </div>

                {/* Body / User Info */}
                <div className="mt-auto" style={{ paddingBottom: '8px' }}>
                  <p className="text-[#c9a84c] uppercase tracking-wider" style={{ fontSize: '10px', marginBottom: '4px' }}>Official Member</p>
                  <h2 className="font-bold text-white uppercase tracking-wider truncate drop-shadow-md" style={{ fontSize: '20px' }}>
                    {formData.fullName || "YOUR NAME HERE"}
                  </h2>
                  <div className="flex text-gray-300" style={{ gap: '16px', marginTop: '8px' }}>
                    <div>
                      <p className="uppercase text-gray-500" style={{ fontSize: '8px' }}>Academic ID</p>
                      <p className="font-mono tracking-widest" style={{ fontSize: '12px' }}>{formData.internationalId || "XXXX-XXXX-XXXX"}</p>
                    </div>
                    <div>
                      <p className="uppercase text-gray-500" style={{ fontSize: '8px' }}>Level</p>
                      <p className="font-mono tracking-widest" style={{ fontSize: '12px' }}>{formData.academicLevel}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="absolute opacity-90 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ right: '24px', bottom: '24px', padding: '6px', borderRadius: '8px' }}>
                <QRCode
                  value={formData.fullName ? formData.fullName : "ASIA MEMBER"}
                  size={36}
                  bgColor="transparent"
                  fgColor="#ffffff"
                  level="L"
                />
              </div>

            </div>
            
            <p className="text-gray-500 text-center" style={{ fontSize: '12px', marginTop: '24px', maxWidth: '320px' }}>
              This card will be officially registered under ASIA global network upon successful payment and verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
