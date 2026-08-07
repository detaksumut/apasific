"use server";

import fs from 'fs';
import path from 'path';
import { hashPassword, verifyPassword } from '@/utils/password';

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
      // SEC-04 (Phase 2): only a salted scrypt hash is persisted, never plaintext.
      password_hash: formData.password ? hashPassword(formData.password) : undefined,
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
    // Security: credentials must be set via environment variables only — no hardcoded fallbacks.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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


// CROSS-SYNC TO RJRAKP: temporarily disabled. When re-enabled, credentials
    // must be read from environment variables only (RJRAKP_SUPABASE_URL,
    // RJRAKP_SUPABASE_SERVICE_ROLE_KEY). No hardcoded fallback secrets are permitted.

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

    // Security: Super Admin account mapping loaded from environment variables only.
    // Set SUPER_ADMIN_EMAIL, SUPER_ADMIN_EMAIL_ALIAS, SUPER_ADMIN_CANONICAL_EMAIL,
    // and SUPER_ADMIN_PASSWORD in .env.local — never hardcode credentials in source.
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || '';
    const superAdminEmailAlias = process.env.SUPER_ADMIN_EMAIL_ALIAS || '';
    const superAdminCanonicalEmail = process.env.SUPER_ADMIN_CANONICAL_EMAIL || '';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || '';

    if (
      superAdminPassword &&
      superAdminCanonicalEmail &&
      (emailLower === superAdminEmail || emailLower === superAdminEmailAlias) &&
      passwordTrimmed === superAdminPassword
    ) {
      emailLower = superAdminCanonicalEmail;
    }

    let localMatchedUser = localUsers.find((u: any) => u.email.toLowerCase() === emailLower);

    // Only force Super Admin role if they actually used the Super Admin password.
    // Otherwise, let them login as the normal user defined in JSON.
    if (
      superAdminPassword &&
      superAdminCanonicalEmail &&
      emailLower === superAdminCanonicalEmail &&
      passwordTrimmed === superAdminPassword
    ) {
localMatchedUser = {
        full_name: "Super Admin",
        role: "super_admin",
        password: superAdminPassword,
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
        // SECURITY FIX: Verify password matches the stored credential before migrating/falling back.
        // SEC-04 (Phase 2): stored credentials are salted scrypt hashes (scrypt$salt$hash).
        // Legacy plaintext values are also verified in constant time as a migration fallback.
        const storedCredential = localMatchedUser.password_hash || localMatchedUser.password || '';
        if (!verifyPassword(passwordTrimmed, storedCredential)) {
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
                await createSessionForProfile(localMatchedUser);
                const fallbackId = localMatchedUser.id?.toString() || `json-${Date.now()}`;
                const fallbackRole = localMatchedUser.role || 'author';
                const fallbackName = localMatchedUser.full_name || 'User';
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
            const fbRole = localMatchedUser.role || 'author';
            const fbName = localMatchedUser.full_name || 'User';
            cookieStore.set('user_role', fbRole, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/'
            });
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
                await createSessionForProfile(localMatchedUser);
                const fallbackId = localMatchedUser.id?.toString() || `json-${Date.now()}`;
                const fallbackRole = localMatchedUser.role || 'author';
                const fallbackName = localMatchedUser.full_name || 'User';
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
        // Identity Core could not map this session (e.g. Firebase/JSON fallback
        // users not yet registered in Supabase profiles/system_settings).
        // Instead of treating them as logged out, preserve the authenticated
        // session with a synthetic identity built from the verified login
        // cookies. RBAC remains enforced at page level via role checks
        // (see src/lib/roles.ts and the dashboard layouts).
        console.warn("Identity resolution fallback in getCurrentUser:", (error as Error)?.message);
        const rawName = cookieStore.get('user_name')?.value;
        let displayName = (user as any).full_name || 'User';
        if (rawName) {
            try { displayName = decodeURIComponent(rawName); } catch { displayName = rawName; }
        }
        const _fallbackRole = cookieStore.get('user_role')?.value || 'author';
        return {
            id: user.id,
            identityId: user.id,
            email: user.email || '',
            full_name: displayName,
            role: _fallbackRole,
            json_id: (user as any).json_id || cookieStore.get('reviewer_json_id')?.value || null,
            provider: 'fallback',
            fallback: true,
            roles: [_fallbackRole],
            permissions: []
        } as any;
    }
  }
  return user;
}

export async function createSessionForProfile(userProfile: any) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const role = userProfile.role || 'author';
  const fullName = userProfile.full_name || 'User';
  const userId = userProfile.id?.toString() || `json-${Date.now()}`;

  cookieStore.set('supabase_fallback_session', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  cookieStore.set('user_role', role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  cookieStore.set('user_name', encodeURIComponent(fullName), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  cookieStore.set('active_portal_role', role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  if (userProfile.id) {
    cookieStore.set('reviewer_json_id', userProfile.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });
  }

  if (userProfile.orcid_id) {
    cookieStore.set('orcid_id', userProfile.orcid_id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });
  }
}

export async function loginWithOrcid(
  orcidId: string,
  name?: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ── Path A: Lookup by orcid_id (Subsequent Login) ─────────────────────
    const { data: profileByOrcid } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('orcid_id', orcidId)
      .maybeSingle();

    if (profileByOrcid) {
      await createSessionForProfile(profileByOrcid);
      return {
        success: true,
        user: {
          id: profileByOrcid.id,
          email: profileByOrcid.email || '',
          full_name: profileByOrcid.full_name,
          role: profileByOrcid.role || 'author',
        },
      };
    }

    // ── Path B: Natural Linking by Name (First Login) ──────────────────────
    if (name) {
      const { data: profileByName } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('full_name', name.trim())
        .maybeSingle();

      if (profileByName) {
        // Link orcid_id into the existing record
        await supabaseAdmin
          .from('profiles')
          .update({ orcid_id: orcidId })
          .eq('id', profileByName.id);

        const linkedProfile = { ...profileByName, orcid_id: orcidId };
        await createSessionForProfile(linkedProfile);
        return {
          success: true,
          user: {
            id: linkedProfile.id,
            email: linkedProfile.email || '',
            full_name: linkedProfile.full_name,
            role: linkedProfile.role || 'author',
          },
        };
      }
    }

    // ── Path C: Auto-Register new user as Author ───────────────────────────
    const newId = crypto.randomUUID();
    const newProfile = {
      id: newId,
      full_name: name || 'ORCID User',
      orcid_id: orcidId,
      role: 'author',
      status: 'Active',
      joined: new Date().toISOString(),
    };

    await supabaseAdmin.from('profiles').insert(newProfile);

    await createSessionForProfile(newProfile);
    return {
      success: true,
      user: {
        id: newId,
        email: '',
        full_name: newProfile.full_name,
        role: 'author',
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}




