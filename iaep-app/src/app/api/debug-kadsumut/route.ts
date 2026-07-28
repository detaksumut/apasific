import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl) {
        return NextResponse.json({ error: "Missing SUPABASE_URL" });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const email = 'kadsumut@gmail.com';

    let result: any = { email, auth: [], profiles: [], systemSettings: [], localJSON: [] };

    // 1. Check Supabase Auth Users
    const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
    if (!authErr && authUsers) {
        result.auth = authUsers.users.filter(u => u.email === email).map(u => ({
            id: u.id,
            created_at: u.created_at,
            provider: u.app_metadata?.provider
        }));
    }

    // 2. Check Profiles Table
    const { data: profiles, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email);
    
    if (!profErr && profiles) {
        result.profiles = profiles;
    }

    // 3. Check System Settings (JSON)
    const { data: settings } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'apasific_registered_users')
        .single();
    
    if (settings && settings.value) {
        const users = Array.isArray(settings.value) ? settings.value : JSON.parse(settings.value as string);
        result.systemSettings = users.filter((u: any) => u.email === email).map((u: any) => ({
            id: u.id,
            name: u.full_name,
            role: u.role
        }));
    }

    // 4. Check Local JSON
    try {
        const localData = fs.readFileSync(path.join(process.cwd(), 'apasific_registered_users.json'), 'utf-8');
        const localUsers = JSON.parse(localData);
        result.localJSON = localUsers.filter((u: any) => u.email === email).map((u: any) => ({
            id: u.id,
            name: u.full_name,
            role: u.role
        }));
    } catch (e: any) {}

    // Check Firebase
    try {
        const { getFirebaseAdmin } = require('@/utils/firebase/server');
        const admin = getFirebaseAdmin();
        const fbUser = await admin.auth().getUserByEmail(email);
        result.firebase = { id: fbUser.uid, email: fbUser.email, name: fbUser.displayName };
    } catch(e) {
        result.firebase = "Not Found or Error";
    }

    return NextResponse.json(result);
}
