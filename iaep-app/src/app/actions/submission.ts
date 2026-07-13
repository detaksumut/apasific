"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitManuscript(formData: FormData) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "Authentication required" };
    }

    const journalId = parseInt(formData.get('journalId') as string) || 1;
    const title = formData.get('title') as string;
    const abstract = formData.get('abstract') as string;
    const file = formData.get('file') as File;
    const anonymousFile = formData.get('anonymousFile') as File | null;
    const supportingFile = formData.get('supportingFile') as File | null;

    if (!title || !file) {
      return { success: false, error: "Title and file are required." };
    }

    // 1. Insert into Submissions table
    // Note: The 'abstract' field now receives a rich JSON payload containing authors, keywords, etc.
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        journal_id: journalId,
        submitter_id: user.id,
        title,
        abstract,
        status: 'queued'
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // Helper function to upload and log files
    const uploadAndLogFile = async (f: File, prefix: string) => {
      const fileExt = f.name.split('.').pop();
      const filePath = `${submission.submission_id}/${Date.now()}_${prefix}.${fileExt}`;
      
      const arrayBuffer = await f.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('manuscripts')
        .upload(filePath, buffer, {
          contentType: f.type
        });

      if (uploadError) throw uploadError;

      const { error: fileError } = await supabase
        .from('submission_files')
        .insert({
          submission_id: submission.submission_id,
          uploader_id: user.id,
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
      await supabase.from('submissions').delete().eq('submission_id', submission.submission_id);
      throw uploadError;
    }

    // 3. Cross-sync to RJRAKP
    try {
      // Use RJRAKP variables if they exist, otherwise fallback to the main shared database
      const rjrakpUrl = process.env.RJRAKP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const rjrakpKey = process.env.RJRAKP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (rjrakpUrl && rjrakpKey) {
        const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
        const rjrakpSupabase = createSupabaseClient(rjrakpUrl, rjrakpKey);
        
        let richPayload: any = {};
        try {
          richPayload = JSON.parse(abstract);
        } catch(e) {}

        const { data: rjrakpArticle, error: rjrakpError } = await rjrakpSupabase
          .from('articles')
          .insert({
            title: title,
            abstract: richPayload.abstract_en || abstract,
            keywords: richPayload.keywords || '',
            status: 'submitted'
          })
          .select()
          .single();
          
        if (rjrakpError) {
          console.error("Failed to sync to RJRAKP DB:", rjrakpError);
        } else if (richPayload.authors && richPayload.authors.length > 0) {
           const authorsToInsert = richPayload.authors.map((a: any, idx: number) => ({
             article_id: rjrakpArticle.id,
             full_name: a.full_name,
             email: a.email,
             affiliation: a.affiliation,
             country: a.country,
             orcid: a.orcid,
             is_corresponding: idx === 0,
             author_order: idx + 1
           }));
           await rjrakpSupabase.from('article_authors').insert(authorsToInsert);
        }

        // Trigger WhatsApp Notification
        const userPhone = user.user_metadata?.phone;
        if (userPhone) {
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
        }
      }
    } catch (crossSyncError) {
      console.error("Cross-sync to RJRAKP failed:", crossSyncError);
    }

    return { success: true, submissionId: submission.submission_id };
  } catch (error: any) {
    console.error("Submission error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
