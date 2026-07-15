import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { getCurrentUser } = await import('@/app/actions/auth');
    const currentUser = await getCurrentUser();

    const db = getFirestore();
    const fbProfilesSnap = await db.collection('profiles').get();
    const fbProfiles = fbProfilesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const list = fbProfiles.map((p: any) => ({ id: p.id, email: p.email, name: p.full_name }));

    return NextResponse.json({
      success: true,
      allFirestoreProfiles: list
    });

    // 3. Seed Supabase certificate (using supabaseAdmin to bypass policies)
    const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: existingSbCerts } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('reference_id', 'sub_1784062294881_r2jx1m4');

    if (!existingSbCerts || existingSbCerts.length === 0) {
      const { error: sbErr } = await supabaseAdmin.from('certificates').insert({
        user_id: authorId,
        type: 'author_publication',
        reference_id: 'sub_1784062294881_r2jx1m4',
        title: `Sertifikat Publikasi Naskah: ${title}`,
        journal: journalName,
        edition: 'Vol. 2 No. 1 (2026)',
        created_at: new Date()
      });
      if (sbErr) console.error("Supabase insert error", sbErr);
    }
    const dbCerts = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      success: true,
      existingFirestoreCertificates: dbCerts,
      existingSupabaseCertificates: existingSbCerts,
      submission: { id: subDoc.id, authorId, title, journalName }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
