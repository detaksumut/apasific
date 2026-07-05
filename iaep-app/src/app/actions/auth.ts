"use server";

import { createClient } from "@/utils/supabase/server";

export async function signUpUser(formData: any) {
  const supabase = await createClient();

  // 1. Sign Up user to Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
      }
    }
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  if (authData.user) {
    // 2. Insert/Update additional data into public.profiles table
    // Note: If you have a trigger on auth.users, the row might already exist.
    // So we use upsert or update. Let's use update based on ID.
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.fullName,
        phone_number: formData.phone,
        country: formData.country,
        university: formData.university,
        role: formData.role,
        orcid_id: formData.orcid,
        google_scholar_id: formData.googleScholar,
        scopus_id: formData.scopus,
        wos_id: formData.wos,
        sinta_id: formData.sinta,
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Wait, if the trigger hasn't finished, update might fail or affect 0 rows.
      // Upsert is safer just in case the trigger failed or isn't enabled.
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          phone_number: formData.phone,
          country: formData.country,
          university: formData.university,
          role: formData.role,
          orcid_id: formData.orcid,
          google_scholar_id: formData.googleScholar,
          scopus_id: formData.scopus,
          wos_id: formData.wos,
          sinta_id: formData.sinta,
        });
        
      if (upsertError) {
        return { success: false, error: "Account created but failed to save profile data: " + upsertError.message };
      }
    }
  }

  return { success: true };
}
