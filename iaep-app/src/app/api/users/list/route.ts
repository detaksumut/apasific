import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const DATA_FILE = path.join(process.cwd(), 'apasific_registered_users.json');

function getLocalUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error("Error reading local users", e);
  }
  
  const initialUsers = [
    { id: 1, full_name: "M. A. Rahman", email: "marahman2169@gmail.com", role: "Editor", journal: "RJRAKP, APASIFIC IAEP", joined: "Oct 2024", status: "Active" },
    { id: 2, full_name: "Kadin Medan", email: "kadinmedan1@gmail.com", role: "Reviewer", journal: "RJRAKP", joined: "Nov 2024", status: "Active" },
    { id: 3, full_name: "Kad Sumut", email: "kadsumut@gmail.com", role: "Author", journal: "APASIFIC IAEP", joined: "Dec 2024", status: "Active" }
  ];
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
              phone_number: newR.phone,
              password: "ReviewerPassword123!"
            });
          }
        }
      }
    } catch (err) {
      console.error("Error merging reviewers data", err);
    }

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: true, users: getLocalUsers() }); 
  }
}

  export async function POST(request: Request) {
    try {
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
                password: "ReviewerPassword123!"
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

    // Always save locally to ensure edits persist across reloads (in dev)
    saveLocalUsers(users);
    
    // Save to memory cache for Vercel
    memoryCache = users;

    // Save to supabase
    const { error: upsertError } = await supabaseAdmin
      .from('system_settings')
      .upsert({ key: 'apasific_registered_users', value: JSON.stringify(users) });
      
    if (upsertError) {
      console.warn("Supabase upsert failed, using memory cache instead:", upsertError.message);
    }

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
