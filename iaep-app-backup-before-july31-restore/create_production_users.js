require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const usersToCreate = [
  { name: "Kun Syafi'i Habibi", email: "kun@apasific.org", role: "layout" },
  { name: "Rizky Al Ridho", email: "rizky@apasific.org", role: "cover" },
  { name: "Parida Hannum", email: "parida@apasific.org", role: "publish" },
  { name: "Muhammad Danil", email: "danil@apasific.org", role: "admin" }
];
const password = "mikrosistem";

async function run() {
  for (const u of usersToCreate) {
    console.log(`Creating user ${u.name} (${u.email})...`);
    
    // 1. Create in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: password,
      email_confirm: true
    });
    
    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`- ${u.email} already exists. Attempting to update profile...`);
        // Find user by email
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = listData.users.find(x => x.email === u.email);
        if (existingUser) {
           await ensureProfile(existingUser.id, u);
        }
      } else {
        console.error(`- Error creating auth for ${u.email}:`, authError.message);
      }
      continue;
    }
    
    console.log(`- Auth created: ID ${authData.user.id}`);
    await ensureProfile(authData.user.id, u);
  }
  console.log("Done!");
}

async function ensureProfile(userId, u) {
    // 2. Upsert Profile
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: u.name,
      email: u.email,
      role: u.role,
      updated_at: new Date().toISOString()
    });
    
    if (profileError) {
       console.error(`- Error creating profile for ${u.email}:`, profileError.message);
    } else {
       console.log(`- Profile updated successfully with role: ${u.role}.`);
    }
}

run();
