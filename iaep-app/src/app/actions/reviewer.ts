"use server";

import { createClient } from "@/utils/supabase/server";

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

    // 1. Update assignment status in Supabase
    await supabaseAdmin.from('review_assignments').update(updatePayload).eq('id', assignmentId);
    
    // 2. Update submission status in Supabase
    await supabaseAdmin.from('submissions').update({ status: newSubmissionStatus }).eq('id', submissionId);
    await supabaseAdmin.from('submissions').update({ status: newSubmissionStatus }).eq('submission_id', submissionId);

    // 3. Insert history in Supabase
    await supabaseAdmin.from('submission_history').insert({
        submission_id: submissionId,
        action: `Assignment ${decision}`,
        details: logDetails
    });

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
        
        if (phoneNum) {
            const message = `Naskah anda mulai di review`;
            const { sendWa } = await import('@/utils/sendWa');
            await sendWa(phoneNum, message);
        } else {
            console.warn("Could not find phone number for WA notification to author.");
        }
      } catch (waErr) {
        console.error("Failed to send WA on reviewer acceptance", waErr);
      }
    } else if (decision === 'rejected') {
      try {
        // Send to Editor's phone number
        const editorPhone = "+62811665212";
        const message = `Maaf, saya masih sibuk`;
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

        const subRef = db.collection('submissions').doc(submissionId);
        batch.update(subRef, { status: newSubmissionStatus, updated_at: new Date() });

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

    // 1. Delete assignment from Supabase
    await supabaseAdmin.from('review_assignments').delete().eq('id', assignmentId);
    
    // 2. Revert submission status if necessary (assuming it goes back to Awaiting Reviewers)
    await supabaseAdmin.from('submissions').update({ status: 'Awaiting Reviewers' }).eq('id', submissionId);
    await supabaseAdmin.from('submissions').update({ status: 'Awaiting Reviewers' }).eq('submission_id', submissionId);

    // 3. Insert history in Supabase
    await supabaseAdmin.from('submission_history').insert({
        submission_id: submissionId,
        action: `Assignment Deleted`,
        details: 'Review assignment was deleted'
    });

    // Send WA when reviewer deletes (same as reject)
    try {
        const editorPhone = "+62811665212";
        const message = `Maaf, saya masih sibuk`;
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

        const subRef = db.collection('submissions').doc(submissionId);
        batch.update(subRef, { status: 'Awaiting Reviewers', updated_at: new Date() });

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

export async function getAssignmentDetails(assignmentId: string) {
  try {
    const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Try Supabase first
    const { data: assignment, error } = await supabaseAdmin
        .from("review_assignments")
        .select("*, submissions(*, journals(name))")
        .eq("id", assignmentId)
        .single();

    if (assignment && assignment.submissions && !error) {
        const submissionId = assignment.submissions.id;
        
        // Find file in Supabase storage since it might not be in the database column
        let fileUrl = assignment.submissions.file_url || "";
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

        // Compute deadline: stored deadline or accepted_at + 3 days or created_at + 3 days
        let dueDateStr = 'Tidak ditentukan';
        if (assignment.deadline) {
          const d = new Date(assignment.deadline);
          if (!isNaN(d.getTime())) dueDateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } else if (assignment.accepted_at) {
          const d = new Date(assignment.accepted_at);
          d.setDate(d.getDate() + 3);
          if (!isNaN(d.getTime())) dueDateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } else if (assignment.created_at) {
          const d = new Date(assignment.created_at);
          d.setDate(d.getDate() + 3);
          if (!isNaN(d.getTime())) dueDateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        return {
            id: submissionId,
            title: assignment.submissions.title,
            abstract: assignment.submissions.abstract,
            type: assignment.submissions.manuscript_type || "Articles",
            journal: assignment.submissions.journals?.name || "Journal",
            dueDate: dueDateStr,
            round: 1,
            file_url: fileUrl
        };
    }

    // Fallback to Firestore
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const fbDoc = await db.collection('review_assignments').doc(assignmentId).get();
    
    if (fbDoc.exists) {
        const fbData = fbDoc.data();
        if (fbData && fbData.submission_id) {
            const subDoc = await db.collection('submissions').doc(fbData.submission_id).get();
            if (subDoc.exists) {
                const subData = subDoc.data() || {};
                const submissionId = subDoc.id;

                // Find file in Supabase storage for Firestore fallback
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

                // Compute deadline for Firestore path
                let dueDateStr = 'Tidak ditentukan';
                if (fbData.deadline) {
                  const d = fbData.deadline.toDate ? fbData.deadline.toDate() : new Date(fbData.deadline);
                  if (!isNaN(d.getTime())) dueDateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                } else if (fbData.accepted_at) {
                  const d = fbData.accepted_at.toDate ? fbData.accepted_at.toDate() : new Date(fbData.accepted_at);
                  d.setDate(d.getDate() + 3);
                  if (!isNaN(d.getTime())) dueDateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                } else if (fbData.created_at) {
                  const d = fbData.created_at.toDate ? fbData.created_at.toDate() : new Date(fbData.created_at);
                  d.setDate(d.getDate() + 3);
                  if (!isNaN(d.getTime())) dueDateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                }

                return {
                    id: submissionId,
                    title: subData.title || "Untitled",
                    abstract: subData.abstract || "No abstract",
                    type: subData.manuscript_type || "Articles",
                    journal: subData.journals?.name || "Journal",
                    dueDate: dueDateStr,
                    round: 1,
                    file_url: fileUrl
                };
            }
        }
    }
    
    return null;
  } catch (e) {
    console.error("Error fetching assignment details", e);
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

    // Supabase updates (wrapped in try/catch to not block Firestore)
    try {
        // 1. Update assignment status in Supabase
        await supabaseAdmin.from('review_assignments').update({ 
            status: 'completed',
            recommendation: results.recommendation,
            comments_for_editor: results.commentsForEditor,
            comments_for_author: results.commentsForAuthor,
            correction_notes: results.correctionNotes,
            updated_at: new Date()
        }).eq('id', assignmentId);
        
        // 2. Update submission status in Supabase
        await supabaseAdmin.from('submissions').update({ status: 'Reviewed' }).eq('id', submissionId);
        await supabaseAdmin.from('submissions').update({ status: 'Reviewed' }).eq('submission_id', submissionId);

        // 3. Insert history in Supabase
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

        const subRef = db.collection('submissions').doc(submissionId);
        batch.update(subRef, { status: 'Reviewed', updated_at: new Date() });

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

    // Supabase updates (wrapped in try/catch)
    try {
        // 1. Update assignment status in Supabase
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

        await supabaseAdmin.from('review_assignments').update(updatePayload).eq('id', assignmentId);
        
        // 2. Update submission status in Supabase
        await supabaseAdmin.from('submissions').update({ status: 'Reviewed' }).eq('id', submissionId);
        await supabaseAdmin.from('submissions').update({ status: 'Reviewed' }).eq('submission_id', submissionId);

        // 3. Insert history in Supabase
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

        const subRef = db.collection('submissions').doc(submissionId);
        batch.update(subRef, { status: 'Reviewed', updated_at: new Date() });

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

    const { revalidatePath } = require('next/cache');
    revalidatePath('/dashboard/reviews/my-reviews');
    revalidatePath('/dashboard/editor/review-results');
    
    return { success: true };
  } catch (e: any) {
    console.error("Submit review with file error", e);
    return { success: false, error: e.message };
  }
}
