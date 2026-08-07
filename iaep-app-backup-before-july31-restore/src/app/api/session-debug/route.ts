import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getFirestore } from "@/utils/firebase/db";
import { getCurrentUser } from "@/app/actions/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ loggedIn: false });
    }

    const supabase = await createClient();
    const db = getFirestore();

    // Find profile in Supabase by ID or Email
    let sbProfile = null;
    if (user.email) {
      const { data } = await supabase.from('profiles').select('*').eq('email', user.email).single();
      sbProfile = data;
    }

    // Find profile in Firestore by ID or Email
    let fbProfile = null;
    const profilesSnapshot = await db.collection('profiles').get();
    const fbProfiles = profilesSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() as any }));
    fbProfile = fbProfiles.find((p: any) => p.id === user.id || (user.email && p.email?.toLowerCase() === user.email.toLowerCase()));

    return NextResponse.json({
      loggedIn: true,
      currentUserSession: user,
      supabaseProfile: sbProfile,
      firestoreProfile: fbProfile
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
