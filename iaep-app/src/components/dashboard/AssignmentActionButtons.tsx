"use client";

import React, { useState } from 'react';
import { handleReviewerDecision, deleteAssignment } from '@/app/actions/reviewer';

interface AssignmentActionButtonsProps {
  assignmentId: string;
  submissionId: string;
}

export default function AssignmentActionButtons({ assignmentId, submissionId }: AssignmentActionButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

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
         if (decision === 'accepted') {
           // Redirect to review detail page to start reviewing immediately
           window.location.href = `/dashboard/reviews/${assignmentId}`;
         } else {
           window.location.reload();
         }
      } else {
         alert("Terjadi kesalahan: " + res.error);
         setIsProcessing(false);
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
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
         window.location.reload();
      } else {
         alert("Terjadi kesalahan: " + res.error);
         setIsProcessing(false);
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex justify-end gap-3">
      <button 
        onClick={onDelete}
        disabled={isProcessing}
        className="px-4 py-2 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
      >
        Hapus
      </button>
      <button 
        onClick={() => onDecision('rejected')}
        disabled={isProcessing}
        className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
      >
        Tolak
      </button>
      <button 
        onClick={() => onDecision('accepted')}
        disabled={isProcessing}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50"
      >
        Terima Ulasan
      </button>
    </div>
  );
}
