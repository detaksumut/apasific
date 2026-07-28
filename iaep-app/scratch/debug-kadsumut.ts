import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkKadsumut() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl) {
        console.error("Missing SUPABASE_URL");
        return;
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const email = 'kadsumut@gmail.com';

    console.log(`\n=== INVESTIGATING: ${email} ===\n`);

    // 1. Check Supabase Auth Users
    console.log("1. Checking Supabase Auth (auth.users)...");
    const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
    if (authErr) {
        console.error("Error fetching auth users:", authErr.message);
    } else {
        const matches = authUsers.users.filter(u => u.email === email);
        console.log(`Found ${matches.length} matches in Auth:`);
        matches.forEach(u => console.log(` - ID: ${u.id}, Created: ${u.created_at}, Provider: ${u.app_metadata?.provider}`));
    }

    // 2. Check Profiles Table
    console.log("\n2. Checking Supabase Profiles (public.profiles)...");
    const { data: profiles, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email);
    
    if (profErr) {
        console.error("Error fetching profiles:", profErr.message);
    } else {
        console.log(`Found ${profiles.length} matches in Profiles:`);
        profiles.forEach(p => console.log(` - ID: ${p.id}, Name: ${p.full_name}, Role: ${p.role}`));
    }

    // 3. Check System Settings (JSON)
    console.log("\n3. Checking System Settings (apasific_registered_users)...");
    const { data: settings } = await supabaseAdmin
        .from('system_settings')
        .select('value')
        .eq('key', 'apasific_registered_users')
        .single();
    
    if (settings && settings.value) {
        const users = Array.isArray(settings.value) ? settings.value : JSON.parse(settings.value);
        const matches = users.filter((u: any) => u.email === email);
        console.log(`Found ${matches.length} matches in system_settings:`);
        matches.forEach((u: any) => console.log(` - ID: ${u.id}, Name: ${u.full_name}, Role: ${u.role}`));
    }

    // 4. Check Local JSON
    console.log("\n4. Checking Local apasific_registered_users.json...");
    try {
        const localData = fs.readFileSync(path.join(process.cwd(), 'apasific_registered_users.json'), 'utf-8');
        const localUsers = JSON.parse(localData);
        const matches = localUsers.filter((u: any) => u.email === email);
        console.log(`Found ${matches.length} matches locally:`);
        matches.forEach((u: any) => console.log(` - ID: ${u.id}, Name: ${u.full_name}, Role: ${u.role}`));
    } catch (e: any) {
        console.log("Could not read local JSON:", e.message);
    }
}

checkKadsumut();
