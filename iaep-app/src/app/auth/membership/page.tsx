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

  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const countries = [
    "Indonesia", "Malaysia", "Singapore", "Thailand", "Vietnam", 
    "Philippines", "Japan", "South Korea", "China", "India", "Australia", "Other"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let amount = 0;
    if (formData.academicLevel === 'S2' || formData.academicLevel === 'Praktisi') amount = 250000;
    if (formData.academicLevel === 'S3' || formData.academicLevel === 'Profesor') amount = 500000;
    
    setPaymentAmount(amount);
    setShowPayment(true);
  };

  const handlePay = () => {
    alert("Payment Successful! Welcome to ASIA.");
    document.cookie = "mock_user=member; path=/";
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen text-[#e8e8f0] flex flex-col py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c9a84c] rounded-full mix-blend-color-dodge filter blur-[128px] opacity-20 animate-blob z-0"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c9a84c] rounded-full mix-blend-color-dodge filter blur-[128px] opacity-10 animate-blob animation-delay-2000 z-0"></div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        
        <Link href="/">
          <div className="flex items-center gap-3 group cursor-pointer w-fit mb-8">
            <div className="w-10 h-10 rounded-full border-2 border-[#c9a84c] flex items-center justify-center text-[#c9a84c] group-hover:bg-[#c9a84c] group-hover:text-black transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </div>
            <span className="font-semibold text-gray-400 group-hover:text-white transition-colors">Back to Home</span>
          </div>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
            Exclusive <span className="text-[#c9a84c]">ASIA Membership</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join the elite circle of Asia Pacific academicians. Fill out the form below to instantly generate your official International Academic Member Card.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-3 bg-[#0d0d1a]/80 p-8 rounded-2xl border border-[#c9a84c]/20 shadow-2xl backdrop-blur-md">
            <h2 className="text-2xl font-bold text-[#c9a84c] mb-6 border-b border-gray-800 pb-4">Membership Application Form</h2>
            
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Full Name (with Titles)</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Prof. Dr. Budi Santoso, M.Sc." className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">International Academic ID</label>
                  <input type="text" name="internationalId" value={formData.internationalId} onChange={handleChange} placeholder="e.g. ORCID, Scopus ID, WOS" className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@university.edu" className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Phone / WhatsApp</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+62 812-3456-7890" className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>

                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Country of Origin</label>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all appearance-none" required>
                    <option value="" disabled>Select Country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Graduate Level</label>
                  <select name="academicLevel" value={formData.academicLevel} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all appearance-none" required>
                    <option value="S2">S2 (Magister)</option>
                    <option value="S3">S3 (Doctorate)</option>
                    <option value="Profesor">Profesor</option>
                    <option value="Praktisi">Praktisi (Professional)</option>
                    <option value="Institusi">Institusi (Organization)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">University / Institution</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} placeholder="e.g. National University" className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required minLength={6} />
                </div>
              </div>

              <div className="pt-8">
                {!showPayment ? (
                  <button type="submit" className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold tracking-wide uppercase text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all transform hover:-translate-y-0.5">
                    Submit & Generate Card
                  </button>
                ) : (
                  <div className="mt-6 bg-[#05050a]/80 border border-[#c9a84c]/40 rounded-xl p-6 text-center animate-fade-in shadow-[0_0_30px_rgba(201,168,76,0.15)]">
                    {formData.academicLevel === 'Institusi' ? (
                      <div>
                        <div className="w-12 h-12 bg-yellow-900/50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-500/30">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">MoU Required</h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Institutions must establish a Memorandum of Understanding (MoU) with ASIA before registering multiple members.
                        </p>
                        <div className="flex gap-3 justify-center">
                          <button type="button" onClick={() => setShowPayment(false)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-semibold transition-colors text-sm">Kembali</button>
                          <button type="button" onClick={() => alert('Redirecting to Contact Page...')} className="px-4 py-2 bg-[#c9a84c] hover:bg-[#e8c97a] text-black rounded font-semibold transition-colors text-sm">Hubungi Admin</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-bold text-[#e8c97a] mb-2">Registration Submitted!</h3>
                        <p className="text-gray-300 text-sm mb-4">
                          Silakan transfer Biaya Administrasi Member untuk level <b>{formData.academicLevel}</b> ke rekening berikut untuk mengaktifkan Kartu Member Anda:
                        </p>
                        <div className="bg-black/50 p-4 rounded-lg border border-gray-700 mb-4 inline-block text-left w-full max-w-sm">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bank Mandiri - ASIA Official</p>
                          <p className="text-lg font-mono text-white mb-3">123-456-789-0123</p>
                          <div className="flex justify-between items-center border-t border-gray-800 pt-3">
                            <span className="text-sm text-gray-400">Total Tagihan:</span>
                            <span className="text-xl font-bold text-[#c9a84c]">Rp {paymentAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button type="button" onClick={handlePay} className="w-full bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(201,168,76,0.3)] transition-colors">
                            Konfirmasi Pembayaran
                          </button>
                          <button type="button" onClick={() => setShowPayment(false)} className="text-sm text-gray-500 hover:text-gray-300 py-2 transition-colors">
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Live Member Card */}
          <div className="lg:col-span-2 flex flex-col items-center justify-start sticky top-24">
            <h3 className="text-gray-400 font-semibold mb-4 text-center tracking-widest uppercase text-sm">Real-Time Card Preview</h3>
            
            {/* The Card */}
            <div 
              className="w-full max-w-sm aspect-[1.586/1] rounded-2xl p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#c9a84c]/40 group transition-all duration-500 hover:shadow-[0_20px_60px_rgba(201,168,76,0.2)] bg-cover bg-center"
              style={{ backgroundImage: 'url(/card-bg.png)' }}
            >
              {/* Card Dark Overlay so text is readable */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/60 to-[#0a0810]/80 z-0"></div>

              {/* Card Background Ornaments */}
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#c9a84c] rounded-full mix-blend-overlay filter blur-[64px] opacity-40 z-0"></div>
              <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#c9a84c] rounded-full mix-blend-overlay filter blur-[64px] opacity-30 z-0"></div>
              
              {/* Fake Chip */}
              <div className="absolute left-6 top-24 w-12 h-9 rounded bg-gradient-to-br from-[#e8c97a] to-[#9a7a30] opacity-90 flex items-center justify-center z-10 shadow-inner">
                <div className="w-8 h-5 border border-black/20 rounded-sm"></div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[#c9a84c] font-bold text-sm tracking-widest uppercase" style={{ fontFamily: 'Cinzel, serif' }}>ASIA</h4>
                    <p className="text-[8px] text-gray-400 uppercase tracking-wider max-w-[120px]">Association of Asia Pacific Academician</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-apasific.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>

                {/* Body / User Info */}
                <div className="mt-auto pb-2">
                  <p className="text-[10px] text-[#c9a84c] uppercase tracking-wider mb-1">Official Member</p>
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider truncate drop-shadow-md">
                    {formData.fullName || "YOUR NAME HERE"}
                  </h2>
                  <div className="flex gap-4 mt-2 text-gray-300">
                    <div>
                      <p className="text-[8px] uppercase text-gray-500">Academic ID</p>
                      <p className="text-xs font-mono tracking-widest">{formData.internationalId || "XXXX-XXXX-XXXX"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase text-gray-500">Level</p>
                      <p className="text-xs font-mono tracking-widest">{formData.academicLevel}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="absolute right-6 bottom-6 opacity-90 p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                <QRCode
                  value={formData.fullName ? formData.fullName : "ASIA MEMBER"}
                  size={36}
                  bgColor="transparent"
                  fgColor="#ffffff"
                  level="L"
                />
              </div>

            </div>
            
            <p className="text-xs text-gray-500 mt-6 text-center max-w-xs">
              This card will be officially registered under ASIA global network upon successful payment and verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force rebuild - 2026-07-06
