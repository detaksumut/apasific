"use server";

import { createClient } from "@/utils/supabase/server";

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
      return { success: false, error: "Authentication required" };
    }

    const journalId = formData.get('journalId') as string;
    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const file = formData.get('file') as File;
    const anonymousFile = formData.get('anonymousFile') as File | null;
    const supportingFile = formData.get('supportingFile') as File | null;

    if (!title || !file) {
      return { success: false, error: "Title and file are required." };
    }

    // Ensure the profile exists to prevent foreign key constraint errors
    if (user && user.id) {
      try {
         const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email || 'Author',
            role: 'author'
         }, { onConflict: 'id' });
         
         if (profileError) {
            console.error("Profile Upsert Error:", profileError);
            return { success: false, error: `PROFILE_UPSERT_ERROR: ${profileError.message} | UserID: ${user.id} | isMock: ${!user.email}` };
         }
      } catch (profileCatchError: any) {
         console.error("Failed to ensure profile exists:", profileCatchError);
         return { success: false, error: `PROFILE_CATCH_ERROR: ${profileCatchError.message} | UserID: ${user.id}` };
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

    if (submissionError) throw submissionError;

    // --- DUAL-DATABASE WRITE: Mirror to Firebase Firestore ---
    try {
       const { getFirestore } = require('@/utils/firebase/db');
       const db = getFirestore();
       const admin = require('@/utils/firebase/server').getFirebaseAdmin();
       
       await db.collection('submissions').doc(submission.submission_id).set({
           journal_id: validJournalId,
           author_id: userId,
           title,
           abstract,
           status: 'Awaiting Reviewers',
           created_at: admin.firestore.FieldValue.serverTimestamp(),
           updated_at: admin.firestore.FieldValue.serverTimestamp()
       });
       console.log("Dual-write to Firestore successful for:", submission.submission_id);
    } catch (fbErr) {
       console.error("Dual-write to Firestore failed:", fbErr);
       // Do not throw here so Supabase submission is not interrupted
    }

    // Helper function to upload and log files
    const uploadAndLogFile = async (f: File, prefix: string) => {
      const fileExt = f.name.split('.').pop();
      const filePath = `${submission.submission_id}/${Date.now()}_${prefix}.${fileExt}`;
      
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from('manuscripts')
        .upload(filePath, buffer, {
          contentType: f.type
        });

      if (uploadError) throw uploadError;

      const { error: fileError } = await supabaseAdmin
        .from('submission_files')
        .insert({
          submission_id: submission.submission_id,
          uploader_id: userId,
          file_stage: 'submission',
          file_name: `${prefix}_${f.name}`,
          file_type: f.type,
          file_size: f.size,
          storage_path: filePath
        });

      if (fileError) throw fileError;
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
      await supabaseAdmin.from('submissions').delete().eq('submission_id', submission.submission_id);
      throw uploadError;
    }

    // 3. Trigger WhatsApp Notification
    let richPayload: any = {};
    try {
      richPayload = JSON.parse(abstract);
    } catch(e) {}

    const userPhone = user?.user_metadata?.phone;
    if (userPhone) {
      try {
        const publicationType = richPayload.publicationType || '';
        const isSinta = publicationType.startsWith('sinta_');
        const pkgName = isSinta ? 'Publikasi Jurnal SINTA' : 'Jurnal Internasional';
        
        const waMessage = isSinta 
          ? `Terima kasih telah melakukan submit artikel Anda melalui sistem Asia Index & Metric (Association Asia Pacific Academicians).

Detail Pengajuan:

Judul Artikel:
${title}

Target Indeksasi & Metrik:
${pkgName}

Fasilitas yang diperoleh:

✓ Review dan standardisasi naskah
✓ Penyuntingan berbasis metrik sitasi
✓ Penyesuaian template jurnal mitra
✓ Pendampingan submit artikel
✓ Pendampingan revisi reviewer
✓ Monitoring proses publikasi hingga terbit
✓ Depositori dan jejak digital Zenodo
✓ Integrasi metrik OpenAIRE (Europe Base Index)
✓ Integrasi profil ORCID Author
✓ Indeksasi Google Scholar
✓ Pendampingan metadata publikasi

Khusus paket publikasi SINTA, Asia Index & Metric akan melakukan pemantauan dan pengelolaan agar artikel Anda memenuhi standar kualitas publikasi pada jurnal yang terindeks SINTA sesuai kategori yang dipilih.

Catatan:
Proses evaluasi dan publikasi dilaksanakan sesuai standar kualitas ilmiah dan kebijakan jurnal mitra.

Asia Index & Metric
Association Asia Pacific Academicians
https://apasific.org`
          : `Terima kasih telah melakukan submit artikel Anda melalui sistem Asia Index & Metric (Association Asia Pacific Academicians).

Detail Pengajuan:

Judul Artikel:
${title}

Target Indeksasi & Metrik:
Jurnal Internasional

Fasilitas yang diperoleh:
✓ Penerbitan di Jurnal Internasional mitra
✓ Indeksasi Google Scholar & Zenodo
✓ Integrasi profil ORCID
✓ Indeksasi metadata OpenAIRE (Europe Base Index)
✓ Penerbitan sertifikat dan jejak DOI

Asia Index & Metric
Association Asia Pacific Academicians
https://apasific.org`;

        const { sendWa } = await import('@/utils/sendWa');
        await sendWa(userPhone, waMessage);
      } catch (waError) {
        console.error("WhatsApp notification failed:", waError);
      }
    }

    return { success: true, submissionId: submission.submission_id };
  } catch (error: any) {
    console.error("Submission error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
