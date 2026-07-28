"use server";

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

        // 2. Try Supabase fallback via author_id on submissions
        if (!phoneNum) {
            try {
                const { data: subFull } = await supabaseAdmin
                    .from('submissions')
                    .select('phone, author_id, profiles:author_id(phone)')
                    .eq('id', submissionId)
                    .single();
                phoneNum = (subFull as any)?.phone ||
                    (Array.isArray((subFull as any)?.profiles) ? (subFull as any).profiles[0]?.phone : (subFull as any)?.profiles?.phone);
            } catch (e) {}
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


    const { revalidatePath } = require('next/cache');
    revalidatePath('/dashboard/reviews');
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

    // Fallback query if maybeSingle didn't match — filter by current user to prevent data leakage
    if (!assignData) {
      try {
        const { getCurrentUser } = await import('./auth');
        const currentUser: any = await getCurrentUser();
        const currentUserId = currentUser?.id;
        const currentUserEmail = currentUser?.email?.toLowerCase();

        let fallbackQ = supabaseAdmin
          .from('review_assignments')
          .select('*, submissions(*, journals(name))');

        // Apply user filter on fallback to avoid loading other reviewers' assignments
        if (currentUserId && currentUserEmail) {
          fallbackQ = fallbackQ.or(`reviewer_id.eq.${currentUserId},reviewer_email.eq.${currentUserEmail}`);
        } else if (currentUserId) {
          fallbackQ = fallbackQ.eq('reviewer_id', currentUserId);
        } else if (currentUserEmail) {
          fallbackQ = fallbackQ.eq('reviewer_email', currentUserEmail);
        }

        const { data: list } = await fallbackQ.limit(100);
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

    // 3. Resolve file URL via StorageFileResolver
    const { resolveFile } = await import('@/utils/storageResolver');
    let rawFileUrl = sub?.file_url || sub?.manuscript_url || sub?.anonymous_file_url || assignData?.file_url || assignData?.manuscript_url || "";
    let fileUrl = "";
    let file_metadata: any = { exists: false, status: 'METADATA_MISSING' };
    
    if (rawFileUrl || targetSubId) {
      const metadata = await resolveFile({
          bucket: 'manuscripts',
          path: rawFileUrl || '',
          entityId: targetSubId,
          entityType: 'submission'
      });
      file_metadata = metadata;
      if (metadata.signedUrl) {
          fileUrl = metadata.signedUrl;
      }
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
      file_metadata: file_metadata,
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
        const updatePayload: any = {
            status: 'completed',
            recommendation: results.recommendation,
            comments_for_editor: results.commentsForEditor,
            comments_for_author: results.commentsForAuthor,
            correction_notes: results.correctionNotes,
            completed_at: new Date(),
            updated_at: new Date()
        };

        if (isAssignUuid) {
            await supabaseAdmin.from('review_assignments').update(updatePayload).or(`id.eq.${assignmentId},submission_id.eq.${assignmentId}`);
        } else {
            await supabaseAdmin.from('review_assignments').update(updatePayload).eq('id', assignmentId);
        }
        if (submissionId) {
            await supabaseAdmin.from('review_assignments').update(updatePayload).eq('submission_id', submissionId);
        }
        if (user.email) {
            await supabaseAdmin.from('review_assignments').update(updatePayload).eq('reviewer_email', user.email.toLowerCase()).eq('submission_id', submissionId);
        }
        
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


    const { revalidatePath } = require('next/cache');
    revalidatePath('/dashboard/reviews/my-reviews');
    revalidatePath('/dashboard/editor/review-results');
    
    return { success: true };
  } catch (e: any) {
    console.error("Submit review error", e);
    return { success: false, error: e.message };
  }
}

export async function autoRepairSubmissionFile(submissionId: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const { revalidatePath } = require('next/cache');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get the submission to check created_at
    const { data: sub } = await supabaseAdmin.from('submissions').select('created_at').eq('id', submissionId).single();
    if (!sub) return { success: false, error: 'Submission not found' };

    const subDate = new Date(sub.created_at).getTime();

    // List files in undefined folder
    const { data: files, error } = await supabaseAdmin.storage.from('manuscripts').list('undefined', { limit: 100 });
    if (error || !files || files.length === 0) return { success: false, error: 'No orphaned files found' };

    const anonFiles = files.filter((f: any) => f.name.toLowerCase().includes('anonymous'));
    
    let bestMatch = null;
    let minDiff = 5 * 60 * 1000; // 5 minutes max difference
    
    for (const file of anonFiles) {
        if (!file.created_at) continue;
        const fileDate = new Date(file.created_at).getTime();
        const diff = Math.abs(subDate - fileDate);
        if (diff < minDiff) {
            minDiff = diff;
            bestMatch = file;
        }
    }
    
    if (!bestMatch) {
      return { success: false, error: 'No matching file found within the timeframe' };
    }

    const rawPath = `undefined/${bestMatch.name}`;
    await supabaseAdmin.from('submissions').update({
        file_url: rawPath
    }).eq('id', submissionId);
    
    revalidatePath(`/dashboard/reviews/${submissionId}`);
    return { success: true, url: rawPath };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}export async function submitReviewResultsWithFile(formData: FormData) {
  try {
    const assignmentId = formData.get('assignmentId') as string;
    const recommendation = formData.get('recommendation') as string;
    const commentsForEditor = formData.get('commentsForEditor') as string || "";
    const commentsForAuthor = formData.get('commentsForAuthor') as string || "";
    const correctionNotes = formData.get('correctionNotes') as string || "";
    const file = formData.get('file') as File | null;

    if (!assignmentId) return { success: false, error: "Assignment ID tidak ditemukan" };

    const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { getCurrentUser } = await import('./auth');
    const user: any = await getCurrentUser();
    
    if (!user) return { success: false, error: "Unauthorized" };

    // 1. Fetch assignment details for validation and submissionId lookup
    const { data: assignment, error: assignErr } = await supabaseAdmin
      .from('review_assignments')
      .select('submission_id, reviewer_id, reviewer_email, status')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignErr || !assignment) {
      return { success: false, error: "Penugasan review tidak ditemukan" };
    }

    // 2. Validate reviewer ownership
    const isOwner = 
      String(assignment.reviewer_id).toLowerCase() === String(user.id).toLowerCase() ||
      (assignment.reviewer_email && user.email && String(assignment.reviewer_email).toLowerCase() === String(user.email).toLowerCase());

    if (!isOwner) {
      return { success: false, error: "Anda tidak berwenang mengirimkan review untuk penugasan ini" };
    }

    // 3. Validate assignment status
    if (assignment.status === 'completed') {
      return { success: false, error: "Penugasan review ini sudah selesai disubmit sebelumnya" };
    }

    const realSubmissionId = assignment.submission_id;
    if (!realSubmissionId) {
      return { success: false, error: "ID Naskah tidak valid pada penugasan ini" };
    }

    // 4. Validate submission existence and current stage
    const { data: submission, error: subErr } = await supabaseAdmin
      .from('submissions')
      .select('id, stage')
      .eq('id', realSubmissionId)
      .maybeSingle();

    if (subErr || !submission) {
      return { success: false, error: "Naskah yang direview tidak ditemukan di database" };
    }

    const isAdvanced = !!(submission.stage && ['Copyediting', 'Production', 'Published'].includes(submission.stage));
    let annotatedFileUrl = "";

    // Upload file if provided
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileName = `annotated_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${realSubmissionId}/${fileName}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('manuscripts')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        });
        
      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        return { success: false, error: "Gagal mengunggah file anotasi: " + uploadError.message };
      }

      const { data: signedData } = await supabaseAdmin.storage
        .from('manuscripts')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);
        
      if (signedData?.signedUrl) {
        annotatedFileUrl = signedData.signedUrl;
      }
    }

    // Build Supabase payload — these columns must exist in Supabase review_assignments table
    const supabasePayload: any = { 
        status: 'completed',
        recommendation: recommendation,
        comments_for_editor: commentsForEditor,
        comments_for_author: commentsForAuthor,
        correction_notes: correctionNotes,
        completed_at: new Date().toISOString(),
        updated_at: new Date()
    };

    if (annotatedFileUrl) {
        supabasePayload.annotated_file_url = annotatedFileUrl;
    }

    // Execute Supabase Updates
    const { error: supaUpdateErr } = await supabaseAdmin
      .from('review_assignments')
      .update(supabasePayload)
      .eq('id', assignmentId);

    if (supaUpdateErr) {
        console.error("Supabase review_assignments update error:", supaUpdateErr);
        return { success: false, error: "Gagal memperbarui status penugasan di database" };
    }

    if (!isAdvanced) {
        const { error: subUpdateErr } = await supabaseAdmin
          .from('submissions')
          .update({ status: 'Reviewed', updated_at: new Date() })
          .eq('id', realSubmissionId);

        if (subUpdateErr) {
            console.error("Supabase submissions update error:", subUpdateErr);
            return { success: false, error: "Gagal memperbarui status naskah di database" };
        }
    }

    // Insert history
    await supabaseAdmin.from('submission_history').insert({
        submission_id: realSubmissionId,
        action: `Review Completed`,
        details: `Reviewer submitted recommendation: ${recommendation}` + (annotatedFileUrl ? ' (with annotated file)' : '')
    });


    const { revalidatePath } = require('next/cache');
    revalidatePath('/dashboard/reviews/my-reviews');
    revalidatePath('/dashboard/editor/review-results');
    
    return { success: true };
  } catch (e: any) {
    console.error("Submit review with file error", e);
    return { success: false, error: e.message };
  }
}

// Reviewer uploads final annotated file after author revision and notifies Editor
export async function submitFinalAnnotatedFile(formData: FormData) {
  try {
    const assignmentId = formData.get('assignmentId') as string;
    const file = formData.get('file') as File | null;
    const notes = formData.get('notes') as string || "";

    if (!assignmentId) return { success: false, error: "Data tidak lengkap" };
    if (!file || file.size === 0) return { success: false, error: "File tidak ditemukan" };

    const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Fetch assignment details for validation and submissionId lookup
    const { data: assignment, error: assignErr } = await supabaseAdmin
      .from('review_assignments')
      .select('submission_id')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignErr || !assignment || !assignment.submission_id) {
      return { success: false, error: "Penugasan review tidak ditemukan" };
    }

    const realSubmissionId = assignment.submission_id;

    // 2. Upload file to Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `final_review_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${realSubmissionId}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('manuscripts')
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) return { success: false, error: uploadError.message };

    const { data: signedData } = await supabaseAdmin.storage
      .from('manuscripts')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);

    const finalFileUrl = signedData?.signedUrl || "";

    // 3. Save to review_assignment in Supabase
    const { error: supaErr } = await supabaseAdmin.from('review_assignments').update({
      final_review_file_url: finalFileUrl,
      final_review_notes: notes,
      final_review_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', assignmentId);

    // 4. Fetch submission title and reviewer name
    const { data: assignmentData } = await supabaseAdmin
      .from('review_assignments')
      .select('*, submissions(title), reviewer:profiles!review_assignments_reviewer_id_fkey(full_name)')
      .eq('id', assignmentId)
      .single();

    const submissionTitle = assignmentData?.submissions?.title || "Naskah";
    const reviewerName = assignmentData?.reviewer?.full_name || "Reviewer";

    // 5. Log history
    await supabaseAdmin.from('submission_history').insert({
      submission_id: realSubmissionId,
      action: 'Final Review File Submitted',
      details: `Reviewer ${reviewerName} telah mengumpulkan file review final setelah memeriksa revisi penulis.`
    });

    // 6. Send WA notification to all editors
    try {
      const { data: editors } = await supabaseAdmin
        .from('profiles')
        .select('full_name, phone')
        .eq('role', 'editor')
        .not('phone', 'is', null);

      if (editors && editors.length > 0) {
        const { sendWa } = await import('@/utils/sendWa');
        const message = `📋 *Notifikasi Review Final*\n\nHalo Tim Editor,\n\nReviewer *${reviewerName}* telah menyelesaikan pemeriksaan file revisi dan mengumpulkan *File Review Final* untuk naskah:\n\n"${submissionTitle}"\n\n${notes ? `*Catatan Reviewer:*\n${notes}\n\n` : ''}Silakan cek file review final tersebut di dashboard Editor → Menu *Revisi Author*.\n\nTerima kasih,\n- Sistem APASIFIC`;
        for (const editor of editors) {
          if (editor.phone) await sendWa(editor.phone, message, finalFileUrl);
        }
      }
    } catch (waErr) {
      console.warn("WA notification to editor failed:", waErr);
    }

    const { revalidatePath } = require('next/cache');
    revalidatePath('/dashboard/editor/revisions');
    revalidatePath('/dashboard/reviews/revisions');

    return { success: true };
  } catch (e: any) {
    console.error("Submit final annotated file error", e);
    return { success: false, error: e.message };
  }
}
