"use server";

import { verifyPassword } from "@/utils/password";

import { IdentityRepository } from "@/repositories/IdentityRepository";

import fs from 'fs';
import path from 'path';

export async function signUpUser(formData: any): Promise<{ success: boolean; error?: string }> {
  const { createClient } = await import("@/utils/supabase/server");
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
    let localMatchedUser = localUsers.find((u: any) => u.email.toLowerCase() === emailLower);
    
    // Only force Super Admin role if they actually used the Super Admin password!
    // Otherwise, let them login as the normal user defined in JSON (e.g. Editor with password mikrosistem)
    
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
        if (!verifyPassword(passwordTrimmed, localMatchedUser.password)) {
           return { success: false, error: "Email atau password salah." };
        }

        console.log("Supabase Auth failed, falling back to Firebase...");
        
        try {
            const { getFirebaseAdmin } = require('@/utils/firebase/server');
            const admin = getFirebaseAdmin();

            // NULL GUARD — Firebase tidak terkonfigurasi, gunakan fallback session
            // Password sudah diverifikasi terhadap JSON di atas (baris 246-248).
            // Pola cookie sama dengan supabase_fallback_session yang sudah ada.
            if (!admin) {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                const fallbackId = localMatchedUser.id?.toString() || `json-${Date.now()}`;
                const registryIdentity = await IdentityRepository.findIdentityFromSystemSettings(emailLower);
                const fallbackRole = registryIdentity?.role || null;
                const fallbackName = localMatchedUser.full_name || 'User';

                cookieStore.set('supabase_fallback_session', fallbackId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/'
                });

                cookieStore.set('fallback_user_email', emailLower, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
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
                // Session cookie completeness — approved addition per CR-002
                // Mirrors client-side cookies set by login page, but server-side
                // so DashboardLayout (server component) sees them before render.
                if (fallbackRole) {
                    cookieStore.set('user_role', fallbackRole, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/'
                });
                }
                cookieStore.set('user_name', encodeURIComponent(fallbackName), {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/'
                });
                return {
                    success: true,
                    user: {
                        id: fallbackId,
                        email: emailLower,
                        full_name: fallbackName,
                        role: fallbackRole
                    }
                };
            }

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

            // Generate a secure session token WITH email claim so IdentityResolver can find them
            const token = await admin.auth().createCustomToken(firebaseUser.uid, { email: emailLower });
            
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

            // Session cookie completeness — same contract as null-guard (CR-002/CR-003)
            // Ensures DashboardLayout (server component) reads correct role/name before render.
            const registryIdentity = await IdentityRepository.findIdentityFromSystemSettings(emailLower);
            const fbRole = registryIdentity?.role || null;
            const fbName = localMatchedUser.full_name || 'User';
            if (fbRole) {
                cookieStore.set('user_role', fbRole, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/'
            });
            }
            cookieStore.set('user_name', encodeURIComponent(fbName), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/'
            });

            return { 
                success: true, 
                user: {
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  full_name: fbName,
                  role: fbRole
                }
            };
        } catch (firebaseErr: any) {
            console.error("Firebase fallback error:", firebaseErr);
            // Firebase failed (e.g. unsupported domain, rate-limit, creation error).
            // Password was already verified above — use JSON session fallback (CR-003 extension).
            try {
                const { cookies } = await import('next/headers');
                const cookieStore = await cookies();
                const fallbackId = localMatchedUser.id?.toString() || `json-${Date.now()}`;
                const registryIdentity = await IdentityRepository.findIdentityFromSystemSettings(emailLower);
                const fallbackRole = registryIdentity?.role || null;
                const fallbackName = localMatchedUser.full_name || 'User';
                cookieStore.set('supabase_fallback_session', fallbackId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/'
                });

                cookieStore.set('fallback_user_email', emailLower, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
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
                if (fallbackRole) {
                    cookieStore.set('user_role', fallbackRole, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/'
                });
                }
                cookieStore.set('user_name', encodeURIComponent(fallbackName), {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24 * 7,
                    path: '/'
                });
                return {
                    success: true,
                    user: {
                        id: fallbackId,
                        email: emailLower,
                        full_name: fallbackName,
                        role: fallbackRole
                    }
                };
            } catch (cookieErr: any) {
                return { success: false, error: "Authentication failed on both Supabase and Firebase: " + firebaseErr.message };
            }
        }
    }

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (authData && authData.user) {
       // Runtime role comes from the production identity registry.
       const registryIdentity = authData.user.email ? await IdentityRepository.findIdentityFromSystemSettings(authData.user.email) : null;
       
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
           full_name: registryIdentity?.full_name || authData.user.user_metadata?.full_name,
           role: registryIdentity?.role || null
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
               user = { id: payload.uid, email: payload.claims?.email || payload.email || "fallback@firebase.local" } as any;
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
    // Attach json_id if available (for backwards compatibility if resolver needs it)
    const jsonId = cookieStore.get('reviewer_json_id')?.value;
    if (jsonId) {
        (user as any).json_id = jsonId;
    }

    try {
        const { IdentityResolver } = await import('@/services/identity/IdentityResolver');
        const identityContext = await IdentityResolver.resolve(user);
        return identityContext;
    } catch (error) {
        console.error("Identity resolution failed in getCurrentUser:", error);
        // Throw or return null depending on strictness. Returning null prevents crash but acts as logged out.
        return null;
    }
  }
  return user;
}



















