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

    // Fetch published_at to sync with Firebase
    let publishedAtVal: string | null = null;
    try {
      const { data: subData } = await supabaseAdmin.from('submissions').select('published_at').eq('id', submissionId).single();
      if (subData?.published_at) {
        publishedAtVal = subData.published_at;
      }
    } catch (e) {
      console.warn("Failed to fetch published_at for sync", e);
    }

    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const docRef = db.collection('submissions').doc(submissionId);
      const doc = await docRef.get();
      const fbPayload: Record<string, any> = { cover_file_url: coverUrl, updated_at: new Date() };
      if (publishedAtVal) {
        fbPayload.published_at = publishedAtVal;
      }
      
      if (!doc.exists) {
         await docRef.set({ ...fbPayload, created_at: new Date() });
      } else {
         await docRef.update(fbPayload);
      }
    } catch(fbErr) {
      console.warn("Firestore cover_file_url update failed", fbErr);
    }

    return NextResponse.json({ success: true, url: coverUrl });
  } catch (error: any) {
    console.error("Upload Cover API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
