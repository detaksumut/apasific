import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const DATA_FILE = path.join(process.cwd(), 'apasific_registered_users.json');
    const REVIEWERS_FILE = path.join(process.cwd(), 'src/app/api/users/list/reviewers_data.json');

    if (!fs.existsSync(DATA_FILE) || !fs.existsSync(REVIEWERS_FILE)) {
      return NextResponse.json({ error: "Files not found" }, { status: 404 });
    }

    const users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const reviewers = JSON.parse(fs.readFileSync(REVIEWERS_FILE, 'utf8'));

    // 1. Get from Supabase
    const { data } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'apasific_registered_users')
      .single();

    let supabaseUsers: any[] = [];
    if (data && data.value) {
      supabaseUsers = Array.isArray(data.value) ? data.value : JSON.parse(data.value as string);
    } else {
      supabaseUsers = [...users];
    }

    let updatedCount = 0;

    // Update in Supabase array
    for (let user of supabaseUsers) {
      if (!user.phone_number && !user.phone) {
        const match = reviewers.find((r: any) => r.email.toLowerCase() === user.email.toLowerCase());
        if (match && match.phone) {
          user.phone_number = match.phone;
          updatedCount++;
        }
      }
    }

    // Update local JSON as well just in case
    for (let user of users) {
      if (!user.phone_number && !user.phone) {
        const match = reviewers.find((r: any) => r.email.toLowerCase() === user.email.toLowerCase());
        if (match && match.phone) {
          user.phone_number = match.phone;
        }
      }
    }

    // Save back to local
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

    // Save back to Supabase
    await supabaseAdmin
      .from('system_settings')
      .upsert({ key: 'apasific_registered_users', value: JSON.stringify(supabaseUsers) });

    return NextResponse.json({ success: true, message: `Berhasil memulihkan ${updatedCount} nomor telepon ke Supabase & database lokal.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
