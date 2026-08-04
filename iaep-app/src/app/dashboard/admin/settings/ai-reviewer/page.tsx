"use client";

/**
 * Super Admin — Governed AI Reviewer Settings (Target #3).
 *
 * Hanya SUPER_ADMIN yang dapat menyimpan perubahan (divalidasi server-side
 * di AIReviewerService.updateConfig). Non-SUPER_ADMIN melihat halaman ini
 * secara read-only.
 */
import { useState, useEffect } from "react";

const MODES = [
  {
    value: "disabled",
    title: "Disabled",
    desc: "AI Reviewer nonaktif. Editor tidak dapat menjalankan AI review.",
  },
  {
    value: "optional",
    title: "Optional",
    desc: "Editor dapat memilih menjalankan AI Reviewer sebagai reviewer tambahan (advisory).",
  },
  {
    value: "mandatory",
    title: "Mandatory Additional Reviewer",
    desc: "AI Reviewer menjadi reviewer tambahan wajib untuk setiap naskah yang direview (hasil tetap advisory).",
  },
];

export default function AIReviewerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ enabled: false, mode: "disabled" });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    (async () => {
      try {
        const m = await import("@/app/actions/aiReviewer");
        const res = await m.getAIReviewerSettings();
        if (res?.success) {
          setCanManage(Boolean(res.canManage));
          setForm({
            enabled: Boolean(res.config?.enabled),
            mode: res.config?.mode || "disabled",
          });
          setSavedAt(res.config?.updatedAt || null);
        } else {
          showToast(res?.error || "Gagal memuat pengaturan.", false);
        }
      } catch {
        showToast("Gagal memuat pengaturan.", false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const m = await import("@/app/actions/aiReviewer");
      const res = await m.updateAIReviewerSettings(form.enabled, form.mode);
      if (res?.success) {
        setForm({
          enabled: Boolean(res.config?.enabled),
          mode: res.config?.mode || form.mode,
        });
        setSavedAt(res.config?.updatedAt || null);
        showToast("Pengaturan AI Reviewer tersimpan.");
      } else {
        showToast(res?.error || "Gagal menyimpan pengaturan.", false);
      }
    } catch {
      showToast("Gagal menyimpan pengaturan.", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">
      {toast && (
        <div
          className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] ${
            toast.ok ? "bg-green-500/90" : "bg-red-500/90"
          } text-white px-6 py-3 rounded-full font-semibold shadow-lg animate-fade-in-down border backdrop-blur-sm`}
        >
          {toast.msg}
        </div>
      )}

      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">🤖 AI Reviewer Agent</h1>
        <p className="text-gray-400">
          Governed AI Reviewer (Target #3) — reviewer tambahan berbasis AI untuk membantu editor.
        </p>
        {savedAt && (
          <p className="text-xs text-gray-500 mt-2">
            Terakhir diperbarui: {new Date(savedAt).toLocaleString("id-ID")}
          </p>
        )}
      </div>

      {/* Governance banner */}
      <div className="bg-[#12121f] rounded-2xl border border-amber-700/40 p-5">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide mb-2">
          Batasan Tata Kelola (Governance)
        </h2>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>Pengaturan ini hanya dapat diubah oleh <span className="text-[#c9a84c] font-semibold">SUPER ADMIN</span>.</li>
          <li>AI Reviewer bersifat <span className="font-semibold">advisory</span>: tidak dapat accept/reject naskah.</li>
          <li>AI Reviewer tidak dapat melewati editor atau mengubah status submission secara langsung.</li>
          <li>Keputusan akhir selalu berada di tangan Editor (lifecycle gate tidak berubah).</li>
        </ul>
        {!canManage && !loading && (
          <p className="mt-3 text-xs text-red-400 font-semibold">
            Anda login sebagai non-SUPER-ADMIN — halaman ini hanya dapat dibaca (read-only).
          </p>
        )}
      </div>

      {/* Enable toggle */}
      <div className="bg-[#12121f] rounded-2xl border border-gray-800 shadow-xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#c9a84c]">Aktifkan AI Reviewer</h2>
          <p className="text-xs text-gray-500 mt-1">
            Master switch. Jika dimatikan, AI review tidak dapat dijalankan dalam mode apa pun.
          </p>
        </div>
        <button
          type="button"
          onClick={() => canManage && setForm(f => ({ ...f, enabled: !f.enabled }))}
          disabled={!canManage || loading}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            form.enabled ? "bg-emerald-500" : "bg-gray-700"
          } ${(!canManage || loading) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          aria-label="Toggle AI Reviewer"
        >
          <span
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${
              form.enabled ? "left-7" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Mode selection */}
      <div className="bg-[#12121f] rounded-2xl border border-gray-800 shadow-xl p-6">
        <h2 className="text-xl font-bold text-[#c9a84c] mb-1">Reviewer Mode</h2>
        <p className="text-xs text-gray-500 mb-4">
          Menentukan bagaimana AI Reviewer berpartisipasi dalam alur review.
        </p>
        <div className="space-y-3">
          {MODES.map(m => (
            <label
              key={m.value}
              className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                form.mode === m.value
                  ? "border-[#c9a84c] bg-[#c9a84c]/5"
                  : "border-gray-800 bg-[#1a1a2e] hover:border-gray-600"
              } ${(!canManage || loading) ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <input
                type="radio"
                name="ai-reviewer-mode"
                value={m.value}
                checked={form.mode === m.value}
                disabled={!canManage || loading}
                onChange={() => setForm(f => ({ ...f, mode: m.value }))}
                className="mt-1 accent-[#c9a84c]"
              />
              <div>
                <p className="text-white font-semibold">{m.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!canManage || saving || loading}
          className={`font-bold py-2.5 px-8 rounded transition-colors text-sm ${
            canManage && !saving && !loading
              ? "bg-[#c9a84c] hover:bg-[#e8c97a] text-black"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  );
}