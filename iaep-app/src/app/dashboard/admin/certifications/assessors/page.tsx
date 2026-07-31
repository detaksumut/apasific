"use client";

import { useState, useEffect } from "react";

interface Assessor {
  id: string;
  name: string;
  email?: string;
  country: string;
  institution?: string;
  expertise: string[];
  certification_scope: string[];
  assessor_code?: string;
  qualification_status: string;
  status: string;
  created_at: string;
}

const qualColor: Record<string, string> = {
  PENDING:   "bg-gray-800 text-gray-400 border-gray-700",
  VERIFIED:  "bg-blue-900/30 text-blue-400 border-blue-800",
  APPROVED:  "bg-green-900/30 text-green-400 border-green-800",
  SUSPENDED: "bg-red-900/30 text-red-400 border-red-800",
};

const QUALIFICATIONS = ["PENDING", "VERIFIED", "APPROVED", "SUSPENDED"] as const;

export default function AssessorsManagementPage() {
  const [assessors, setAssessors] = useState<Assessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQual, setFilterQual] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "", email: "", country: "", institution: "",
    expertise: "", certification_scope: "", assessor_code: "",
  });

  const loadAssessors = async (qual?: string) => {
    setLoading(true);
    const params = qual && qual !== "ALL" ? `?qualification_status=${qual}` : "";
    const res = await fetch(`/api/certifications/assessors${params}`);
    if (res.ok) setAssessors(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadAssessors(filterQual); }, [filterQual]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/certifications/assessors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email || undefined,
        country: form.country || "Unknown",
        institution: form.institution || undefined,
        expertise: form.expertise.split(",").map(s => s.trim()).filter(Boolean),
        certification_scope: form.certification_scope.split(",").map(s => s.trim()).filter(Boolean),
        assessor_code: form.assessor_code || undefined,
      }),
    });
    if (res.ok) {
      setForm({ name: "", email: "", country: "", institution: "", expertise: "", certification_scope: "", assessor_code: "" });
      setShowForm(false);
      loadAssessors(filterQual);
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  };

  const updateQualification = async (id: string, qualification_status: string) => {
    setActionId(id);
    await fetch(`/api/certifications/assessors?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qualification_status, updated_by: "Admin" }),
    });
    await loadAssessors(filterQual);
    setActionId(null);
  };

  const approvedCount = assessors.filter(a => a.qualification_status === "APPROVED").length;
  const pendingCount = assessors.filter(a => a.qualification_status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#05050a] text-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#c9a84c] mb-1">Assessor Registry</h1>
            <p className="text-gray-500 text-sm">APASIFIC Certification Platform — Assessor Management</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 text-sm font-bold transition-colors">
            {showForm ? "✕ Tutup Form" : "+ Tambah Asesor"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Asesor", value: assessors.length, color: "text-gray-300" },
            { label: "Approved", value: approvedCount, color: "text-green-400" },
            { label: "Pending Verifikasi", value: pendingCount, color: "text-orange-400" },
            { label: "Suspended", value: assessors.filter(a => a.qualification_status === "SUSPENDED").length, color: "text-red-400" },
          ].map(s => (
            <div key={s.label} className="bg-[#0d0d1a] border border-gray-800 rounded-xl p-4">
              <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add Assessor Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-[#0d0d1a] border border-[#c9a84c]/20 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-bold text-[#c9a84c] uppercase tracking-widest mb-5">Daftarkan Asesor Baru</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { key: "name", label: "Nama Lengkap *", placeholder: "Dr. Ahmad Fauzi" },
                { key: "email", label: "Email", placeholder: "ahmad@university.edu" },
                { key: "country", label: "Negara", placeholder: "Indonesia" },
                { key: "institution", label: "Institusi", placeholder: "Universitas XYZ" },
                { key: "assessor_code", label: "Kode Asesor", placeholder: "ASMT-2026-001" },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">{field.label}</label>
                  <input type="text" placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full bg-[#05050a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a84c] px-3 py-2.5 placeholder:text-gray-600" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Expertise (pisah koma)</label>
                <input type="text" placeholder="HR Management, Labor Law, Leadership"
                  value={form.expertise}
                  onChange={e => setForm(prev => ({ ...prev, expertise: e.target.value }))}
                  className="w-full bg-[#05050a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a84c] px-3 py-2.5 placeholder:text-gray-600" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Certification Scope (pisah koma)</label>
                <input type="text" placeholder="HR, Finance, Lecturer"
                  value={form.certification_scope}
                  onChange={e => setForm(prev => ({ ...prev, certification_scope: e.target.value }))}
                  className="w-full bg-[#05050a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a84c] px-3 py-2.5 placeholder:text-gray-600" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
                Batal
              </button>
              <button type="submit"
                className="px-6 py-2 rounded-lg bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold text-sm transition-colors">
                Daftarkan Asesor
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {["ALL", ...QUALIFICATIONS].map(q => (
            <button key={q} onClick={() => setFilterQual(q)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                filterQual === q
                  ? "bg-[#c9a84c]/10 border-[#c9a84c]/40 text-[#c9a84c]"
                  : "border-gray-800 text-gray-500 hover:text-gray-300"
              }`}>
              {q}
            </button>
          ))}
        </div>

        {/* Assessors table */}
        <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-7 h-7 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : assessors.length === 0 ? (
            <div className="py-16 text-center text-gray-600 text-sm">
              Belum ada asesor terdaftar.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-500 text-xs uppercase tracking-widest">
                  <th className="text-left px-5 py-4">Asesor</th>
                  <th className="text-left px-4 py-4 hidden md:table-cell">Negara / Institusi</th>
                  <th className="text-left px-4 py-4 hidden lg:table-cell">Scope Sertifikasi</th>
                  <th className="text-left px-4 py-4">Kualifikasi</th>
                  <th className="text-left px-4 py-4">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {assessors.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{a.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{a.email || "—"}</p>
                      {a.assessor_code && (
                        <p className="text-[#c9a84c] font-mono text-[10px] mt-0.5">{a.assessor_code}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <p className="text-gray-300 text-sm">{a.country}</p>
                      <p className="text-gray-500 text-xs">{a.institution || "—"}</p>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(a.certification_scope || []).map(s => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]">
                            {s}
                          </span>
                        ))}
                        {(a.certification_scope || []).length === 0 && <span className="text-gray-600 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${qualColor[a.qualification_status] || ""}`}>
                        {a.qualification_status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {QUALIFICATIONS.filter(q => q !== a.qualification_status).map(q => (
                          <button key={q} onClick={() => updateQualification(a.id, q)}
                            disabled={actionId === a.id}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer hover:opacity-80 disabled:opacity-40 transition-opacity ${qualColor[q]}`}>
                            → {q}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
