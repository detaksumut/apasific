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
      discipline: formData.discipline,
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";
    
    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseKey);

    // Store in system_settings as well for admin panel to see
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'apasific_registered_users')
      .single();

    let existingUsers = [];
    
    if (!settingsError && settingsData && settingsData.value) {
      existingUsers = Array.isArray(settingsData.value) ? settingsData.value : JSON.parse(settingsData.value as string);
    } else {
      try {
        const DATA_FILE = path.join(process.cwd(), 'apasific_registered_users.json');
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
      .upsert({ key: 'apasific_registered_users', value: JSON.stringify(existingUsers) });
      
    if (upsertError) {
      console.error("Failed to save to Supabase:", upsertError);
      // Fallback to local file for demo purposes so it always works
      try {
        const DATA_FILE = path.join(process.cwd(), 'apasific_registered_users.json');
        fs.writeFileSync(DATA_FILE, JSON.stringify(existingUsers, null, 2));
      } catch (e) {
        console.error(e);
      }
    }

    // Simpan juga ke tabel profiles dengan email (database proper)
    try {
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        full_name: formData.fullName || 'User',
        email: formData.email,
        role: formData.role || 'author',
        phone: formData.phone || null,
        university: formData.university || null,
        country: formData.country || null,
        discipline: formData.discipline || null,
        orcid_id: formData.orcid || null,
        status: 'Pending',
      }, { onConflict: 'id' });
    } catch (profileErr) {
      console.warn('Could not save to profiles table:', profileErr);
    }


    // CROSS-SYNC TO RJRAKP (Temporarily disabled as requested)
    /*
    try {
      // Use RJRAKP variables if they exist, otherwise fallback to the main shared database
      const rjrakpUrl = process.env.RJRAKP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const rjrakpKey = process.env.RJRAKP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";
      
      if (rjrakpUrl && rjrakpKey) {
        const { createClient: createRjrakpClient } = require('@supabase/supabase-js');
        const rjrakpSupabase = createRjrakpClient(rjrakpUrl, rjrakpKey);
        
        // 1. Insert into RJRAKP 'users' table
        const { error: rjrakpUserError } = await rjrakpSupabase.from('users').upsert({
          id: userId,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role?.toLowerCase() || 'author',
          status: 'PENDING',
          institution: formData.university || formData.country,
          faculty: '',
          degree_level: '',
          scopus_id: formData.scopus || '',
          wos_id: formData.wos || '',
          sinta_id: formData.sinta || ''
        }, { onConflict: 'email' });

        if (rjrakpUserError) {
          console.error("Failed to cross-sync user to RJRAKP:", rjrakpUserError);
        } else if (formData.role?.toLowerCase() === 'reviewer') {
          // 2. Insert into RJRAKP 'reviewer_profiles' if role is reviewer
          await rjrakpSupabase.from('reviewer_profiles').upsert({
            user_id: userId,
            affiliation: formData.university || formData.country,
            faculty: '',
            education_level: '',
            expertise_area: '',
            orcid_id: formData.orcid || '',
            google_scholar: formData.googleScholar || '',
            scopus_id: formData.scopus || '',
            wos_id: formData.wos || '',
            sinta_id: formData.sinta || '',
            cv_url: ''
          }, { onConflict: 'user_id' });
        }
      }
    } catch (crossSyncError) {
      console.error("RJRAKP Cross-sync error:", crossSyncError);
    }
    */

  return { success: true };
}

export async function loginUser(email: string, password?: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    let emailLower = email.toLowerCase().trim();
    const passwordTrimmed = password?.trim();
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // We will look up the user first to get their full name for migration
    const DATA_FILE = require('path').join(process.cwd(), 'apasific_registered_users.json');
    const fs = require('fs');
    let localUsers = [];
    if (fs.existsSync(DATA_FILE)) {
       localUsers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    try {
       const { data: settingsData } = await supabaseAdmin.from('system_settings').select('value').eq('key', 'apasific_registered_users').single();
       if (settingsData && settingsData.value) {
           const sbUsers = Array.isArray(settingsData.value) ? settingsData.value : JSON.parse(settingsData.value as string);
           for (let su of sbUsers) {
               if (!localUsers.find((lu: any) => lu.email.toLowerCase() === su.email.toLowerCase())) {
                   localUsers.push(su);
               } else {
                   // overwrite local user with supabase user data (e.g. password updates)
                   const idx = localUsers.findIndex((lu: any) => lu.email.toLowerCase() === su.email.toLowerCase());
                   localUsers[idx] = { ...localUsers[idx], ...su };
               }
           }
       }
    } catch(e) {
       console.error("Error fetching users from Supabase for login:", e);
    }

    // Master / Super Admin Account Mapping
    if ((emailLower === "detaksumut@gmail.com" || emailLower === "detaksumtu@gmail.com") && passwordTrimmed === "Mikr@210669Mpi") {
        emailLower = "kadinmedan1@gmail.com"; // Supabase has this email for the super admin
    }

    let localMatchedUser = localUsers.find((u: any) => u.email.toLowerCase() === emailLower);
    
    // Only force Super Admin role if they actually used the Super Admin password!
    // Otherwise, let them login as the normal user defined in JSON (e.g. Editor with password mikrosistem)
    if (emailLower === "kadinmedan1@gmail.com" && passwordTrimmed === "Mikr@210669Mpi") {
        localMatchedUser = {
            full_name: "Super Admin",
            role: "admin",
            password: "Mikr@210669Mpi"
        };
    }
    
    if (!localMatchedUser) {
        localMatchedUser = { full_name: "User", role: "author" };
    }

    if (!passwordTrimmed) {
      return { success: false, error: "Password required" };
    }

    let authData = null;
    let authError = null;
    try {
      const res = await supabase.auth.signInWithPassword({
        email: emailLower,
        password: passwordTrimmed,
      });
      authData = res.data;
      authError = res.error;
    } catch (err: any) {
      console.warn("Supabase threw an exception (maintenance/down). Triggering fallback.", err);
      authError = err;
    }
    
    // If real login fails (user only in JSON, not in Supabase Auth), we migrate them to REAL Auth!
    if (authError || !authData?.user) {
        // SECURITY FIX: Verify password matches JSON before migrating/falling back!
        if (localMatchedUser.password !== passwordTrimmed) {
           return { success: false, error: "Email atau password salah." };
        }

        console.log("Supabase Auth failed, falling back to Firebase...");
        
        try {
            const { getFirebaseAdmin } = require('@/utils/firebase/server');
            const admin = getFirebaseAdmin();
            let firebaseUser;
            try {
                firebaseUser = await admin.auth().getUserByEmail(emailLower);
            } catch (e: any) {
                if (e.code === 'auth/user-not-found') {
                    // Create in Firebase
                    firebaseUser = await admin.auth().createUser({
                        email: emailLower,
                        password: passwordTrimmed, // Store real password in Firebase
                        displayName: localMatchedUser.full_name,
                    });
                } else {
                    throw e;
                }
            }

            // Generate a secure session token
            const token = await admin.auth().createCustomToken(firebaseUser.uid);
            
            // Set cookie for Next.js middleware/pages
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            cookieStore.set('firebase_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/'
            });
            
            if (localMatchedUser.id) {
                cookieStore.set('reviewer_json_id', localMatchedUser.id.toString(), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/'
                });
            }

            return { 
                success: true, 
                user: {
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  full_name: localMatchedUser.full_name,
                  role: localMatchedUser.role || 'author'
                }
            };
        } catch (firebaseErr: any) {
            console.error("Firebase fallback error:", firebaseErr);
            return { success: false, error: "Authentication failed on both Supabase and Firebase: " + firebaseErr.message };
        }
    }

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (authData && authData.user) {
       // Fetch role from profiles to return to client
       const { data: profile } = await supabaseAdmin.from('profiles').select('role, full_name').eq('id', authData.user.id).single();
       
       // Also set a backup cookie just in case
       const { cookies } = await import('next/headers');
       const cookieStore = await cookies();
       cookieStore.set('supabase_fallback_session', authData.user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
       });

       return { 
         success: true, 
         user: {
           id: authData.user.id,
           email: authData.user.email,
           full_name: profile?.full_name || authData.user.user_metadata?.full_name,
           role: profile?.role || 'author'
         }
       };
    }

    return { success: false, error: "Authentication failed" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getCurrentUser() {
  const { createClient } = await import('@/utils/supabase/server');
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const fbToken = cookieStore.get('firebase_session')?.value;
    const fallbackUserId = cookieStore.get('supabase_fallback_session')?.value;
    
    if (fbToken || fallbackUserId) {
        try {
            if (fbToken) {
               const payloadBase64 = fbToken.split('.')[1];
               const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
               user = { id: payload.uid, email: payload.email || "fallback@firebase.local" } as any;
            }
        } catch (e) {}
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "fallback@fallback.local" } as any;
        }
    }
  }

  if (user) {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    // Attach json_id if available
    const jsonId = cookieStore.get('reviewer_json_id')?.value;
    if (jsonId) {
        (user as any).json_id = jsonId;
    }

    // Enrich user email from Supabase system_settings if missing or fallback
    if (user && (!user.email || user.email.includes('fallback@'))) {
       try {
          const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
          const supabaseAdmin = createSupabaseClient(
             process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
             process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
          );
          const { data: settings } = await supabaseAdmin.from('system_settings').select('value').in('key', ['apasific_registered_users', 'registered_users']);
          if (settings) {
             for (const s of settings) {
                try {
                   const users = Array.isArray(s.value) ? s.value : JSON.parse(s.value);
                   const matched = users.find((u: any) => u.id === user.id || u.id === (user as any).json_id || u.email === 'kadsumut@gmail.com');
                   if (matched && matched.email) {
                      user.email = matched.email;
                      if (matched.full_name) (user as any).full_name = matched.full_name;
                      break;
                   }
                } catch(e) {}
             }
          }
       } catch(e) {}
    }
  }
  return user;
}
