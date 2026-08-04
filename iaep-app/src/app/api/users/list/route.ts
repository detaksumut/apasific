import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';

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
async function isAdminRequest(): Promise<boolean> {
  try {
    const { getCurrentUserRole } = await import("@/app/actions/user");
    const profile = await getCurrentUserRole();
    if (!profile) return false;
    const role = (profile.role || "").toLowerCase();
    return ["admin", "superadmin", "super_admin"].includes(role);
  } catch {
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

export async function GET() {
  try {
    // RBAC: only authenticated admins may list user data (SEC-P1).
    const isAdmin = await isAdminRequest();
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
      const isAdmin = await isAdminRequest();
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
