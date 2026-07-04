"use client";

import { useState } from "react";

export type RoleType = "author" | "reviewer" | "editor" | "member";

interface RegisterWizardProps {
  availableRoles: { value: RoleType; label: string }[];
  defaultRole?: RoleType;
  title: string;
}

export default function RegisterWizard({ availableRoles, defaultRole, title }: RegisterWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: defaultRole || availableRoles[0]?.value || "member",
    country: "",
    university: "",
    orcid: "",
    googleScholar: "",
    scopus: "",
    wos: "",
    sinta: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Simulasi Submit ke Supabase!\nData: " + JSON.stringify(formData, null, 2));
    // TODO: Supabase Auth Signup + Insert to profiles table
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 bg-[#12121f] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(201,168,76,0.2)] overflow-hidden">
      <div className="bg-[#18182e] p-6 border-b border-[rgba(201,168,76,0.2)] text-center">
        <h2 className="text-2xl font-bold text-[#c9a84c] font-['Cinzel']">{title}</h2>
        <p className="text-[#8888aa] text-sm mt-2">
          Step {step} of 2: {step === 1 ? "Basic Information" : "Academic Profile"}
        </p>
      </div>

      <div className="p-8">
        <form onSubmit={step === 1 ? nextStep : submitForm}>
          {step === 1 && (
            <div className="space-y-4">
              {availableRoles.length > 1 && (
                <div>
                  <label className="block text-[#e8e8f0] text-sm font-semibold mb-2">Select Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-3 focus:outline-none focus:border-[#c9a84c] transition-colors" required>
                    {availableRoles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-[#e8e8f0] text-sm font-semibold mb-2">Full Name (with Titles)</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-3 focus:outline-none focus:border-[#c9a84c]" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#e8e8f0] text-sm font-semibold mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-3 focus:outline-none focus:border-[#c9a84c]" required />
                </div>
                <div>
                  <label className="block text-[#e8e8f0] text-sm font-semibold mb-2">Phone / WhatsApp</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-3 focus:outline-none focus:border-[#c9a84c]" required />
                </div>
              </div>

              <div>
                <label className="block text-[#e8e8f0] text-sm font-semibold mb-2">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-3 focus:outline-none focus:border-[#c9a84c]" required minLength={6} />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-[#c9a84c] text-black font-bold py-3 rounded-lg hover:bg-[#e8c97a] transition-colors">
                  Next Step: Academic Profile ➔
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#e8e8f0] text-sm font-semibold mb-2">University / Institution</label>
                  <input type="text" name="university" value={formData.university} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-3 focus:outline-none focus:border-[#c9a84c]" required />
                </div>
                <div>
                  <label className="block text-[#e8e8f0] text-sm font-semibold mb-2">Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-3 focus:outline-none focus:border-[#c9a84c]" required />
                </div>
              </div>

              <div className="pt-4 border-t border-[#333]">
                <h3 className="text-[#c9a84c] font-semibold mb-4">Academic IDs</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#8888aa] text-xs mb-1">ORCID iD</label>
                    <input type="text" name="orcid" value={formData.orcid} onChange={handleChange} placeholder="0000-0000-0000-0000" className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-2 focus:outline-none focus:border-[#c9a84c]" />
                  </div>
                  <div>
                    <label className="block text-[#8888aa] text-xs mb-1">Google Scholar ID</label>
                    <input type="text" name="googleScholar" value={formData.googleScholar} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-2 focus:outline-none focus:border-[#c9a84c]" />
                  </div>
                  <div>
                    <label className="block text-[#8888aa] text-xs mb-1">Scopus ID</label>
                    <input type="text" name="scopus" value={formData.scopus} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-2 focus:outline-none focus:border-[#c9a84c]" />
                  </div>
                  <div>
                    <label className="block text-[#8888aa] text-xs mb-1">Web of Science (WoS) ID</label>
                    <input type="text" name="wos" value={formData.wos} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-2 focus:outline-none focus:border-[#c9a84c]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[#8888aa] text-xs mb-1">SINTA ID (Indonesia)</label>
                    <input type="text" name="sinta" value={formData.sinta} onChange={handleChange} className="w-full bg-[#0d0d1a] border border-[#333] text-[#e8e8f0] rounded-lg p-2 focus:outline-none focus:border-[#c9a84c]" />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-transparent border border-[#333] text-[#8888aa] font-bold py-3 rounded-lg hover:text-white transition-colors">
                  Back
                </button>
                <button type="submit" className="w-2/3 bg-[#c9a84c] text-black font-bold py-3 rounded-lg hover:bg-[#e8c97a] transition-colors">
                  Complete Registration ✔
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
