"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AssignedSession {
  id: string;
  candidate_id: string;
  certification_field: string;
  status: string;
  score?: number;
  created_at?: string;
}

const statusColor: Record<string, string> = {
  SUBMITTED: "bg-purple-900/30 text-purple-400 border-purple-800",
  UNDER_REVIEW: "bg-orange-900/30 text-orange-400 border-orange-800",
  ASSESSMENT_COMPLETED: "bg-indigo-900/30 text-indigo-300 border-indigo-800",
  READY: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
  IN_PROGRESS: "bg-blue-900/30 text-blue-400 border-blue-800",
  CERTIFIED: "bg-green-900/30 text-green-400 border-green-800",
  FAILED: "bg-red-900/30 text-red-400 border-red-800",
};

export default function AssessorDashboard() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [sessions, setSessions] = useState<AssignedSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"queue" | "history">("queue");

  // Restore saved code
  useEffect(() => {
    const saved = sessionStorage.getItem("assessor_dashboard_code");
    if (saved) { setAccessCode(saved); loadSessions(saved); }
  }, []);

  const loadSessions = async (code: string) => {
    setLoading(true);
    setError("");
    try {
      // Fetch sessions where assessor_code matches
      const res = await fetch("/api/certifications/exam/sessions", {
        headers: { "x-assessor-code": code },
      });
      if (res.ok) {
        const data = await res.json();
        // Filter to sessions assigned to this assessor
        setSessions(data.filter((s: any) => s.assessor_code === code));
      }
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    sessionStorage.setItem("assessor_dashboard_code", codeInput.trim());
    setAccessCode(codeInput.trim());
    await loadSessions(codeInput.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem("assessor_dashboard_code");
    setAccessCode("");
    setSessions([]);
    setCodeInput("");
  };

  const queueSessions = sessions.filter(s => ["SUBMITTED", "UNDER_REVIEW"].includes(s.status));
  const historySessions = sessions.filter(s => ["ASSESSMENT_COMPLETED", "CERTIFIED", "FAILED"].includes(s.status));

  // ── Login screen ──
  if (!accessCode) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold font-serif text-white mb-1">Assessor Dashboard</h1>
            <p className="text-gray-500 text-sm">Masukkan Kode Asesor untuk mengakses antrian penilaian Anda.</p>
          </div>

          <form onSubmit={handleLogin} className="bg-[#0d0d1a] border border-gray-800 rounded-2xl p-6">
            <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">
              Kode Asesor
            </label>
            <input
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              placeholder="Masukkan kode asesor Anda..."
              className="w-full bg-[#05050a] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] px-4 py-3 mb-4 font-mono placeholder:text-gray-600"
            />
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button type="submit" disabled={loading || !codeInput.trim()}
              className="w-full bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] hover:from-[#e8c97a] hover:to-[#c9a84c] text-black font-bold uppercase tracking-wider py-3 rounded-xl disabled:opacity-50 transition-all">
              {loading ? "Memuat..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main dashboard ──
  return (
    <div className="min-h-screen bg-[#05050a] text-gray-200">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold font-serif text-[#c9a84c] mb-1">Assessor Workspace</h1>
            <p className="text-gray-500 text-sm font-mono">Kode: {accessCode}</p>
          </div>
          <button onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-red-400 border border-gray-800 hover:border-red-900/50 px-4 py-2 rounded-lg transition-colors">
            Keluar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Ditugaskan", value: sessions.length, color: "text-gray-300" },
            { label: "Menunggu Penilaian", value: queueSessions.length, color: "text-orange-400" },
            { label: "Selesai Dinilai", value: historySessions.length, color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="bg-[#0d0d1a] border border-gray-800 rounded-xl p-4">
              <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0d0d1a] border border-gray-800 rounded-xl p-1 mb-6">
          {[
            { id: "queue" as const, label: "Antrian Review", count: queueSessions.length },
            { id: "history" as const, label: "Riwayat Penilaian", count: historySessions.length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c]"
                  : "text-gray-500 hover:text-gray-300"
              }`}>
              {tab.label}
              {tab.count > 0 && <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Queue Tab */}
        {activeTab === "queue" && (
          <div className="space-y-3">
            {queueSessions.length === 0 ? (
              <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl py-16 text-center text-gray-600">
                ✅ Tidak ada sesi yang menunggu penilaian.
              </div>
            ) : queueSessions.map(s => (
              <div key={s.id} className="bg-[#0d0d1a] border border-orange-900/30 rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{s.certification_field}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">{s.id} · {s.candidate_id}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor[s.status] || ""}`}>
                    {s.status}
                  </span>
                  <Link href={`/exam/${s.id}/assessor`}
                    className="px-4 py-2 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 text-xs font-bold transition-colors">
                    Nilai Sekarang →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-widest">
                  <th className="text-left px-5 py-4">Sesi</th>
                  <th className="text-left px-4 py-4">Bidang</th>
                  <th className="text-left px-4 py-4">Skor</th>
                  <th className="text-left px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {historySessions.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-600">Belum ada riwayat penilaian.</td></tr>
                ) : historySessions.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-mono text-xs text-gray-400">{s.id}</td>
                    <td className="px-4 py-4 text-gray-300">{s.certification_field}</td>
                    <td className="px-4 py-4 font-bold text-[#c9a84c]">{s.score ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor[s.status] || ""}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
