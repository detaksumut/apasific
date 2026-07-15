"use server";

import { createClient } from '@/utils/supabase/server';

export async function getReviewsForSubmission(submissionId: string) {
    try {
        const supabase = await createClient();
        const { data: reviews, error } = await supabase
            .from('review_assignments')
            .select('*, reviewer:reviewer_id(full_name)')
            .eq('submission_id', submissionId)
            .eq('status', 'completed');
            
        let finalReviews = reviews || [];

        // Fallback to Firestore
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const fbReviews = await db.collection('review_assignments')
                .where('submission_id', '==', submissionId)
                .where('status', '==', 'completed')
                .get();

            for (const doc of fbReviews.docs) {
                const data = doc.data();
                if (!finalReviews.find((r: any) => r.id === doc.id)) {
                    // Try to fetch reviewer name from Supabase profiles
                    let reviewerName = 'Anonim';
                    if (data.reviewer_id) {
                        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', data.reviewer_id).single();
                        if (prof) reviewerName = prof.full_name;
                    }
                    
                    finalReviews.push({
                        id: doc.id,
                        ...data,
                        reviewer: { full_name: reviewerName },
                        created_at: data.created_at ? data.created_at.toDate().toISOString() : new Date().toISOString(),
                        updated_at: data.updated_at ? data.updated_at.toDate().toISOString() : new Date().toISOString(),
                    });
                }
            }
        } catch (e) {
            console.warn("Firestore fetch reviews failed", e);
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
            await supabaseAdmin.from('certificates').insert({
              user_id: authorId,
              type: 'author_publication',
              reference_id: submissionId,
              title: `Sertifikat Publikasi Naskah: ${title}`
            });
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

            if (decision === 'Accepted') {
                const certRef = db.collection('certificates').doc();
                batch.set(certRef, {
                    user_id: authorId,
                    type: 'author_publication',
                    reference_id: submissionId,
                    title: `Sertifikat Publikasi Naskah: ${title}`,
                    created_at: new Date()
                });
            }

            await batch.commit();
        } catch (e) {
            console.warn("Firestore update decision failed", e);
        }

        const { revalidatePath } = require('next/cache');
        revalidatePath('/dashboard/editor/review-results');
        revalidatePath('/dashboard/editor/submissions');
        
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateSubmissionStage(submissionId: string, stage: string, status: string) {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // 1. Update Supabase
        await supabaseAdmin.from('submissions').update({ stage, status, updated_at: new Date() }).eq('id', submissionId);

        // 2. Fetch author phone and send WA if Needs Revision
        if (status === 'Needs Revision') {
            const { data: sub } = await supabaseAdmin
                .from('submissions')
                .select('title, profiles:author_id(full_name, phone)')
                .eq('id', submissionId)
                .single();
            
            if (sub?.profiles?.phone) {
                const message = `Halo ${sub.profiles.full_name},

Pemberitahuan dari Tim Editorial Asia Index & Metric (APASIFIC).

Naskah Anda yang berjudul:
"${sub.title}"

Telah selesai ditinjau oleh Reviewer dan *MEMERLUKAN REVISI*. 
Silakan login ke dashboard APASIFIC, masuk ke menu Submisi -> Lacak Proses, untuk membaca catatan revisi dan mengunggah naskah yang telah diperbaiki.

Terima kasih.
https://apasific.org`;

                const { sendWa } = await import('@/utils/sendWa');
                await sendWa(sub.profiles.phone, message);
            }
        }

        // 3. Update Firestore
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const subRef = db.collection('submissions').doc(submissionId);
            await subRef.update({ stage, status, updated_at: new Date() });
        } catch (e) {
            console.warn("Firestore update stage failed", e);
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

        // Try Supabase first (only if it's a UUID)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId);
        let subData: any = null;

        if (isUuid) {
            const { data } = await supabaseAdmin
                .from('submissions')
                .select('*, profiles:author_id(full_name), journals:journal_id(name)')
                .eq('id', submissionId)
                .single();
            if (data) subData = data;
        }

        // Fallback to Firestore
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
                    if (fbData?.author_id) {
                         const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', fbData.author_id).single();
                         if (profile?.full_name) authorName = profile.full_name;
                         else {
                             const uDoc = await db.collection('users').doc(fbData.author_id).get();
                             if (uDoc.exists) authorName = uDoc.data()?.full_name || uDoc.data()?.name || authorName;
                         }
                    }

                    subData = {
                        id: doc.id,
                        ...fbData,
                        created_at: fbData?.created_at?.toDate ? fbData.created_at.toDate().toISOString() : fbData?.created_at || new Date().toISOString(),
                        updated_at: fbData?.updated_at?.toDate ? fbData.updated_at.toDate().toISOString() : fbData?.updated_at || new Date().toISOString(),
                        profiles: { full_name: authorName },
                        journals: { name: journalName }
                    };
                }
            } catch (e) {
                console.warn("Firestore fetch failed", e);
            }
        }

        if (!subData) return { success: false, error: "Not found" };

        // Attempt to fetch secure file URL from Storage if column is empty
        let fileUrl = subData.file_url || "";
        try {
            const { data: files } = await supabaseAdmin.storage.from('manuscripts').list(submissionId + '/');
            if (files && files.length > 0) {
                const titlePage = files.find((f: any) => f.name.includes('title_page')) || files[0];
                const { data: signedData } = await supabaseAdmin.storage.from('manuscripts').createSignedUrl(`${submissionId}/${titlePage.name}`, 60 * 60 * 24);
                if (signedData?.signedUrl) {
                    fileUrl = signedData.signedUrl;
                }
            }
        } catch(e) {}
        subData.file_url = fileUrl;

        return { success: true, submission: subData };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getActiveReviewers() {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Fetch users who have the role 'reviewer' from the profiles table
        const { data: reviewers, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .in('role', ['reviewer', 'Reviewer', 'editor', 'Editor'])
            .order('full_name', { ascending: true });

        if (error) throw error;

        return { success: true, reviewers: reviewers || [] };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
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

        return { success: true, members: members || [] };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
