'use client';

import { useState } from 'react';

interface UpdateMetadataButtonProps {
  submissionId: string;
  journalId: string;
  currentVolume?: string;
  currentIssue?: string;
}

export default function UpdateMetadataButton({
  submissionId,
  journalId,
  currentVolume = '',
  currentIssue = '',
}: UpdateMetadataButtonProps) {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(currentVolume);
  const [issue, setIssue] = useState(currentIssue);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleUpdate = async () => {
    if (!volume && !issue) {
      showToast('Isi minimal salah satu: Volume atau Edisi.');
      return;
    }
    const confirmed = confirm(
      `Perbarui metadata naskah ini?\nVolume: ${volume || '-'}\nEdisi: ${issue || '-'}`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { publishArticle } = await import('@/app/actions/editor');
      const res = await publishArticle(submissionId, journalId, volume, issue);
      if (res.success) {
        showToast('✅ Metadata berhasil diperbarui!');
        setOpen(false);
      } else {
        showToast('❌ Gagal memperbarui: ' + (res as any).error);
      }
    } catch (e: any) {
      showToast('❌ Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-zinc-900 border border-zinc-700 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
        title="Perbarui Volume & Edisi naskah yang sudah terbit"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Metadata
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Perbarui Metadata Terbitan</h4>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Volume</label>
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="cth: Vol. 1"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Edisi / Issue</label>
              <input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="cth: No. 2"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              * Perubahan memperbarui database Supabase, Firestore, dan Sertifikat penulis secara otomatis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
