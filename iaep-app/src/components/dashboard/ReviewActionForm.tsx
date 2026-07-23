"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Save, Send, ShieldCheck, XCircle, FileUp } from 'lucide-react';

export default function ReviewActionForm({ assignment }: { assignment: any }) {
  const [status, setStatus] = useState(assignment.status); // 'pending', 'accepted', 'completed'
  const [recommendation, setRecommendation] = useState(assignment.recommendation || 'accept');
  const [commentsAuthor, setCommentsAuthor] = useState(assignment.comments_for_author || '');
  const [commentsEditor, setCommentsEditor] = useState(assignment.comments_for_editor || '');
  const [reviewFileUrl, setReviewFileUrl] = useState(assignment.review_file_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAcceptAssignment = async () => {
    setIsSubmitting(true);
    try {
      const { handleReviewerDecision } = await import('@/app/actions/reviewer');
      const res = await handleReviewerDecision(assignment.id, assignment.submission_id || assignment.submissions?.id, 'accepted');
      if (res.success) {
        setStatus('accepted');
        router.refresh();
      } else {
        alert(res.error || 'Gagal menerima tugas.');
      }
    } catch (e: any) {
      console.error(e);
      alert('Gagal menerima tugas: ' + (e.message || e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectAssignment = async () => {
    setIsSubmitting(true);
    try {
      const { handleReviewerDecision } = await import('@/app/actions/reviewer');
      const res = await handleReviewerDecision(assignment.id, assignment.submission_id || assignment.submissions?.id, 'rejected');
      if (res.success) {
        setStatus('rejected');
        router.refresh();
      } else {
        alert(res.error || 'Gagal menolak tugas.');
      }
    } catch (e: any) {
      alert('Gagal menolak tugas: ' + (e.message || e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!commentsAuthor.trim()) {
      alert('Komentar untuk Penulis wajib diisi.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('review_assignments')
        .update({
          status: 'completed',
          recommendation,
          comments_for_author: commentsAuthor,
          comments_for_editor: commentsEditor,
          review_file_url: reviewFileUrl,
          completed_at: new Date().toISOString()
        })
        .eq('id', assignment.id);
      
      if (error) throw error;

      await supabase.from('submission_history').insert({
        submission_id: assignment.submission_id,
        action: 'Review Completed',
        performed_by: assignment.reviewer_id,
        details: `Recommendation: ${recommendation}`
      });

      setStatus('completed');
      router.refresh();
    } catch (e) {
      console.error(e);
      alert('Gagal mengirim hasil ulasan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'pending') {
    return (
      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={handleRejectAssignment}
          disabled={isSubmitting}
          className="px-6 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          Tolak Tugas
        </button>
        <button 
          onClick={handleAcceptAssignment}
          disabled={isSubmitting}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          Terima Ulasan
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-emerald-500" />
        <div>
          <h4 className="text-emerald-400 font-bold">Ulasan Telah Selesai</h4>
          <p className="text-sm text-emerald-500/80">Terima kasih atas kontribusi Anda. Hasil ulasan telah dikirim ke Editor.</p>
        </div>
      </div>
    );
  }

  // Accepted Status - Show the Review Form
  return (
    <div className="mt-6 border-t border-zinc-800 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
        <Send className="w-4 h-4 text-[#c9a84c]" />
        Formulir Penilaian (Review Form)
      </h4>
      
      <div className="space-y-6">
        {/* Recommendation */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">Rekomendasi Akhir <span className="text-red-500">*</span></label>
          <select 
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors appearance-none"
          >
            <option value="accept">Accept Submission (Diterima)</option>
            <option value="minor_revision">Revisions Required (Revisi Minor)</option>
            <option value="major_revision">Resubmit for Review (Revisi Mayor)</option>
            <option value="reject">Decline Submission (Ditolak)</option>
          </select>
        </div>

        {/* Comments for Author */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Komentar untuk Penulis (Authors) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-zinc-500 mb-2">Komentar ini akan diteruskan oleh Editor kepada Penulis. Berikan kritik dan saran yang konstruktif.</p>
          <textarea 
            value={commentsAuthor}
            onChange={(e) => setCommentsAuthor(e.target.value)}
            rows={5}
            className="w-full bg-[#0a0a0f] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors"
            placeholder="Ketik ulasan Anda di sini..."
          />
        </div>

        {/* Comments for Editor */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Komentar Rahasia untuk Editor (Opsional)
          </label>
          <p className="text-xs text-zinc-500 mb-2">Komentar ini HANYA dapat dibaca oleh Editor (tidak akan diberikan ke Penulis).</p>
          <textarea 
            value={commentsEditor}
            onChange={(e) => setCommentsEditor(e.target.value)}
            rows={3}
            className="w-full bg-[#0a0a0f] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors"
            placeholder="Pesan khusus untuk pertimbangan Editor..."
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Unggah File Hasil Pemeriksaan (PDF) <span className="text-zinc-500 font-normal">(Opsional)</span>
          </label>
          <p className="text-xs text-zinc-500 mb-2">Unggah file PDF berisi coretan/catatan langsung pada naskah (jika ada).</p>
          <div className="bg-[#0a0a0f] p-4 border border-zinc-700 rounded-lg">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={async (e) => {
                if(!e.target.files || !e.target.files[0]) return;
                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', e.target.files[0]);
                formData.append('submissionId', assignment.submission_id);
                try {
                  const res = await fetch('/api/upload-revised-manuscript', { method: 'POST', body: formData });
                  const data = await res.json();
                  if(data.success) {
                    setReviewFileUrl(data.url);
                    alert('Berhasil upload file hasil review!');
                  } else {
                    alert('Gagal upload: ' + data.error);
                  }
                } catch(err) {
                  alert('Error uploading file');
                } finally {
                  setIsUploading(false);
                }
              }}
              disabled={isUploading}
              className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 disabled:opacity-50" 
            />
            {isUploading && <p className="text-xs text-[#c9a84c] mt-2 font-bold animate-pulse">Mengunggah file... Mohon tunggu.</p>}
            {reviewFileUrl && (
              <div className="mt-3 text-sm text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded border border-emerald-500/20 flex justify-between items-center">
                <span>✅ File telah diunggah</span>
                <a href={reviewFileUrl} target="_blank" className="text-emerald-500 underline">Lihat File</a>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#c9a84c] hover:bg-[#e8c97a] text-black rounded-lg font-bold text-sm transition-colors shadow-[0_0_15px_rgba(201,168,76,0.2)] disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Mengirim...' : 'Kirim Hasil Ulasan'}
          </button>
        </div>
      </div>
    </div>
  );
}
