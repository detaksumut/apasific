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

    return { success: true, submissionId: submission.submission_id };
  } catch (error: any) {
    console.error("Submission error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
