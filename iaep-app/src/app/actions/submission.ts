"use server";

import { SubmissionLifecycleService } from "@/services/SubmissionLifecycleService";

export async function updateSubmissionStatus(submissionId: string, newStatus: string) {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  let success = false;
  
  // 1. Update Supabase melalui gerbang lifecycle tervalidasi
  // (menulis kolom 'id' + mirror legacy 'submission_id' sekaligus)
  try {
     const transisi = await SubmissionLifecycleService.transitionTo(supabaseAdmin, submissionId, {
         status: newStatus,
         mirrorLegacySubmissionId: true
     });
     if (!transisi.success) {
         console.error("Lifecycle transition failed:", transisi.error);
         return { success: false, error: transisi.error || 'Transisi status ditolak oleh lifecycle service.' };
     }
     success = true;
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

// assignReviewerActionFunc has been removed. Use assignReviewer from editor.ts instead.

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
    const transisiRevisi = await SubmissionLifecycleService.transitionTo(supabaseAdmin, submissionId, {
      status: 'Revision Submitted',
      extraFields: { revised_file_url: revisedFileUrl },
      mirrorLegacySubmissionId: true
    });
    if (!transisiRevisi.success) {
      return { success: false, error: transisiRevisi.error || 'Transisi status revisi ditolak oleh lifecycle service.' };
    }

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

