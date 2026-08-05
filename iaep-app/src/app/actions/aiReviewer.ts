'use server';

/**
 * Server Actions — Governed AI Reviewer Agent (Target #3).
 *
 * Role gates:
 *  - getAIReviewerSettings / runAIReview / getAIReviewForSubmission:
 *      editor ke atas (termasuk co-admin yang boleh menugaskan reviewer).
 *  - updateAIReviewerSettings: HANYA SUPER_ADMIN
 *      (divalidasi ulang di dalam AIReviewerService.updateConfig).
 *
 * AI Reviewer bersifat READ-ONLY terhadap siklus hidup naskah:
 * action-action di sini tidak pernah mengubah submissions.status/stage.
 */
import { revalidatePath } from 'next/cache';
import { normalizeRole } from '@/lib/roles';
import {
    AIReviewerService,
    type AIReviewerMode,
} from '@/services/reviewer/AIReviewerService';

async function createAdminClient(): Promise<any> {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

async function resolveCaller(supabaseAdmin: any): Promise<{ actorId: string | null; role: string | null }> {
    try {
        const { getCurrentUser } = await import('./auth');
        const user: any = await getCurrentUser();
        if (!user?.id) return { actorId: null, role: null };

        let role: string | null = null;
        const email: string = user.email || '';

        // 1. Profile role (profiles table) — primary source
        try {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();
            role = profile?.role || null;
        } catch { /* non-fatal */ }

        // 2. Fallback chain — authenticated session role/context
        if (!role) {
            role = user.role || null;
        }
        // 3. Session cookie fallback (user_role)
        if (!role) {
            try {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                role = cookieStore.get('user_role')?.value || null;
            } catch { /* non-fatal */ }
        }
        // 4. User metadata
        if (!role) {
            role = user.user_metadata?.role || null;
        }
        // 5. App metadata
        if (!role) {
            role = user.app_metadata?.role || null;
        }

        // 6. Defensive SUPER_ADMIN recovery via env canonical email.
        //    Security: only promotes to SUPER_ADMIN when the authenticated
        //    session's email matches SUPER_ADMIN_CANONICAL_EMAIL (env only).
        const canonicalEmail = (process.env.SUPER_ADMIN_CANONICAL_EMAIL || '').toLowerCase().trim();
        if (canonicalEmail && email.toLowerCase() === canonicalEmail) {
            role = 'super_admin';
        }

        // Normalize at the boundary so ALL downstream gates (canManageConfig,
        // canRunAIReview) see canonical roles: SUPER_ADMIN | ADMIN | EDITOR |
        // REVIEWER | PRODUCTION. Unknown/author roles map to null.
        const normalized = normalizeRole(role);
        return { actorId: user.id, role: normalized };
    } catch (e) {
        return { actorId: null, role: null };
    }
}

/**
 * Baca konfigurasi AI Reviewer + hak manage caller.
 * Dipakai oleh panel Super Admin dan UI editor.
 */
export async function getAIReviewerSettings(): Promise<{
    success: boolean;
    config?: any;
    canManage?: boolean;
    canUse?: boolean;
    error?: string;
}> {
    try {
        const supabaseAdmin = await createAdminClient();
        const caller = await resolveCaller(supabaseAdmin);
        if (!caller.actorId) return { success: false, error: 'Unauthorized' };

        const canUse = AIReviewerService.canRunAIReview(caller.role);
        if (!canUse && !AIReviewerService.canManageConfig(caller.role)) {
            return { success: false, error: 'Unauthorized: akses khusus editor/admin.' };
        }

        const config = await AIReviewerService.getConfig(supabaseAdmin);
        return {
            success: true,
            config,
            canManage: AIReviewerService.canManageConfig(caller.role),
            canUse,
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Perbarui konfigurasi AI Reviewer — HANYA SUPER_ADMIN.
 */
export async function updateAIReviewerSettings(
    enabled: boolean,
    mode: string
): Promise<{ success: boolean; config?: any; error?: string }> {
    try {
        const supabaseAdmin = await createAdminClient();
        const caller = await resolveCaller(supabaseAdmin);
        if (!caller.actorId) return { success: false, error: 'Unauthorized' };

        const result = await AIReviewerService.updateConfig(
            supabaseAdmin,
            { enabled, mode },
            { id: caller.actorId, role: caller.role }
        );
        return result;
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Jalankan AI Review untuk sebuah naskah (advisory).
 * Tidak mengubah status submission — hanya menulis baris review_assignments
 * dengan reviewer_type 'AI'.
 */
export async function runAIReview(submissionId: string): Promise<{
    success: boolean;
    assignmentId?: string;
    review?: any;
    error?: string;
}> {
    try {
        const supabaseAdmin = await createAdminClient();
        const caller = await resolveCaller(supabaseAdmin);
        if (!caller.actorId) return { success: false, error: 'Unauthorized' };
        if (!AIReviewerService.canRunAIReview(caller.role)) {
            return { success: false, error: 'Unauthorized: hanya editor/admin yang dapat menjalankan AI review.' };
        }

        const result = await AIReviewerService.generateReview(supabaseAdmin, submissionId, { id: caller.actorId, role: caller.role });
        if (result.success) {
            revalidatePath(`/dashboard/editor/submissions/${submissionId}`);
            revalidatePath('/dashboard/editor/review-results');
        }
        return result;
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Ambil hasil AI review terakhir untuk sebuah naskah (bila ada).
 */
export async function getAIReviewForSubmission(submissionId: string): Promise<{
    success: boolean;
    review?: any;
    error?: string;
}> {
    try {
        const supabaseAdmin = await createAdminClient();
        const caller = await resolveCaller(supabaseAdmin);
        if (!caller.actorId) return { success: false, error: 'Unauthorized' };
        if (!AIReviewerService.canRunAIReview(caller.role)) {
            return { success: false, error: 'Unauthorized: hanya editor/admin yang dapat melihat AI review.' };
        }

        const row = await AIReviewerService.getAIAssignment(supabaseAdmin, submissionId);
        if (!row) return { success: true, review: null };

        return {
            success: true,
            review: {
                id: row.id,
                recommendation: row.recommendation || null,
                score: row.score || null,
                report: row.comments_for_editor || null,
                commentsForAuthor: row.comments_for_author || null,
                reviewerName: row.reviewer_name || 'AI Reviewer Agent',
                completedAt: row.completed_at || null,
                updatedAt: row.updated_at || null,
            },
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
