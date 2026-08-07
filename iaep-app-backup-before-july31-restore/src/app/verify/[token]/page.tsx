"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type VerificationResult = {
  valid: boolean;
  status: "ACTIVE" | "EXPIRED" | "REVOKED" | "NOT_FOUND";
  credential_number?: string;
  certification_type?: string;
  holder_name?: string;
  issued_at?: string;
  expired_at?: string;
  issued_by?: string;
  revoked_at?: string;
  revoked_reason?: string;
  verified_at?: string;
  message?: string;
};

export default function CredentialVerifyPage() {
  const { token } = useParams();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/public/credentials/verify?token=${token}`)
      .then(res => res.json())
      .then(data => { setResult(data); setLoading(false); })
      .catch(() => { setResult({ valid: false, status: "NOT_FOUND", message: "Gagal menghubungi server." }); setLoading(false); });
  }, [token]);

  const fmt = (iso?: string) => iso
    ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Memverifikasi credential...</p>
        </div>
      </div>
    );
  }

  const isActive = result?.status === "ACTIVE";
  const isExpired = result?.status === "EXPIRED";
  const isRevoked = result?.status === "REVOKED";
  const notFound = result?.status === "NOT_FOUND" || !result?.credential_number;

  const statusConfig = {
    ACTIVE: { color: "green", label: "✅ AKTIF & VALID", border: "border-green-700/50", bg: "bg-green-900/10", text: "text-green-400", glow: "shadow-[0_0_60px_rgba(0,200,0,0.06)]" },
    EXPIRED: { color: "yellow", label: "⏰ KADALUARSA", border: "border-yellow-700/50", bg: "bg-yellow-900/10", text: "text-yellow-400", glow: "shadow-[0_0_60px_rgba(200,200,0,0.06)]" },
    REVOKED: { color: "red", label: "⛔ DICABUT", border: "border-red-700/50", bg: "bg-red-900/10", text: "text-red-400", glow: "shadow-[0_0_60px_rgba(200,0,0,0.06)]" },
    NOT_FOUND: { color: "gray", label: "❌ TIDAK DITEMUKAN", border: "border-gray-700/50", bg: "bg-gray-900/10", text: "text-gray-400", glow: "" },
  };
  const cfg = statusConfig[result?.status || "NOT_FOUND"];

  return (
    <div className="min-h-screen bg-[#05050a] relative overflow-hidden">
      {/* Background glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[150px] pointer-events-none ${
        isActive ? "bg-green-500/5" : isExpired ? "bg-yellow-500/5" : isRevoked ? "bg-red-500/5" : "bg-gray-500/5"
      }`} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">

        {/* APASIFIC header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-[#c9a84c] uppercase tracking-widest font-bold">APASIFIC</p>
            <p className="text-xs text-gray-500">Credential Verification System</p>
          </div>
        </div>

        {/* Result Card */}
        <div className={`w-full max-w-xl bg-[#0d0d1a]/95 backdrop-blur border ${cfg.border} rounded-2xl p-8 ${cfg.glow}`}>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.text} text-xs font-bold uppercase tracking-widest mb-6`}>
            <span className={`w-2 h-2 rounded-full bg-current ${isActive ? "animate-pulse" : ""}`} />
            {cfg.label}
          </div>

          {notFound ? (
            <div className="text-center py-4">
              <h1 className="text-xl font-bold text-white mb-3">Credential Tidak Ditemukan</h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {result?.message || "Token verifikasi tidak valid atau credential tidak terdaftar dalam sistem APASIFIC."}
              </p>
              <Link href="/verify" className="text-[#c9a84c] text-sm underline underline-offset-4">
                Coba cari dengan nomor sertifikat →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold font-serif text-white mb-1">
                {result?.holder_name}
              </h1>
              <p className={`text-sm font-semibold mb-6 ${cfg.text}`}>{result?.certification_type}</p>

              <div className="bg-[#151522] border border-gray-800 rounded-xl divide-y divide-gray-800 mb-6">
                {[
                  ["Nomor Sertifikat", result?.credential_number],
                  ["Diterbitkan", fmt(result?.issued_at)],
                  ["Berlaku Hingga", fmt(result?.expired_at)],
                  ["Diterbitkan Oleh", result?.issued_by || "APASIFIC"],
                  ...(isRevoked ? [["Dicabut Pada", fmt(result?.revoked_at)], ["Alasan", result?.revoked_reason || "—"]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center px-4 py-3">
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="text-gray-200 text-sm font-medium text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Verification timestamp */}
              <p className="text-xs text-gray-600 text-center">
                Diverifikasi pada {fmt(result?.verified_at)} · Token: {String(token).slice(0, 12)}...
              </p>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-gray-700 text-xs mt-6 text-center max-w-sm">
          Halaman ini adalah sistem verifikasi resmi APASIFIC. Credential palsu dapat dilaporkan ke{" "}
          <span className="text-gray-500">admin@apasific.org</span>
        </p>
      </div>
    </div>
  );
}
