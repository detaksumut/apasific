'use server';

/**
 * Server Actions — AI-Assisted Review Enhancement Layer (IAEP).
 *
 * GOVERNANCE:
 *   - AI is NOT a reviewer. This layer only enhances a COMPLETED HUMAN
 *     REVIEWER REPORT.
 *   - These actions NEVER create reviewer assignments, NEVER modify
 *     review_assignments.status, NEVER modify submissions.status/stage, and
 *     NEVER call SubmissionLifecycleService.
 *   - Access: editor-or-above (via AIReviewEnhancementService.canAccessEnhancement,
 *     which uses normalizeRole). Authors are never granted access.
 *   - Persists a derived record in `review_enhancements` only.
 */
import { revalidatePath } from 'next/cache';
import {
  AIReviewEnhancementService,
  type HumanReviewInput,
  type ManuscriptMetadata,
} from '@/services/reviewer/AIReviewEnhancementService';

async function createAdminClient(): Promise<any> {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function resolveCallerRole(supabaseAdmin: any): Promise<string | null> {
  try {
    const { getCurrentUser } = await import('./auth');
    const user: any = await getCurrentUser();
    if (!user?.id) return null;
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profile?.role) return profile.role;
    } catch { /* non-fatal */ }
    return user.role || null;
  } catch {
    return null;
  }
}

/**
 * Generate the AI-assisted enhancement record for a completed human review.
 * Read/write is restricted to editor-or-above.
 */
export async function runReviewEnhancement(reviewId: string): Promise<{
  success: boolean;
  enhancement?: any;
  error?: string;
}> {
  try {
    if (!reviewId) return { success: false, error: 'reviewId wajib diisi.' };

    const supabaseAdmin = await createAdminClient();
    const role = await resolveCallerRole(supabaseAdmin);
    if (!AIReviewEnhancementService.canAccessEnhancement(role)) {
      return {
        success: false,
        error: 'Unauthorized: hanya editor/admin yang dapat menjalankan AI-Assisted Review Enhancement.',
      };
    }

    // 1. Load the completed HUMAN review assignment (reads only).
    const { data: assignment, error: assignErr } = await supabaseAdmin
      .from('review_assignments')
      .select('*, submissions(*)')
      .eq('id', reviewId)
      .maybeSingle();

    if (assignErr || !assignment) {
      return { success: false, error: assignErr?.message || 'Review tidak ditemukan.' };
    }
    if (assignment.status !== 'completed') {
      return {
        success: false,
        error: 'Hanya review yang sudah selesai (completed) oleh reviewer manusia yang dapat ditingkatkan oleh lapisan AI.',
      };
    }

    const sub = assignment.submissions || {};
    const review: HumanReviewInput = {
      reviewId,
      submissionId: String(assignment.submission_id || ''),
      recommendation: assignment.recommendation || null,
      commentsForAuthor: assignment.comments_for_author || null,
      commentsForEditor: assignment.comments_for_editor || null,
      correctionNotes: assignment.correction_notes || null,
    };

    const manuscript: ManuscriptMetadata = {
      title: sub.title || null,
      abstract: sub.abstract || null,
      keywords: sub.keywords || null,
      journalName: sub.journals?.name || sub.journal_name || null,
    };

    // 2. Generate derived enhancement (PURE — no lifecycle writes).
    const output = AIReviewEnhancementService.generateEnhancement(review, manuscript);

    // 3. Persist a single derived record (upsert on review_id).
    const payload = {
      review_id: reviewId,
      submission_id: review.submissionId,
      original_review_snapshot: output.originalReviewSnapshot,
      enhanced_review_content: output.enhancedReviewContent,
      quality_score: output.qualityScore,
      ai_observations: output.aiObservations,
      severity_level: output.severityLevel,
      enhancement_engine: output.enhancementEngine,
      enhancement_version: output.enhancementVersion,
      status: output.status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('review_enhancements')
      .upsert(payload, { onConflict: 'review_id' })
      .select('*')
      .single();

    if (error) {
      return {
        success: false,
        error: 'Gagal menyimpan peningkatan review: ' + error.message,
      };
    }

    if (review.submissionId) {
      revalidatePath(`/dashboard/editor/submissions/${review.submissionId}`);
    }
    revalidatePath('/dashboard/editor/review-results');

    return {
      success: true,
      enhancement: {
        id: data.id,
        reviewId: data.review_id,
        submissionId: data.submission_id,
        enhancedReviewContent: data.enhanced_review_content,
        qualityScore: data.quality_score,
        aiObservations: data.ai_observations,
        severityLevel: data.severity_level,
        enhancementEngine: data.enhancement_engine,
        enhancementVersion: data.enhancement_version,
        status: data.status,
        createdAt: data.created_at,
      },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Gagal menjalankan peningkatan review.' };
  }
}

/**
 * Read the existing enhancement record for a completed human review.
 */
export async function getReviewEnhancement(reviewId: string): Promise<{
  success: boolean;
  enhancement?: any;
  error?: string;
}> {
  try {
    if (!reviewId) return { success: false, error: 'reviewId wajib diisi.' };

    const supabaseAdmin = await createAdminClient();
    const role = await resolveCallerRole(supabaseAdmin);
    if (!AIReviewEnhancementService.canAccessEnhancement(role)) {
      return {
        success: false,
        error: 'Unauthorized: hanya editor/admin yang dapat melihat peningkatan review.',
      };
    }

    const { data, error } = await supabaseAdmin
      .from('review_enhancements')
      .select('*')
      .eq('review_id', reviewId)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: true, enhancement: null };

    return {
      success: true,
      enhancement: {
        id: data.id,
        reviewId: data.review_id,
        submissionId: data.submission_id,
        enhancedReviewContent: data.enhanced_review_content,
        qualityScore: data.quality_score,
        aiObservations: data.ai_observations,
        severityLevel: data.severity_level,
        enhancementEngine: data.enhancement_engine,
        enhancementVersion: data.enhancement_version,
        status: data.status,
        createdAt: data.created_at,
      },
    };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Gagal membaca peningkatan review.' };
  }
}
