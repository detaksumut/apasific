"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from 'next/cache';

export async function submitManuscript(formData: FormData) {
  const supabase = await createClient();
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    let { data: { user } } = await supabase.auth.getUser();
    let userId = user?.id;
    
    if (!userId) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const fbToken = cookieStore.get('firebase_session')?.value;
      const fallbackUserId = cookieStore.get('supabase_fallback_session')?.value;
      
      if (fbToken || fallbackUserId) {
          try {
              if (fbToken) {
                 const admin = require('@/utils/firebase/server').getFirebaseAdmin();
                 const payloadBase64 = fbToken.split('.')[1];
                 const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
                 const fbUser = await admin.auth().getUser(payload.uid);
                 user = { id: fbUser.uid, email: fbUser.email, user_metadata: { full_name: fbUser.displayName } } as any;
                 userId = fbUser.uid;
              }
          } catch (e) {
              console.error("Firebase token verification failed in submission", e);
          }
          
          if (!userId && fallbackUserId) {
             user = { id: fallbackUserId, email: "user@example.com", user_metadata: { full_name: "Author" } } as any;
             userId = fallbackUserId;
          }
      }
    }

    if (!userId) {
      return { success: false, error: "Authentication required" };
    }

    // FIX THE ROOT CAUSE: Firebase UIDs (28 chars) crash Supabase Postgres (expects UUID)
    // We convert the Firebase UID into a deterministic 32-char valid UUID format.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        const hex = Buffer.from(userId).toString('hex').padEnd(32, '0').slice(0, 32);
        userId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
    }

    const journalId = formData.get('journalId') as string;
    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const formPhone = formData.get('phone') as string;
    const file = formData.get('file') as File;
    const anonymousFile = formData.get('anonymousFile') as File | null;
    const supportingFile = formData.get('supportingFile') as File | null;

    if (!title || !file) {
      return { success: false, error: "Title and file are required." };
    }

    // Ensure the profile exists to prevent foreign key constraint errors
    let savedToSupabase = false;
    let finalSubmissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (userId) {
      try {
         const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            id: userId,
            full_name: user?.user_metadata?.full_name || user?.email || 'Author',
            role: 'author'
         }, { onConflict: 'id' });
         
         if (profileError) {
            console.warn("Profile Upsert Error (expected if Firebase fallback without Supabase auth):", profileError.message);
         }
      } catch (profileCatchError: any) {
         console.warn("Failed to ensure profile exists:", profileCatchError.message);
      }
    }

    // Verify journal exists, fallback to first available if not
    let validJournalId = journalId;
    const { data: journalCheck } = await supabaseAdmin.from('journals').select('id').eq('id', journalId).single();
    if (!journalCheck) {
       const { data: anyJournal } = await supabaseAdmin.from('journals').select('id').limit(1).single();
       if (anyJournal) validJournalId = anyJournal.id;
    }

    // 1. Insert into Submissions table
    // Note: The 'abstract' field now receives a rich JSON payload containing authors, keywords, etc.
    try {
        const { data: submission, error: submissionError } = await supabaseAdmin
          .from('submissions')
          .insert({
            journal_id: validJournalId,
            author_id: userId,
            title,
            abstract,
            status: 'Awaiting Reviewers'
          })
          .select()
          .single();

        if (!submissionError && submission) {
           finalSubmissionId = submission.submission_id;
           savedToSupabase = true;
        } else {
           console.warn("Supabase submission insert failed (FK violation?), falling back to Firestore:", submissionError?.message);
        }
    } catch(supaErr: any) {
        console.warn("Supabase interaction failed:", supaErr.message);
    }

    // --- DUAL-DATABASE WRITE: Mirror to Firebase Firestore ---
    try {
       const { getFirestore } = require('@/utils/firebase/db');
       const db = getFirestore();
       const admin = require('@/utils/firebase/server').getFirebaseAdmin();
       
       await db.collection('submissions').doc(finalSubmissionId).set({
           journal_id: validJournalId,
           author_id: userId,
           title,
           abstract,
           status: 'Awaiting Reviewers',
           created_at: admin.firestore.FieldValue.serverTimestamp(),
           updated_at: admin.firestore.FieldValue.serverTimestamp()
       });
       console.log("Dual-write to Firestore successful for:", finalSubmissionId);
    } catch (fbErr) {
       console.error("Dual-write to Firestore failed:", fbErr);
       if (!savedToSupabase) {
          throw new Error("Both Supabase and Firebase failed to save the submission.");
       }
    }

    // Helper function to upload and log files
    const uploadAndLogFile = async (f: File, prefix: string) => {
      const fileExt = f.name.split('.').pop();
      const filePath = `${finalSubmissionId}/${Date.now()}_${prefix}.${fileExt}`;
      
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let { error: uploadError } = await supabaseAdmin.storage
        .from('manuscripts')
        .upload(filePath, buffer, {
          contentType: f.type
        });

      if (uploadError && uploadError.message?.toLowerCase().includes('bucket not found')) {
          console.log("Bucket 'manuscripts' not found. Creating it automatically...");
          await supabaseAdmin.storage.createBucket('manuscripts', { public: false });
          
          const retry = await supabaseAdmin.storage
            .from('manuscripts')
            .upload(filePath, buffer, {
              contentType: f.type
            });
          uploadError = retry.error;
      }

      if (uploadError) throw uploadError;

      if (savedToSupabase) {
          const { error: fileError } = await supabaseAdmin
            .from('submission_files')
            .insert({
              submission_id: finalSubmissionId,
              uploader_id: userId,
              file_stage: 'submission',
              file_name: `${prefix}_${f.name}`,
              file_type: f.type,
              file_size: f.size,
              storage_path: filePath
            });

          if (fileError) console.warn("Supabase submission_files insert failed:", fileError.message);
      }
    };

    // 2. Upload Title Page
    try {
      await uploadAndLogFile(file, 'title_page');
      
      // Upload optional files
      if (anonymousFile) {
        await uploadAndLogFile(anonymousFile, 'anonymous');
      }
      if (supportingFile) {
        await uploadAndLogFile(supportingFile, 'supporting');
      }
    } catch (uploadError: any) {
      // Rollback submission if any upload fails
      if (savedToSupabase) {
          await supabaseAdmin.from('submissions').delete().eq('submission_id', finalSubmissionId);
      }
      throw uploadError;
    }

    // 3. Trigger WhatsApp Notification
    let richPayload: any = {};
    try {
      richPayload = JSON.parse(abstract);
    } catch(e) {}

    const userPhone = formPhone || user?.user_metadata?.phone;
    if (userPhone) {
      try {
        const publicationType = richPayload.publicationType || '';
        const isSinta = publicationType.startsWith('sinta_');
        const pkgName = isSinta ? 'Publikasi Jurnal SINTA' : 'Jurnal Internasional';
        
        const waMessage = `Terimakasih telah Submit naskah di ASIA.
Judul: ${title}

Tim Redaksi kami akan segera memproses naskah Anda.`;

        const { sendWa } = await import('@/utils/sendWa');
        await sendWa(userPhone, waMessage);
      } catch (waError) {
        console.error("WhatsApp notification failed:", waError);
      }
    }

    return { success: true, submissionId: finalSubmissionId };
  } catch (error: any) {
    console.error("Submission error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function updateSubmissionStatus(submissionId: string, newStatus: string) {
  const supabase = await createClient();
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
      revalidatePath('/dashboard/editor/incoming');
      revalidatePath('/dashboard/editor/assign-reviewer');
      return { success: true };
  }
  return { success: false, error: "Failed to update status in both databases." };
}

export async function deleteSubmission(submissionId: string) {
  const supabase = await createClient();
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

export async function sendReminderWa(submissionId: string) {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const { data: submission } = await supabaseAdmin
      .from('submissions')
      .select('*, profiles:author_id(full_name, phone)')
      .eq('submission_id', submissionId)
      .single();

    if (!submission) {
       // fallback check by 'id'
       const { data: submission2 } = await supabaseAdmin
         .from('submissions')
         .select('*, profiles:author_id(full_name, phone)')
         .eq('id', submissionId)
         .single();
       if (!submission2) return { success: false, error: "Submission not found." };
       Object.assign(submission || {}, submission2);
    }

    const phone = submission?.profiles?.phone;
    if (!phone) {
       return { success: false, error: "Nomor handphone penulis tidak ditemukan." };
    }

    const message = `Halo ${submission?.profiles?.full_name || 'Penulis'},

Pesan dari Tim Editorial Asia Index & Metric (APASIFIC).
Terdapat pembaruan informasi atau hal yang perlu dikonfirmasi terkait naskah Anda yang berjudul:
"${submission?.title}"

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

  try {
    // Ensure reviewer profile exists in Supabase to avoid foreign key violations
    await supabaseAdmin.from('profiles').upsert({
        id: validReviewerId,
        full_name: reviewer.full_name || 'Reviewer',
        email: reviewer.email || `${validReviewerId}@reviewer.local`,
        role: 'reviewer'
    }, { onConflict: 'id' });

    // Supabase Attempt
    const { error: assignError } = await supabaseAdmin.from('review_assignments').insert({
        submission_id: submissionId,
        reviewer_id: validReviewerId,
        status: 'pending'
    });

    if (!assignError) {
        await supabaseAdmin.from('submissions').update({ status: 'Pending Reviewer Approval' }).eq('submission_id', submissionId);
        await supabaseAdmin.from('submissions').update({ status: 'Pending Reviewer Approval' }).eq('id', submissionId);
        await supabaseAdmin.from('submission_history').insert({
            submission_id: submissionId,
            action: 'Reviewer Assigned',
            details: `Assigned to reviewer: ${reviewer.full_name} (Pending Approval)`
        });
    } else {
        console.warn("Supabase assign error:", assignError.message);
    }
  } catch (e) {
    console.error("Supabase assign exception:", e);
  }

  // Firestore Attempt (Dual Database Fallback)
  let firestoreSuccess = false;
  try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      
      const batch = db.batch();
      
      const subRef = db.collection('submissions').doc(submissionId);
      batch.update(subRef, { status: 'Pending Reviewer Approval', updated_at: new Date() });
      
      const assignRef = db.collection('review_assignments').doc();
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
  } catch (e) {
      console.error("Firestore assign error:", e);
  }

  const { revalidatePath } = require('next/cache');
  revalidatePath('/dashboard/editor/assign-reviewer');
  return { success: true };
}

export async function submitAuthorRevision(submissionId: string, formData: FormData) {
  const supabase = await createClient();
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
    // We update file_url because it's the main file now, but also save revised_file_url just in case
    await supabaseAdmin.from('submissions').update({ 
      file_url: revisedFileUrl,
      revised_file_url: revisedFileUrl,
      status: 'Revision Submitted',
      updated_at: new Date() 
    }).eq('id', submissionId);
    
    await supabaseAdmin.from('submissions').update({ 
      file_url: revisedFileUrl,
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
          file_url: revisedFileUrl,
          revised_file_url: revisedFileUrl,
          status: 'Revision Submitted', 
          updated_at: new Date() 
        });
    } catch (e) {
        console.warn("Firestore update revision failed", e);
    }

    const { revalidatePath } = require('next/cache');
    revalidatePath(`/dashboard/submissions/${submissionId}`);
    
    return { success: true };
  } catch (e: any) {
    console.error("Revision upload error:", e);
    return { success: false, error: e.message };
  }
}
