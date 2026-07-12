import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DATA_FILE = path.join(process.cwd(), 'registered_users.json');

function getLocalUsers() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
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
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'registered_users')
      .single();

    let users = [];
    let useLocalOnly = false;
    
    // Check if we have a locally updated file first!
    const localUsers = getLocalUsers();
    if (localUsers && localUsers.length > 0) {
      users = localUsers;
      useLocalOnly = true;
    } else if (!error && data && data.value) {
      users = Array.isArray(data.value) ? data.value : JSON.parse(data.value as string);
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
      
      // First try to fetch from Supabase
      let { data, error } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'registered_users')
        .single();
  
      let users = [];
      let useLocalOnly = false;
      
      const localUsers = getLocalUsers();
      if (localUsers && localUsers.length > 0) {
        users = localUsers;
        useLocalOnly = true;
      } else if (!error && data && data.value) {
        users = Array.isArray(data.value) ? data.value : JSON.parse(data.value as string);
      } else {
        users = localUsers;
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
          full_name: editData.name,
          email: editData.email,
          role: editData.role.toLowerCase(),
          status: editData.status,
          phone_number: editData.phone,
          university: editData.university,
          country: editData.country,
          orcid_id: editData.orcid,
          google_scholar_id: editData.googleScholar,
          scopus_id: editData.scopus,
          wos_id: editData.wos,
          sinta_id: editData.sinta
        } : u);
      } else if (action === "approve") {
        users = users.map((u: any) => u.id === userId ? { ...u, status: "Active" } : u);
      } else if (action === "revoke") {
        users = users.map((u: any) => u.id === userId ? { ...u, status: "Revoked" } : u);
      } else if (action === "delete") {
        users = users.filter((u: any) => u.id !== userId);
      }

    // Always save locally to ensure edits persist across reloads
    saveLocalUsers(users);

    // Try saving to supabase as backup
    const { error: upsertError } = await supabaseAdmin
      .from('system_settings')
      .upsert({ key: 'registered_users', value: JSON.stringify(users) });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
