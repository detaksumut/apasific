import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const journalName = formData.get('journalName') as string;
    const type = formData.get('type') as string; // 'current' or 'past'

    if (!file || !journalName) {
      return NextResponse.json({ error: 'Missing file or journalName' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const safeName = journalName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const fileName = `${safeName}_${type}_${Date.now()}.${file.name.split('.').pop()}`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('manuscripts')
      .upload(`sks/${fileName}`, file);

    if (uploadError) throw uploadError;

    // Use a long-lived signed URL (10 years) to ensure it works even if the bucket is private
    const { data: signedData } = await supabaseAdmin.storage
      .from('manuscripts')
      .createSignedUrl(`sks/${fileName}`, 60 * 60 * 24 * 365 * 10);

    const skUrl = signedData?.signedUrl || "";

    return NextResponse.json({ success: true, url: skUrl });
  } catch (error: any) {
    console.error("Upload SK error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
