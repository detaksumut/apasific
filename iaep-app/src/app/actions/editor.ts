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
                    await sendWa(phoneNum, message);
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
        const isFirestoreId = submissionId.startsWith('sub_') || !submissionId.includes('-');

        // 1. Update Firestore first (primary for Firestore-based submissions)
        if (isFirestoreId) {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const subRef = db.collection('submissions').doc(submissionId);
            await subRef.update({ stage, status, updated_at: new Date() });
        }

        // 2. Update Supabase (primary for UUID-based submissions)
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabaseAdmin.from('submissions').update({ stage, status, updated_at: new Date() }).eq('id', submissionId);

        // Insert into submission_history
        const { getCurrentUser } = await import('./auth');
        const user: any = await getCurrentUser();
        await supabaseAdmin.from('submission_history').insert({
            submission_id: submissionId,
            action: `Stage updated: ${stage} (${status})`,
            performed_by: user?.id || null,
            details: `Naskah dipindahkan ke tahap ${stage} dengan status ${status}`
        });

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
                    await sendWa(phoneNum, message);
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

        // 1. Fetch from Supabase
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

        // 2. Fetch from Firestore
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const snapshot = await db.collection('submissions')
                .where('journal_id', '==', journalId)
                .get();

            const existingIds = new Set(articles.map(a => a.id));
            const fbArticles = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if ((data.status === 'Production Completed' || data.status === 'Published') && !existingIds.has(doc.id)) {
                    // Get author name
                    let authorName = data.author || 'Author';
                    if (data.author_id) {
                         const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', data.author_id).single();
                         if (profile?.full_name) authorName = profile.full_name;
                         else {
                             const uDoc = await db.collection('users').doc(data.author_id).get();
                             if (uDoc.exists) authorName = uDoc.data()?.full_name || uDoc.data()?.name || authorName;
                         }
                    }

                    fbArticles.push({
                        id: doc.id,
                        title: data.title,
                        status: data.status,
                        stage: data.stage,
                        author_id: data.author_id,
                        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at || new Date().toISOString(),
                        profiles: { full_name: authorName }
                    });
                }
            }
            articles = [...articles, ...fbArticles];
        } catch (fbErr) {
            console.error("Firestore publications fetch failed", fbErr);
        }

        return {
            success: true,
            acceptedArticles: articles.filter(a => a.status === 'Production Completed'),
            publishedArticles: articles.filter(a => a.status === 'Published')
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function publishArticle(submissionId: string, journalId: string, volume: string = "Vol. 1", issue: string = "No. 1") {
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

        const editionStr = `${volume} ${issue} (${new Date().getFullYear()})`;
        const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        // 2. Update status to Published
        if (isFirestore) {
            await db.collection('submissions').doc(submissionId).update({
                status: 'Published',
                updated_at: new Date()
            });
        }
        await supabaseAdmin.from('submissions').update({
            status: 'Published',
            updated_at: new Date()
        }).eq('id', submissionId);

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

        // 3. Ensure Certificate exists
        // Check in Supabase
        const { data: certSupabase } = await supabaseAdmin.from('certificates').select('id').eq('reference_id', submissionId);
        let hasCert = certSupabase && certSupabase.length > 0;

        // Check in Firestore
        if (!hasCert) {
            const fbCertSnapshot = await db.collection('certificates').where('reference_id', '==', submissionId).get();
            hasCert = !fbCertSnapshot.empty;
        }

        if (!hasCert && authorId) {
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
        }

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

function toUuid(id: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
  const hex = Buffer.from(id).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
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
            isStaff = role === 'editor' || role === 'admin' || role === 'superadmin' || role === 'supervisor' || role === 'admin editor';
        } catch (err) {
            // Check in Firestore if Supabase fails or is empty
            try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const uDoc = await db.collection('profiles').doc(userId).get();
                const uData = uDoc.data();
                const role = uData?.role?.toLowerCase() || '';
                if (uData?.email) userEmail = uData.email;
                isStaff = role === 'editor' || role === 'admin' || role === 'superadmin' || role === 'supervisor' || role === 'admin editor';
            } catch (fbErr) {}
        }

        // Find all linked IDs for this user's email
        const userIds = new Set<string>([userId, toUuid(userId)]);
        if (userEmail) {
            try {
                const { data: sbProfs } = await supabaseAdmin.from('profiles').select('id').eq('email', userEmail);
                if (sbProfs) sbProfs.forEach((p: any) => userIds.add(p.id));
            } catch (e) {}
            try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const fbSnap = await db.collection('profiles').where('email', '==', userEmail).get();
                fbSnap.forEach((doc: any) => userIds.add(doc.id));
            } catch (e) {}
        }
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
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(articleId);

        if (isUuid) {
            const { data } = await supabaseAdmin
                .from('submissions')
                .select('*, journals:journal_id(name)')
                .eq('id', articleId)
                .single();
            if (data) subData = data;
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
                    let authorName = fbData?.author || 'Author';
                    let orcid = '';
                    let googleScholar = '';
                    let wos = '';
                    let ssrn = '';

                    if (fbData?.author_id) {
                         const { data: profile } = await supabaseAdmin.from('profiles').select('full_name, orcid, google_scholar, wos, academic_id').eq('id', fbData.author_id).single();
                         if (profile?.full_name) {
                             authorName = profile.full_name;
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
                        } catch (e) {}
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
                 queryId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
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

        // 1. Fetch from Supabase
        try {
          let query = supabaseAdmin
              .from('submissions')
              .select('*, journals:journal_id(name)')
              .eq('status', 'Published');
          if (journalId) {
              query = query.eq('journal_id', journalId);
          }
          const { data } = await query;
          if (data) articlesList = [...data];
        } catch (dbErr) {
          console.error("Supabase published articles fetch failed", dbErr);
        }

        // 2. Fetch from Firestore
        try {
          const { getFirestore } = await import('@/utils/firebase/db');
          const db = getFirestore();
          let query = db.collection('submissions').where('status', '==', 'Published');
          if (journalId) {
              query = query.where('journal_id', '==', journalId);
          }
          const snapshot = await query.get();
          const existingIds = new Set(articlesList.map(a => a.id || a.submission_id));
           const fbArticles = snapshot.docs.map((doc: any) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at || new Date().toISOString()
            };
          }).filter((c: any) => !existingIds.has(c.id));
          articlesList = [...articlesList, ...fbArticles];
        } catch (fbErr) {
          console.error("Firestore published articles fetch failed", fbErr);
        }

        // Fetch authors if missing
        const formatted = await Promise.all(articlesList.map(async (a) => {
             let authorName = a.author || 'Author';
             if (a.author_id) {
                  let queryId = a.author_id;
                  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryId)) {
                      const hex = Buffer.from(queryId).toString('hex').padEnd(32, '0').slice(0, 32);
                      queryId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
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

        return { success: true, articles: formatted };
    } catch (e: any) {
        return { success: false, error: e.message, articles: [] };
    }
}




