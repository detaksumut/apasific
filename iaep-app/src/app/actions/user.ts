"use server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getFirebaseAdmin } from "@/utils/firebase/server";
import { getFirestore } from "@/utils/firebase/db";

export async function getCurrentUserRole() {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();
  let userId = user?.id;
  
  if (!user) {
    const cookieStore = await cookies();
    const fbToken = cookieStore.get('firebase_session')?.value;
    if (fbToken) {
        try {
            const admin = getFirebaseAdmin();
            const payloadBase64 = fbToken.split('.')[1];
            const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
            const fbUser = await admin.auth().getUser(payload.uid);
            userId = fbUser.uid;
        } catch (e) {
            return null;
        }
    }
  }

  if (!userId) return null;

  try {
      const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', userId).single();
      if (profile) return profile;
  } catch(e) {}

  // Fallback to Firestore
  try {
      const db = getFirestore();
      const profileDoc = await db.collection('profiles').doc(userId).get();
      if (profileDoc.exists) return profileDoc.data();
  } catch(fbErr) {}

  return { full_name: "User", role: "author" }; // Default fallback
}
