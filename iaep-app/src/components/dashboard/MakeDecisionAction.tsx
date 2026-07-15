"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, FileSignature, RefreshCw } from 'lucide-react';
import { getReviewsForSubmission, submitEditorialDecision } from '@/app/actions/editor';

export default function MakeDecisionAction({ article }: { article: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [decision, setDecision] = useState('Accepted');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();

  // Fetch reviews when opened
  useEffect(() => {
    if (isOpen && reviews.length === 0) {
      fetchReviews();
    }
  }, [isOpen]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await getReviewsForSubmission(article.id || article.submission_id);
      if (res.success) {
          setReviews(res.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDecision = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitEditorialDecision(
          article.id || article.submission_id, 
          article.author_id, 
          article.title, 
          decision, 
          comments
      );

      if (!res.success) throw new Error(res.error);

      setIsOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan keputusan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-[#c9a84c] hover:bg-[#e8c97a] rounded-lg transition-colors shadow-[0_0_15px_rgba(201,168,76,0.2)]"
      >
        <FileSignature className="w-4 h-4" /> Keputusan Editorial
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-[#c9a84c]" />
            Keputusan Editorial
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{article.title}</h3>
            <p className="text-sm text-zinc-400">Jurnal: <span className="text-zinc-300">{article.journals?.name}</span></p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Hasil Review dari Mitra Bestari</h4>
            {isLoading ? (
              <div className="p-6 text-center text-zinc-500"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Memuat ulasan...</div>
            ) : reviews.length === 0 ? (
              <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-zinc-400">
                Belum ada review yang selesai untuk naskah ini.
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-semibold text-emerald-400">Reviewer: {rev.reviewer?.full_name || 'Anonim'}</div>
                    <div className="px-2 py-1 text-xs font-bold rounded-md uppercase bg-zinc-800 text-zinc-300">
                      Rekomendasi: {rev.recommendation}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Komentar untuk Penulis:</p>
                      <p className="text-sm text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800/50 whitespace-pre-wrap">{rev.comments_for_author}</p>
                    </div>
                    {rev.comments_for_editor && (
                      <div>
                        <p className="text-xs text-amber-500/70 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Catatan Rahasia untuk Editor:</p>
                        <p className="text-sm text-amber-500/90 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 whitespace-pre-wrap">{rev.comments_for_editor}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-zinc-800 pt-6 space-y-6">
            <h4 className="text-sm font-semibold text-[#c9a84c] uppercase tracking-wider">Form Keputusan Akhir</h4>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Keputusan Editorial <span className="text-red-500">*</span></label>
              <select 
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors"
              >
                <option value="Accepted">Accepted (Diterima & Terbitkan)</option>
                <option value="Revision Required">Revision Required (Minta Revisi ke Author)</option>
                <option value="Rejected">Rejected (Tolak Naskah)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Pesan Keputusan / Catatan Editorial
              </label>
              <textarea 
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full bg-[#0a0a0f] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors"
                placeholder="Pesan ini akan terlihat oleh Penulis (Author)..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg font-medium text-sm transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmitDecision}
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#c9a84c] hover:bg-[#e8c97a] text-black rounded-lg font-bold text-sm transition-colors shadow-[0_0_15px_rgba(201,168,76,0.2)] disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? 'Menyimpan...' : 'Eksekusi Keputusan'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
