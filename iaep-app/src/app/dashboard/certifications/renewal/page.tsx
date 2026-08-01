"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CredentialWithRenewal {
  id: string;
  credential_number: string;
  certification_type: string;
  status: string;
  issued_at: string;
  expired_at: string;
  renewal_status: string;
  renewal_count: number;
  renewal_requested_at?: string;
}

interface RenewalCheck {
  credential: CredentialWithRenewal;
  computed: {
    is_expiring: boolean;
    is_expired: boolean;
    days_until_expiry: number;
    eligible_for_renewal: boolean;
  };
}

const renewalStatusColor: Record<string, string> = {
  NONE: "bg-gray-800 text-gray-500 border-gray-700",
  REQUESTED: "bg-orange-900/30 text-orange-400 border-orange-800",
  APPROVED: "bg-blue-900/30 text-blue-400 border-blue-800",
  REJECTED: "bg-red-900/30 text-red-400 border-red-800",
  COMPLETED: "bg-green-900/30 text-green-400 border-green-800",
};

const expiryColor = (days: number, isExpired: boolean) => {
  if (isExpired) return "text-red-400";
  if (days <= 30) return "text-orange-400";
  if (days <= 90) return "text-yellow-400";
  return "text-green-400";
};

export default function RenewalDashboardPage() {
  const [candidateId, setCandidateId] = useState("");
  const [idInput, setIdInput] = useState("");
  const [renewals, setRenewals] = useState<RenewalCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Restore from session
  useEffect(() => {
    const saved = sessionStorage.getItem("renewal_candidate_id");
    if (saved) { setCandidateId(saved); loadCredentials(saved); }
  }, []);

  const loadCredentials = async (cid: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/certifications/credentials?candidate_id=${cid}`);
      if (!res.ok) { setError("Gagal memuat data."); setLoading(false); return; }
      const creds: CredentialWithRenewal[] = await res.json();

      // Fetch renewal status per credential
      const checks = await Promise.all(
        creds.map(async (cred) => {
          const r = await fetch(`/api/certifications/credentials/${cred.id}/renew`);
          if (r.ok) return await r.json() as RenewalCheck;
          return { credential: cred, computed: { is_expiring: false, is_expired: false, days_until_expiry: 999, eligible_for_renewal: false } };
        })
      );
      setRenewals(checks);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInput.trim()) return;
    sessionStorage.setItem("renewal_candidate_id", idInput.trim());
    setCandidateId(idInput.trim());
    loadCredentials(idInput.trim());
  };

  const requestRenewal = async (credentialId: string) => {
    setActionId(credentialId);
    const res = await fetch(`/api/certifications/credentials/${credentialId}/renew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REQUEST", requested_by: candidateId }),
    });
    if (res.ok) {
      await loadCredentials(candidateId);
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
    setActionId(null);
  };

  const expiryLabel = (check: RenewalCheck) => {
    if (check.computed.is_expired) return "Sudah expired";
    if (check.computed.is_expiring) return `${check.computed.days_until_expiry} hari lagi`;
    return `${check.computed.days_until_expiry} hari lagi`;
  };

  // Sort: expiring first, then active, then others
  const sorted = [...renewals].sort((a, b) => {
    if (a.computed.is_expiring && !b.computed.is_expiring) return -1;
    if (!a.computed.is_expiring && b.computed.is_expiring) return 1;
    return a.computed.days_until_expiry - b.computed.days_until_expiry;
  });

  // Login screen
  if (!candidateId) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h1 className="text-xl font-bold font-serif text-white mb-1">Renewal Center</h1>
            <p className="text-gray-500 text-sm">Masukkan ID kandidat untuk melihat status sertifikat dan mengajukan perpanjangan.</p>
          </div>
          <form onSubmit={handleLogin} className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-6">
            <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">ID Kandidat</label>
            <input type="text" value={idInput} onChange={e => setIdInput(e.target.value)}
              placeholder="Masukkan Candidate ID Anda..."
              className="w-full bg-[#05050a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#c9a84c] px-4 py-3 mb-4 font-mono placeholder:text-gray-600" />
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button type="submit" disabled={loading || !idInput.trim()}
              className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold py-3 rounded-xl disabled:opacity-50 transition-all">
              {loading ? "Memuat..." : "Lihat Sertifikat"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold font-serif text-[#c9a84c] mb-1">Renewal Center</h1>
            <p className="text-gray-500 text-sm font-mono">{candidateId}</p>
          </div>
          <button onClick={() => { sessionStorage.removeItem("renewal_candidate_id"); setCandidateId(""); setRenewals([]); }}
            className="text-xs text-gray-500 hover:text-red-400 border border-gray-800 hover:border-red-900/50 px-4 py-2 rounded-lg transition-colors">
            Ganti Kandidat
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Sertifikat", value: renewals.length, color: "text-gray-300" },
            { label: "Aktif", value: renewals.filter(r => r.credential.status === "ACTIVE" && !r.computed.is_expiring).length, color: "text-green-400" },
            { label: "Akan Expired", value: renewals.filter(r => r.computed.is_expiring).length, color: "text-orange-400" },
            { label: "Pending Renewal", value: renewals.filter(r => r.credential.renewal_status === "REQUESTED").length, color: "text-blue-400" },
          ].map(s => (
            <div key={s.label} className="bg-[#0d0d1a] border border-gray-800 rounded-xl p-4">
              <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Credential cards */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl py-16 text-center text-gray-600">
            Tidak ada sertifikat ditemukan untuk kandidat ini.
          </div>
        ) : sorted.map(({ credential: cr, computed }) => (
          <div key={cr.id} className={`bg-[#0d0d1a] border rounded-xl p-5 mb-4 ${
            computed.is_expiring
              ? "border-orange-900/40"
              : computed.is_expired
              ? "border-red-900/40"
              : "border-gray-800"
          }`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-mono text-xs text-[#c9a84c] mb-1">{cr.credential_number}</p>
                <p className="font-semibold text-white text-sm">{cr.certification_type}</p>
                {cr.renewal_count > 0 && (
                  <p className="text-gray-600 text-xs mt-0.5">Renewal ke-{cr.renewal_count}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {/* Expiry urgency indicator */}
                <p className={`text-sm font-bold ${expiryColor(computed.days_until_expiry, computed.is_expired)}`}>
                  {computed.is_expiring && "⚠️ "}
                  {expiryLabel({ credential: cr, computed })}
                </p>
                <p className="text-gray-600 text-xs">
                  Berlaku hingga {new Date(cr.expired_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Status row */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                cr.status === "ACTIVE" && !computed.is_expiring
                  ? "bg-green-900/30 text-green-400 border-green-800"
                  : computed.is_expiring
                  ? "bg-orange-900/30 text-orange-400 border-orange-800"
                  : "bg-red-900/30 text-red-400 border-red-800"
              }`}>
                {computed.is_expiring ? "EXPIRING" : cr.status}
              </span>
              {cr.renewal_status !== "NONE" && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${renewalStatusColor[cr.renewal_status]}`}>
                  RENEWAL: {cr.renewal_status}
                </span>
              )}
            </div>

            {/* Renewal timeline (if in progress) */}
            {cr.renewal_status !== "NONE" && (
              <div className="bg-[#05050a] rounded-lg px-4 py-3 mb-4">
                <div className="flex items-center gap-0">
                  {(["REQUESTED", "APPROVED", "COMPLETED"] as const).map((step, i) => {
                    const stepIndex = ["REQUESTED", "APPROVED", "COMPLETED"].indexOf(cr.renewal_status);
                    const currentIndex = i;
                    const done = stepIndex >= currentIndex || cr.renewal_status === "REJECTED";
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                          done
                            ? cr.renewal_status === "REJECTED" && step === "APPROVED"
                              ? "bg-red-900/50 border border-red-800 text-red-400"
                              : "bg-[#c9a84c] text-black"
                            : "bg-gray-800 border border-gray-700 text-gray-600"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 mx-1">
                          <div className={`h-0.5 ${done && i < 2 ? "bg-[#c9a84c]" : "bg-gray-800"}`} />
                        </div>
                        <p className={`text-[9px] uppercase tracking-wide absolute -translate-x-1/2 mt-4 whitespace-nowrap hidden`}>{step}</p>
                      </div>
                    );
                  })}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                    cr.renewal_status === "COMPLETED" ? "bg-[#c9a84c] text-black" : "bg-gray-800 border border-gray-700 text-gray-600"
                  }`}>✓</div>
                </div>
                <div className="flex justify-between mt-1.5">
                  {["Diajukan", "Disetujui", "Re-assess", "Selesai"].map(l => (
                    <p key={l} className="text-[9px] text-gray-600 text-center flex-1">{l}</p>
                  ))}
                </div>
                {cr.renewal_requested_at && (
                  <p className="text-[10px] text-gray-600 mt-2">
                    Diajukan: {new Date(cr.renewal_requested_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <a href={`/api/certifications/credentials/${cr.id}/pdf`} target="_blank"
                className="px-4 py-2 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 text-xs font-bold transition-colors">
                ⬇ Download PDF
              </a>
              <Link href={`/verify/${cr.id}`} target="_blank"
                className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-xs transition-colors">
                Verifikasi
              </Link>
              {computed.eligible_for_renewal && (
                <button onClick={() => requestRenewal(cr.id)} disabled={actionId === cr.id}
                  className="px-4 py-2 rounded-lg bg-orange-900/20 border border-orange-800/50 text-orange-400 hover:bg-orange-900/40 text-xs font-bold disabled:opacity-50 transition-colors ml-auto">
                  {actionId === cr.id ? "Mengajukan..." : "🔄 Ajukan Renewal"}
                </button>
              )}
              {cr.renewal_status === "REQUESTED" && (
                <div className="ml-auto flex items-center gap-1.5 text-xs text-orange-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  Menunggu persetujuan Admin
                </div>
              )}
              {cr.renewal_status === "APPROVED" && (
                <div className="ml-auto flex items-center gap-1.5 text-xs text-blue-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Sesi re-assessment sudah dibuat oleh Admin
                </div>
              )}
              {cr.renewal_status === "REJECTED" && (
                <div className="ml-auto text-xs text-red-400">❌ Renewal ditolak</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
