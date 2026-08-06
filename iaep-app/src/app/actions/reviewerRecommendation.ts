"use server";

/**
 * reviewerRecommendation.ts — Isolated AI Reviewer Recommendation Assistant.
 *
 * Single server action that produces a ranked, advisory list of the top 2
 * human reviewers for a given submission.
 *
 * Design guarantees:
 *   - READ-ONLY: never assigns, never writes, never mutates lifecycle.
 *   - Uses the existing ReviewerMatchingService (read-only ranking) UNCHANGED.
 *   - RBAC enforced here (editor-or-above / co-admin) via profiles table.
 *   - No auto-assignment: this action only returns a suggestion list.
 *   - No migration, no database change, no lifecycle modification.
 *   - This is a RECOMMENDATION ASSISTANT ONLY — no AI reviewer agent.
 */
import { isEditorOrAbove, isCoAdmin } from '@/lib/permissions';

export interface AIRankedReviewer {
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

export interface ReviewerRecommendationResponse {
  success: boolean;
  recommendations?: AIRankedReviewer[];
  error?: string;
}

/**
 * Returns the top 2 ranked human reviewers for a submission (advisory only).
 *
 *   1. Validate editor/admin (or co-admin) permission.
 *   2. ReviewerMatchingService.recommendForSubmission loads the `submissions`
 *      row by `submissions.id = submissionId`, extracts title/abstract/
 *      keywords/journal-division, loads the reviewer pool, and ranks them
 *      using the existing deterministic scoring logic.
 *   3. Return exactly the top 2 recommendations.
 */
export async function getAIRankedReviewersForAssignment(
  submissionId: string
): Promise<ReviewerRecommendationResponse> {
  try {
    // ── 1. Validate editor/admin permission ────────────────────────────────
    let role = '';
    let callerId: string | null = null;
    try {
      const { getCurrentUser } = await import('./auth');
      const currentUser: any = await getCurrentUser();
      if (!currentUser?.id) {
        return { success: false, error: 'Akses ditolak: pengguna tidak terautentikasi.' };
      }
      callerId = currentUser.id;

      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      try {
        const { data: callerProfile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();
        if (callerProfile?.role) role = String(callerProfile.role).toLowerCase();
      } catch {
        // fall through to session role below
      }

      if (!role) {
        const arrRole = Array.isArray(currentUser.roles) && currentUser.roles.length > 0
          ? String(currentUser.roles[0]).toLowerCase()
          : '';
        role = arrRole || String(currentUser.role || '').toLowerCase();
      }
    } catch {
      return { success: false, error: 'Akses ditolak: sesi tidak valid.' };
    }

    if (!(isEditorOrAbove(role) || isCoAdmin(role))) {
      return {
        success: false,
        error: 'Akses ditolak: hanya editor atau admin yang dapat melihat rekomendasi reviewer.'
      };
    }

    if (!submissionId) {
      return { success: false, error: 'Submission ID tidak valid.' };
    }

    // ── 2. Load submission by submissions.id, extract signals, load reviewers,
    //        and rank using the existing ReviewerMatchingService logic. ───────
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { ReviewerMatchingService } = await import('@/services/reviewer/ReviewerMatchingService');
    const result = await ReviewerMatchingService.recommendForSubmission(
      supabaseAdmin,
      submissionId,
      { limit: 2 }
    );

    if (!result.success) {
      return { success: false, error: result.error || 'Gagal menghitung rekomendasi reviewer.' };
    }

    // ── 3. Return exactly the top 2 recommendations (advisory) ──────────────
    const recommendations: AIRankedReviewer[] = (result.recommendations || [])
      .slice(0, 2)
      .map((r: any) => {
        const reasons: string[] = Array.isArray(r.reasons) ? r.reasons : [];
        const conflict = r.conflictCheck as { hasConflict?: boolean; reasons?: string[] } | undefined;
        const conflictReasons: string[] = Array.isArray(conflict?.reasons) ? conflict.reasons : [];
        const reasonParts: string[] = [];
        if (conflict?.hasConflict && conflictReasons.length > 0) {
          reasonParts.push(`Konflik: ${conflictReasons.join('; ')}`);
        }
        if (Array.isArray(r.matchedTerms) && r.matchedTerms.length > 0) {
          reasonParts.push(`Topik sesuai: ${r.matchedTerms.slice(0, 3).join(', ')}`);
        } else if (r.academicField) {
          reasonParts.push(`Bidang: ${r.academicField}`);
        }
        if (reasonParts.length === 0) reasonParts.push('Daya ekspertise & ketersediaan baik');

        return {
          reviewerId: r.reviewerId,
          fullName: r.fullName,
          email: r.email,
          academicField: r.academicField,
          university: r.university,
          country: r.country,
          expertiseScore: r.expertiseScore,
          availabilityScore: r.availabilityScore,
          workloadScore: r.workloadScore,
          conflictCheck: conflict
            ? { hasConflict: !!conflict.hasConflict, reasons: conflictReasons }
            : { hasConflict: false, reasons: [] },
          totalScore: r.totalScore,
          matchedTerms: r.matchedTerms || [],
          reason: reasons.length > 0 ? reasons[0] : reasonParts.join(' • '),
          rank: r.rank,
        };
      });

    return { success: true, recommendations };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Gagal menghitung rekomendasi reviewer.' };
  }
}
