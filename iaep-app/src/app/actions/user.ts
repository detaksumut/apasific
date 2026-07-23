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

  return { full_name: "User", role: "author" }; // Default fallback
}

export async function updateProfile(userId: string, profileData: any) {
  const supabase = await createClient();
  
  // 1. Update di database ASIA (Supabase utama)
  const { error: aspfError } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId);

  if (aspfError) {
    console.error("Gagal update profil ASIA:", aspfError);
    return { success: false, error: aspfError.message };
  }

  // 2. Cross-Sync pembaruan ke RJRAKP
  try {
    const rjrakpUrl = process.env.RJRAKP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rjrakpKey = process.env.RJRAKP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (rjrakpUrl && rjrakpKey) {
      const { createClient: createRjrakpClient } = require('@supabase/supabase-js');
      const rjrakpSupabase = createRjrakpClient(rjrakpUrl, rjrakpKey);
      
      // Update data di RJRAKP (users)
      await rjrakpSupabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          institution: profileData.affiliation || profileData.institution,
          orcid_id: profileData.orcid,
          scopus_id: profileData.scopus_id,
        })
        .eq('id', userId);
        
      // Jika reviewer, update juga di reviewer_profiles RJRAKP
      if (profileData.role?.toLowerCase() === 'reviewer') {
        await rjrakpSupabase
          .from('reviewer_profiles')
          .update({
            affiliation: profileData.affiliation || profileData.institution,
            orcid_id: profileData.orcid,
            scopus_id: profileData.scopus_id,
            google_scholar: profileData.google_scholar,
            wos_id: profileData.wos_id,
            sinta_id: profileData.sinta_id
          })
          .eq('user_id', userId);
      }
    }
  } catch (syncError) {
    console.error("Gagal sinkronisasi update profil ke RJRAKP:", syncError);
  }

  return { success: true };
}
