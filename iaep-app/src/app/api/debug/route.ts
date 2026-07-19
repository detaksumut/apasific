import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

  let logs = [];

  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const fbSnap = await db.collection('submissions').get();
    
    logs.push(`Firestore total docs: ${fbSnap.size}`);
    fbSnap.forEach(doc => {
      const d = doc.data();
      logs.push(`FS [${doc.id}]: status="${d.status}", stage="${d.stage}", journal_id="${d.journal_id}"`);
    });
  } catch (e: any) {
    logs.push(`Firestore error: ${e.message}`);
  }

  try {
    const { data } = await supabaseAdmin.from('submissions').select('id, status, journal_id').limit(10);
    logs.push(`Supabase docs: ${data?.length}`);
    data?.forEach(d => {
      logs.push(`SB [${d.id}]: status="${d.status}", journal_id="${d.journal_id}"`);
    });
  } catch(e: any) {
    logs.push(`Supabase error: ${e.message}`);
  }

  return NextResponse.json({ logs });
}
