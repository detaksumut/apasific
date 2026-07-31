"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifySearchPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setNotFound(false);

    // Determine if input is a credential number or token
    const isCredentialNumber = input.toUpperCase().startsWith("APASIFIC-");
    const param = isCredentialNumber
      ? `credential_number=${encodeURIComponent(input.trim().toUpperCase())}`
      : `token=${encodeURIComponent(input.trim().toUpperCase())}`;

    try {
      const res = await fetch(`/api/public/credentials/verify?${param}`);
      const data = await res.json();

      if (data.status === "NOT_FOUND" || res.status === 404) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // If found by credential_number, redirect to token-based URL if token available
      // Otherwise show the result inline via query
      if (isCredentialNumber && data.credential_number) {
        // Redirect to verification page with found data
        router.push(`/verify/search?credential_number=${encodeURIComponent(input.trim().toUpperCase())}`);
      } else {
        router.push(`/verify/${input.trim().toUpperCase()}`);
      }
    } catch {
      setNotFound(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9a84c]/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-serif text-white mb-2">Verifikasi Sertifikat APASIFIC</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Masukkan nomor sertifikat atau token verifikasi untuk mengkonfirmasi keaslian credential APASIFIC.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleVerify} className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">
            Nomor Sertifikat atau Token Verifikasi
          </label>
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setNotFound(false); }}
            placeholder="APASIFIC-CERT-2026-A8F2C1 atau token..."
            className="w-full bg-[#05050a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] px-4 py-3 mb-4 placeholder:text-gray-600 font-mono"
          />

          {notFound && (
            <div className="bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">
              ❌ Credential tidak ditemukan. Pastikan nomor sertifikat benar.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold uppercase tracking-wider py-3.5 rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memverifikasi..." : "Verifikasi Sekarang"}
          </button>
        </form>

        {/* Example format */}
        <div className="mt-6 bg-[#0d0d1a] border border-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-3">Format yang Diterima</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] flex-shrink-0" />
              <p className="text-gray-500 text-xs font-mono">APASIFIC-CERT-2026-A8F2C1 <span className="text-gray-700">(nomor sertifikat)</span></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] flex-shrink-0" />
              <p className="text-gray-500 text-xs font-mono">A8F2C1D9E3B7... <span className="text-gray-700">(token verifikasi dari QR code)</span></p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          Sistem verifikasi resmi APASIFIC · Credential yang tidak terverifikasi dapat dilaporkan ke{" "}
          <span className="text-gray-600">admin@apasific.org</span>
        </p>
      </div>
    </div>
  );
}
