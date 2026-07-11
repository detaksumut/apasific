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
  return [];
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
    if (!error && data && data.value) {
      users = Array.isArray(data.value) ? data.value : JSON.parse(data.value as string);
    } else {
      // Fallback to local file if Supabase fails (e.g. RLS or missing service key)
      users = getLocalUsers();
    }

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: true, users: getLocalUsers() }); 
  }
}

export async function POST(request: Request) {
  try {
    const { action, userId } = await request.json();
    
    // First try to fetch from Supabase
    let { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'registered_users')
      .single();

    let users = [];
    let useLocal = false;
    
    if (!error && data && data.value) {
      users = Array.isArray(data.value) ? data.value : JSON.parse(data.value as string);
    } else {
      users = getLocalUsers();
      useLocal = true;
    }

    if (action === "approve") {
      users = users.map((u: any) => u.id === userId ? { ...u, status: "Active" } : u);
    } else if (action === "revoke") {
      users = users.map((u: any) => u.id === userId ? { ...u, status: "Revoked" } : u);
    } else if (action === "delete") {
      users = users.filter((u: any) => u.id !== userId);
    }

    // Try saving to supabase
    const { error: upsertError } = await supabaseAdmin
      .from('system_settings')
      .upsert({ key: 'registered_users', value: JSON.stringify(users) });

    if (upsertError || useLocal) {
      saveLocalUsers(users);
    }

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
