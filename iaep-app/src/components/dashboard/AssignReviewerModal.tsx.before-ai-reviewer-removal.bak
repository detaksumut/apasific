"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Sparkles, GraduationCap, Award, Target } from 'lucide-react';
import { assignReviewer } from '@/app/actions/editor';
import { getAIRankedReviewersForAssignment } from '@/app/actions/reviewerRecommendation';

interface RecommendedReviewer {
  reviewerId: string;
  fullName: string;
  email: string | null;
  academicField: string | null;
  university: string | null;
  country: string | null;
  expertiseScore: number;
  availabilityScore: number;
  workloadScore: number;
  conflictCheck: { hasConflict: boolean; reasons: string[] };
  totalScore: number;
  matchedTerms: string[];
  reason: string;
  rank: number;
}

/**
 * AssignReviewerModal — AI Recommended Reviewer selection popup.
 *
 * Built from zero. Shows ONLY the AI recommended reviewer selection:
 *   - Article title
 *   - Exactly 2 recommended human reviewers (from ReviewerMatchingService)
 *   - Each with: name, academic field, institution, country, expertise match,
 *     matching score, reason recommendation
 *   - "Pilih Reviewer Ini" → calls the existing assignReviewer()
 *
 * Advisory only — never auto-assigns. No manual reviewer list, no search,
 * no field filter.
 */
export default function AssignReviewerModal({
  submissionId,
  articleTitle,
  onClose,
}: {
  submissionId: string;
  articleTitle?: string | null;
  onClose: () => void;
}) {
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [recommendedReviewers, setRecommendedReviewers] = useState<RecommendedReviewer[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState('');

  // Load the top 2 AI-ranked reviewer recommendations when the modal opens.
  const loadRecommendations = useCallback(async () => {
    if (!submissionId) {
      setRecommendationsLoading(false);
      setRecommendationsError('Submission ID tidak valid.');
      return;
    }
    setRecommendationsLoading(true);
    setRecommendationsError('');
    try {
      const res = await getAIRankedReviewersForAssignment(submissionId);
      if (res.success) {
        setRecommendedReviewers(res.recommendations || []);
        if (!res.recommendations || res.recommendations.length === 0) {
          setRecommendationsError('Rekomendasi reviewer tidak tersedia.');
        }
      } else {
        setRecommendedReviewers([]);
        setRecommendationsError(res.error || 'Rekomendasi reviewer tidak tersedia');
      }
    } catch (e: any) {
      setRecommendedReviewers([]);
      setRecommendationsError(e?.message || 'Rekomendasi reviewer tidak tersedia');
    } finally {
      setRecommendationsLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleAssign = async (rec: RecommendedReviewer) => {
    // Resolve the reviewer identifier: ReviewerMatchingService may return
    // reviewerId = "email:..." when only an email is known. In that case pass
    // the email so assignReviewer's email lookup can resolve it.
    const reviewerIdForAssign =
      typeof rec.reviewerId === 'string' && rec.reviewerId.startsWith('email:') ? rec.email || '' : rec.reviewerId;
    const assignKey = reviewerIdForAssign || rec.email || '';

    setIsAssigning(assignKey);

    try {
      const res = await assignReviewer(submissionId, reviewerIdForAssign, rec.fullName, rec.email || undefined) as any;
      if (!res.success) {
        throw new Error(res.error || "Failed to assign reviewer");
      }
      onClose();
      // Server Action revalidates the page; reload to reflect the new assignment.
      window.location.reload();
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      alert("Terjadi kesalahan saat menugaskan reviewer.");
    } finally {
      setIsAssigning(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-gradient-to-r from-indigo-950/60 to-zinc-900/50">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Recommended Reviewer
            </h2>
            <p className="text-sm text-zinc-400 mt-1 truncate">
              {articleTitle || `Naskah #${submissionId}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-xs text-zinc-400 mb-4">
            2 reviewer terbaik direkomendasikan berdasarkan bidang artikel, profil akademik,
            dan riwayat penugasan. Kopihan ini bersifat penasehat — keputusan akhir tetap di tangan Editor.
          </p>

          {recommendationsLoading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-indigo-300 animate-pulse">
                Menghitung kandidat terbaik berdasarkan keahlian, beban kerja &amp; konflik kepentingan...
              </p>
            </div>
          ) : recommendationsError ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-400">{recommendationsError}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {recommendedReviewers.map((rec, idx) => {
                const hasConflict = !!rec.conflictCheck?.hasConflict;
                return (
                  <div
                    key={rec.reviewerId || rec.email}
                    className={`rounded-xl border p-5 ${hasConflict ? 'border-red-400/40 bg-white/5' : 'border-indigo-300/30 bg-white/5'}`}
                  >
                    {/* Reviewer name + rank badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-200 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-2 py-0.5 mb-1">
                          <Award className="w-3 h-3" /> Reviewer #{idx + 1}
                        </span>
                        <h3 className="font-bold text-white text-base leading-snug">{rec.fullName}</h3>
                        {rec.email && <p className="text-xs text-blue-300 truncate mt-0.5">{rec.email}</p>}
                        {hasConflict && (
                          <span className="inline-block text-[10px] font-bold text-red-300 bg-red-500/20 rounded-full px-2 py-0.5 mt-1">
                            ⚠ Konflik Kepentingan
                          </span>
                        )}
                      </div>
                      <div className="text-center shrink-0">
                        <div className={`text-white text-lg font-bold rounded-xl w-14 h-14 flex items-center justify-center ${rec.totalScore >= 70 ? 'bg-emerald-600' : rec.totalScore >= 40 ? 'bg-amber-500' : 'bg-gray-500'}`}>
                          {Math.round(rec.totalScore)}
                        </div>
                        <div className="text-[9px] text-zinc-400 mt-1 uppercase">Score</div>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> Academic Field
                        </span>
                        <p className="text-xs text-zinc-200 mt-0.5 capitalize">{rec.academicField || 'Umum'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Institution</span>
                        <p className="text-xs text-zinc-200 mt-0.5">{rec.university || 'Tidak diketahui'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Country</span>
                        <p className="text-xs text-zinc-200 mt-0.5">{rec.country || '-'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Expertise Match</span>
                        <p className="text-xs text-zinc-200 mt-0.5">
                          {rec.expertiseScore}/100
                          {rec.matchedTerms?.length > 0 && (
                            <span className="text-zinc-400"> — {rec.matchedTerms.slice(0, 3).join(', ')}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Matching score bar */}
                    <div className="mt-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Matching Score</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${rec.totalScore >= 70 ? 'bg-emerald-500' : rec.totalScore >= 40 ? 'bg-amber-500' : 'bg-gray-500'}`}
                            style={{ width: `${Math.min(100, Math.max(0, rec.totalScore))}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-zinc-200">{Math.round(rec.totalScore)}/100</span>
                      </div>
                    </div>

                    {/* Reason recommendation */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Reason</span>
                      <p className="text-xs text-zinc-300 mt-0.5">{rec.reason || '—'}</p>
                    </div>

                    {hasConflict && rec.conflictCheck?.reasons?.length > 0 && (
                      <p className="text-[11px] text-red-300 mt-2">{rec.conflictCheck.reasons.join('; ')}</p>
                    )}

                    {/* Assign button */}
                    <button
                      onClick={() => handleAssign(rec)}
                      disabled={isAssigning !== null}
                      className={`mt-4 w-full py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${isAssigning === (rec.reviewerId || rec.email) ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    >
                      {isAssigning === (rec.reviewerId || rec.email) ? (
                        <>
                          <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                          Menugaskan...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Pilih Reviewer Ini
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-[10px] text-zinc-500 mt-5 text-center">
            Pembobotan: Expertise 50% • Workload 30% • Availability 20%. Kandidat berkonflik dipenalti &amp; ditandai.
            Keputusan akhir tetap di tangan Editor.
          </p>
        </div>
      </div>
    </div>
  );
}
