"use server";

export async function updateSubmissionStatus(submissionId: string, newStatus: string) {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  let success = false;
  
  // 1. Update Supabase
  try {
     const { error } = await supabaseAdmin.from('submissions').update({ status: newStatus }).eq('submission_id', submissionId);
     if (!error) success = true;
     
     // also try with 'id' if 'submission_id' fails, depending on schema
     await supabaseAdmin.from('submissions').update({ status: newStatus }).eq('id', submissionId);
  } catch (e) {
     console.error("Supabase update failed:", e);
  }

  // 2. Update Firestore (Dual-Database)
  try {
     const { getFirestore } = require('@/utils/firebase/db');
     const db = getFirestore();
     await db.collection('submissions').doc(submissionId).update({
         status: newStatus,
         updated_at: new Date()
     });
     success = true;
  } catch (e) {
     console.error("Firestore update failed:", e);
  }

  if (success) {
       const { revalidatePath } = require('next/cache');
       revalidatePath('/dashboard/editor/incoming');
       revalidatePath('/dashboard/editor/assign-reviewer');
       return { success: true };
  }
  return { success: false, error: "Failed to update status in both databases." };
}

export async function deleteSubmission(submissionId: string) {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  let success = false;
  
  // 1. Delete from Supabase
  try {
     const { error } = await supabaseAdmin.from('submissions').delete().eq('submission_id', submissionId);
     if (!error) success = true;
     
     await supabaseAdmin.from('submissions').delete().eq('id', submissionId);
  } catch (e) {
     console.error("Supabase delete failed:", e);
  }

  // 2. Delete from Firestore
  try {
     const { getFirestore } = require('@/utils/firebase/db');
     const db = getFirestore();
     await db.collection('submissions').doc(submissionId).delete();
     success = true;
  } catch (e) {
     console.error("Firestore delete failed:", e);
  }

  if (success) {
      const { revalidatePath } = require('next/cache');
      revalidatePath('/dashboard/editor/incoming');
      revalidatePath('/dashboard/editor/assign-reviewer');
      return { success: true };
  }
  return { success: false, error: "Failed to delete from both databases." };
}

export async function sendReminderWa(submissionId: string, manualPhone?: string) {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    let submission = null;
    try {
      const { data } = await supabaseAdmin
        .from('submissions')
        .select('*, profiles:author_id(full_name, phone)')
        .eq('submission_id', submissionId)
        .single();
      submission = data;
    } catch(e) {}

    if (!submission) {
       // fallback check by 'id'
       try {
         const { data: submission2 } = await supabaseAdmin
           .from('submissions')
           .select('*, profiles:author_id(full_name, phone)')
           .eq('id', submissionId)
           .single();
         submission = submission2;
       } catch(e) {}
    }

    let phone = "";
    let authorName = "Penulis";
    let title = "";

    if (submission) {
        const profile = Array.isArray(submission.profiles) ? submission.profiles[0] : submission.profiles;
        phone = profile?.phone || submission.phone || submission.author_phone || "";
        authorName = profile?.full_name || "Penulis";
        title = submission.title || "";
    } else {
        // Fallback to Firestore
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            const doc = await db.collection('submissions').doc(submissionId).get();
            if (doc.exists) {
                const fbData = doc.data();
                title = fbData?.title || "";
                phone = fbData?.phone || fbData?.author_phone || "";
                if (fbData?.author_id) {
                    const profileDoc = await db.collection('users').doc(fbData.author_id).get();
                    if (profileDoc.exists) {
                        phone = profileDoc.data()?.phone || phone;
                        authorName = profileDoc.data()?.full_name || "Penulis";
                    }
                }
            }
        } catch (fbErr) {
            console.error("Firestore fallback in sendReminderWa failed", fbErr);
        }
    }

    if (manualPhone) {
        phone = manualPhone;
    }

    if (!phone) {
       return { success: false, error: "Nomor handphone penulis tidak ditemukan. Pastikan penulis telah mengisi profil dengan lengkap atau naskah memiliki data nomor telepon." };
    }

    const message = `Halo ${authorName},

Pesan dari Tim Editorial Asia Index & Metric (APASIFIC).
Terdapat pembaruan informasi atau hal yang perlu dikonfirmasi terkait naskah Anda yang berjudul:
"${title}"

Silakan login ke sistem APASIFIC untuk mengecek status terbaru.

Terima kasih.
https://apasific.org`;

    const { sendWa } = await import('@/utils/sendWa');
    const waResult = await sendWa(phone, message);

    if (waResult) {
      return { success: true };
    } else {
      return { success: false, error: "Gagal mengirim pesan melalui sistem WA." };
    }
  } catch (e: any) {
    console.error("sendReminderWa error:", e);
    return { success: false, error: e.message || "Terjadi kesalahan saat mengirim pesan WA." };
  }
}

export async function assignReviewerActionFunc(submissionId: string, reviewer: any) {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  let validReviewerId = reviewer.id;
  
  // Normalize UUID if needed (to prevent Postgres UUID constraint errors)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validReviewerId)) {
      const hex = Buffer.from(validReviewerId).toString('hex').padEnd(32, '0').slice(0, 32);
      validReviewerId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
  }

  // Fetch current stage to avoid reverting a published article
  let isAdvanced = false;
  try {
    const { data: subDataStage } = await supabaseAdmin.from('submissions').select('stage').eq('id', submissionId).single();
    isAdvanced = !!(subDataStage?.stage && ['Copyediting', 'Production', 'Published'].includes(subDataStage.stage));
  } catch (_) {}

  try {
    // Ensure reviewer profile exists in Supabase to avoid foreign key violations
    await supabaseAdmin.from('profiles').upsert({
        id: validReviewerId,
        full_name: reviewer.full_name || 'Reviewer',
        role: 'reviewer'
    }, { onConflict: 'id' });

    // Supabase Attempt
    const { data: insertedAssign, error: assignError } = await supabaseAdmin.from('review_assignments').insert({
        submission_id: submissionId,
        reviewer_id: validReviewerId,
        status: 'pending'
    }).select('id').maybeSingle();

    if (!assignError && insertedAssign) {
        if (!isAdvanced) {
            await supabaseAdmin.from('submissions').update({ status: 'Pending Reviewer Approval' }).eq('submission_id', submissionId);
            await supabaseAdmin.from('submissions').update({ status: 'Pending Reviewer Approval' }).eq('id', submissionId);
        }
        await supabaseAdmin.from('submission_history').insert({
            submission_id: submissionId,
            action: 'Reviewer Assigned',
            details: `Assigned to reviewer: ${reviewer.full_name} (Pending Approval)`
        });
    } else {
        console.warn("Supabase assign error:", assignError ? assignError.message : "No data returned");
    }
  } catch (e) {
    console.error("Supabase assign exception:", e);
  }

  // Firestore Attempt (Dual Database Fallback)
  let firestoreSuccess = false;
  try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      
      const { data: currentAssign } = await supabaseAdmin
        .from('review_assignments')
        .select('id')
        .eq('submission_id', submissionId)
        .eq('reviewer_id', validReviewerId)
        .eq('status', 'pending')
        .maybeSingle();

      const docId = currentAssign?.id || "";

      if (docId) {
          const batch = db.batch();
          
          if (!isAdvanced) {
              const subRef = db.collection('submissions').doc(submissionId);
              batch.update(subRef, { status: 'Pending Reviewer Approval', updated_at: new Date() });
          }
          
          const assignRef = db.collection('review_assignments').doc(docId);
          batch.set(assignRef, {
              submission_id: submissionId,
              reviewer_id: reviewer.id, // keep original ID for Firestore
              status: 'pending',
              created_at: new Date(),
              updated_at: new Date()
          });
          
          const histRef = db.collection('submission_history').doc();
          batch.set(histRef, {
              submission_id: submissionId,
              action: 'Reviewer Assigned',
              details: `Assigned to reviewer: ${reviewer.full_name} (Pending Approval)`,
              created_at: new Date()
          });
          
          await batch.commit();
          firestoreSuccess = true;
      }
  } catch (e) {
      console.error("Firestore assign error:", e);
  }

  const { revalidatePath } = require('next/cache');
  revalidatePath('/dashboard/editor/assign-reviewer');
  return { success: true };
}

export async function submitAuthorRevision(submissionId: string, formData: FormData) {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided' };

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Supabase Storage
    const fileName = `revised_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `${submissionId}/${fileName}`;
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('manuscripts')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });
      
    if (uploadError) throw uploadError;

    let revisedFileUrl = "";
    const { data: signedData } = await supabaseAdmin.storage
      .from('manuscripts')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
      
    if (signedData?.signedUrl) {
      revisedFileUrl = signedData.signedUrl;
    }

    // Update Supabase
    // Save revised file to revised_file_url — do NOT overwrite file_url (the original manuscript)
    // so that the reviewer can still compare both versions if needed.
    await supabaseAdmin.from('submissions').update({ 
      revised_file_url: revisedFileUrl,
      status: 'Revision Submitted',
      updated_at: new Date() 
    }).eq('id', submissionId);
    
    await supabaseAdmin.from('submissions').update({ 
      revised_file_url: revisedFileUrl,
      status: 'Revision Submitted',
      updated_at: new Date() 
    }).eq('submission_id', submissionId);

    await supabaseAdmin.from('submission_history').insert({
        submission_id: submissionId,
        action: `Revision Submitted`,
        details: `Author submitted a revised manuscript.`
    });

    // Update Firestore
    try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        const subRef = db.collection('submissions').doc(submissionId);
        await subRef.update({ 
          revised_file_url: revisedFileUrl,
          status: 'Revision Submitted', 
          updated_at: new Date() 
        });
    } catch (e) {
        console.warn("Firestore update revision failed", e);
    }

    // Send WA notification to editors so they know to review and forward the revised file
    try {
        const { data: editors } = await supabaseAdmin
            .from('profiles')
            .select('full_name, phone')
            .eq('role', 'editor')
            .not('phone', 'is', null);

        if (editors && editors.length > 0) {
            const { sendWa } = await import('@/utils/sendWa');
            // Fetch submission title for the message
            let subTitle = submissionId;
            try {
                const { data: subInfo } = await supabaseAdmin
                    .from('submissions').select('title').eq('id', submissionId).single();
                if (subInfo?.title) subTitle = subInfo.title;
            } catch (e) {}

            const message = `📝 *Pemberitahuan Revisi Naskah*\n\nHalo Tim Editor,\n\nPenulis telah mengunggah *File Revisi* untuk naskah:\n\n"${subTitle}"\n\nSilakan buka Dashboard Editor → Menu *Hasil Review* untuk memeriksa file revisi dan meneruskannya ke Reviewer.\n\nTerima kasih,\n- Sistem APASIFIC`;
            for (const editor of editors) {
                if (editor.phone) await sendWa(editor.phone, message);
            }
        }
    } catch (waErr) {
        console.warn("WA notification to editor on revision submit failed:", waErr);
    }

    const { revalidatePath } = require('next/cache');
    revalidatePath(`/dashboard/submissions/${submissionId}`);
    revalidatePath('/dashboard/editor/review-results');
    revalidatePath('/dashboard/editor/submissions');
    
    return { success: true };
  } catch (e: any) {
    console.error("Revision upload error:", e);
    return { success: false, error: e.message };
  }
}

