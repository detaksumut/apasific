"use server";

import { revalidatePath } from 'next/cache';
import { SubmissionLifecycleService } from '@/services/SubmissionLifecycleService';
import { isCoAdmin, isEditorOrAbove } from '@/lib/permissions';

async function createClient() {
    const { createClient: getClient } = await import('@/utils/supabase/server');
    return getClient();
}

/**
 * Audit Log Helper — records every significant action on a submission.
 * Called by assignReviewer, recordEditorialDecision, etc.
 */
async function logSubmissionActivity(
    supabaseAdmin: any,
    submissionId: string,
    actorId: string | null,
    actorRole: string,
    action: string,
    details?: Record<string, any>
) {
    try {
        await supabaseAdmin.from('submission_activity_log').insert({
            submission_id: submissionId,
            actor_id: actorId || null,
            actor_role: actorRole,
            action,
            details: details || null,
        });
    } catch (e) {
        // Non-fatal — audit log should never break main workflow
        console.warn('[AuditLog] Failed to write activity log:', e);
    }
}



export async function getReviewsForSubmission(submissionId: string) {
    try {
        const supabase = await createClient();
        const { data: reviews, error } = await supabase
            .from('review_assignments')
            .select('*, reviewer:reviewer_id(full_name, phone)')
            .eq('submission_id', submissionId)
            .in('status', ['pending', 'accepted', 'completed']);

        let finalReviews = reviews || [];

        // Fallback to Firestore (DISABLED to prevent Quota Exceeded errors)
        /*
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const fbReviews = await db.collection('review_assignments')
                .where('submission_id', '==', submissionId)
                .where('status', 'in', ['pending', 'accepted', 'completed'])
                .get();

            for (const doc of fbReviews.docs) {
                const data = doc.data();
                const existingIndex = finalReviews.findIndex((r: any) => r.id === doc.id);
                if (existingIndex !== -1) {
                    // Merge Firestore-only fields that are missing in Supabase due to schema differences
                    if (data.annotated_file_url && !finalReviews[existingIndex].annotated_file_url) {
                        finalReviews[existingIndex].annotated_file_url = data.annotated_file_url;
                    }
                    if (data.review_file_url && !finalReviews[existingIndex].review_file_url) {
                        finalReviews[existingIndex].review_file_url = data.review_file_url;
                    }
                    if (data.correction_notes && !finalReviews[existingIndex].correction_notes) {
                        finalReviews[existingIndex].correction_notes = data.correction_notes;
                    }
                    if (data.revised_file_url && !finalReviews[existingIndex].revised_file_url) {
                        finalReviews[existingIndex].revised_file_url = data.revised_file_url;
                    }
                } else {
                    // Try to fetch reviewer name from Supabase profiles
                    let reviewerName = 'Anonim';
                    let reviewerPhone = '';
                    if (data.reviewer_id) {
                        const { data: prof } = await supabase.from('profiles').select('full_name, phone').eq('id', data.reviewer_id).single();
                        if (prof) {
                           reviewerName = prof.full_name;
                           reviewerPhone = prof.phone || '';
                        }
                    }

                    finalReviews.push({
                        id: doc.id,
                        ...data,
                        reviewer: { full_name: reviewerName, phone: reviewerPhone },
                        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : new Date().toISOString(),
                        updated_at: data.updated_at?.toDate ? data.updated_at.toDate().toISOString() : new Date().toISOString(),
                        assigned_at: data.assigned_at?.toDate ? data.assigned_at.toDate().toISOString() : null,
                        deadline: data.deadline?.toDate ? data.deadline.toDate().toISOString() : null,
                        accepted_at: data.accepted_at?.toDate ? data.accepted_at.toDate().toISOString() : null,
                        completed_at: data.completed_at?.toDate ? data.completed_at.toDate().toISOString() : null,
                    });
                }
            }
        } catch (e) {
            console.warn("Firestore fetch reviews failed", e);
        }
        */

        // Augment any reviews that are missing phone numbers but have reviewer_email
        for (let i = 0; i < finalReviews.length; i++) {
            const rev = finalReviews[i];
            if ((!rev.reviewer || !rev.reviewer.phone) && rev.reviewer_email) {
                const { data: prof } = await supabase.from('profiles').select('full_name, phone').eq('email', rev.reviewer_email).single();
                if (prof) {
                    rev.reviewer = {
                        full_name: prof.full_name || rev.reviewer_name || rev.reviewer?.full_name || 'Anonim',
                        phone: prof.phone || ''
                    };
                } else if (!rev.reviewer) {
                    rev.reviewer = { full_name: rev.reviewer_name || 'Anonim', phone: '' };
                }
            } else if (!rev.reviewer) {
                rev.reviewer = { full_name: rev.reviewer_name || 'Anonim', phone: '' };
            }
        }

        return { success: true, reviews: finalReviews };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function submitEditorialDecision(submissionId: string, authorId: string, title: string, decision: string, comments: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { getCurrentUser } = await import('./auth');
        const user: any = await getCurrentUser();
        const editorId = user?.id || null;

        // 1. Update Supabase melalui gerbang lifecycle tervalidasi
        const transisi = await SubmissionLifecycleService.transitionTo(supabaseAdmin, submissionId, {
            status: decision,
            actorId: editorId,
            history: {
                action: `Editor Decision: ${decision}`,
                details: comments
            }
        });
        if (!transisi.success) {
            return { success: false, error: transisi.error || 'Keputusan editorial ditolak oleh lifecycle service.' };
        }

        if (decision === 'Accepted') {
            try {
                const { data: sub } = await supabaseAdmin
                    .from('submissions')
                    .select('title, profiles:author_id(full_name, phone)')
                    .eq('id', submissionId)
                    .single();

                const authorProfile = sub?.profiles as any;
                const phoneNum = Array.isArray(authorProfile) ? authorProfile[0]?.phone : authorProfile?.phone;
                const fullName = Array.isArray(authorProfile) ? authorProfile[0]?.full_name : authorProfile?.full_name;

                if (phoneNum) {
                    const message = `Halo ${fullName},\n\nKabar gembira dari Tim Editorial Asia Index & Metric (APASIFIC).\n\nNaskah Anda yang berjudul:\n"${sub?.title}"\n\nTelah dinyatakan *DITERIMA (ACCEPTED)* untuk dipublikasikan.\nSilakan login ke dashboard APASIFIC untuk melihat langkah selanjutnya atau mengunduh Letter of Acceptance (LoA) Anda.\n\nTerima kasih atas kontribusi Anda.\nhttps://apasific.org`;
                    const { sendWa } = await import('@/utils/sendWa');
                    const logoUrl = "https://apasific.org/logobaru.png";
                    await sendWa(phoneNum, message, logoUrl);
                }
            } catch (waErr) {
                console.error("Failed to send Accepted WA", waErr);
            }
        }

        revalidatePath('/dashboard/editor/review-results');
        revalidatePath('/dashboard/editor/submissions');

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateSubmissionStage(submissionId: string, stage: string, status: string) {
    try {
        const { getCurrentUser } = await import('./auth');
        const user: any = await getCurrentUser();

        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Update Supabase melalui gerbang lifecycle tervalidasi
        const transisi = await SubmissionLifecycleService.transitionTo(supabaseAdmin, submissionId, {
            stage,
            status,
            actorId: user?.id || null,
            history: {
                action: `Stage updated: ${stage} (${status})`,
                details: `Naskah dipindahkan ke tahap ${stage} dengan status ${status}`
            }
        });
        if (!transisi.success) {
            return { success: false, error: transisi.error || 'Transisi stage/status naskah ditolak oleh lifecycle service.' };
        }

        // 4. Fetch author phone and send WA if Needs Revision
        // 4. Fetch author phone and send WA if Needs Revision
        if (status === 'Needs Revision') {
            try {
                const { data: sub } = await supabaseAdmin
                    .from('submissions')
                    .select('title, profiles:author_id(full_name, phone)')
                    .eq('id', submissionId)
                    .single();

                // Fetch latest review notes
                const { data: reviewAssignments } = await supabaseAdmin
                    .from('review_assignments')
                    .select('comments_for_author, correction_notes')
                    .eq('submission_id', submissionId)
                    .eq('status', 'completed')
                    .order('updated_at', { ascending: false })
                    .limit(1);

                let reviewNotes = '';
                if (reviewAssignments && reviewAssignments.length > 0) {
                    const notes = reviewAssignments[0];
                    if (notes.comments_for_author) reviewNotes += `\n*Catatan Umum:* ${notes.comments_for_author}`;
                    if (notes.correction_notes) reviewNotes += `\n*Catatan Koreksi Tambahan:* ${notes.correction_notes}`;
                }

                const authorProfile = sub?.profiles as any;
                const phoneNum = Array.isArray(authorProfile) ? authorProfile[0]?.phone : authorProfile?.phone;
                const fullName = Array.isArray(authorProfile) ? authorProfile[0]?.full_name : authorProfile?.full_name;

                if (phoneNum) {
                    const message = `Halo ${fullName},\n\nPemberitahuan dari Tim Editorial Asia Index & Metric (APASIFIC).\n\nNaskah Anda yang berjudul:\n"${sub?.title}"\n\nTelah selesai ditinjau oleh Reviewer dan *MEMERLUKAN REVISI*.${reviewNotes ? '\n\nBerikut adalah catatan perbaikan dari Reviewer:' + reviewNotes : ''}\n\nNaskah beserta semua catatan perbaikan kini telah dikembalikan ke laci dashboard Anda. Silakan login ke dashboard APASIFIC, masuk ke menu Submisi -> Lacak Proses, untuk membaca catatan lengkapnya dan mengunggah naskah yang telah diperbaiki.\n\nTerima kasih.\nhttps://apasific.org`;
                    const { sendWa } = await import('@/utils/sendWa');
                    const logoUrl = "https://apasific.org/logobaru.png";
                    await sendWa(phoneNum, message, logoUrl);
                }
            } catch (waErr) {
                console.error("Failed to send Needs Revision WA", waErr);
            }
        }

        const { revalidatePath } = require('next/cache');
        revalidatePath('/dashboard/editor/submissions');

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getSubmissionDetailsEditor(submissionId: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId);
        let subData: any = null;

        try {
            if (isUuidLike) {
                const { data } = await supabaseAdmin
                    .from('submissions')
                    .select('*, profiles:author_id(full_name, phone), journals:journal_id(name)')
                    .eq('id', submissionId)
                    .single();
                if (data) subData = data;
            }

            if (!subData) {
                const { data } = await supabaseAdmin
                    .from('submissions')
                    .select('*, profiles:author_id(full_name, phone), journals:journal_id(name)')
                    .or(`zenodo_id.eq.${submissionId},doi.ilike.%${submissionId}%`)
                    .single();
                if (data) subData = data;
            }
        } catch (sbErr) {
            console.warn("Supabase lookup error in getSubmissionDetailsEditor:", sbErr);
        }

        // Safe Fallback to Firestore (DISABLED to prevent Quota Exceeded)
        /*
        if (!subData) {
            try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const doc = await db.collection('submissions').doc(submissionId).get();
                if (doc.exists) {
                    const fbData = doc.data();
                    let journalName = 'Unknown Journal';
                    if (fbData?.journal_id) {
                        const jDoc = await db.collection('journals').doc(fbData.journal_id).get();
                        if (jDoc.exists) journalName = jDoc.data()?.name || journalName;
                        else {
                            const { data: sj } = await supabaseAdmin.from('journals').select('name').eq('id', fbData.journal_id).single();
                            if (sj) journalName = sj.name;
                        }
                    }
                    let authorName = 'Unknown Author';
                    let authorPhone = '';
                    if (fbData?.author_id) {
                        const { data: profile } = await supabaseAdmin.from('profiles').select('full_name, phone').eq('id', fbData.author_id).single();
                        if (profile?.full_name) authorName = profile.full_name;
                        if (profile?.phone) authorPhone = profile.phone;
                        if (!profile?.full_name) {
                            const uDoc = await db.collection('users').doc(fbData.author_id).get();
                            if (uDoc.exists) authorName = uDoc.data()?.full_name || uDoc.data()?.name || authorName;
                            if (uDoc.exists && !authorPhone) authorPhone = uDoc.data()?.phone || uDoc.data()?.whatsapp || '';
                        }
                    }

                    subData = {
                        id: doc.id,
                        ...fbData,
                        created_at: fbData?.created_at?.toDate ? fbData.created_at.toDate().toISOString() : fbData?.created_at || new Date().toISOString(),
                        updated_at: fbData?.updated_at?.toDate ? fbData.updated_at.toDate().toISOString() : fbData?.updated_at || new Date().toISOString(),
                        profiles: { full_name: authorName, phone: authorPhone },
                        journals: { name: journalName }
                    };
                }
            } catch (e) {
                console.warn("Firestore fetch skipped in getSubmissionDetailsEditor (quota/network)", e);
            }
        }
        */

        if (!subData) return { success: false, error: "Not found" };

        // 3. If file_url is missing in Supabase, check Firestore just in case it was lost during migration (DISABLED to prevent Quota Exceeded)
        /*
        if (subData && !subData.file_url) {
            try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const doc = await db.collection('submissions').doc(submissionId).get();
                if (!doc.exists) {
                    // Try unhexed ID
                    const unhexUuid = (uuidStr: string) => {
                        try {
                            const hex = uuidStr.replace(/-/g, "").replace(/0+$/, "");
                            if (/^[0-9a-f]+$/i.test(hex) && hex.length >= 8) {
                                return Buffer.from(hex, "hex").toString("utf8");
                            }
                        } catch(e) {}
                        return uuidStr;
                    };
                    const originalId = unhexUuid(submissionId);
                    if (originalId !== submissionId) {
                        const doc2 = await db.collection('submissions').doc(originalId).get();
                        if (doc2.exists && doc2.data()?.file_url) {
                            subData.file_url = doc2.data()?.file_url;
                        }
                    }
                } else if (doc.data()?.file_url) {
                    subData.file_url = doc.data()?.file_url;
                }
            } catch (e) {
                console.warn("Firestore file_url fallback failed", e);
            }
        }
        */

        const { resolveFile } = await import('@/utils/storageResolver');
        
        // Save the raw file_url path before resolving and overwriting it
        const rawFolderPath = subData.file_url || "";

        // Resolve revised_file_url first, then file_url
        let targetPath = subData.revised_file_url || subData.file_url || "";
        
        // Fallback: If Author's file is missing, try to use Reviewer's annotated file
        if (!targetPath) {
            try {
                const { data: revs } = await supabaseAdmin
                    .from('review_assignments')
                    .select('annotated_file_url, review_file_url')
                    .eq('submission_id', submissionId)
                    .eq('status', 'completed');
                
                if (revs && revs.length > 0) {
                    const rev = revs.find(r => r.annotated_file_url || r.review_file_url);
                    if (rev) {
                        targetPath = rev.annotated_file_url || rev.review_file_url || "";
                    }
                }
            } catch (e) {
                console.warn("Error fetching reviewer fallback file:", e);
            }
        }
        
        // Auto-discovery feature: Always call resolveFile so it can scan the bucket if path is empty
        const metadata = await resolveFile({
            bucket: 'manuscripts',
            path: targetPath,
            entityId: submissionId,
            entityType: 'submission'
        });
        subData.file_metadata = metadata;
        if (metadata.signedUrl) {
            if (subData.revised_file_url) {
                subData.revised_file_url = metadata.signedUrl;
            } else {
                subData.file_url = metadata.signedUrl;
            }
        }

        // Determine the actual folder name in the bucket (handle hex-encoded UUIDs)
        const unhexUuidForFolder = (uuidStr: string) => {
            try {
                const hex = uuidStr.replace(/-/g, '');
                const str = Buffer.from(hex, 'hex').toString('utf8');
                if (str.startsWith('sub_')) return str.replace(/\0/g, '');
            } catch(e) {}
            return uuidStr;
        };
        const folderName = unhexUuidForFolder(submissionId);

        let actualFolder = folderName;
        if (rawFolderPath) {
            if (rawFolderPath.includes('/')) {
                actualFolder = rawFolderPath.split('/')[0];
            } else if (rawFolderPath.startsWith('sub_')) {
                actualFolder = rawFolderPath;
            }
        }

        // Fetch original title page (identity) and anonymous files by scanning the bucket directly
        try {
            const { data: bucketFiles } = await supabaseAdmin
                .storage
                .from('manuscripts')
                .list(actualFolder);

            if (bucketFiles && bucketFiles.length > 0) {
                // Find the file that has "title_page" in its name
                if (!subData.original_file_url) {
                    const titleFile = bucketFiles.find(f => f.name.includes('title_page'));
                    if (titleFile) {
                        const titleMetadata = await resolveFile({
                            bucket: 'manuscripts',
                            path: `${actualFolder}/${titleFile.name}`,
                            entityId: submissionId,
                            entityType: 'submission'
                        });
                        if (titleMetadata.signedUrl) {
                            subData.original_file_url = titleMetadata.signedUrl;
                            subData.original_file_metadata = titleMetadata;
                        }
                    }
                }
                
                // Find the anonymous file as well for legacy fallback
                if (!subData.anonymous_file_url) {
                    const anonFile = bucketFiles.find(f => f.name.includes('anonymous'));
                    if (anonFile) {
                        const anonMetadata = await resolveFile({
                            bucket: 'manuscripts',
                            path: `${actualFolder}/${anonFile.name}`,
                            entityId: submissionId,
                            entityType: 'submission'
                        });
                        if (anonMetadata.signedUrl) {
                            subData.anonymous_file_url = anonMetadata.signedUrl;
                            // Optionally set metadata if needed, but URL is the main thing
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("Error scanning bucket for files:", e);
        }

        return { success: true, submission: subData };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getActiveReviewers() {
    try {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        let reviewers: any[] = [];

        // 1. Fetch from profiles table
        try {
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .ilike('role', '%reviewer%');
            if (profiles) reviewers = [...profiles];
        } catch (e) { }

        // 2. Fetch from system_settings
        try {
            const { data: settings } = await supabaseAdmin
                .from('system_settings')
                .select('value')
                .in('key', ['apasific_registered_users', 'registered_users']);

            if (settings && settings.length > 0) {
                let allUsers: any[] = [];
                settings.forEach((s: any) => {
                    try {
                        const parsed = Array.isArray(s.value) ? s.value : JSON.parse(s.value as string);
                        allUsers = [...allUsers, ...parsed];
                    } catch (err) { }
                });
                const sysReviewers = allUsers.filter((u: any) => u.role && u.role.toLowerCase().includes('reviewer'));

                for (const sr of sysReviewers) {
                    if (!reviewers.find(r => (r.email || '').toLowerCase() === (sr.email || '').toLowerCase())) {
                        reviewers.push(sr);
                    }
                }
            }
        } catch (e) { }

        // Exclude anyone who is an admin or co-admin from being listed as a reviewer
        reviewers = reviewers.filter(r => {
            const roleLower = (r.role || '').toLowerCase();
            const isAdmin = roleLower.includes('admin') && roleLower !== 'co-admin' && roleLower !== 'co_admin';
            return !isAdmin;
        });

        // Tidak ada dummy reviewer — jika kosong, kembalikan array kosong
        // Sistem akan menampilkan pesan "Belum ada reviewer terdaftar" di UI

        return { success: true, reviewers };
    } catch (e: any) {
        return { success: false, error: e.message, reviewers: [] };
    }
}

export async function getReviewers() {
    const res = await getActiveReviewers();
    return res.reviewers || [];
}


export async function getEditorialBoard(journalName: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const bodyName = `Editorial Board - ${journalName}`;
        const { data, error } = await supabaseAdmin
            .from('leadership')
            .select('members_json')
            .eq('body_name', bodyName)
            .single();

        if (error) throw error;

        let members = [];
        if (typeof data.members_json === 'string') {
            members = JSON.parse(data.members_json);
        } else if (data.members_json) {
            members = data.members_json;
        }

        if (Array.isArray(members)) {
            members = members.filter((m: any) => {
                const jabatan = (m.jabatan || '').toLowerCase();
                return !jabatan.includes('co-admin') && !jabatan.includes('co_admin');
            });
        }

        return { success: true, members: members || [] };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateIssn(submissionId: string, issn: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabaseAdmin.from('submissions').update({ issn }).eq('id', submissionId);


        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateDoi(submissionId: string, doi: string, zenodoId: string | number) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // ── SERVER-SIDE AUTHORIZATION: Co-Admin cannot update DOI ──
        try {
            const { getCurrentUser } = await import('./auth');
            const user: any = await getCurrentUser();
            if (user?.id) {
                const { data: callerProfile } = await supabaseAdmin
                    .from('profiles').select('role').eq('id', user.id).single();
                if (callerProfile?.role && isCoAdmin(callerProfile.role)) {
                    return { success: false, error: 'Unauthorized: Co-Admin tidak memiliki izin untuk mengubah DOI.' };
                }
            }
        } catch (e) { /* non-fatal auth check */ }

        // Try Supabase first, ignore error if id format is invalid for UUID
        const { error } = await supabaseAdmin.from('submissions')
            .update({ doi: doi, zenodo_id: zenodoId })
            .eq('id', submissionId);


        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function resetDoi(submissionId: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabaseAdmin.from('submissions')
            .update({ doi: null, zenodo_id: null })
            .eq('id', submissionId);

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getPublicationsData(journalId: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        let articles: any[] = [];

        // 1. Fetch from Supabase (Pure SSOT)
        try {
            const { data } = await supabaseAdmin
                .from('submissions')
                .select('*, profiles:author_id(full_name)')
                .eq('journal_id', journalId)
                .in('status', ['Production Completed', 'Published']);
            if (data) articles = [...data];
        } catch (dbErr) {
            console.error("Supabase publications fetch failed", dbErr);
        }

        // Pure Supabase SSOT Read (No Firestore read lag or 2x duplicates)

        return {
            success: true,
            acceptedArticles: articles.filter(a => a.status === 'Production Completed'),
            publishedArticles: articles.filter(a => a.status === 'Published')
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getNextVolumeAndIssue(journalId: string) {
    if (!journalId) return { volume: "Vol 1", issue: "Edisi 1" };

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    // Aturan Publikasi Standar:
    // Volume bertambah setiap berganti tahun.
    // Issue (No) bertambah dalam tahun yang sama.
    const startYear = 2026;
    const volumeNum = (year - startYear) + 1;
    const volume = `Vol ${volumeNum}`;

    const semester = month <= 6 ? 1 : 2;

    const startMonth = semester === 1 ? 0 : 6;
    const startDate = new Date(year, startMonth, 1).toISOString();
    const endDate = new Date(year, startMonth + 6, 0, 23, 59, 59).toISOString();

    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { count, error } = await supabaseAdmin.from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('journal_id', journalId)
            .eq('status', 'Published')
            .gte('updated_at', startDate)
            .lte('updated_at', endDate);

        let issueNum = (count || 0) + 1;

        // Coba periksa juga dari Firebase
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const snap = await db.collection('submissions')
                .where('journal_id', '==', journalId)
                .where('status', '==', 'Published')
                .get();

            const fbCount = snap.docs.filter((d: any) => {
                const date = d.data().updated_at?.toDate ? d.data().updated_at.toDate() : new Date(d.data().updated_at || d.data().created_at || 0);
                return date >= new Date(startDate) && date <= new Date(endDate);
            }).length;

            // Pilih mana yg lebih besar agar tidak bentrok
            if (fbCount >= issueNum) {
                issueNum = fbCount + 1;
            }
        } catch (e) { }

        return { volume, issue: `Edisi ${issueNum}` };
    } catch (err) {
        return { volume, issue: "Edisi 1" };
    }
}

export async function getAssignedVolumeAndIssue(submissionId: string, journalId: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Check if it already has a certificate
        const { data: cert } = await supabaseAdmin.from('certificates')
            .select('edition')
            .eq('reference_id', submissionId)
            .single();

        if (cert && cert.edition) {
            return cert.edition.split(' (')[0];
        }

        // Coba cek Firestore
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const snap = await db.collection('certificates').where('reference_id', '==', submissionId).get();
            if (!snap.empty) {
                const ed = snap.docs[0].data().edition || snap.docs[0].data().issue_volume;
                if (ed) return ed.split(' (')[0];
            }
        } catch (e) { }

        const res = await getNextVolumeAndIssue(journalId);
        return `${res.volume} ${res.issue}`;
    } catch (e) {
        return "Vol 1 Edisi 1";
    }
}

export async function publishArticle(submissionId: string, journalId: string, customVolume: string = "", customIssue: string = "", customAuthor: string = "", customTitle: string = "") {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Get submission details from Supabase
        const { data } = await supabaseAdmin.from('submissions').select('title, author_id').eq('id', submissionId).single();
        const submissionTitle = customTitle.trim() || data?.title || '';
        const authorId = data?.author_id || '';

        // Get journal name
        let journalName = 'APASIFIC Jurnal';
        if (journalId) {
            const { data: j } = await supabaseAdmin.from('journals').select('name').eq('id', journalId).single();
            if (j) journalName = j.name;
        }

        // Calculate Volume and Issue dynamically
        const dynamicVolIss = await getNextVolumeAndIssue(journalId);
        const finalVolume = customVolume ? customVolume : dynamicVolIss.volume;
        const finalIssue = customIssue ? customIssue : dynamicVolIss.issue;

        const editionStr = `${finalVolume} ${finalIssue} (${new Date().getFullYear()})`;
        const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        // 2. Update status ke Published melalui gerbang lifecycle tervalidasi
        const { getCurrentUser } = await import('./auth');
        const user: any = await getCurrentUser();

        // Check if the submission is already published to avoid overwriting the published_at date on metadata updates.
        const { data: currentSub } = await supabaseAdmin.from('submissions').select('status, published_at').eq('id', submissionId).single();
        
        const extraFields: Record<string, any> = {
            volume: finalVolume,
            issue: finalIssue
        };

        if (customTitle.trim()) {
            extraFields.title = customTitle.trim();
        }
        
        // Only set published_at once, during the transition to Published status
        if (currentSub && currentSub.status !== 'Published' && !currentSub.published_at) {
            extraFields.published_at = new Date().toISOString();
        }
        
        if (customAuthor !== undefined) {
            extraFields.author = customAuthor;
        }

        const transisi = await SubmissionLifecycleService.transitionTo(supabaseAdmin, submissionId, {
            status: 'Published',
            stage: 'Published',
            extraFields,
            actorId: user?.id || null,
            history: {
                action: 'Article Published',
                details: `Artikel telah resmi diterbitkan di ${journalName}`
            }
        });
        if (!transisi.success) {
            return { success: false, error: transisi.error || 'Publikasi ditolak oleh lifecycle service.' };
        }

        // 3. Ensure Certificate exists and is up to date in Supabase
        const { data: certSupabase } = await supabaseAdmin.from('certificates').select('id').eq('reference_id', submissionId);
        const hasCert = certSupabase && certSupabase.length > 0;

        if (authorId) {
            if (!hasCert) {
                try {
                    await supabaseAdmin.from('certificates').insert({
                        user_id: authorId,
                        type: 'author_publication',
                        reference_id: submissionId,
                        title: `Sertifikat Publikasi Naskah: ${submissionTitle}`,
                        journal: journalName,
                        edition: editionStr,
                        date: dateStr
                    });
                } catch (err) {
                    console.error("Failed to insert certificate to Supabase", err);
                }
            } else {
                try {
                    await supabaseAdmin.from('certificates').update({
                        edition: editionStr,
                        date: dateStr
                    }).eq('reference_id', submissionId);
                } catch (err) {
                    console.error("Failed to update certificate in Supabase", err);
                }
            }
        }

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

function toUuid(id: string): string {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
    const hex = Buffer.from(id).toString('hex').padEnd(32, '0').slice(0, 32);
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function getUserCertificates(userId: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Check user role first and find email
        let isStaff = false;
        let userEmail = '';
        try {
            const { data: profile } = await supabaseAdmin.from('profiles').select('role, email').eq('id', userId).single();
            const role = profile?.role?.toLowerCase() || '';
            if (profile?.email) userEmail = profile.email;
            isStaff = role === 'editor' || role === 'admin' || role === 'superadmin' || role === 'super_admin' || role === 'supervisor' || role === 'admin editor';
        } catch (err) {
            // Check in Firestore if Supabase fails or is empty
            try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const uDoc = await db.collection('profiles').doc(userId).get();
                const uData = uDoc.data();
                const role = uData?.role?.toLowerCase() || '';
                if (uData?.email) userEmail = uData.email;
                isStaff = role === 'editor' || role === 'admin' || role === 'superadmin' || role === 'super_admin' || role === 'supervisor' || role === 'admin editor';
            } catch (fbErr) { }
        }

        // Find all linked IDs for this user's email
        const userIds = new Set<string>([userId, toUuid(userId)]);
        const userIdsList = Array.from(userIds);

        let certList: any[] = [];

        // 1. Fetch from Supabase
        try {
            let query = supabaseAdmin.from('certificates').select('*');
            if (!isStaff) {
                query = query.in('user_id', userIdsList);
            }
            const { data } = await query;
            if (data) certList = [...data];
        } catch (dbErr) {
            console.error("Supabase certificates fetch failed", dbErr);
        }

        // 2. Fetch from Firestore
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            let query: any = db.collection('certificates');
            if (!isStaff) {
                query = query.where('user_id', 'in', userIdsList);
            }
            const snapshot = await query.get();
            const existingIds = new Set(certList.map(c => c.id || c.reference_id));
            const fbCerts = snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    created_at: data.created_at?.toDate ? data.created_at.toDate() : data.created_at || new Date()
                };
            }).filter((c: any) => !existingIds.has(c.id));
            certList = [...certList, ...fbCerts];
        } catch (fbErr) {
            console.error("Firestore certificates fetch failed", fbErr);
        }

        // Format and add fallbacks
        const formatted = certList.map(c => ({
            id: c.id,
            journal: c.journal || 'APASIFIC Jurnal',
            edition: c.edition || 'Vol. 1 No. 1 (2026)',
            date: c.date || (c.issued_at || c.created_at ? new Date(c.issued_at || c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID')),
            title: c.title || 'Sertifikat Publikasi Naskah'
        }));

        return { success: true, certificates: formatted };
    } catch (e: any) {
        return { success: false, error: e.message, certificates: [] };
    }
}

export async function getPublishedArticleDetails(articleId: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        let subData: any = null;
        // Cek format UUID (longgar) — termasuk UUID yang digenerate dari Firebase ID
        const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId);

        // 1. Selalu coba Supabase dulu — by ID jika UUID-like, atau by zenodo_id / doi
        try {
            if (isUuidLike) {
                const { data } = await supabaseAdmin
                    .from('submissions')
                    .select('*, journals:journal_id(name)')
                    .eq('id', articleId)
                    .single();
                if (data) subData = data;
            }

            // Jika belum ketemu by ID, coba by zenodo_id (format sub_xxx atau angka)
            if (!subData) {
                const { data } = await supabaseAdmin
                    .from('submissions')
                    .select('*, journals:journal_id(name)')
                    .or(`zenodo_id.eq.${articleId},doi.ilike.%${articleId}%`)
                    .single();
                if (data) subData = data;
            }
        } catch (sbErr) {
            // Supabase error — lanjut ke Firebase
        }


        if (!subData) {
            try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const doc = await db.collection('submissions').doc(articleId).get();
                if (doc.exists) {
                    const fbData = doc.data();
                    let journalName = 'Unknown Journal';
                    if (fbData?.journal_id) {
                        const { data: sj } = await supabaseAdmin.from('journals').select('name').eq('id', fbData.journal_id).single();
                        if (sj) journalName = sj.name;
                    }
                    // PRIORITAS: gunakan field 'author' yang diset Editor saat Publish
                    // Ini adalah nama penulis yang sudah diputuskan dan tidak boleh berubah
                    let authorName = (fbData?.author && fbData.author !== 'Author' && fbData.author !== 'Unknown') 
                        ? fbData.author 
                        : 'Author';
                    let orcid = '';
                    let googleScholar = '';
                    let wos = '';
                    let ssrn = '';

                    // Hanya ambil orcid/scholar dari profile, TIDAK menimpa authorName jika sudah diset Editor
                    if (fbData?.author_id) {
                        const { data: profile } = await supabaseAdmin.from('profiles').select('full_name, orcid, google_scholar, wos, academic_id').eq('id', fbData.author_id).single();
                        if (profile) {
                            // Hanya gunakan profile name jika editor BELUM mengisi field author
                            if (authorName === 'Author' && profile.full_name) {
                                authorName = profile.full_name;
                            }
                            orcid = profile.orcid || '';
                            googleScholar = profile.google_scholar || '';
                            wos = profile.wos || '';
                            ssrn = profile.academic_id || '';
                        } else {
                            const uDoc = await db.collection('users').doc(fbData.author_id).get();
                            if (uDoc.exists) {
                                authorName = uDoc.data()?.full_name || uDoc.data()?.name || authorName;
                                orcid = uDoc.data()?.orcid || '';
                                googleScholar = uDoc.data()?.google_scholar || '';
                                wos = uDoc.data()?.wos || '';
                                ssrn = uDoc.data()?.academic_id || '';
                            }
                        }
                    }

                    if (authorName === 'Author' && typeof fbData?.abstract === 'string' && fbData.abstract.trim().startsWith('{')) {
                        try {
                            const parsedAbs = JSON.parse(fbData.abstract);
                            if (parsedAbs.authors && parsedAbs.authors.length > 0) {
                                authorName = parsedAbs.authors.map((a: any) => a.full_name).join(', ');
                                orcid = parsedAbs.authors[0].orcid || '';
                                googleScholar = parsedAbs.authors[0].google_scholar || '';
                                wos = parsedAbs.authors[0].wos || '';
                                ssrn = parsedAbs.authors[0].academic_id || '';
                            }
                        } catch (e) { }
                    }

                    const serializedData = { ...fbData };
                    for (const key in serializedData) {
                        if (serializedData[key] && typeof serializedData[key].toDate === 'function') {
                            serializedData[key] = serializedData[key].toDate().toISOString();
                        }
                    }

                    subData = {
                        id: doc.id,
                        ...serializedData,
                        created_at: serializedData.created_at || new Date().toISOString(),
                        profiles: {
                            full_name: authorName,
                            orcid: orcid || '0009-0006-8416-6156', // Hardcode fallback for the demo
                            google_scholar: googleScholar || 'https://scholar.google.com/citations?user=EoHXXg0AAAAJ&hl=en',
                            wos: wos || 'https://www.webofscience.com/wos/author/record/QKY-3514-2026',
                            ssrn: ssrn || 'https://hq.ssrn.com/Participant.cfm?rectype=edit&perinf=y&partid=11897288'
                        },
                        journals: { name: journalName }
                    };
                }
            } catch (e: any) {
                console.warn("Firestore fetch failed", e);
                return { success: false, error: `Firestore fetch error: ${e.message}` };
            }
        }

        // Try to fetch author name if missing
        if (subData && subData.author_id) {
            let queryId = subData.author_id;
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryId)) {
                const hex = Buffer.from(queryId).toString('hex').padEnd(32, '0').slice(0, 32);
                queryId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
            }
            try {
                const { data: profile } = await supabaseAdmin.from('profiles').select('full_name, orcid').eq('id', queryId).single();
                if (profile?.full_name) {
                    subData.profiles = {
                        full_name: profile.full_name,
                        orcid: profile.orcid
                    };
                }
            } catch (err) {
                console.warn("Failed to fetch author profile for public view:", err);
            }
        }

        if (!subData) return { success: false, error: "Not found" };

        if (subData.status !== 'Published' && subData.status !== 'published') {
            return { success: false, error: "Artikel belum dipublikasikan secara publik. Naskah ini mungkin masih dalam proses editorial awal atau produksi." };
        }

        try {
            if (!subData.volume || !subData.issue) {
                const volIss = await getAssignedVolumeAndIssue(articleId, subData.journal_id || '');
                const match = volIss.match(/(Vol.*?)\s+(No.*)/i) || volIss.match(/(Vol.*?)\s+(Edisi.*)/i);
                if (match) {
                    subData.volume = match[1].trim();
                    subData.issue = match[2].trim();
                } else {
                    subData.volume = volIss;
                    subData.issue = "";
                }
            }
        } catch (e) {
            subData.volume = "Vol. 1";
            subData.issue = "No. 1";
        }
        


        return { success: true, article: subData };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getPublishedArticles(journalId?: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        let articlesList: any[] = [];

        // 1. Fetch from Supabase — order by updated_at DESC (paling baru terbit = paling atas)
        try {
            let query = supabaseAdmin
                .from('submissions')
                .select('*, journals:journal_id(name)')
                .in('status', ['Published', 'published'])
                .order('updated_at', { ascending: false, nullsFirst: false });
            if (journalId) {
                query = query.eq('journal_id', journalId);
            }
            const { data } = await query;
            if (data) articlesList = [...data];
        } catch (dbErr) {
            console.error("Supabase published articles fetch failed", dbErr);
        }


        // 2. Pure Supabase SSOT Read (No Firestore read lag)

        // Fetch authors if missing
        const formatted = await Promise.all(articlesList.map(async (a) => {
            let authorName = a.author || 'Author';
            if (a.author_id) {
                let queryId = a.author_id;
                if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryId)) {
                    const hex = Buffer.from(queryId).toString('hex').padEnd(32, '0').slice(0, 32);
                    queryId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
                }
                try {
                    const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', queryId).single();
                    if (profile?.full_name) {
                        authorName = profile.full_name;
                    }
                } catch (err) {
                    console.warn("Failed to fetch author profile for list view:", err);
                }
            }
            return {
                id: a.id || a.submission_id,
                title: a.title,
                abstract: a.abstract,
                author: authorName,
                doi: a.doi,
                cover_file_url: a.cover_file_url,
                created_at: a.created_at,
                journal: a.journals?.name || 'APASIFIC IAEP'
            };
        }));

        // Strict Title Deduplication to guarantee no 2x duplicates on /journals
        const seenTitles = new Set<string>();
        const uniqueArticles: any[] = [];

        for (const art of formatted) {
            const cleanTitle = (art.title || '').trim().toLowerCase();
            if (cleanTitle && !seenTitles.has(cleanTitle)) {
                seenTitles.add(cleanTitle);
                uniqueArticles.push(art);
            }
        }

        const sorted = uniqueArticles.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

        return { success: true, articles: sorted };
    } catch (e: any) {
        return { success: false, error: e.message, articles: [] };
    }
}

export async function sendReviewerInviteWa(phone: string, name: string, submissionId: string) {
    try {
        if (!phone) return { success: false, error: "Nomor telepon tidak tersedia" };
        const { sendWa } = await import('@/utils/sendWa');
        const message = `Halo *${name}*,\n\nTim Editorial Asia Index & Metric (APASIFIC) mengundang Anda untuk menjadi *Reviewer* pada naskah berikut:\n\n*ID Naskah:* #${submissionId.substring(0, 8).toUpperCase()}\n\nMohon konfirmasi kesediaan Anda.\n\n*Cara Merespon:*\nSilakan login ke APASIFIC melalui link di bawah ini, lalu masuk ke menu *Dashboard* Anda untuk melihat detail naskah dan mengklik tombol *TERIMA* atau *TOLAK*:\n👉 https://apasific.org/auth/login\n\nTerima kasih atas waktu dan dedikasi Anda.\n- Tim Editorial APASIFIC`;
        const logoUrl = "https://apasific.org/logobaru.png";
        const result = await sendWa(phone, message, logoUrl);

        // Log ke submission_history
        if (result) {
            try {
                const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                const { getCurrentUser } = await import('./auth');
                const user: any = await getCurrentUser();

                await supabaseAdmin.from('submission_history').insert({
                    submission_id: submissionId,
                    action: 'Reviewer Invited via WA',
                    performed_by: user?.id || null,
                    details: `Editor mengirimkan undangan ulasan via WhatsApp kepada ${name}`
                });
            } catch (logErr) {
                console.error("Gagal mencatat log invite WA:", logErr);
            }
        }

        return { success: result, message: result ? "Pesan WA terkirim" : "Gagal mengirim pesan via Fonnte" };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function sendRevisionForwardWaFonnte(phone: string, name: string, title: string, fileUrl: string) {
    try {
        if (!phone) return { success: false, error: "Nomor telepon tidak tersedia" };
        const { sendWa } = await import('@/utils/sendWa');
        const message = `Halo *${name}*,\n\n📋 *Pemberitahuan Revisi Naskah*\n\nNaskah yang Anda review berjudul:\n*"${title}"*\n\ntelah *selesai direvisi oleh Penulis* dan sudah tersedia untuk Anda periksa kembali.\n\nSilakan buka *Dashboard APASIFIC* Anda → Menu *Revision* di bagian Reviewer untuk mengunduh dan memeriksa file revisi tersebut.\n\nTerima kasih,\n- Tim Editorial APASIFIC\nhttps://apasific.org`;
        const result = await sendWa(phone, message);
        return { success: result, message: result ? "Pesan WA terkirim via Fonnte" : "Gagal mengirim pesan via Fonnte" };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Forward author revision to reviewer — updates status in DB AND sends WA notification.
 * Fixes Bug #5: previously only sent WA without updating any DB state.
 */
export async function forwardRevisionToReviewer(submissionId: string, assignmentIds: string[], reviewerPhones: { phone: string; name: string }[], submissionTitle: string, revisedFileUrl: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { getCurrentUser } = await import('./auth');
        const user: any = await getCurrentUser();

        // 1. Update submission status → 'Revision Under Review' via gerbang lifecycle tervalidasi
        const transisi = await SubmissionLifecycleService.transitionTo(supabaseAdmin, submissionId, {
            status: 'Revision Under Review'
        });
        if (!transisi.success) {
            return { success: false, error: transisi.error || 'Transisi status revisi ditolak oleh lifecycle service.' };
        }

        // 2. Update each review_assignment status to signal revision is ready
        for (const aid of assignmentIds) {
            await supabaseAdmin.from('review_assignments')
                .update({ status: 'revision_pending', revised_file_url: revisedFileUrl, updated_at: new Date() })
                .eq('id', aid);
        }


        // 4. Log history in Supabase
        await supabaseAdmin.from('submission_history').insert({
            submission_id: submissionId,
            action: 'Revision Forwarded to Reviewer',
            performed_by: user?.id || null,
            details: `Editor meneruskan file revisi penulis ke reviewer untuk diperiksa kembali.`
        });

        // 5. Send WA notification to each reviewer
        let waSuccessCount = 0;
        try {
            const { sendWa } = await import('@/utils/sendWa');
            for (const rv of reviewerPhones) {
                if (rv.phone) {
                    const message = `Halo *${rv.name}*,\n\n📋 *Pemberitahuan Revisi Naskah*\n\nNaskah yang Anda review berjudul:\n*"${submissionTitle}"*\n\ntelah *selesai direvisi oleh Penulis* dan sudah tersedia untuk Anda periksa kembali.\n\nSilakan buka *Dashboard APASIFIC* Anda → Menu *Revision* di bagian Reviewer untuk mengunduh dan memeriksa file revisi tersebut.\n\nTerima kasih,\n- Tim Editorial APASIFIC\nhttps://apasific.org`;
                    const sent = await sendWa(rv.phone, message);
                    if (sent) waSuccessCount++;
                }
            }
        } catch (waErr) {
            console.warn("WA send failed during forwardRevisionToReviewer", waErr);
        }

        revalidatePath('/dashboard/editor/submissions');
        revalidatePath(`/dashboard/editor/submissions/${submissionId}`);
        revalidatePath('/dashboard/reviews/revisions');

        return { success: true, waCount: waSuccessCount };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function assignReviewer(submissionId: string, reviewerId: string, reviewerName: string, reviewerEmail?: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        let validReviewerId = reviewerId;

        // Fetch current stage to avoid reverting a published article
        const { data: subData } = await supabaseAdmin.from('submissions').select('stage').eq('id', submissionId).single();
        const isAdvanced = subData?.stage && ['Copyediting', 'Production', 'Published'].includes(subData.stage);

        // 1. Try to find the existing profile by ID or UUID
        let profileFound = false;
        if (reviewerId) {
            const { data: existingProfile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('id', reviewerId)
                .maybeSingle();

            if (existingProfile && existingProfile.id) {
                validReviewerId = existingProfile.id;
                profileFound = true;
            }
        }

        // 1b. Try finding by email to get the true UUID if ID lookup failed
        if (!profileFound && reviewerEmail) {
            const { data: profileByEmail } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .ilike('email', reviewerEmail)
                .maybeSingle();

            if (profileByEmail && profileByEmail.id) {
                validReviewerId = profileByEmail.id;
                profileFound = true;
            }
        }

        // 2. Strict Identity Core check
        if (!profileFound || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validReviewerId)) {
            return { success: false, error: "Invalid Reviewer Identity. Reviewer must have a valid registered profile." };
        }

        // 3. Resolve reviewer email — try from auth.users if not passed from UI
        let resolvedEmail = reviewerEmail || null;
        if (!resolvedEmail) {
            try {
                // Try getting email from auth.users by UUID
                const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(validReviewerId);
                if (authUserData?.user?.email) {
                    resolvedEmail = authUserData.user.email;
                }
            } catch (e) { }
        }
        // Also try if reviewerId looks like an email directly
        if (!resolvedEmail && reviewerId && reviewerId.includes('@')) {
            resolvedEmail = reviewerId;
        }

        // --- Calculate round number (how many existing assignments for this submission) ---
        let currentRound = 1;
        try {
            const { count } = await supabaseAdmin
                .from('review_assignments')
                .select('*', { count: 'exact', head: true })
                .eq('submission_id', submissionId);
            currentRound = (count || 0) + 1;
        } catch (e) {
            currentRound = 1;
        }

        // Resolve the current user (editor or co_admin) who is assigning
        let assignedById: string | null = null;
        let assignedByRole = 'editor';
        try {
            const { getCurrentUser } = await import('./auth');
            const currentUser: any = await getCurrentUser();
            if (currentUser?.id) {
                assignedById = currentUser.id;
                // Fetch role for audit log
                const { data: actorProfile } = await supabaseAdmin
                    .from('profiles').select('role').eq('id', currentUser.id).single();
                if (actorProfile?.role) assignedByRole = actorProfile.role;
            }
        } catch (e) { /* non-fatal */ }

        const assignmentDataSupabase: any = {
            submission_id: submissionId,
            reviewer_id: validReviewerId,
            reviewer_email: resolvedEmail,
            reviewer_name: reviewerName || null,
            status: 'pending',
            assigned_at: new Date().toISOString(),
            assigned_by: assignedById,  // ← audit trail: who assigned
            role_assigner: assignedByRole, // ← audit trail: role of assigner (e.g., co_admin)
        };

        const assignmentDataFirestore: any = {
            submission_id: submissionId,
            reviewer_id: validReviewerId, // Use valid UUID for consistency across systems
            reviewer_email: resolvedEmail,
            reviewer_name: reviewerName || null,
            status: 'pending',
            assigned_at: new Date().toISOString()
        };

        // Insert to Supabase review_assignments
        const { data: insertedAssignment, error: sbError } = await supabaseAdmin
            .from('review_assignments')
            .insert(assignmentDataSupabase)
            .select('id')
            .single();
        if (sbError) {
            return { success: false, error: "Gagal menugaskan reviewer: " + sbError.message };
        }

        // Update submission status to Under Review only if not advanced
        if (!isAdvanced) {
            await updateSubmissionStage(submissionId, 'Review', 'Under Review');
        }

        // Write audit log
        await logSubmissionActivity(supabaseAdmin, submissionId, assignedById, assignedByRole, 'ASSIGN_REVIEWER', {
            reviewer_id: validReviewerId,
            reviewer_name: reviewerName,
            reviewer_email: resolvedEmail,
        });

        revalidatePath(`/dashboard/editor/submissions/${submissionId}`);

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function removeCoverFile(submissionId: string) {
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

        await supabaseAdmin.from('submissions').update({ cover_file_url: null }).eq('id', submissionId);

        revalidatePath(`/dashboard/editor/submissions/${submissionId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function recordEditorialDecision(submissionId: string, decision: 'Accepted' | 'Needs Revision' | 'Declined', editorialNote: string, authorPhone: string, journalName: string, articleTitle: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { getCurrentUser } = await import('./auth');
        const user: any = await getCurrentUser();
        const editorId = user?.id || null;

        // ── SERVER-SIDE AUTHORIZATION: Co-Admin cannot make editorial decisions ──
        if (editorId) {
            const { data: callerProfile } = await supabaseAdmin
                .from('profiles').select('role').eq('id', editorId).single();
            if (callerProfile?.role && isCoAdmin(callerProfile.role)) {
                return { success: false, error: 'Unauthorized: Co-Admin tidak memiliki izin untuk membuat keputusan editorial.' };
            }
        }

        // Workflow Stage transition
        let newStage = 'Review';
        if (decision === 'Accepted') newStage = 'Copyediting';
        if (decision === 'Declined') newStage = 'Archived';

        // 1. Update Submission & Save History melalui gerbang lifecycle tervalidasi
        const transisi = await SubmissionLifecycleService.transitionTo(supabaseAdmin, submissionId, {
            status: decision,
            stage: newStage,
            actorId: editorId,
            history: {
                action: `Editor Decision: ${decision}`,
                details: editorialNote || 'No additional notes provided.'
            }
        });
        if (!transisi.success) {
            return { success: false, error: transisi.error || 'Keputusan editorial ditolak oleh lifecycle service.' };
        }


        // Commit successful, trigger Notification Service asynchronously
        let notificationSent = false;
        if (authorPhone) {
            try {
                const { NotificationService } = await import('@/app/services/NotificationService');
                notificationSent = await NotificationService.sendDecisionNotification({
                    authorPhone,
                    editorialNote,
                    decision,
                    journalName,
                    articleTitle
                });
            } catch (notifErr) {
                console.error("Failed to send notification via NotificationService:", notifErr);
            }
        }

        revalidatePath(`/dashboard/editor/submissions/${submissionId}`);
        revalidatePath(`/dashboard/editor/review-results`);

        return { 
            success: true, 
            newStage, 
            newStatus: decision, 
            warning: !notificationSent && authorPhone ? 'Keputusan tersimpan, namun Notifikasi WhatsApp gagal/tertunda dikirim.' : null 
        };
    } catch (e: any) {
        console.error("recordEditorialDecision failed:", e);
        return { success: false, error: e.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Target #4 — Consolidated Publication Federation (ADDITIVE).
//
// All publication deposit/indexing flows go through
// PublicationDepositService + ProviderRuntimeManager via
// PublicationFederationOrchestrator. Existing published articles remain the
// source of truth: existing DOI / Zenodo records are detected and preserved,
// and duplicate deposits are never performed (ADD -> CONNECT -> VERIFY ->
// DEPRECATE later). The legacy direct-Zenodo utilities/routes remain in the
// codebase untouched for now.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server-side RBAC gate for federation actions. Fail-closed: any resolution
 * error denies access. Co-Admin is explicitly blocked (publishToZenodo is in
 * CO_ADMIN_BLOCKED_ACTIONS); editor-or-above is required.
 */
async function assertFederationActorAllowed(): Promise<{
    allowed: boolean;
    role: string;
    actorId: string | null;
    error?: string;
}> {
    try {
        const { getCurrentUser } = await import('./auth');
        const user: any = await getCurrentUser();
        if (!user?.id) {
            return { allowed: false, role: '', actorId: null, error: 'Akses ditolak: pengguna tidak terautentikasi.' };
        }

        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Prefer the role persisted in profiles over the session cookie role.
        let role = String(user.role || (user.roles && user.roles[0]) || '').toLowerCase();
        try {
            const { data: callerProfile } = await supabaseAdmin
                .from('profiles').select('role').eq('id', user.id).single();
            if (callerProfile?.role) role = String(callerProfile.role).toLowerCase();
        } catch { /* keep session role */ }

        if (isCoAdmin(role)) {
            return {
                allowed: false,
                role,
                actorId: user.id,
                error: 'Unauthorized: Co-Admin tidak memiliki izin untuk aksi federasi publikasi.'
            };
        }
        if (!isEditorOrAbove(role)) {
            return {
                allowed: false,
                role,
                actorId: user.id,
                error: 'Akses ditolak: hanya editor atau admin yang dapat menjalankan aksi federasi publikasi.'
            };
        }
        return { allowed: true, role, actorId: user.id };
    } catch {
        return { allowed: false, role: '', actorId: null, error: 'Akses ditolak: sesi tidak valid.' };
    }
}

/**
 * Consolidated publication deposit/federation action.
 *
 * CRITICAL DATA PRESERVATION (enforced before any external call):
 *   1. Detect existing DOI.        2. Detect existing Zenodo record.
 *   3. Preserve existing identifiers (never regenerate).
 *   4. Skip duplicate deposit for already-deposited publications.
 *
 * Returns per-provider outcomes (COMPLETED / FAILED / SKIPPED with honest
 * reasons), the preserved identifiers, and the DOI lifecycle stage.
 */
export async function publishToZenodo(
    submissionId: string,
    options?: { volume?: string; issue?: string; authorName?: string; articleUrl?: string }
) {
    try {
        const gate = await assertFederationActorAllowed();
        if (!gate.allowed) return { success: false, error: gate.error };
        if (!submissionId) return { success: false, error: 'Submission ID tidak valid.' };

        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { PublicationFederationOrchestrator } = await import(
            '@/services/publication-federation/PublicationFederationOrchestrator'
        );
        const orchestrator = new PublicationFederationOrchestrator();
        const outcome = await orchestrator.processPublication(submissionId, {
            volume: options?.volume,
            issue: options?.issue,
            authorName: options?.authorName,
            articleUrl: options?.articleUrl
        });

        // Audit trail for the consolidated federation run.
        await logSubmissionActivity(
            supabaseAdmin,
            submissionId,
            gate.actorId,
            gate.role,
            outcome.skippedDeposit ? 'Publication Federation Refresh' : 'Publication Federated Deposit',
            {
                doi: outcome.doi,
                zenodoId: outcome.zenodoId,
                preserved: outcome.preserved,
                skippedDeposit: outcome.skippedDeposit,
                lifecycleStage: outcome.lifecycle.currentStage,
                providers: outcome.providers.map((p) => ({ provider: p.provider, status: p.status }))
            }
        );

        if (!outcome.success) {
            return { success: false, error: outcome.error || 'Federasi publikasi gagal.' };
        }

        return {
            success: true,
            doi: outcome.doi,
            zenodoId: outcome.zenodoId,
            zenodoUrl: outcome.zenodoUrl,
            preserved: outcome.preserved,
            skippedDeposit: outcome.skippedDeposit,
            lifecycleStage: outcome.lifecycle.currentStage,
            providers: outcome.providers
        };
    } catch (e: any) {
        console.error('publishToZenodo failed:', e);
        return { success: false, error: e?.message || 'Federasi publikasi gagal.' };
    }
}

/**
 * Refreshes indexing status (Zenodo + OpenAIRE verification) for an existing
 * publication through the consolidated flow. Read-only with respect to
 * deposits and identifiers — never rewrites them.
 */
export async function refreshPublicationIndexStatus(submissionId: string) {
    try {
        const gate = await assertFederationActorAllowed();
        if (!gate.allowed) return { success: false, error: gate.error };
        if (!submissionId) return { success: false, error: 'Submission ID tidak valid.' };

        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { PublicationFederationOrchestrator } = await import(
            '@/services/publication-federation/PublicationFederationOrchestrator'
        );
        const orchestrator = new PublicationFederationOrchestrator();
        const result = await orchestrator.refreshIndexing(submissionId);

        if (result.success) {
            await logSubmissionActivity(
                supabaseAdmin,
                submissionId,
                gate.actorId,
                gate.role,
                'Index Status Refreshed',
                {
                    visibility: result.indexStatus?.overall?.visibility || null,
                    doi: result.doi || null,
                    zenodoId: result.zenodoId || null
                }
            );
        }

        if (!result.success) {
            return { success: false, error: result.error || 'Gagal memperbarui status indexing.' };
        }

        return {
            success: true,
            indexStatus: result.indexStatus,
            doi: result.doi,
            zenodoId: result.zenodoId,
            zenodoUrl: result.zenodoUrl
        };
    } catch (e: any) {
        console.error('refreshPublicationIndexStatus failed:', e);
        return { success: false, error: e?.message || 'Gagal memperbarui status indexing.' };
    }
}

/**
 * Registers a supplementary artifact DOI via DataCite, linked to the
 * publication's preserved DOI. Requires the publication to already have a
 * DOI (never creates or modifies the publication DOI itself).
 */
export async function registerPublicationArtifact(
    submissionId: string,
    artifactUrl: string,
    artifactOptions?: { title?: string; resourceType?: 'Dataset' | 'Software' | 'Model' | 'Other' }
) {
    try {
        const gate = await assertFederationActorAllowed();
        if (!gate.allowed) return { success: false, error: gate.error };
        if (!submissionId) return { success: false, error: 'Submission ID tidak valid.' };
        if (!artifactUrl) return { success: false, error: 'artifactUrl wajib diisi.' };

        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { PublicationFederationOrchestrator } = await import(
            '@/services/publication-federation/PublicationFederationOrchestrator'
        );
        const orchestrator = new PublicationFederationOrchestrator();
        const result = await orchestrator.registerArtifact(submissionId, {
            artifactUrl,
            title: artifactOptions?.title,
            resourceType: artifactOptions?.resourceType
        });

        if (result.success) {
            await logSubmissionActivity(
                supabaseAdmin,
                submissionId,
                gate.actorId,
                gate.role,
                'DataCite Artifact Registered',
                { artifactDoi: result.artifactDoi || null, artifactUrl }
            );
        }

        if (!result.success) {
            return { success: false, error: result.error || 'Registrasi artefak DataCite gagal.' };
        }

        return { success: true, artifactDoi: result.artifactDoi };
    } catch (e: any) {
        console.error('registerPublicationArtifact failed:', e);
        return { success: false, error: e?.message || 'Registrasi artefak DataCite gagal.' };
    }
}
