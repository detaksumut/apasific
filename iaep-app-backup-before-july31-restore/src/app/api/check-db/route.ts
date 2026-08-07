import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aroasmlrlpjbjokvxlgo.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg'
    );

    const { data: assignments } = await supabase.from('review_assignments').select('*').order('created_at', { ascending: false }).limit(5);
    const { data: profile } = await supabase.from('profiles').select('*').eq('email', 'ekocmayndarto@gmail.com');
    const { data: userAuth } = await supabase.auth.admin.listUsers();
    const ekoAuth = userAuth?.users?.find(u => u.email === 'ekocmayndarto@gmail.com');

    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const fbAssignmentsSnap = await db.collection('review_assignments').orderBy('assigned_at', 'desc').limit(5).get();
    const fbAssignments = fbAssignmentsSnap.docs.map((d: any) => ({id: d.id, ...d.data()}));

    return NextResponse.json({
      eko_auth_id: ekoAuth ? ekoAuth.id : null,
      eko_profile_id: profile && profile.length > 0 ? profile[0].id : null,
      supabase_assignments: assignments,
      firestore_assignments: fbAssignments
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack });
  }
}
