import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const docId = 'sub_1784062294881_r2jx1m4';

    // Reset naskah ke stage Review / Copyediting agar Editor bisa mengatur ulang
    await db.collection('submissions').doc(docId).update({
      stage: 'Review',
      status: 'Under Review',
      updated_at: new Date(),
    });

    // Also reset in Supabase if exists
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await supabase.from('submissions').update({ stage: 'Review', status: 'Under Review' }).eq('id', docId);
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ success: true, message: `Reset submission ${docId} to Review / Under Review` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
