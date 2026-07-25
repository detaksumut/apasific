"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, Trash2, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { handleReviewerDecision, deleteAssignment } from '@/app/actions/reviewer';
import { ReviewStatus } from '@/domain/reviewer/ReviewStatus';

interface ReviewAssignmentActionProps {
  assignment: any;
  showDelete?: boolean;
}

export default function ReviewAssignmentAction({ assignment, showDelete = false }: ReviewAssignmentActionProps) {
  const [status, setStatus] = useState<string>(assignment.status || 'pending');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const submissionId = assignment.submission_id || assignment.submissions?.id || '';
  const assignmentId = assignment.id;

  const onDecision = async (decision: 'accepted' | 'rejected') => {
    if (decision === 'rejected') {
      const confirmReject = confirm("Apakah Anda yakin ingin MENOLAK tugas review naskah ini?");
      if (!confirmReject) return;
    } else {
      const confirmAccept = confirm("Apakah Anda yakin ingin MENERIMA tugas review naskah ini?");
      if (!confirmAccept) return;
    }

    setIsProcessing(true);
    try {
      const res = await handleReviewerDecision(assignmentId, submissionId, decision);
      if (res.success) {
        setStatus(decision);
        if (decision === 'accepted') {
          // Go to evaluation page immediately
          router.push(`/dashboard/reviews/${assignmentId}`);
        } else {
          router.refresh();
        }
      } else {
        alert("Terjadi kesalahan: " + res.error);
        setIsProcessing(false);
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem.");
      setIsProcessing(false);
    }
  };

  const onDelete = async () => {
    const confirmDelete = confirm("Apakah Anda yakin ingin MENGHAPUS riwayat penugasan ini secara permanen?");
    if (!confirmDelete) return;

    setIsProcessing(true);
    try {
      const res = await deleteAssignment(assignmentId, submissionId);
      if (res.success) {
        router.refresh();
        window.location.reload();
      } else {
        alert("Terjadi kesalahan: " + res.error);
        setIsProcessing(false);
      }
    } catch (e) {
      alert("Terjadi kesalahan sistem.");
      setIsProcessing(false);
    }
  };

  // 1. PENDING: Invitation state
  if (status === 'pending' || status === ReviewStatus.Pending) {
    return (
      <div className="space-y-4 mt-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <h4 className="flex items-center gap-2 text-amber-500 font-semibold text-sm mb-1.5">
            <AlertCircle className="w-4 h-4" /> Pernyataan Etika & Konfidensialitas:
          </h4>
          <p className="text-xs text-amber-500/80 leading-relaxed">
            Sebelum dapat mengakses naskah lengkap dan memberikan ulasan, Anda berkewajiban mengonfirmasi kesediaan. Dengan mengklik "Terima Ulasan", Anda menyatakan bersedia mengulas secara profesional dan bebas dari benturan kepentingan dengan penulis.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => onDecision('rejected')}
            disabled={isProcessing}
            className="px-5 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            Tolak Tugas
          </button>
          <button 
            onClick={() => onDecision('accepted')}
            disabled={isProcessing}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Terima Ulasan
          </button>
        </div>
      </div>
    );
  }

  // 2. ACCEPTED / REVISION_PENDING: Active review state
  if (
    status === 'accepted' || 
    status === 'revision_pending' || 
    status === ReviewStatus.Accepted || 
    status === ReviewStatus.RevisionPending
  ) {
    const isRevision = status === 'revision_pending' || status === ReviewStatus.RevisionPending;
    return (
      <div className="flex justify-end items-center gap-3 mt-4">
        {isRevision && (
          <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg mr-auto">
            🔔 Revisi dari Author sudah dikirim oleh Editor.
          </span>
        )}
        <button 
          onClick={() => router.push(`/dashboard/reviews/${assignmentId}`)}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
        >
          <Eye className="w-4 h-4" />
          {isRevision ? 'Periksa Revisi & Upload Hasil Final' : 'Buka & Mulai Ulasan'}
        </button>
      </div>
    );
  }

  // 3. COMPLETED: Done review state
  if (status === 'completed' || status === ReviewStatus.Completed) {
    return (
      <div className="space-y-4 mt-4">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h4 className="text-emerald-400 font-bold text-sm">Ulasan Telah Selesai</h4>
              <p className="text-xs text-emerald-500/80">Terima kasih atas kontribusi Anda. Hasil ulasan telah dikirim ke Editor.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/dashboard/reviews/${assignmentId}`)}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold bg-zinc-800/50"
          >
            <Eye className="w-3.5 h-3.5" /> Lihat Hasil
          </button>
        </div>
        {showDelete && (
          <div className="flex justify-end">
            <button 
              onClick={onDelete}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-colors border border-red-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus Riwayat
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. REJECTED: Declined state
  if (status === 'rejected' || status === ReviewStatus.Rejected) {
    return (
      <div className="space-y-4 mt-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500 shrink-0" />
          <div>
            <h4 className="text-red-400 font-bold text-sm">Undangan Ditolak</h4>
            <p className="text-xs text-red-500/80">Anda telah menolak tugas review untuk naskah ini.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={onDelete}
            disabled={isProcessing}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-colors border border-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus Tugas
          </button>
        </div>
      </div>
    );
  }

  return null;
}
