"use client";

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import AssignReviewerModal from './AssignReviewerModal';

/**
 * Client wrapper that renders the "Pilih & Tugaskan Reviewer" trigger button
 * and manages the open state of the AssignReviewerModal.
 */
export default function AssignReviewerButton({
  submissionId,
  articleTitle,
}: {
  submissionId: string;
  articleTitle?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-[#c9a84c] hover:bg-[#e8c97a] rounded-lg transition-colors shadow-[0_0_15px_rgba(201,168,76,0.2)]"
      >
        <UserPlus className="w-4 h-4" /> Pilih & Tugaskan Reviewer
      </button>

      {isOpen && (
        <AssignReviewerModal
          submissionId={submissionId}
          articleTitle={articleTitle}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
