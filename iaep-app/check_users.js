const fs = require('fs');
const envConfig = fs.readFileSync('.env.local', 'utf8').split('\n');
for (let line of envConfig) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    process.env[key.trim()] = rest.join('=').trim();
  }
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkUsers() {
  // Total per role
  const { data: all, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ERROR:', error.message);
    return;
  }

  const roles = {};
  for (const u of all) {
    roles[u.role] = (roles[u.role] || 0) + 1;
  }

  console.log('\n=== APASIFIC IAEEA — USER DATABASE REPORT ===');
  console.log(`Total Users: ${all.length}`);
  console.log('\nBreakdown by Role:');
  for (const [role, count] of Object.entries(roles)) {
    console.log(`  - ${role}: ${count} users`);
  }

  console.log('\nLatest 10 Registered Users:');
  all.slice(0, 10).forEach((u, i) => {
    const date = new Date(u.created_at).toLocaleDateString('id-ID');
    console.log(`  ${i+1}. ${u.full_name || '(no name)'} | ${u.email || '(no email)'} | Role: ${u.role} | Joined: ${date}`);
  });
}

checkUsers();
