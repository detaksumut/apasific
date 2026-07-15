"use client";

import { useState, useTransition, useEffect } from "react";
import { signUpUser } from "@/app/actions/auth";

export type RoleType = "author" | "reviewer" | "editor" | "member";

interface RegisterWizardProps {
  availableRoles: { value: RoleType; label: string }[];
  defaultRole?: RoleType;
  forcedRole?: RoleType;
  title: string;
}

export default function RegisterWizard({ availableRoles, defaultRole, forcedRole, title }: RegisterWizardProps) {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: forcedRole || defaultRole || availableRoles[0]?.value || "member",
    country: "",
    university: "",
    discipline: "",
    orcid: "",
    googleScholar: "",
    scopus: "",
    wos: "",
    sinta: "",
    academicLevel: "S1",
    bankAccount: "",
  });

  // Sync forcedRole if it changes after initial render (e.g. from searchParams)
  useEffect(() => {
    if (forcedRole && formData.role !== forcedRole) {
      setFormData(prev => ({ ...prev, role: forcedRole }));
    }
  }, [forcedRole]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    setStep(2);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailLower = formData.email.toLowerCase().trim();
    
    // 1. Real Database Registration
    startTransition(async () => {
      try {
        const res = await signUpUser(formData);
        
        if (res && !res.success) {
          setMessage({ type: 'error', text: res.error || 'Terjadi kesalahan saat pendaftaran.' });
          return;
        }

        // All registration roles (author, reviewer, editor) should go to pending approval
        let mockRole = formData.role || "author";
        let redirectPath = "/auth/pending-approval";
        
        // Members might still go to membership payment page if there is one?
        if (formData.role === 'member') {
          redirectPath = "/auth/membership"; // or wherever members go
        }

        setMessage({ type: 'success', text: 'Registrasi berhasil! Data Anda telah masuk ke database. Menghubungkan...' });
        
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1500);

      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan jaringan.' });
      }
    });
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.role === 'member') {
      setStep(3);
    } else {
      submitForm(e);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-12 bg-[#12121f] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(201,168,76,0.2)] overflow-hidden">
      <div className="bg-[#18182e] p-6 border-b border-[rgba(201,168,76,0.2)] text-center">
        <h2 className="text-2xl font-bold text-[#c9a84c] font-['Cinzel']">{title}</h2>
          <p className="text-[#8888aa] text-sm mt-2">
          Step {step} of {formData.role === 'member' ? '3' : '2'}: 
          {step === 1 ? " Basic Information" : step === 2 ? " Academic Profile" : " Membership Plan"}
        </p>
      </div>

      <div className="p-8">
        {message && (
          <div className={`p-4 mb-6 rounded-lg font-bold text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={step === 1 ? nextStep : step === 2 ? handleStep2Submit : submitForm}>
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Apasific Royalty Message (Hidden for dedicated Members) */}
              {formData.role !== 'member' && (
                <div className="bg-[#c9a84c]/10 border-l-4 border-[#c9a84c] p-4 rounded-r-lg">
                  <p className="text-sm text-[#e8c97a] font-semibold flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Karya tulis Anda sangat dihargai di APASIFIC! Setiap pembaca yang mengunduh jurnal Anda wajib membayar, dan royalti tersebut akan ditransfer langsung ke rekening Anda. Pastikan Anda mengisi Nomor Rekening di tahap selanjutnya.
                    </span>
                  </p>
                </div>
              )}

              {availableRoles.length > 1 && !forcedRole && (
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Select Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all appearance-none" required>
                    {availableRoles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Full Name (with Titles)</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Phone / WhatsApp</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required minLength={6} />
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold tracking-wide uppercase text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all transform hover:-translate-y-0.5">
                  Next Step: Academic Profile ➔
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">University / Institution</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-2">Disiplin Keilmuan / Scientific Discipline</label>
                  <input type="text" name="discipline" value={formData.discipline} onChange={handleChange} placeholder="Contoh: Manajemen Keuangan, Sistem Informasi, dsb." className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-1">Status Akademik Saat Ini (Current Academic Status)</label>
                  <p className="text-xs text-[#8888aa] mb-3 italic">Data ini wajib diisi untuk menentukan klasifikasi publikasi artikel Anda.</p>
                  <select name="academicLevel" value={formData.academicLevel} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all appearance-none" required>
                    <option value="Mahasiswa">Mahasiswa (Belum Lulus S1)</option>
                    <option value="S1">S1 (Sarjana / Menulis untuk S2)</option>
                    <option value="S2">S2 (Magister / Menulis untuk S3)</option>
                    <option value="S3">S3 (Doktor / Profesor)</option>
                    <option value="Praktisi">Praktisi (Profesional / Industri)</option>
                    <option value="Institusi">Perwakilan Institusi (Universitas / Lembaga)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-xs tracking-wider uppercase font-semibold mb-1">Nomor Rekening & Nama Bank <span className="text-gray-500 normal-case font-normal">(Opsional)</span></label>
                  <p className="text-xs text-[#8888aa] mb-3 italic">Digunakan untuk mentransfer royalti jika ada pembagian keuntungan (bisa diisi nanti).</p>
                  <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} placeholder="Contoh: BCA 1234567890 a/n Budi Santoso" className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <h3 className="text-gray-300 text-xs tracking-wider uppercase font-semibold mb-4">Academic IDs</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label className="block text-[#8888aa] text-[10px] uppercase tracking-wider mb-1">ORCID iD</label>
                    <input type="text" name="orcid" value={formData.orcid} onChange={handleChange} placeholder="0000-0000-0000-0000" className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-[#8888aa] text-[10px] uppercase tracking-wider mb-1">Google Scholar ID</label>
                    <input type="text" name="googleScholar" value={formData.googleScholar} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-[#8888aa] text-[10px] uppercase tracking-wider mb-1">Scopus ID</label>
                    <input type="text" name="scopus" value={formData.scopus} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-[#8888aa] text-[10px] uppercase tracking-wider mb-1">Web of Science (WoS) ID</label>
                    <input type="text" name="wos" value={formData.wos} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[#8888aa] text-[10px] uppercase tracking-wider mb-1">SINTA ID (Indonesia)</label>
                    <input type="text" name="sinta" value={formData.sinta} onChange={handleChange} className="w-full bg-[#05050a]/50 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all text-sm" />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-transparent border border-gray-700 text-gray-400 font-bold uppercase tracking-wide text-sm py-4 rounded-xl hover:text-white hover:bg-white/5 transition-all" disabled={isPending}>
                  Back
                </button>
                <button type="submit" className="w-2/3 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold tracking-wide uppercase text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isPending}>
                  {formData.role === 'member' ? "Next Step: Membership Plan ➔" : (isPending ? "Processing..." : "Complete Registration ✔")}
                </button>
              </div>
            </div>
          )}

          {step === 3 && formData.role === 'member' && (
            <div className="space-y-6">
              {formData.academicLevel === 'Institusi' ? (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 text-center">
                  <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Institutional MoU Required</h3>
                  <p className="text-gray-300 text-sm mb-6">
                    Institutions cannot register standard memberships because you have the capability to assign multiple reviewers. 
                    Please contact our Admin to establish a formal Memorandum of Understanding (MoU).
                  </p>
                  <div className="flex justify-center gap-4">
                    <button type="button" onClick={() => setStep(2)} className="bg-transparent border border-[#333] text-[#8888aa] font-bold py-2 px-6 rounded-lg hover:text-white transition-colors">
                      Back
                    </button>
                    <a href="mailto:admin@apasific.org" className="bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-500 transition-colors inline-block">
                      Contact Admin
                    </a>
                  </div>
                </div>
              ) : formData.academicLevel === 'Mahasiswa' ? (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 text-center">
                  <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-green-400 mb-2">Student Membership is FREE!</h3>
                  <p className="text-gray-300 text-sm mb-6">
                    As part of APASIFIC's commitment to academic regeneration, your membership is completely free of charge.
                  </p>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-transparent border border-[#333] text-[#8888aa] font-bold py-3 rounded-lg hover:text-white transition-colors" disabled={isPending}>
                      Back
                    </button>
                    <button type="submit" className="w-2/3 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50" disabled={isPending}>
                      {isPending ? "Processing..." : "Complete Registration ✔"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0d0d1a] border border-[#c9a84c]/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#c9a84c] mb-2 text-center">Membership Payment</h3>
                  <p className="text-gray-400 text-sm text-center mb-6">
                    Join APASIFIC to become an exclusive, highly-paid Reviewer. Your expertise is rewarded here.
                  </p>
                  
                  <div className="bg-[#1a1a2e] rounded-lg p-4 mb-6 border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Tier:</span>
                      <span className="font-bold text-white">{formData.academicLevel}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="text-gray-300">Annual Fee:</span>
                      <span className="font-bold text-[#c9a84c]">
                        Rp {(formData.academicLevel === 'S3' ? 500000 : 250000).toLocaleString('id-ID')} / year
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-transparent border border-[#333] text-[#8888aa] font-bold py-3 rounded-lg hover:text-white transition-colors" disabled={isPending}>
                      Back
                    </button>
                    <button type="submit" className="w-2/3 bg-[#c9a84c] text-black font-bold py-3 rounded-lg hover:bg-[#e8c97a] transition-colors disabled:opacity-50" disabled={isPending}>
                      {isPending ? "Processing..." : "Pay & Register ✔"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
