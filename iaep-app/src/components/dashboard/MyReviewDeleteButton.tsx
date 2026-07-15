"use client";

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteAssignment } from '@/app/actions/reviewer';

export default function MyReviewDeleteButton({ assignmentId, submissionId }: { assignmentId: string; submissionId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const ok = confirm("Hapus entri review ini dari daftar?");
    if (!ok) return;

    setIsDeleting(true);
    try {
      const res = await deleteAssignment(assignmentId, submissionId);
      if (res.success) {
        window.location.reload();
      } else {
        alert("Gagal menghapus: " + res.error);
        setIsDeleting(false);
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      title="Hapus dari daftar"
      className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? '...' : 'Hapus'}
    </button>
  );
}
