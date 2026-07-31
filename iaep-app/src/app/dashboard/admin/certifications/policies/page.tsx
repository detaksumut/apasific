"use client";

import { useState, useEffect } from "react";

interface Policy {
  id: string;
  name: string;
  code: string;
  category: string;
  level?: string;
  passing_grade: number;
  validity_years: number;
  assessment_method: string[];
  mcq_weight: number;
  essay_weight: number;
  interview_weight: number;
  interview_required: boolean;
  reviewer_count: number;
  certificate_template?: string;
  description?: string;
  is_active: boolean;
}

const CATEGORIES = ["Professional", "Academic", "Technical", "Executive"] as const;
const LEVELS = ["Foundation", "Professional", "Senior", "Expert"] as const;
const TEMPLATES = ["STANDARD", "LECTURER", "EXECUTIVE"] as const;

const categoryColor: Record<string, string> = {
  Professional: "bg-blue-900/30 text-blue-400 border-blue-800",
  Academic: "bg-purple-900/30 text-purple-400 border-purple-800",
  Technical: "bg-cyan-900/30 text-cyan-400 border-cyan-800",
  Executive: "bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/30",
};

const emptyForm = {
  name: "", code: "", category: "Professional", level: "",
  passing_grade: 70, validity_years: 3,
  mcq_weight: 0.60, essay_weight: 0.40, interview_weight: 0.00,
  interview_required: false, reviewer_count: 1,
  certificate_template: "STANDARD", description: "",
};

export default function CertificationPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterCat, setFilterCat] = useState("ALL");
  const [actionId, setActionId] = useState<string | null>(null);
  const [weightError, setWeightError] = useState("");

  const loadPolicies = async () => {
    setLoading(true);
    const res = await fetch("/api/certifications/policies?include_inactive=true");
    if (res.ok) setPolicies(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadPolicies(); }, []);

  // Validate weight sum on every change
  useEffect(() => {
    const total = Math.round((Number(form.mcq_weight) + Number(form.essay_weight) + Number(form.interview_weight)) * 100) / 100;
    if (Math.abs(total - 1.00) > 0.01) {
      setWeightError(`Total bobot = ${total.toFixed(2)} — harus = 1.00`);
    } else {
      setWeightError("");
    }
  }, [form.mcq_weight, form.essay_weight, form.interview_weight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (weightError) return;

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `/api/certifications/policies?id=${editingId}`
      : "/api/certifications/policies";

    const body = {
      ...form,
      assessment_method: [
        form.mcq_weight > 0 && "MCQ",
        form.essay_weight > 0 && "ESSAY",
        form.interview_weight > 0 && "INTERVIEW",
      ].filter(Boolean),
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setForm({ ...emptyForm });
      setShowForm(false);
      setEditingId(null);
      loadPolicies();
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  };

  const startEdit = (policy: Policy) => {
    setForm({
      name: policy.name,
      code: policy.code,
      category: policy.category,
      level: policy.level || "",
      passing_grade: policy.passing_grade,
      validity_years: policy.validity_years,
      mcq_weight: policy.mcq_weight,
      essay_weight: policy.essay_weight,
      interview_weight: policy.interview_weight,
      interview_required: policy.interview_required,
      reviewer_count: policy.reviewer_count,
      certificate_template: policy.certificate_template || "STANDARD",
      description: policy.description || "",
    });
    setEditingId(policy.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    setActionId(id);
    if (currentActive) {
      await fetch(`/api/certifications/policies?id=${id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/certifications/policies?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
    }
    await loadPolicies();
    setActionId(null);
  };

  const filteredPolicies = filterCat === "ALL"
    ? policies
    : policies.filter(p => p.category === filterCat);

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );

  const inputClass = "w-full bg-[#05050a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] px-3 py-2.5 placeholder:text-gray-600";

  return (
    <div className="min-h-screen bg-[#05050a] text-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-serif text-[#c9a84c] mb-1">Certification Policies</h1>
            <p className="text-gray-500 text-sm">Single Source of Truth — aturan scoring, passing grade, dan validity semua sertifikasi APASIFIC.</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ ...emptyForm }); }}
            className="px-5 py-2.5 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 text-sm font-bold transition-colors">
            {showForm ? "✕ Tutup" : "+ Policy Baru"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Policies", value: policies.length, color: "text-gray-300" },
            { label: "Active", value: policies.filter(p => p.is_active).length, color: "text-green-400" },
            { label: "Dengan Interview", value: policies.filter(p => p.interview_required).length, color: "text-blue-400" },
            { label: "Panel Assessor", value: policies.filter(p => p.reviewer_count > 1).length, color: "text-[#c9a84c]" },
          ].map(s => (
            <div key={s.label} className="bg-[#0d0d1a] border border-gray-800 rounded-xl p-4">
              <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#0d0d1a] border border-[#c9a84c]/20 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-bold text-[#c9a84c] uppercase tracking-widest mb-5">
              {editingId ? "Edit Policy" : "Buat Policy Baru"}
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <Field label="Nama Lengkap *">
                <input required type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="HR Professional Certification" className={inputClass} />
              </Field>
              <Field label="Code *">
                <input required type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="HR" className={inputClass} />
              </Field>
              <Field label="Deskripsi">
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Deskripsi singkat..." className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <Field label="Category">
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Level">
                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} className={inputClass}>
                  <option value="">— (tidak ada)</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Passing Grade">
                <input type="number" min={1} max={100} value={form.passing_grade}
                  onChange={e => setForm(p => ({ ...p, passing_grade: Number(e.target.value) }))} className={inputClass} />
              </Field>
              <Field label="Validity (tahun)">
                <input type="number" min={1} max={20} value={form.validity_years}
                  onChange={e => setForm(p => ({ ...p, validity_years: Number(e.target.value) }))} className={inputClass} />
              </Field>
            </div>

            {/* Scoring Weights */}
            <div className="bg-[#05050a] border border-gray-800 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">
                Bobot Scoring <span className="text-gray-600 normal-case font-normal">(harus total = 1.00)</span>
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "MCQ Weight", key: "mcq_weight" as const },
                  { label: "Essay Weight", key: "essay_weight" as const },
                  { label: "Interview Weight", key: "interview_weight" as const },
                ].map(w => (
                  <Field key={w.key} label={w.label}>
                    <input type="number" step="0.01" min={0} max={1} value={form[w.key]}
                      onChange={e => setForm(p => ({ ...p, [w.key]: Number(e.target.value) }))}
                      className={inputClass} />
                  </Field>
                ))}
              </div>
              {weightError ? (
                <p className="text-red-400 text-xs mt-2">⚠️ {weightError}</p>
              ) : (
                <p className="text-green-400 text-xs mt-2">✅ Total bobot = 1.00</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <Field label="Interview Required">
                <select value={form.interview_required ? "true" : "false"}
                  onChange={e => setForm(p => ({ ...p, interview_required: e.target.value === "true" }))} className={inputClass}>
                  <option value="false">Tidak</option>
                  <option value="true">Ya (Wajib)</option>
                </select>
              </Field>
              <Field label="Jumlah Reviewer (Panel)">
                <input type="number" min={1} max={5} value={form.reviewer_count}
                  onChange={e => setForm(p => ({ ...p, reviewer_count: Number(e.target.value) }))} className={inputClass} />
              </Field>
              <Field label="Certificate Template">
                <select value={form.certificate_template} onChange={e => setForm(p => ({ ...p, certificate_template: e.target.value }))} className={inputClass}>
                  {TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm({ ...emptyForm }); }}
                className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
                Batal
              </button>
              <button type="submit" disabled={!!weightError}
                className="px-6 py-2 rounded-lg bg-[#c9a84c] hover:bg-[#e8c97a] disabled:opacity-50 text-black font-bold text-sm transition-colors">
                {editingId ? "Simpan Perubahan" : "Buat Policy"}
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {["ALL", ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                filterCat === c
                  ? "bg-[#c9a84c]/10 border-[#c9a84c]/40 text-[#c9a84c]"
                  : "border-gray-800 text-gray-500 hover:text-gray-300"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Policies Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl py-16 text-center text-gray-600">
            Belum ada certification policy. Buat yang pertama.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPolicies.map(p => (
              <div key={p.id} className={`bg-[#0d0d1a] border rounded-xl p-5 transition-opacity ${!p.is_active ? "opacity-50 border-gray-800" : "border-gray-800 hover:border-gray-700"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded">{p.code}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColor[p.category] || ""}`}>
                        {p.category}{p.level ? ` · ${p.level}` : ""}
                      </span>
                      {!p.is_active && <span className="text-[10px] text-gray-600 font-bold uppercase">INACTIVE</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                    {p.description && <p className="text-gray-500 text-xs mt-0.5">{p.description}</p>}
                  </div>
                </div>

                {/* Policy details */}
                <div className="bg-[#05050a] rounded-lg p-3 mb-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Passing Grade</span>
                    <span className="ml-2 text-white font-bold">{p.passing_grade}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Validity</span>
                    <span className="ml-2 text-white font-bold">{p.validity_years} tahun</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reviewer</span>
                    <span className="ml-2 text-white font-bold">{p.reviewer_count === 1 ? "Single" : `Panel (${p.reviewer_count})`}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Template</span>
                    <span className="ml-2 text-white font-bold">{p.certificate_template || "STANDARD"}</span>
                  </div>
                </div>

                {/* Scoring bar */}
                <div className="mb-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Scoring Weights</p>
                  <div className="flex rounded-full overflow-hidden h-2">
                    {p.mcq_weight > 0 && (
                      <div style={{ width: `${p.mcq_weight * 100}%` }} className="bg-blue-500 h-full" title={`MCQ ${p.mcq_weight * 100}%`} />
                    )}
                    {p.essay_weight > 0 && (
                      <div style={{ width: `${p.essay_weight * 100}%` }} className="bg-[#c9a84c] h-full" title={`Essay ${p.essay_weight * 100}%`} />
                    )}
                    {p.interview_weight > 0 && (
                      <div style={{ width: `${p.interview_weight * 100}%` }} className="bg-green-500 h-full" title={`Interview ${p.interview_weight * 100}%`} />
                    )}
                  </div>
                  <div className="flex gap-3 mt-1.5">
                    {p.mcq_weight > 0 && <span className="text-[10px] text-blue-400">MCQ {Math.round(p.mcq_weight * 100)}%</span>}
                    {p.essay_weight > 0 && <span className="text-[10px] text-[#c9a84c]">Essay {Math.round(p.essay_weight * 100)}%</span>}
                    {p.interview_weight > 0 && <span className="text-[10px] text-green-400">Interview {Math.round(p.interview_weight * 100)}%</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-800">
                  <button onClick={() => startEdit(p)}
                    className="flex-1 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-xs transition-colors">
                    Edit
                  </button>
                  <button onClick={() => toggleActive(p.id, p.is_active)}
                    disabled={actionId === p.id}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-colors disabled:opacity-50 ${
                      p.is_active
                        ? "border-red-900/50 text-red-400 hover:bg-red-900/20"
                        : "border-green-900/50 text-green-400 hover:bg-green-900/20"
                    }`}>
                    {p.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
