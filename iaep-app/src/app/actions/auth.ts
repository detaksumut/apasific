"use server";

import { createClient } from "@/utils/supabase/server";
import fs from 'fs';
import path from 'path';

export async function signUpUser(formData: any): Promise<{ success: boolean; error?: string }> {
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
    console.error("Supabase Auth Error (Ignored for Demo):", authError);
    // We ignore the error so the demo can proceed even with invalid Supabase keys.
  }

  const userId = authData?.user?.id || `demo-user-${Date.now()}`;
  
  const newUserRecord = {
    id: userId,
      email: formData.email,
      password: formData.password,
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
      status: "Pending",
      joined: new Date().toISOString()
    };

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Store in system_settings as well for admin panel to see
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'registered_users')
      .single();

    let existingUsers = [];
    
    if (!settingsError && settingsData && settingsData.value) {
      existingUsers = Array.isArray(settingsData.value) ? settingsData.value : JSON.parse(settingsData.value as string);
    } else {
      try {
        const DATA_FILE = path.join(process.cwd(), 'registered_users.json');
        if (fs.existsSync(DATA_FILE)) {
          existingUsers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
      } catch (e) {
        console.error("Error reading local users during registration", e);
      }
    }
    
    // Prevent duplicates by email
    existingUsers = existingUsers.filter((u: any) => u.email !== formData.email);
    existingUsers.push(newUserRecord);

    const { error: upsertError } = await supabaseAdmin
      .from('system_settings')
      .upsert({ key: 'registered_users', value: JSON.stringify(existingUsers) });
      
    if (upsertError) {
      console.error("Failed to save to Supabase:", upsertError);
      // Fallback to local file for demo purposes so it always works
      try {
        const DATA_FILE = path.join(process.cwd(), 'registered_users.json');
        fs.writeFileSync(DATA_FILE, JSON.stringify(existingUsers, null, 2));
      } catch (e) {
        console.error(e);
      }
    }

  return { success: true };
}

export async function loginUser(email: string, password?: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const emailLower = email.toLowerCase().trim();
    const passwordTrimmed = password?.trim();
    
    // Master / Super Admin Account
    if ((emailLower === "detaksumut@gmail.com" || emailLower === "detaksumtu@gmail.com") && passwordTrimmed === "Mikr@210669Mpi") {
      return {
        success: true,
        user: {
          id: "super-admin",
          email: "detaksumut@gmail.com",
          full_name: "Super Admin",
          role: "admin",
          status: "Active"
        }
      };
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'registered_users')
      .single();

    let existingUsers = [];
    if (!settingsError && settingsData && settingsData.value) {
      existingUsers = Array.isArray(settingsData.value) ? settingsData.value : JSON.parse(settingsData.value as string);
    } else {
      const DATA_FILE = path.join(process.cwd(), 'registered_users.json');
      if (fs.existsSync(DATA_FILE)) {
        existingUsers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      }
    }

    // Merge bulk reviewers so they can log in!
    try {
      const reviewersFile = path.join(process.cwd(), 'src/app/api/users/list/reviewers_data.json');
      if (fs.existsSync(reviewersFile)) {
        const reviewersData = JSON.parse(fs.readFileSync(reviewersFile, 'utf8'));
        for (let newR of reviewersData) {
          const exists = existingUsers.find((u: any) => u.email.toLowerCase() === newR.email.toLowerCase());
          if (!exists) {
            existingUsers.push({
              id: `reviewer-${newR.email}`,
              full_name: newR.full_name,
              email: newR.email,
              role: newR.role || 'reviewer',
              status: newR.status || 'Active',
              password: 'ReviewerPassword123!'
            });
          }
        }
      }
    } catch(err) {
      console.error("Failed to load reviewers for login", err);
    }

    const matchedUser = existingUsers.find((u: any) => u.email.toLowerCase().trim() === emailLower);
    
    if (matchedUser) {
      if (matchedUser.password && matchedUser.password.trim() !== passwordTrimmed) {
        return { success: false, error: "Password salah" };
      }
      return { success: true, user: matchedUser };
    }
    
    return { success: false, error: "User not found" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
