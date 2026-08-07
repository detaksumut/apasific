import React from 'react';
import { ReviewStatus } from '@/domain/reviewer/ReviewStatus';
import { Clock, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ReviewStatusBadgeProps {
  status: string | ReviewStatus;
}

export default function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
  const normStatus = (status || '').toLowerCase();

  switch (normStatus) {
    case 'pending':
    case ReviewStatus.Pending:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
          <Clock className="w-3.5 h-3.5" /> UNDANGAN MENUNGGU
        </span>
      );
    case 'accepted':
    case 'reviewing':
    case ReviewStatus.Accepted:
    case ReviewStatus.Reviewing:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
          <FileText className="w-3.5 h-3.5" /> DALAM PROSES REVIEW
        </span>
      );
    case 'revision_pending':
    case ReviewStatus.RevisionPending:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
          <AlertCircle className="w-3.5 h-3.5" /> REVISI MENUNGGU
        </span>
      );
    case 'completed':
    case ReviewStatus.Completed:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          <CheckCircle className="w-3.5 h-3.5" /> REVIEW SELESAI
        </span>
      );
    case 'rejected':
    case ReviewStatus.Rejected:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md">
          <XCircle className="w-3.5 h-3.5" /> DITOLAK
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-md">
          {normStatus.toUpperCase()}
        </span>
      );
  }
}
