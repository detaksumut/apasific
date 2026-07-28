"use server";

import { revalidatePath } from 'next/cache';

async function createClient() {
    const { createClient: getClient } = await import('@/utils/supabase/server');
    return getClient();
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

        // 1. Update Supabase
        await supabaseAdmin.from('submissions').update({ status: decision, updated_at: new Date() }).eq('id', submissionId);

        await supabaseAdmin.from('submission_history').insert({
            submission_id: submissionId,
            action: `Editor Decision: ${decision}`,
            performed_by: editorId,
            details: comments
        });

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
                    const logoUrl = "https://apasific.org/logo-apasific.png";
                    await sendWa(phoneNum, message, logoUrl);
                }
            } catch (waErr) {
                console.error("Failed to send Accepted WA", waErr);
            }
        }

        // 2. Update Firestore
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const batch = db.batch();

            const subRef = db.collection('submissions').doc(submissionId);
            batch.update(subRef, { status: decision, updated_at: new Date() });

            const histRef = db.collection('submission_history').doc();
            batch.set(histRef, {
                submission_id: submissionId,
                action: `Editor Decision: ${decision}`,
                performed_by: editorId,
                details: comments,
                created_at: new Date()
            });



            await batch.commit();
        } catch (e) {
            console.warn("Firestore update decision failed", e);
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

        const isFirestoreId = submissionId.startsWith('sub_') || !submissionId.includes('-');

        // 1. Update Firestore first (primary for Firestore-based submissions)
        if (isFirestoreId) {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const subRef = db.collection('submissions').doc(submissionId);
            await subRef.update({ stage, status, updated_at: new Date() });
        }

        // 2. Update Supabase (wrapped in try/catch to ignore UUID errors for Firestore IDs)
        try {
            await supabaseAdmin.from('submissions').update({ stage, status, updated_at: new Date() }).eq('id', submissionId);

            // Insert into submission_history
            await supabaseAdmin.from('submission_history').insert({
                submission_id: submissionId,
                action: `Stage updated: ${stage} (${status})`,
                performed_by: user?.id || null,
                details: `Naskah dipindahkan ke tahap ${stage} dengan status ${status}`
            });
        } catch (supaErr) {
            console.warn("Supabase update skipped (likely Firestore ID format mismatch)", supaErr);
        }

        // 3. Also update Firestore for Supabase submissions (cross-sync)
        if (!isFirestoreId) {
            try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const subRef = db.collection('submissions').doc(submissionId);
                await subRef.update({ stage, status, updated_at: new Date() });

                const histRef = db.collection('submission_history').doc();
                await histRef.set({
                    submission_id: submissionId,
                    action: `Stage updated: ${stage} (${status})`,
                    performed_by: user?.id || null,
                    details: `Naskah dipindahkan ke tahap ${stage} dengan status ${status}`,
                    created_at: new Date()
                });
            } catch (e) {
                console.warn("Firestore cross-sync update failed", e);
            }
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
                    const logoUrl = "https://apasific.org/logo-apasific.png";
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
        if (subData.file_url && subData.file_url.includes('/')) {
            actualFolder = subData.file_url.split('/')[0];
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

        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            await db.collection('submissions').doc(submissionId).update({ issn });
        } catch (e) {
            console.warn("Failed to update ISSN in Firestore", e);
        }

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

        // Try Supabase first, ignore error if id format is invalid for UUID
        const { error } = await supabaseAdmin.from('submissions')
            .update({ doi: doi, zenodo_id: zenodoId })
            .eq('id', submissionId);

        // Always try Firestore as fallback/sync
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            await db.collection('submissions').doc(submissionId).update({
                doi: doi,
                zenodo_id: zenodoId
            });
        } catch (e) {
            console.warn("Failed to update DOI in Firestore", e);
        }

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

export async function publishArticle(submissionId: string, journalId: string, customVolume: string = "", customIssue: string = "", customAuthor: string = "") {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();

        // 1. Get submission details to find author and title
        let submissionTitle = '';
        let authorId = '';
        let isFirestore = submissionId.startsWith('sub_') || !submissionId.includes('-');

        if (isFirestore) {
            const doc = await db.collection('submissions').doc(submissionId).get();
            if (doc.exists) {
                submissionTitle = doc.data()?.title || '';
                authorId = doc.data()?.author_id || '';
            }
        } else {
            const { data } = await supabaseAdmin.from('submissions').select('title, author_id').eq('id', submissionId).single();
            if (data) {
                submissionTitle = data.title;
                authorId = data.author_id;
            }
        }

        // Get journal name
        let journalName = 'APASIFIC Jurnal';
        if (journalId) {
            const { data: j } = await supabaseAdmin.from('journals').select('name').eq('id', journalId).single();
            if (j) journalName = j.name;
            else {
                const jDoc = await db.collection('journals').doc(journalId).get();
                if (jDoc.exists) journalName = jDoc.data()?.name || journalName;
            }
        }

        // Calculate Volume and Issue dynamically
        const dynamicVolIss = await getNextVolumeAndIssue(journalId);
        const finalVolume = customVolume ? customVolume : dynamicVolIss.volume;
        const finalIssue = customIssue ? customIssue : dynamicVolIss.issue;

        const editionStr = `${finalVolume} ${finalIssue} (${new Date().getFullYear()})`;
        const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        // 2. Update status, stage, volume, and issue to Published
        const updatePayload: any = {
            status: 'Published',
            stage: 'Published',
            volume: finalVolume,
            issue: finalIssue,
            updated_at: new Date()
        };

        if (customAuthor !== undefined) {
            updatePayload.author = customAuthor;
        }

        if (isFirestore) {
            await db.collection('submissions').doc(submissionId).update(updatePayload);
        }
        await supabaseAdmin.from('submissions').update(updatePayload).eq('id', submissionId);

        // Insert history
        const { getCurrentUser } = await import('./auth');
        const user: any = await getCurrentUser();
        await supabaseAdmin.from('submission_history').insert({
            submission_id: submissionId,
            action: 'Article Published',
            performed_by: user?.id || null,
            details: `Artikel telah resmi diterbitkan di ${journalName}`
        });

        if (isFirestore) {
            const histRef = db.collection('submission_history').doc();
            await histRef.set({
                submission_id: submissionId,
                action: 'Article Published',
                performed_by: user?.id || null,
                details: `Artikel telah resmi diterbitkan di ${journalName}`,
                created_at: new Date()
            });
        }

        // 3. Ensure Certificate exists and is up to date
        // Check in Supabase
        const { data: certSupabase } = await supabaseAdmin.from('certificates').select('id').eq('reference_id', submissionId);
        let hasCert = certSupabase && certSupabase.length > 0;

        // Check in Firestore
        let fbCertId = null;
        if (!hasCert || isFirestore) {
            const fbCertSnapshot = await db.collection('certificates').where('reference_id', '==', submissionId).get();
            hasCert = hasCert || !fbCertSnapshot.empty;
            if (!fbCertSnapshot.empty) {
                fbCertId = fbCertSnapshot.docs[0].id;
            }
        }

        if (authorId) {
            if (!hasCert) {
                // Create in Supabase
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

                // Create in Firestore
                try {
                    await db.collection('certificates').add({
                        user_id: authorId,
                        type: 'author_publication',
                        reference_id: submissionId,
                        title: `Sertifikat Publikasi Naskah: ${submissionTitle}`,
                        journal: journalName,
                        edition: editionStr,
                        date: dateStr,
                        created_at: new Date()
                    });
                } catch (err) {
                    console.error("Failed to insert certificate to Firestore", err);
                }
            } else {
                // Update existing certificate
                try {
                    await supabaseAdmin.from('certificates').update({
                        edition: editionStr,
                        date: dateStr
                    }).eq('reference_id', submissionId);
                } catch (err) {
                    console.error("Failed to update certificate in Supabase", err);
                }

                if (fbCertId) {
                    try {
                        await db.collection('certificates').doc(fbCertId).update({
                            edition: editionStr,
                            date: dateStr
                        });
                    } catch (err) {
                        console.error("Failed to update certificate in Firestore", err);
                    }
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

        // 1. Fetch from Supabase — order by zenodo_id DESC (angka lebih besar = terbaru)
        try {
            let query = supabaseAdmin
                .from('submissions')
                .select('*, journals:journal_id(name)')
                .in('status', ['Published', 'published'])
                .order('zenodo_id', { ascending: false, nullsFirst: false });
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
        const logoUrl = "https://apasific.org/logo-apasific.png";
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

                // Fallback to Firestore
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const histRef = db.collection('submission_history').doc();
                await histRef.set({
                    submission_id: submissionId,
                    action: 'Reviewer Invited via WA',
                    performed_by: user?.id || null,
                    details: `Editor mengirimkan undangan ulasan via WhatsApp kepada ${name}`,
                    created_at: new Date()
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

        // 1. Update submission status → 'Revision Under Review'
        await supabaseAdmin.from('submissions')
            .update({ status: 'Revision Under Review', updated_at: new Date() })
            .eq('id', submissionId);

        // 2. Update each review_assignment status to signal revision is ready
        for (const aid of assignmentIds) {
            await supabaseAdmin.from('review_assignments')
                .update({ status: 'revision_pending', revised_file_url: revisedFileUrl, updated_at: new Date() })
                .eq('id', aid);
        }

        // 3. Update Firestore
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const batch = db.batch();

            const subRef = db.collection('submissions').doc(submissionId);
            batch.update(subRef, { status: 'Revision Under Review', updated_at: new Date() });

            for (const aid of assignmentIds) {
                const aRef = db.collection('review_assignments').doc(aid);
                batch.set(aRef, { status: 'revision_pending', revised_file_url: revisedFileUrl, updated_at: new Date() }, { merge: true });
            }

            const histRef = db.collection('submission_history').doc();
            batch.set(histRef, {
                submission_id: submissionId,
                action: 'Revision Forwarded to Reviewer',
                performed_by: user?.id || null,
                details: `Editor meneruskan file revisi penulis ke reviewer untuk diperiksa kembali.`,
                created_at: new Date()
            });

            await batch.commit();
        } catch (e) {
            console.warn("Firestore forward revision update failed", e);
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

        const assignmentDataSupabase: any = {
            submission_id: submissionId,
            reviewer_id: validReviewerId,
            reviewer_email: resolvedEmail,
            reviewer_name: reviewerName || null,
            status: 'pending',
            assigned_at: new Date().toISOString()
        };

        const assignmentDataFirestore: any = {
            submission_id: submissionId,
            reviewer_id: validReviewerId, // Use valid UUID for consistency across systems
            reviewer_email: resolvedEmail,
            reviewer_name: reviewerName || null,
            status: 'pending',
            assigned_at: new Date().toISOString()
        };

        // Insert to Supabase review_assignments — capture returned ID for ID bridging
        let newAssignmentId: string | null = null;
        const { data: insertedAssignment, error: sbError } = await supabaseAdmin
            .from('review_assignments')
            .insert(assignmentDataSupabase)
            .select('id')
            .single();
        if (sbError) {
            console.error("Supabase assign reviewer failed (likely UUID mismatch, continuing to Firestore):", sbError);
        } else if (insertedAssignment?.id) {
            newAssignmentId = insertedAssignment.id;
        }

        // Insert to Firestore review_assignments using the SAME ID as Supabase (ID bridging)
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            if (newAssignmentId) {
                // Use Supabase UUID as Firestore document ID — solves ID mismatch bug
                await db.collection('review_assignments').doc(newAssignmentId).set(assignmentDataFirestore);
            } else {
                // Fallback: let Firestore auto-generate if Supabase insert failed
                await db.collection('review_assignments').add(assignmentDataFirestore);
            }
        } catch (e) {
            console.warn("Firestore assign reviewer failed", e);
        }

        // Update submission status to Under Review only if not advanced
        if (!isAdvanced) {
            await updateSubmissionStage(submissionId, 'Review', 'Under Review');
        }

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

        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            await db.collection('submissions').doc(submissionId).update({ cover_file_url: null });
        } catch (e) {
            console.warn("Firestore update failed", e);
        }
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

        // Workflow Stage transition
        let newStage = 'Review';
        if (decision === 'Accepted') newStage = 'Copyediting';
        if (decision === 'Declined') newStage = 'Archived';

        // 1. Transaction: Update Submission & Save History
        await supabaseAdmin.from('submissions').update({ status: decision, stage: newStage, updated_at: new Date() }).eq('id', submissionId);

        await supabaseAdmin.from('submission_history').insert({
            submission_id: submissionId,
            action: `Editor Decision: ${decision}`,
            performed_by: editorId,
            details: editorialNote || 'No additional notes provided.'
        });

        // Also update Firestore fallback
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            await db.collection('submissions').doc(submissionId).update({ status: decision, stage: newStage, updated_at: new Date() });
            await db.collection('submission_history').add({
                submission_id: submissionId,
                action: `Editor Decision: ${decision}`,
                performed_by: editorId,
                details: editorialNote,
                created_at: new Date()
            });
        } catch (fbErr) {
            console.warn("Firestore fallback failed during recordEditorialDecision", fbErr);
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
