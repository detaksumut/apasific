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

    const fileName = `${submissionId}_pasca_review_${Date.now()}.${file.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('manuscripts')
      .upload(`${submissionId}/${fileName}`, file);

    if (uploadError) throw uploadError;

    // Get signed url immediately or just store the path
    const { data: signedData } = await supabaseAdmin.storage
      .from('manuscripts')
      .createSignedUrl(`${submissionId}/${fileName}`, 60 * 60 * 24 * 365); // 1 year

    const revisedUrl = signedData?.signedUrl || "";

    // Update both databases
    await supabaseAdmin.from('submissions').update({ revised_file_url: revisedUrl }).eq('id', submissionId);

    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      await db.collection('submissions').doc(submissionId).update({ revised_file_url: revisedUrl });
    } catch(fbErr) {
      console.warn("Firestore revised_file_url update failed", fbErr);
    }

    return NextResponse.json({ success: true, url: revisedUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
