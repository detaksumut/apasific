"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function handleReviewerDecision(assignmentId: string, submissionId: string, decision: 'accepted' | 'rejected') {
  try {
    const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { getCurrentUser } = await import('./auth');
    const user: any = await getCurrentUser();
    
    if (!user) return { success: false, error: "Unauthorized" };

    const statusMap = {
        'accepted': 'Under Review',
        'rejected': 'Awaiting Reviewers'
    };
    
    const newSubmissionStatus = statusMap[decision];
    const logDetails = decision === 'accepted' ? 'Reviewer accepted the assignment' : 'Reviewer rejected the assignment';

    const acceptedAt = new Date();
    const deadline = new Date(acceptedAt);
    deadline.setDate(deadline.getDate() + 3); // 3 hari batas waktu

    const updatePayload: any = { status: decision, updated_at: new Date() };
    if (decision === 'accepted') {
      updatePayload.accepted_at = acceptedAt.toISOString();
      updatePayload.deadline = deadline.toISOString();
    }

    // Fetch current stage to avoid reverting advanced articles
    const { data: subData } = await supabaseAdmin.from('submissions').select('stage').eq('id', submissionId).single();
    const isAdvanced = subData?.stage && ['Copyediting', 'Production', 'Published'].includes(subData.stage);

    // 1. Update assignment status in Supabase
    await supabaseAdmin.from('review_assignments').update(updatePayload).eq('id', assignmentId);
    
    // 2. Update assignment status in Firestore
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const fsPayload: any = { status: decision, updated_at: new Date() };
      if (decision === 'accepted') {
        fsPayload.accepted_at = acceptedAt;
        fsPayload.deadline = deadline;
      }
      await db.collection('review_assignments').doc(assignmentId).set(fsPayload, { merge: true });
    } catch (e) {
      console.warn("Firestore review_assignments update failed", e);
    }

    // 3. Update submission status in Supabase
    if (!isAdvanced) {
      await supabaseAdmin.from('submissions').update({ status: newSubmissionStatus }).eq('id', submissionId);
      await supabaseAdmin.from('submissions').update({ status: newSubmissionStatus }).eq('submission_id', submissionId);
    }

    // 4. Insert history in Supabase
    await supabaseAdmin.from('submission_history').insert({
        submission_id: submissionId,
        action: `Assignment ${decision}`,
        details: logDetails
    });

    let reviewerName = 'Reviewer';
    try {
        const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', user.id).single();
        if (profile && profile.full_name) {
            reviewerName = profile.full_name;
        } else {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const uDoc = await db.collection('users').doc(user.id).get();
            if (uDoc.exists && (uDoc.data()?.full_name || uDoc.data()?.name)) {
                reviewerName = uDoc.data()?.full_name || uDoc.data()?.name;
            }
        }
    } catch(e) {}

    // Send WA based on decision
    if (decision === 'accepted') {
      try {
        let phoneNum = null;
        
        // 1. Try Supabase first (ignore if it fails due to UUID issues)
        try {
            const { data: sub } = await supabaseAdmin
                .from('submissions')
                .select('profiles:author_id(phone)')
                .eq('id', submissionId)
                .single();
            const authorProfile = sub?.profiles as any;
            phoneNum = Array.isArray(authorProfile) ? authorProfile[0]?.phone : authorProfile?.phone;
        } catch (e) {}

        // 2. Try Firestore fallback to get phone number directly from submission
        if (!phoneNum) {
            try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const subDoc = await db.collection('submissions').doc(submissionId).get();
                if (subDoc.exists) {
                    phoneNum = subDoc.data()?.phone;
                    if (!phoneNum) {
                        // try to get from user profile in firestore
                        const authorId = subDoc.data()?.author_id;
                        if (authorId) {
                            const userDoc = await db.collection('users').doc(authorId).get();
                            if (userDoc.exists) phoneNum = userDoc.data()?.phone_number || userDoc.data()?.phone;
                        }
                    }
                }
            } catch (fbErr) {
                console.error("Firestore phone lookup failed", fbErr);
            }
        }
        
        const { sendWa } = await import('@/utils/sendWa');
        if (phoneNum) {
            const message = `Naskah anda mulai di review`;
            const logoUrl = "https://apasific.org/logo-apasific.png";
            await sendWa(phoneNum, message, logoUrl);
        } else {
            console.warn("Could not find phone number for WA notification to author.");
        }
        
        // Kirim juga notifikasi ke HP Admin
        const editorPhone = "+62811665212";
        const editorMessage = `Kabar baik! Reviewer atas nama ${reviewerName} telah MENERIMA penugasan untuk naskah #${submissionId}.`;
        await sendWa(editorPhone, editorMessage);
      } catch (waErr) {
        console.error("Failed to send WA on reviewer acceptance", waErr);
      }
    } else if (decision === 'rejected') {
      try {
        // Send to Editor's phone number
        const editorPhone = "+62811665212";
        const message = `Maaf, Reviewer atas nama ${reviewerName} menyatakan BELUM BERSEDIA meninjau naskah #${submissionId}. Mohon tugaskan reviewer lain.`;
        const { sendWa } = await import('@/utils/sendWa');
        await sendWa(editorPhone, message);
      } catch (waErr) {
        console.error("Failed to send WA on reviewer rejection", waErr);
      }
    }

    // 4. Update Firestore as fallback
    try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        const batch = db.batch();

        const assignRef = db.collection('review_assignments').doc(assignmentId);
        const fbUpdatePayload: any = { status: decision, updated_at: new Date() };
        if (decision === 'accepted') {
          fbUpdatePayload.accepted_at = new Date();
          fbUpdatePayload.deadline = deadline;
        }
        batch.update(assignRef, fbUpdatePayload);

        if (!isAdvanced) {
            const subRef = db.collection('submissions').doc(submissionId);
            batch.update(subRef, { status: newSubmissionStatus, updated_at: new Date() });
        }

        const histRef = db.collection('submission_history').doc();
        batch.set(histRef, {
            submission_id: submissionId,
            action: `Assignment ${decision}`,
            details: logDetails,
            created_at: new Date()
        });

        await batch.commit();
    } catch (fbErr) {
        console.error("Firestore update failed", fbErr);
    }

    const { revalidatePath } = require('next/cache');
    revalidatePath('/dashboard/reviews/assignments');
    revalidatePath('/dashboard/reviews/my-reviews');
    
    return { success: true };
  } catch (e: any) {
    console.error("Decision error", e);
    return { success: false, error: e.message };
  }
}

export async function deleteAssignment(assignmentId: string, submissionId: string) {
  try {
    const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { getCurrentUser } = await import('./auth');
    const user: any = await getCurrentUser();
    
    if (!user) return { success: false, error: "Unauthorized" };

    let reviewerName = 'Reviewer';
    try {
        const { data: profile } = await supabaseAdmin.from('profiles').select('full_name').eq('id', user.id).single();
        if (profile && profile.full_name) {
            reviewerName = profile.full_name;
        } else {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const uDoc = await db.collection('users').doc(user.id).get();
            if (uDoc.exists && (uDoc.data()?.full_name || uDoc.data()?.name)) {
                reviewerName = uDoc.data()?.full_name || uDoc.data()?.name;
            }
        }
    } catch(e) {}

    // 1. Delete assignment from Supabase
    await supabaseAdmin.from('review_assignments').delete().eq('id', assignmentId);
    
    // Fetch current stage to avoid reverting a published article
    const { data: subData } = await supabaseAdmin.from('submissions').select('stage').eq('id', submissionId).single();
    const isAdvanced = subData?.stage && ['Copyediting', 'Production', 'Published'].includes(subData.stage);

    // 2. Revert submission status if necessary (assuming it goes back to Awaiting Reviewers)
    if (!isAdvanced) {
        await supabaseAdmin.from('submissions').update({ status: 'Awaiting Reviewers' }).eq('id', submissionId);
        await supabaseAdmin.from('submissions').update({ status: 'Awaiting Reviewers' }).eq('submission_id', submissionId);
    }

    // 3. Insert history in Supabase
    await supabaseAdmin.from('submission_history').insert({
        submission_id: submissionId,
        action: `Assignment Deleted`,
        details: 'Review assignment was deleted'
    });

    // Send WA when reviewer deletes (same as reject)
    try {
        const editorPhone = "+62811665212";
        const message = `Maaf, Reviewer atas nama ${reviewerName} menyatakan BELUM BERSEDIA meninjau naskah #${submissionId}. Mohon tugaskan reviewer lain.`;
        const { sendWa } = await import('@/utils/sendWa');
        await sendWa(editorPhone, message);
    } catch (waErr) {
        console.error("Failed to send WA on reviewer deletion", waErr);
    }

    // 4. Update Firestore as fallback
    try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        const batch = db.batch();

        const assignRef = db.collection('review_assignments').doc(assignmentId);
        batch.delete(assignRef);

        if (!isAdvanced) {
            const subRef = db.collection('submissions').doc(submissionId);
            batch.update(subRef, { status: 'Awaiting Reviewers', updated_at: new Date() });
        }

        const histRef = db.collection('submission_history').doc();
        batch.set(histRef, {
            submission_id: submissionId,
            action: `Assignment Deleted`,
            details: 'Review assignment was deleted',
            created_at: new Date()
        });

        await batch.commit();
    } catch (fbErr) {
        console.error("Firestore delete failed", fbErr);
    }

    const { revalidatePath } = require('next/cache');
    revalidatePath('/dashboard/reviews/assignments');
    
    return { success: true };
  } catch (e: any) {
    console.error("Delete assignment error", e);
    return { success: false, error: e.message };
  }
}

function unhexUuid(uuidStr: string): string {
  if (!uuidStr) return "";
  try {
    const hex = uuidStr.replace(/-/g, "").replace(/0+$/, "");
    if (/^[0-9a-f]+$/i.test(hex) && hex.length >= 8) {
      return Buffer.from(hex, "hex").toString("utf8");
    }
  } catch(e) {}
  return uuidStr;
}

export async function getAssignmentDetails(assignmentId: string) {
  try {
    const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let assignData: any = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId);

    // 1. Fetch assignment from Supabase
    try {
      let q = supabaseAdmin.from('review_assignments').select('*, submissions(*, journals(name))');
      if (isUuid) {
        q = q.or(`id.eq.${assignmentId},submission_id.eq.${assignmentId}`);
      } else {
        q = q.eq('id', assignmentId);
      }
      const { data } = await q.maybeSingle();
      if (data) assignData = data;
    } catch(e) {}

    // Fallback query if maybeSingle didn't match
    if (!assignData) {
      try {
        const { data: list } = await supabaseAdmin
          .from('review_assignments')
          .select('*, submissions(*, journals(name))')
          .limit(50);
        if (list) {
          assignData = list.find((a: any) => String(a.id) === String(assignmentId) || String(a.submission_id) === String(assignmentId));
        }
      } catch(e) {}
    }

    if (!assignData) return null;

    // 2. Fetch submission data if missing or incomplete
    let sub = assignData.submissions;
    const targetSubId = assignData.submission_id || assignmentId;

    if (!sub || !sub.title) {
      if (targetSubId) {
        try {
          const isSubUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetSubId);
          let subQ = supabaseAdmin.from('submissions').select('*, journals(name)');
          if (isSubUuid) {
            subQ = subQ.or(`id.eq.${targetSubId},submission_id.eq.${targetSubId}`);
          } else {
            subQ = subQ.eq('id', targetSubId);
          }
          const { data: subData } = await subQ.maybeSingle();
          if (subData) sub = subData;
        } catch(e) {}
      }
    }

    // Helper to obtain a working URL from Supabase Storage
    const getStorageUrl = async (pathStr: string): Promise<string> => {
      if (!pathStr) return "";
      if (pathStr.startsWith('http://') || pathStr.startsWith('https://')) return pathStr;
      try {
        const { data: signedData } = await supabaseAdmin.storage.from('manuscripts').createSignedUrl(pathStr, 86400);
        if (signedData?.signedUrl) return signedData.signedUrl;
      } catch(e) {}
      try {
        const { data: pubData } = supabaseAdmin.storage.from('manuscripts').getPublicUrl(pathStr);
        if (pubData?.publicUrl) return pubData.publicUrl;
      } catch(e) {}
      return "";
    };

    // 3. Resolve file URL 100% via Supabase (DB + Storage)
    const rawCandidateIds = [
      targetSubId,
      sub?.submission_id,
      sub?.id,
      assignData?.submission_id,
      assignData?.id,
      assignmentId
    ].filter(Boolean);

    const candidateIds: string[] = [];
    for (const cid of rawCandidateIds) {
      const strCid = String(cid);
      candidateIds.push(strCid);
      const unhexed = unhexUuid(strCid);
      if (unhexed && unhexed !== strCid) {
        candidateIds.push(unhexed);
      }
    }

    const uniqueCandidates = Array.from(new Set(candidateIds));

    let rawFileUrl = sub?.file_url || sub?.manuscript_url || sub?.anonymous_file_url || assignData?.file_url || assignData?.manuscript_url || "";
    let fileUrl = await getStorageUrl(rawFileUrl);

    // If still empty, search Supabase Storage bucket 'manuscripts' directly using candidates and prefix matching
    if (!fileUrl && uniqueCandidates.length > 0) {
      try {
        const { data: rootList } = await supabaseAdmin.storage.from('manuscripts').list();
        if (rootList && rootList.length > 0) {
          for (const cand of uniqueCandidates) {
            const matchedFolderObj = rootList.find((item: any) => 
              item.name === cand || 
              item.name.startsWith(cand) || 
              cand.startsWith(item.name)
            );

            if (matchedFolderObj) {
              const { data: folderFiles } = await supabaseAdmin.storage.from('manuscripts').list(matchedFolderObj.name);
              if (folderFiles && folderFiles.length > 0) {
                const selectedFile = folderFiles.find((f: any) => f.name.toLowerCase().includes('anonymous')) || folderFiles[0];
                fileUrl = await getStorageUrl(`${matchedFolderObj.name}/${selectedFile.name}`);
                if (fileUrl) break;
              }
            }
          }
        }
      } catch(e) {}
    }

    const dueDateStr = assignData.deadline
      ? new Date(assignData.deadline?.toDate ? assignData.deadline.toDate() : assignData.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : "Batas Waktu Standar (14 Hari)";

    const result = {
      id: String(assignData.id || assignmentId),
      submission_id: String(targetSubId || ""),
      title: String(sub?.title || assignData.title || "Judul Naskah Tidak Ditemukan"),
      abstract: String(sub?.abstract || assignData.abstract || "Tidak ada abstrak tersedia."),
      type: String(sub?.type || "Articles"),
      journal: String(sub?.journals?.name || assignData.journal_name || "JURNAL"),
      dueDate: String(dueDateStr),
      round: Number(assignData.round || 1),
      file_url: String(fileUrl),
      status: String(assignData.status || 'pending'),
      recommendation: String(assignData.recommendation || ''),
      comments_for_author: String(assignData.comments_for_author || ''),
      comments_for_editor: String(assignData.comments_for_editor || ''),
      correction_notes: String(assignData.correction_notes || '')
    };

    return JSON.parse(JSON.stringify(result));
  } catch (e) {
    console.error("Error in getAssignmentDetails:", e);
    return null;
  }
}

export async function submitReviewResults(
    assignmentId: string, 
    submissionId: string, 
    results: {
        commentsForEditor: string;
        commentsForAuthor: string;
        correctionNotes: string;
        recommendation: string;
    }
) {
  try {
    const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { getCurrentUser } = await import('./auth');
    const user: any = await getCurrentUser();
    
    if (!user) return { success: false, error: "Unauthorized" };

    // Supabase updates
    try {
        const isAssignUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId);
        let assignQ = supabaseAdmin.from('review_assignments').update({ 
            status: 'completed',
            recommendation: results.recommendation,
            comments_for_editor: results.commentsForEditor,
            comments_for_author: results.commentsForAuthor,
            correction_notes: results.correctionNotes,
            updated_at: new Date()
        });
        if (isAssignUuid) {
            assignQ = assignQ.or(`id.eq.${assignmentId},submission_id.eq.${assignmentId}`);
        } else {
            assignQ = assignQ.eq('id', assignmentId);
        }
        await assignQ;
        
        // Fetch current stage to avoid reverting a published article
        const { data: subData } = await supabaseAdmin.from('submissions').select('stage').eq('id', submissionId).maybeSingle();
        const isAdvanced = subData?.stage && ['Copyediting', 'Production', 'Published'].includes(subData.stage);

        // Update submission status in Supabase only if not advanced
        if (!isAdvanced) {
            await supabaseAdmin.from('submissions').update({ status: 'Reviewed', updated_at: new Date() }).eq('id', submissionId);
            const unhexedSubId = unhexUuid(submissionId);
            if (unhexedSubId && unhexedSubId !== submissionId) {
                await supabaseAdmin.from('submissions').update({ status: 'Reviewed', updated_at: new Date() }).eq('id', unhexedSubId);
            }
        }

        // Insert history in Supabase
        await supabaseAdmin.from('submission_history').insert({
            submission_id: submissionId,
            action: `Review Completed`,
            details: `Reviewer submitted recommendation: ${results.recommendation}`
        });
    } catch (supaErr) {
        console.warn("Supabase update failed during review submission:", supaErr);
    }

    // 4. Update Firestore as fallback
    try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        const batch = db.batch();

        const assignRef = db.collection('review_assignments').doc(assignmentId);
        batch.update(assignRef, { 
            status: 'completed',
            recommendation: results.recommendation,
            comments_for_editor: results.commentsForEditor,
            comments_for_author: results.commentsForAuthor,
            correction_notes: results.correctionNotes,
            updated_at: new Date()
        });

        // Fetch current stage to avoid reverting a published article (re-fetch inside catch block just in case)
        const { data: subDataFb } = await supabaseAdmin.from('submissions').select('stage').eq('id', submissionId).single();
        const isAdvancedFb = subDataFb?.stage && ['Copyediting', 'Production', 'Published'].includes(subDataFb.stage);

        if (!isAdvancedFb) {
            const subRef = db.collection('submissions').doc(submissionId);
            batch.update(subRef, { status: 'Reviewed', updated_at: new Date() });
        }

        const histRef = db.collection('submission_history').doc();
        batch.set(histRef, {
            submission_id: submissionId,
            action: `Review Completed`,
            details: `Reviewer submitted recommendation: ${results.recommendation}`,
            created_at: new Date()
        });

        await batch.commit();
    } catch (fbErr) {
        console.error("Firestore update failed", fbErr);
    }

    const { revalidatePath } = require('next/cache');
    revalidatePath('/dashboard/reviews/my-reviews');
    revalidatePath('/dashboard/editor/review-results');
    
    return { success: true };
  } catch (e: any) {
    console.error("Submit review error", e);
    return { success: false, error: e.message };
  }
}

export async function submitReviewResultsWithFile(formData: FormData) {
  try {
    const assignmentId = formData.get('assignmentId') as string;
    const submissionId = formData.get('submissionId') as string;
    const recommendation = formData.get('recommendation') as string;
    const commentsForEditor = formData.get('commentsForEditor') as string || "";
    const commentsForAuthor = formData.get('commentsForAuthor') as string || "";
    const correctionNotes = formData.get('correctionNotes') as string || "";
    const file = formData.get('file') as File | null;

    const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { getCurrentUser } = await import('./auth');
    const user: any = await getCurrentUser();
    
    if (!user) return { success: false, error: "Unauthorized" };

    let annotatedFileUrl = "";

    // Upload file if provided
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload to Supabase Storage
      const fileName = `annotated_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${submissionId}/${fileName}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('manuscripts')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        });
        
      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
      } else {
        const { data: signedData } = await supabaseAdmin.storage
          .from('manuscripts')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
          
        if (signedData?.signedUrl) {
            annotatedFileUrl = signedData.signedUrl;
        }
      }
    }

    // 1. Update assignment status payload
    const updatePayload: any = { 
        status: 'completed',
        recommendation: recommendation,
        comments_for_editor: commentsForEditor,
        comments_for_author: commentsForAuthor,
        correction_notes: correctionNotes,
        updated_at: new Date()
    };
    
    if (annotatedFileUrl) {
        updatePayload.annotated_file_url = annotatedFileUrl;
    }

    // Fetch current stage to avoid reverting a published article
    let isAdvanced = false;
    try {
        const { data: subDataStage } = await supabaseAdmin.from('submissions').select('stage').eq('id', submissionId).maybeSingle();
        isAdvanced = !!(subDataStage?.stage && ['Copyediting', 'Production', 'Published'].includes(subDataStage.stage));
    } catch (_) {}

    // Supabase updates
    try {
        const isAssignUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId);
        let assignQ = supabaseAdmin.from('review_assignments').update(updatePayload);
        if (isAssignUuid) {
            assignQ = assignQ.or(`id.eq.${assignmentId},submission_id.eq.${assignmentId}`);
        } else {
            assignQ = assignQ.eq('id', assignmentId);
        }
        await assignQ;

        // Update submission status in Supabase only if not advanced
        if (!isAdvanced) {
            await supabaseAdmin.from('submissions').update({ status: 'Reviewed', updated_at: new Date() }).eq('id', submissionId);
            const unhexedSubId = unhexUuid(submissionId);
            if (unhexedSubId && unhexedSubId !== submissionId) {
                await supabaseAdmin.from('submissions').update({ status: 'Reviewed', updated_at: new Date() }).eq('id', unhexedSubId);
            }
        }

        // Insert history in Supabase
        await supabaseAdmin.from('submission_history').insert({
            submission_id: submissionId,
            action: `Review Completed`,
            details: `Reviewer submitted recommendation: ${recommendation}` + (annotatedFileUrl ? ' (with annotated file)' : '')
        });
    } catch (supaErr) {
        console.warn("Supabase update failed during review file submission:", supaErr);
    }

    // 4. Update Firestore as fallback
    try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        const batch = db.batch();

        const assignRef = db.collection('review_assignments').doc(assignmentId);
        batch.update(assignRef, updatePayload);

        if (!isAdvanced) {
            const subRef = db.collection('submissions').doc(submissionId);
            batch.update(subRef, { status: 'Reviewed', updated_at: new Date() });
        }

        const histRef = db.collection('submission_history').doc();
        batch.set(histRef, {
            submission_id: submissionId,
            action: `Review Completed`,
            details: `Reviewer submitted recommendation: ${recommendation}` + (annotatedFileUrl ? ' (with annotated file)' : ''),
            created_at: new Date()
        });

        await batch.commit();
    } catch (fbErr) {
        console.error("Firestore update failed", fbErr);
    }

    revalidatePath('/dashboard/reviews/my-reviews');
    revalidatePath('/dashboard/editor/review-results');
    
    return { success: true };
  } catch (e: any) {
    console.error("Submit review with file error", e);
    return { success: false, error: e.message };
  }
}
