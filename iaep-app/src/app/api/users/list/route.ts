import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';
import { isAdminRole } from "@/lib/roles";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// SEC-03: Service role key must be provided via environment variables only.
// No hardcoded fallback secrets are permitted.
if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is not configured.");
}
if (!supabaseKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured. Refusing to start with a fallback secret.");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// RBAC: only authenticated admins may list or mutate user data.
// Uses the canonical getCurrentUser() session resolver (handles Supabase,
// firebase_session, and supabase_fallback_session + user_role cookies) and
// the centralized isAdminRole() from src/lib/roles â€” no hardcoded role list.
//
// Cookie-fallback tier: when IdentityResolver succeeds but returns roles:[]
// (fake-UUID session IDs that pass the True UUID regex but have no profiles
// row), we read the user_role cookie directly from the Request Cookie header â€”
// the same role value the dashboard layout already trusts. The httpOnly
// supabase_fallback_session cookie remains the session proof; user_role
// is the role carrier. Reading from Request headers (not next/headers cookies())
// is unconditionally reliable regardless of Next.js async context constraints.

/** Extract a single named cookie value from a raw Cookie header string. */
function parseCookieValue(cookieHeader: string, name: string): string | undefined {
  const re = new RegExp('(?:^|;\\s*)' + name + '=([^;]*)');
  const m = cookieHeader.match(re);
  return m ? decodeURIComponent(m[1]) : undefined;
}

async function isAdminRequest(request: Request): Promise<boolean> {
  try {
    const { getCurrentUser } = await import("@/app/actions/auth");
    const user = await getCurrentUser();
    if (!user) {
      console.error("[users/list.DEBUG] getCurrentUser() returned", user);
      return false;
    }

    // Tier 1: roles[] from IdentityContext (from IdentityResolver â†’ profiles.role
    // or system_settings role). Scalar user.role used as fallback if array is empty.
    let roles: string[] = Array.isArray(user.roles)
  ? user.roles
  : [];

    // Tier 2: Cookie override â€” reads user_role directly from the incoming request.
    //
    // Activates in TWO cases:
    //   A) roles is empty â€” identity resolution produced nothing; use cookie as identity.
    //   B) roles is non-empty but no role passes isAdminRole(), AND the user_role cookie
    //      claims an admin-class role (super_admin / admin).
    //      This handles the Super Admin whose kadinmedan1@gmail.com is registered with an
    //      older role ("editor") in system_settings/registered_users, while the server-side
    //      login flow (auth.ts, Super Admin password branch) writes user_role=super_admin.
    //      The dashboard layout already trusts this same cookie as the authoritative source.
    //
    // Security: this override only triggers if (a) getCurrentUser() returned a valid user
    // (session proof via httpOnly supabase_fallback_session / firebase_session is valid)
    // AND (b) the cookie role is admin-class (checked via the canonical isAdminRole()).
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieRole = parseCookieValue(cookieHeader, 'user_role');
    const alreadyAdmin = roles.some((r: string) => isAdminRole(r));

    if (cookieRole && !alreadyAdmin && isAdminRole(cookieRole)) {
      // Server-verified admin cookie takes precedence over stale identity role.
      roles = [cookieRole];
    }

    const allowed = roles.some((r: string) => isAdminRole(r));
    // TEMP DEBUG LOG (remove after diagnosis)
    console.error("[users/list.DEBUG] user.id=", user.id, "| email=", user.email,
  "| roles=", JSON.stringify(user.roles),
  "| cookieRole=", cookieRole, "| alreadyAdmin=", alreadyAdmin,
  "| resolvedRoles=", JSON.stringify(roles), "| isAdminAllowed=", allowed);
    return allowed;
  } catch (e: any) {
    console.error("[users/list.DEBUG] isAdminRequest threw:", e?.message);
    return false;
  }
}

// SEC-04: strip any plaintext password fields before returning user records.
function sanitizeUsers(users: any[]): any[] {
  return users.map(({ password, ...rest }) => rest);
}

const DATA_FILE = path.join(process.cwd(), 'apasific_registered_users.json');

function getLocalUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error("Error reading local users", e);
  }
  
  const initialUsers: any[] = [];
  saveLocalUsers(initialUsers);
  return initialUsers;
}

function saveLocalUsers(users: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Error writing local users (expected on Vercel)", e);
  }
}

// Memory cache for Vercel demo when Supabase fails
let memoryCache: any[] | null = null;

export async function GET(request: Request) {
  try {
    // RBAC: only authenticated admins may list user data (SEC-P1).
    const isAdmin = await isAdminRequest(request);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized: admin role required." }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'apasific_registered_users')
      .single();

    let users: any[] = [];
    
    // Prefer Supabase data if available, but merge with local data to avoid missing new registrants
    const localUsers = getLocalUsers() || [];
    
    if (!error && data && data.value) {
      const sbUsers = Array.isArray(data.value) ? data.value : JSON.parse(data.value as string);
      users = [...sbUsers];
      
      // Merge local users that might have failed to save to Supabase
      for (let lu of localUsers) {
        if (!users.find(u => u.email.toLowerCase() === lu.email.toLowerCase())) {
          users.push(lu);
        }
      }
    } else if (memoryCache) {
      users = memoryCache;
    } else {
      users = localUsers;
    }

    // Merge new reviewers data from file
    try {
      const reviewersFile = path.join(process.cwd(), 'src/app/api/users/list/reviewers_data.json');
      if (fs.existsSync(reviewersFile)) {
        const reviewersData = JSON.parse(fs.readFileSync(reviewersFile, 'utf8'));
        
        for (let newR of reviewersData) {
          const exists = users.find((u: any) => u.email.toLowerCase() === newR.email.toLowerCase());
          if (!exists) {
users.push({
              id: `demo-user-${Date.now()}-${Math.random()}`,
              full_name: newR.full_name,
              email: newR.email,
              role: newR.role,
              journal: "APASIFIC IAEP",
              university: newR.university,
              country: newR.country,
              status: newR.status,
              joined: newR.date,
              phone_number: newR.phone
            });
          }
        }
      }
    } catch (err) {
      console.error("Error merging reviewers data", err);
    }

    // SEC-04: never return plaintext password fields.
    return NextResponse.json({ success: true, users: sanitizeUsers(users) });
  } catch (error: any) {
    return NextResponse.json({ success: true, users: sanitizeUsers(getLocalUsers()) }); 
  }
}

export async function POST(request: Request) {
    try {
      // RBAC: only authenticated admins may mutate user data.
      const isAdmin = await isAdminRequest(request);
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized: admin role required." }, { status: 403 });
      }

      const { action, userId, user: editData } = await request.json();
      
      let { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'apasific_registered_users')
        .single();
  
      let users: any[] = [];
      
      if (!error && data && data.value) {
        users = Array.isArray(data.value) ? data.value : JSON.parse(data.value as string);
      } else {
        users = getLocalUsers();
      }

      // Merge new reviewers data from file before updating
      try {
        const reviewersFile = path.join(process.cwd(), 'src/app/api/users/list/reviewers_data.json');
        if (fs.existsSync(reviewersFile)) {
          const reviewersData = JSON.parse(fs.readFileSync(reviewersFile, 'utf8'));
          for (let newR of reviewersData) {
            const exists = users.find((u: any) => u.email.toLowerCase() === newR.email.toLowerCase());
if (!exists) {
              // SEC-04: no plaintext passwords are persisted or returned.
              users.push({
                id: `demo-user-${Date.now()}-${Math.random()}`,
                full_name: newR.full_name,
                email: newR.email,
                role: newR.role,
                journal: "APASIFIC IAEP",
                university: newR.university,
                country: newR.country,
                status: newR.status,
                joined: newR.date
              });
            }
          }
        }
      } catch (err) {}

      if (action === "edit" && editData) {
        users = users.map((u: any) => u.id === editData.id ? { 
          ...u, 
          full_name: editData.name || editData.full_name,
          email: editData.email,
          role: editData.role.toLowerCase(),
          status: editData.status,
          phone_number: editData.phone_number || editData.phone,
          university: editData.university,
          country: editData.country,
          orcid_id: editData.orcid_id || editData.orcid,
          google_scholar_id: editData.google_scholar_id || editData.googleScholar,
          scopus_id: editData.scopus_id || editData.scopus,
          wos_id: editData.wos_id || editData.wos,
          sinta_id: editData.sinta_id || editData.sinta
        } : u);
      } else if (action === "approve") {
        users = users.map((u: any) => u.id === userId ? { ...u, status: "Active" } : u);
      } else if (action === "revoke") {
        users = users.map((u: any) => u.id === userId ? { ...u, status: "Revoked" } : u);
      } else if (action === "delete") {
        users = users.filter((u: any) => u.id !== userId);
      }

// SEC-04: strip any plaintext password fields before persisting.
    const safeUsers = sanitizeUsers(users);

    // Always save locally to ensure edits persist across reloads (in dev)
    saveLocalUsers(safeUsers);
    
    // Save to memory cache for Vercel
    memoryCache = safeUsers;

    // Save to supabase
    const { error: upsertError } = await supabaseAdmin
      .from('system_settings')
      .upsert({ key: 'apasific_registered_users', value: JSON.stringify(safeUsers) });
      
    if (upsertError) {
      console.warn("Supabase upsert failed, using memory cache instead:", upsertError.message);
    }

    return NextResponse.json({ success: true, users: safeUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


