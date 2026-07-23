import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: profiles } = await supabase.from('profiles').select('*').eq('email', 'kadsumut@gmail.com');
  const { data: candidates } = await supabase.from('certification_candidates').select('*').eq('email', 'kadsumut@gmail.com');
  
  const { data: users } = await supabase.auth.admin.listUsers();
  const authUser = users?.users?.find(u => u.email === 'kadsumut@gmail.com');

  const { data: supabaseCerts } = await supabase.from('certificates').select('*');

  let firestoreCerts = [];
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const snap = await db.collection('certificates').get();
    firestoreCerts = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (e: any) {
    firestoreCerts = [{ error: e.message }];
  }

  return NextResponse.json({
    profiles,
    candidates,
    supabaseCerts,
    firestoreCerts,
    authUser: authUser ? { id: authUser.id, email: authUser.email } : null
  });
}
