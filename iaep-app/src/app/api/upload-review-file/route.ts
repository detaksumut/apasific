import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const submissionId = formData.get('submissionId') as string;

    if (!file || !submissionId) {
      return NextResponse.json({ error: 'Missing file or submissionId' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fileName = `${submissionId}_review_${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `${submissionId}/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('manuscripts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Return the raw path so Signed URLs can be generated dynamically
    return NextResponse.json({ success: true, url: filePath });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
