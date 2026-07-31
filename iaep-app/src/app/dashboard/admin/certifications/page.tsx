"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  academicField?: string;
  cert: string;
  method: string;
  schedule: string;
  status: string;
  eligibilityStatus?: string;
  zoomLink?: string;
  buktiTransferUrl?: string;
}

interface ExamSession {
  id: string;
  candidate_id: string;
  certification_field: string;
  assessor_code: string;
  candidate_code: string;
  status: string;
  score?: number;
  created_at?: string;
}

interface Credential {
  id: string;
  candidate_id: string;
  credential_number: string;
  certification_type: string;
  status: string;
  issued_at: string;
  expired_at: string;
  issued_by?: string;
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "pipeline",   label: "Pipeline",          icon: "👥" },
  { id: "exam",       label: "Exam Status",        icon: "📋" },
  { id: "queue",      label: "Assessment Queue",   icon: "⏳" },
  { id: "decision",   label: "Decision",           icon: "⚖️" },
  { id: "credentials",label: "Credentials",        icon: "🏆" },
] as const;
type TabId = typeof TABS[number]["id"];

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  DRAFT: "bg-gray-800 text-gray-400 border-gray-700",
  READY: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
  IN_PROGRESS: "bg-blue-900/30 text-blue-400 border-blue-800",
  SUBMITTED: "bg-purple-900/30 text-purple-400 border-purple-800",
  UNDER_REVIEW: "bg-orange-900/30 text-orange-400 border-orange-800",
  ASSESSMENT_COMPLETED: "bg-indigo-900/30 text-indigo-300 border-indigo-800",
  CERTIFIED: "bg-green-900/30 text-green-400 border-green-800",
  FAILED: "bg-red-900/30 text-red-400 border-red-800",
  EXPIRED: "bg-gray-800 text-gray-500 border-gray-700",
  ACTIVE: "bg-green-900/30 text-green-400 border-green-800",
  REVOKED: "bg-red-900/30 text-red-400 border-red-800",
  PENDING: "bg-gray-800 text-gray-400 border-gray-700",
  ELIGIBLE: "bg-green-900/30 text-green-400 border-green-800",
  REJECTED: "bg-red-900/30 text-red-400 border-red-800",
  Registered: "bg-blue-900/30 text-blue-400 border-blue-800",
};

const Badge = ({ status }: { status: string }) => (
  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor[status] || "bg-gray-800 text-gray-400 border-gray-700"}`}>
    {status}
  </span>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CertificationsAdmin() {
  const [activeTab, setActiveTab] = useState<TabId>("pipeline");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Data loaders ──
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [candRes, sessRes] = await Promise.all([
        fetch("/api/certifications/candidates"),
        fetch("/api/certifications/exam/sessions"),
      ]);
      if (candRes.ok) setCandidates(await candRes.json());
      if (sessRes.ok) setSessions(await sessRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCredentials = useCallback(async () => {
    // Load all credentials (via admin param)
    const res = await fetch("/api/certifications/credentials?candidate_id=ALL");
    // Fallback: query per candidate if needed
    if (res.ok) setCredentials(await res.json());
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (activeTab === "credentials") loadCredentials(); }, [activeTab, loadCredentials]);

  // ── Eligibility update ──
  const updateEligibility = async (candidateId: string, status: "ELIGIBLE" | "REJECTED") => {
    setActionLoading(candidateId);
    await fetch(`/api/certifications/candidates/${candidateId}/eligibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eligibility_status: status, verified_by: "Admin" }),
    });
    await loadAll();
    setActionLoading(null);
  };

  // ── Admin certification decision ──
  const makeDecision = async (sessionId: string, decision: "CERTIFIED" | "FAILED", candidateId: string) => {
    if (!confirm(`Konfirmasi keputusan: ${decision} untuk sesi ${sessionId}?`)) return;
    setActionLoading(sessionId);
    try {
      await fetch(`/api/certifications/exam/sessions/${sessionId}/data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin": "true" },
        body: JSON.stringify({ status: decision }),
      });
      if (decision === "CERTIFIED") {
        // Auto-issue credential
        const session = sessions.find(s => s.id === sessionId);
        await fetch("/api/certifications/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exam_session_id: sessionId,
            candidate_id: candidateId,
            certification_type: session?.certification_field || "APASIFIC Certification",
            issued_by: "APASIFIC Admin",
          }),
        });
      }
      await loadAll();
    } finally {
      setActionLoading(null);
    }
  };

  // ── Create exam session ──
  const createSession = async (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;
    setActionLoading(candidateId);
    try {
      await fetch("/api/certifications/exam/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidateId,
          certification_field: candidate.cert,
          status: "DRAFT",
        }),
      });
      await loadAll();
    } finally {
      setActionLoading(null);
    }
  };

  // ── Derived data ──
  const queueSessions = sessions.filter(s => s.status === "SUBMITTED");
  const decisionSessions = sessions.filter(s => s.status === "ASSESSMENT_COMPLETED");

  // ─── Render ───
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#c9a84c] mb-1">Certification Management</h1>
            <p className="text-gray-500 text-sm">APASIFIC Certification Platform — Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/certifications/assessors"
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm transition-colors">
              Kelola Asesor
            </Link>
            <Link href="/exam"
              className="px-4 py-2 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 text-sm transition-colors">
              + Buat Exam Room
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Kandidat", value: candidates.length, color: "text-gray-300" },
            { label: "Eligible", value: candidates.filter(c => c.eligibilityStatus === "ELIGIBLE").length, color: "text-green-400" },
            { label: "Pending Penilaian", value: queueSessions.length, color: "text-orange-400" },
            { label: "Pending Keputusan", value: decisionSessions.length, color: "text-indigo-300" },
            { label: "Tersertifikasi", value: sessions.filter(s => s.status === "CERTIFIED").length, color: "text-[#c9a84c]" },
          ].map(stat => (
            <div key={stat.label} className="bg-[#0d0d1a] border border-gray-800 rounded-xl p-4">
              <p className={`text-2xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0d0d1a] border border-gray-800 rounded-xl p-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c]"
                  : "text-gray-500 hover:text-gray-300"
              }`}>
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.id === "queue" && queueSessions.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">{queueSessions.length}</span>
              )}
              {tab.id === "decision" && decisionSessions.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">{decisionSessions.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: Pipeline ── */}
        {activeTab === "pipeline" && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-4">Kandidat</th>
                  <th className="text-left px-4 py-4 hidden md:table-cell">Sertifikasi</th>
                  <th className="text-left px-4 py-4 hidden lg:table-cell">Jadwal</th>
                  <th className="text-left px-4 py-4">Eligibility</th>
                  <th className="text-left px-4 py-4">Status</th>
                  <th className="text-left px-4 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {candidates.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-600">Belum ada kandidat terdaftar.</td></tr>
                ) : candidates.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{c.name}</p>
                      <p className="text-gray-500 text-xs">{c.id} · {c.email}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-gray-300 text-sm">{c.cert}</p>
                      <p className="text-gray-600 text-xs">{c.method}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-gray-400 text-xs">{c.schedule}</td>
                    <td className="px-4 py-4">
                      <Badge status={c.eligibilityStatus || "PENDING"} />
                    </td>
                    <td className="px-4 py-4"><Badge status={c.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {c.eligibilityStatus !== "ELIGIBLE" && (
                          <button onClick={() => updateEligibility(c.id, "ELIGIBLE")}
                            disabled={actionLoading === c.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-900/20 border border-green-800/50 text-green-400 hover:bg-green-900/40 disabled:opacity-50 transition-colors">
                            Eligible ✓
                          </button>
                        )}
                        {c.eligibilityStatus !== "REJECTED" && (
                          <button onClick={() => updateEligibility(c.id, "REJECTED")}
                            disabled={actionLoading === c.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-900/20 border border-red-800/50 text-red-400 hover:bg-red-900/40 disabled:opacity-50 transition-colors">
                            Reject
                          </button>
                        )}
                        {c.eligibilityStatus === "ELIGIBLE" && (
                          <button onClick={() => createSession(c.id)}
                            disabled={actionLoading === c.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 disabled:opacity-50 transition-colors">
                            Buat Exam →
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tab: Exam Status ── */}
        {activeTab === "exam" && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-widest">
                  <th className="text-left px-5 py-4">Session ID</th>
                  <th className="text-left px-4 py-4">Bidang</th>
                  <th className="text-left px-4 py-4">Status</th>
                  <th className="text-left px-4 py-4 hidden md:table-cell">Skor</th>
                  <th className="text-left px-4 py-4">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {sessions.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-600">Belum ada sesi ujian.</td></tr>
                ) : sessions.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-gray-300">{s.id}</p>
                      <p className="text-gray-600 text-xs">Kandidat: {s.candidate_id}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-sm">{s.certification_field}</td>
                    <td className="px-4 py-4"><Badge status={s.status} /></td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-[#c9a84c] font-bold">{s.score != null ? `${s.score}` : "—"}</span>
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/exam/${s.id}`} target="_blank"
                        className="text-xs text-[#c9a84c] hover:underline underline-offset-2">
                        Buka →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Tab: Assessment Queue ── */}
        {activeTab === "queue" && (
          <div className="space-y-3">
            {queueSessions.length === 0 ? (
              <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl py-16 text-center text-gray-600">
                Tidak ada sesi yang menunggu penilaian.
              </div>
            ) : queueSessions.map(s => (
              <div key={s.id} className="bg-[#0d0d1a] border border-orange-900/30 rounded-xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white mb-1">{s.certification_field}</p>
                  <p className="text-xs text-gray-500 font-mono">{s.id} · Kandidat: {s.candidate_id}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge status={s.status} />
                  <Link href={`/exam/${s.id}`} target="_blank"
                    className="px-4 py-2 rounded-lg bg-orange-900/20 border border-orange-800/50 text-orange-400 hover:bg-orange-900/40 text-xs font-bold transition-colors">
                    Buka untuk Dinilai →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Decision ── */}
        {activeTab === "decision" && (
          <div className="space-y-3">
            {decisionSessions.length === 0 ? (
              <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl py-16 text-center text-gray-600">
                Tidak ada sesi yang menunggu keputusan sertifikasi.
              </div>
            ) : decisionSessions.map(s => (
              <div key={s.id} className="bg-[#0d0d1a] border border-indigo-900/30 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-white mb-1">{s.certification_field}</p>
                    <p className="text-xs text-gray-500 font-mono">{s.id} · Kandidat: {s.candidate_id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-[#c9a84c] font-serif">{s.score ?? "—"}</p>
                    <p className="text-xs text-gray-500">Final Score</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => makeDecision(s.id, "CERTIFIED", s.candidate_id)}
                    disabled={actionLoading === s.id}
                    className="flex-1 py-2.5 rounded-xl bg-green-900/20 border border-green-800/50 text-green-400 hover:bg-green-900/40 text-sm font-bold disabled:opacity-50 transition-colors">
                    ✅ CERTIFY + Issue Credential
                  </button>
                  <button onClick={() => makeDecision(s.id, "FAILED", s.candidate_id)}
                    disabled={actionLoading === s.id}
                    className="flex-1 py-2.5 rounded-xl bg-red-900/20 border border-red-800/50 text-red-400 hover:bg-red-900/40 text-sm font-bold disabled:opacity-50 transition-colors">
                    ❌ FAIL Candidate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Credentials ── */}
        {activeTab === "credentials" && (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-widest">
                  <th className="text-left px-5 py-4">Nomor Sertifikat</th>
                  <th className="text-left px-4 py-4">Kandidat</th>
                  <th className="text-left px-4 py-4 hidden md:table-cell">Bidang</th>
                  <th className="text-left px-4 py-4 hidden lg:table-cell">Berlaku Hingga</th>
                  <th className="text-left px-4 py-4">Status</th>
                  <th className="text-left px-4 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {credentials.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-600">Belum ada credential diterbitkan.</td></tr>
                ) : credentials.map(cr => (
                  <tr key={cr.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-[#c9a84c]">{cr.credential_number}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-xs">{cr.candidate_id}</td>
                    <td className="px-4 py-4 hidden md:table-cell text-gray-400 text-xs">{cr.certification_type}</td>
                    <td className="px-4 py-4 hidden lg:table-cell text-gray-400 text-xs">
                      {new Date(cr.expired_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-4"><Badge status={cr.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <a href={`/api/certifications/credentials/${cr.id}/pdf`} target="_blank"
                          className="text-xs px-3 py-1.5 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 transition-colors">
                          PDF
                        </a>
                        <Link href={`/verify/${cr.id}`} target="_blank"
                          className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-colors">
                          Verify
                        </Link>
                      </div>
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
