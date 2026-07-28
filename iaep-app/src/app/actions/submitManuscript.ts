"use server";

export async function submitManuscript(formData: FormData) {
  const { createClient } = await import("@/utils/supabase/server");
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
                 if (!admin) throw new Error('Firebase admin not available');
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

    let finalAbstract = abstract || "";

    // Ensure the profile exists to prevent foreign key constraint errors
    let finalSubmissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (userId) {
      try {
         const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            id: userId,
            full_name: user?.user_metadata?.full_name || user?.email || 'Author',
            role: 'author'
         }, { onConflict: 'id' });
         
         if (profileError) {
            console.warn("Profile Upsert Error:", profileError.message);
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

    try {
        const { data: submission, error: submissionError } = await supabaseAdmin
          .from('submissions')
          .insert({
            journal_id: validJournalId,
            author_id: userId,
            title,
            abstract: finalAbstract,
            status: 'queued',
            phone: formPhone || null
          })
          .select()
          .single();

        if (submissionError) {
           throw submissionError;
        }

        if (submission) {
           finalSubmissionId = submission.id || submission.submission_id || finalSubmissionId;
        }
    } catch(supaErr: any) {
        console.error("Supabase interaction failed:", supaErr.message);
        throw new Error("Failed to save submission to Supabase: " + supaErr.message);
    }



    // Helper function to upload and log files
    const uploadAndLogFile = async (f: File, prefix: string, dbField: string, updateFallbackFileUrl: boolean = false) => {
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

      // Save the raw storage path to appropriate db column so signed URLs can be generated later
      try {
        if (filePath) {
          const updateData: any = { [dbField]: filePath };
          if (updateFallbackFileUrl) {
            updateData.file_url = filePath;
            updateData.manuscript_url = filePath; // legacy
          }
          
          await supabaseAdmin.from('submissions').update(updateData).eq('id', finalSubmissionId);
        }
      } catch(e) {
          console.error("Failed to update submission with file path:", e);
      }
    };

    // 2. Upload Title Page
    try {
      await uploadAndLogFile(file, 'title_page', 'original_file_url', true);
      
      // Upload optional files
      if (anonymousFile) {
        await uploadAndLogFile(anonymousFile, 'anonymous', 'anonymous_file_url', false);
      }
      if (supportingFile) {
        await uploadAndLogFile(supportingFile, 'supporting', 'supporting_file_url', false);
      }
    } catch (uploadError: any) {
      // Rollback submission if any upload fails
      await supabaseAdmin.from('submissions').delete().eq('id', finalSubmissionId);
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
        
        const waMessage = `Terimakasih telah Submit naskah di ASIA.\nJudul: ${title}\n\nTim Redaksi kami akan segera memproses naskah Anda.`;
        const logoUrl = "https://apasific.org/logo-apasific.png";

        const { sendWa } = await import('@/utils/sendWa');
        await sendWa(userPhone, waMessage, logoUrl);
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
