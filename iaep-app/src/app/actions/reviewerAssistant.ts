'use server';

/**
 * Server Actions — AI Reviewer Assistant (IAEP).
 *
 * PURPOSE: Assist the HUMAN reviewer during the active review process.
 *
 * GOVERNANCE:
 *   - AI is an ASSISTANT, NOT a reviewer.
 *   - These actions NEVER create a review report, NEVER replace the reviewer,
 *     NEVER submit a review, NEVER make editorial decisions, and NEVER use
 *     reviewer_type='AI'.
 *   - These actions are READ-ONLY with respect to the review lifecycle: they
 *     only read the reviewer's OWN assignment + manuscript metadata and
 *     compute advisory guidance. NO database writes occur.
 *   - Access: restricted to the assigned human REVIEWER (ownership check) or
 *     editor-or-above. Authors are never granted access.
 *   - Double-blind review is preserved: only the manuscript metadata (title,
 *     abstract, keywords, journal) is analyzed — never author identity.
 */
import {
  AIReviewerAssistantService,
  type ManuscriptSnapshot,
  type ReviewerAssistantOutput,
} from '@/services/reviewer/AIReviewerAssistantService';

async function createAdminClient(): Promise<any> {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function resolveCaller(supabaseAdmin: any): Promise<{ userId: string | null; email: string | null; role: string | null }> {
  try {
    const { getCurrentUser } = await import('./auth');
    const user: any = await getCurrentUser();
    if (!user?.id) return { userId: null, email: null, role: null };

    let role: string | null = null;
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      role = profile?.role || null;
    } catch { /* non-fatal */ }

    if (!role) role = user.role || null;
    if (!role) {
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        role = cookieStore.get('user_role')?.value || null;
      } catch { /* non-fatal */ }
    }
    if (!role) role = user.user_metadata?.role || null;
    if (!role) role = user.app_metadata?.role || null;

    return { userId: user.id, email: user.email || null, role };
  } catch {
    return { userId: null, email: null, role: null };
  }
}

/**
 * Generate the AI Reviewer Assistant advisory output for the human reviewer's
 * OWN active assignment. READ-ONLY and advisory only.
 *
 * @param assignmentId the human reviewer's review_assignments id
 */
export async function getReviewerAssistant(assignmentId: string): Promise<{
  success: boolean;
  assistant?: ReviewerAssistantOutput;
  error?: string;
}> {
  try {
    if (!assignmentId) return { success: false, error: 'assignmentId wajib diisi.' };

    const supabaseAdmin = await createAdminClient();
    const caller = await resolveCaller(supabaseAdmin);
    if (!caller.userId && !caller.email) {
      return { success: false, error: 'Unauthorized: session tidak valid.' };
    }

    // 1. Load the assignment (READ-ONLY) with its submission metadata.
    const { data: assignment, error: assignErr } = await supabaseAdmin
      .from('review_assignments')
      .select('*, submissions!inner(*, journals(name))')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignErr || !assignment) {
      return { success: false, error: assignErr?.message || 'Penugasan review tidak ditemukan.' };
    }

    // 2. Ownership gate: the human reviewer must be assigned to this review.
    const isOwner =
      (caller.userId && String(assignment.reviewer_id).toLowerCase() === String(caller.userId).toLowerCase()) ||
      (caller.email && assignment.reviewer_email && String(assignment.reviewer_email).toLowerCase() === String(caller.email).toLowerCase());

    // Editor-or-above may also view the assistant output (advisory only).
    const isStaff = AIReviewerAssistantService.canAccessAssistant(caller.role);

    if (!isOwner && !isStaff) {
      return { success: false, error: 'Unauthorized: hanya reviewer yang ditugaskan (atau editor) yang dapat melihat asisten AI.' };
    }

    // 3. Build the manuscript snapshot (double-blind safe: no author identity).
    const sub = assignment.submissions || {};
    const snapshot: ManuscriptSnapshot = {
      title: sub.title ?? null,
      abstract: sub.abstract ?? null,
      keywords: sub.keywords ?? null,
      journalName: sub.journals?.name ?? sub.journal_name ?? null,
      hasFullText: Boolean(sub.file_url || sub.file_url_galley || sub.anonymous_file_url),
    };

    // 4. Compute advisory assistant output (PURE — no writes).
    const assistant = AIReviewerAssistantService.generateAssistant(snapshot);

    return { success: true, assistant };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Gagal menghasilkan AI Reviewer Assistant.' };
  }
}
