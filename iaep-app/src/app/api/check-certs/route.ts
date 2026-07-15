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


  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
