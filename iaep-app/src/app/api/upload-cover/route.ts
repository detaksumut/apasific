import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const submissionId = formData.get('submissionId') as string;

    if (!file || !submissionId) {
      return NextResponse.json({ error: 'Missing file or submission ID' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `${submissionId}/${Date.now()}_cover.${fileExt}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('manuscripts')
      .upload(filePath, buffer, { contentType: file.type || 'image/png' });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 2. Get Public or Signed URL
    const { data: signedData } = await supabaseAdmin.storage
      .from('manuscripts')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

    const coverUrl = signedData?.signedUrl || "";

    // 3. Update databases
    // Attempt Supabase, but ignore error if column doesn't exist
    await supabaseAdmin.from('submissions').update({ cover_file_url: coverUrl }).eq('id', submissionId);

    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      await db.collection('submissions').doc(submissionId).update({ cover_file_url: coverUrl });
    } catch(fbErr) {
      console.warn("Firestore cover_file_url update failed", fbErr);
    }

    return NextResponse.json({ success: true, url: coverUrl });
  } catch (error: any) {
    console.error("Upload Cover API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
