"use client";

import { useState, useEffect, useCallback } from "react";

interface Accreditation {
  id: string;
  certification_code: string | null;
  accreditation_body: string;
  region: string;
  country: string | null;
  recognition_type: string;
  recognition_level: string | null;
  accreditation_number: string | null;
  valid_from: string | null;
  valid_until: string | null;
  document_url: string | null;
  notes: string | null;
  is_active: boolean;
}

const RECOGNITION_TYPES = ["FULL", "PARTIAL", "PARTNER", "EQUIVALENT"] as const;
const REGIONS = ["ASEAN", "Asia Pacific", "South Asia", "Global", "Indonesia", "Malaysia", "Singapore"] as const;

const typeColor: Record<string, string> = {
  FULL: "bg-green-900/30 text-green-400 border-green-800",
  PARTIAL: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
  PARTNER: "bg-blue-900/30 text-blue-400 border-blue-800",
  EQUIVALENT: "bg-purple-900/30 text-purple-400 border-purple-800",
};

const emptyForm = {
  certification_code: "",
  accreditation_body: "",
  region: "ASEAN",
  country: "",
  recognition_type: "FULL",
  recognition_level: "",
  accreditation_number: "",
  valid_from: "",
  valid_until: "",
  document_url: "",
  notes: "",
};

export default function AccreditationsPage() {
  const [accreditations, setAccreditations] = useState<Accreditation[]>([]);
  const [policies, setPolicies] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterRegion, setFilterRegion] = useState("ALL");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [accRes, polRes] = await Promise.all([
      fetch("/api/certifications/accreditations?active_only=false"),
      fetch("/api/certifications/policies?include_inactive=false"),
    ]);
    if (accRes.ok) setAccreditations(await accRes.json());
    if (polRes.ok) setPolicies(await polRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `/api/certifications/accreditations?id=${editingId}`
      : "/api/certifications/accreditations";

    const body = { ...form };
    if (!body.certification_code) body.certification_code = ""; // null translation handled by API

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setForm({ ...emptyForm });
      setShowForm(false);
      setEditingId(null);
      loadData();
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  };

  const startEdit = (acc: Accreditation) => {
    setForm({
      certification_code: acc.certification_code || "",
      accreditation_body: acc.accreditation_body,
      region: acc.region,
      country: acc.country || "",
      recognition_type: acc.recognition_type,
      recognition_level: acc.recognition_level || "",
      accreditation_number: acc.accreditation_number || "",
      valid_from: acc.valid_from ? new Date(acc.valid_from).toISOString().split("T")[0] : "",
      valid_until: acc.valid_until ? new Date(acc.valid_until).toISOString().split("T")[0] : "",
      document_url: acc.document_url || "",
      notes: acc.notes || "",
    });
    setEditingId(acc.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    setActionId(id);
    if (currentActive) {
      await fetch(`/api/certifications/accreditations?id=${id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/certifications/accreditations?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
    }
    await loadData();
    setActionId(null);
  };

  const filtered = filterRegion === "ALL"
    ? accreditations
    : accreditations.filter(a => a.region === filterRegion);

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
            <h1 className="text-2xl font-bold font-serif text-[#c9a84c] mb-1">International Accreditation</h1>
            <p className="text-gray-500 text-sm">Kelola pengakuan internasional untuk sertifikasi APASIFIC.</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ ...emptyForm }); }}
            className="px-5 py-2.5 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20 text-sm font-bold transition-colors">
            {showForm ? "✕ Tutup" : "+ Tambah Pengakuan"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#0d0d1a] border border-[#c9a84c]/20 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-bold text-[#c9a84c] uppercase tracking-widest mb-5">
              {editingId ? "Edit Pengakuan" : "Tambah Pengakuan Baru"}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Badan Akreditasi (Institution) *">
                <input required type="text" value={form.accreditation_body} onChange={e => setForm(p => ({ ...p, accreditation_body: e.target.value }))}
                  placeholder="Contoh: ASEAN Qualifications Reference Framework" className={inputClass} />
              </Field>
              <Field label="Berlaku Untuk (Policy) *">
                <select value={form.certification_code} onChange={e => setForm(p => ({ ...p, certification_code: e.target.value }))} className={inputClass}>
                  <option value="">🌟 Berlaku Global (Semua Sertifikasi APASIFIC)</option>
                  {policies.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <Field label="Region *">
                <input required type="text" list="regions" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className={inputClass} />
                <datalist id="regions">{REGIONS.map(r => <option key={r} value={r} />)}</datalist>
              </Field>
              <Field label="Negara (Opsional)">
                <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} placeholder="Kosongkan jika level region" className={inputClass} />
              </Field>
              <Field label="Recognition Type *">
                <select required value={form.recognition_type} onChange={e => setForm(p => ({ ...p, recognition_type: e.target.value }))} className={inputClass}>
                  {RECOGNITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Recognition Level">
                <input type="text" value={form.recognition_level} onChange={e => setForm(p => ({ ...p, recognition_level: e.target.value }))} placeholder="Contoh: KKNI Level 6" className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <Field label="Nomor Akreditasi (Opsional)">
                <input type="text" value={form.accreditation_number} onChange={e => setForm(p => ({ ...p, accreditation_number: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Valid From">
                <input type="date" value={form.valid_from} onChange={e => setForm(p => ({ ...p, valid_from: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Valid Until (Kosong = Permanen)">
                <input type="date" value={form.valid_until} onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Document URL">
                <input type="url" value={form.document_url} onChange={e => setForm(p => ({ ...p, document_url: e.target.value }))} placeholder="https://..." className={inputClass} />
              </Field>
            </div>

            <Field label="Notes">
              <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={inputClass} />
            </Field>

            <div className="flex justify-end gap-3 mt-5">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm({ ...emptyForm }); }}
                className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
                Batal
              </button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-[#c9a84c] hover:bg-[#e8c97a] text-black font-bold text-sm transition-colors">
                {editingId ? "Simpan Perubahan" : "Simpan Pengakuan"}
              </button>
            </div>
          </form>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
          {["ALL", ...Array.from(new Set(accreditations.map(a => a.region)))].map(r => (
            <button key={r} onClick={() => setFilterRegion(r)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors whitespace-nowrap ${
                filterRegion === r
                  ? "bg-[#c9a84c]/10 border-[#c9a84c]/40 text-[#c9a84c]"
                  : "border-gray-800 text-gray-500 hover:text-gray-300"
              }`}>
              {r}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-7 h-7 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0d0d1a] border border-gray-800 rounded-2xl py-16 text-center text-gray-600">
            Belum ada data akreditasi internasional.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(acc => (
              <div key={acc.id} className={`bg-[#0d0d1a] border rounded-xl p-5 transition-opacity ${!acc.is_active ? "opacity-50 border-gray-800" : "border-gray-800 hover:border-gray-700"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${typeColor[acc.recognition_type] || ""}`}>
                        {acc.recognition_type}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-800 px-2 py-0.5 rounded-full">
                        {acc.region} {acc.country ? `· ${acc.country}` : ""}
                      </span>
                      {!acc.is_active && <span className="text-[10px] text-red-500 font-bold uppercase border border-red-900/50 px-2 py-0.5 rounded-full">INACTIVE</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-white">{acc.accreditation_body}</h3>
                    {acc.certification_code ? (
                      <p className="text-[#c9a84c] text-xs font-mono mt-1">APASIFIC {acc.certification_code}</p>
                    ) : (
                      <p className="text-blue-400 text-xs font-mono mt-1">🌟 ALL APASIFIC CERTIFICATIONS</p>
                    )}
                  </div>
                </div>

                <div className="bg-[#05050a] rounded-lg p-3 mb-3 grid grid-cols-2 gap-y-2 text-xs">
                  <div><span className="text-gray-500 block mb-0.5">Level</span><span className="text-gray-300 font-medium">{acc.recognition_level || "-"}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Accreditation #</span><span className="text-gray-300 font-mono">{acc.accreditation_number || "-"}</span></div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Valid From</span>
                    <span className="text-gray-300">{acc.valid_from ? new Date(acc.valid_from).toLocaleDateString("id-ID") : "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Valid Until</span>
                    <span className="text-gray-300">{acc.valid_until ? new Date(acc.valid_until).toLocaleDateString("id-ID") : "Permanent"}</span>
                  </div>
                </div>

                {acc.notes && <p className="text-gray-500 text-xs mb-3 line-clamp-2">{acc.notes}</p>}

                <div className="flex gap-2 pt-3 border-t border-gray-800">
                  <button onClick={() => startEdit(acc)}
                    className="flex-1 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white text-xs transition-colors">
                    Edit
                  </button>
                  <button onClick={() => toggleActive(acc.id, acc.is_active)}
                    disabled={actionId === acc.id}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-colors disabled:opacity-50 ${
                      acc.is_active ? "border-red-900/50 text-red-400 hover:bg-red-900/20" : "border-green-900/50 text-green-400 hover:bg-green-900/20"
                    }`}>
                    {acc.is_active ? "Nonaktifkan" : "Aktifkan"}
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
