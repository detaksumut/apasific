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

    if (!title || !file) {
      return { success: false, error: "Title and file are required." };
    }

    // 1. Insert into Submissions table
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

    // 2. Upload file to Storage Bucket
    const fileExt = file.name.split('.').pop();
    const filePath = `${submission.submission_id}/${Date.now()}_manuscript.${fileExt}`;
    
    // Convert File to Buffer for Supabase storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Note: 'manuscripts' bucket must be created in Supabase dashboard
    const { error: uploadError } = await supabase.storage
      .from('manuscripts')
      .upload(filePath, buffer, {
        contentType: file.type
      });

    if (uploadError) {
      // Rollback submission if upload fails
      await supabase.from('submissions').delete().eq('submission_id', submission.submission_id);
      throw uploadError;
    }

    // 3. Insert into submission_files table
    const { error: fileError } = await supabase
      .from('submission_files')
      .insert({
        submission_id: submission.submission_id,
        uploader_id: user.id,
        file_stage: 'submission',
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath
      });

    if (fileError) throw fileError;

    return { success: true, submissionId: submission.submission_id };
  } catch (error: any) {
    console.error("Submission error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
