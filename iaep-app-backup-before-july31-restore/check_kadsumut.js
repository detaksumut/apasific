const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

try {
  const env = fs.readFileSync('.env.local', 'utf8');
  env.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  });
} catch(e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUser() {
  console.log("Checking profiles...");
  const { data: profiles } = await supabase.from('profiles').select('*').eq('email', 'kadsumut@gmail.com');
  console.log("Profiles:", profiles);

  console.log("Checking certification_candidates...");
  const { data: candidates } = await supabase.from('certification_candidates').select('*').eq('email', 'kadsumut@gmail.com');
  console.log("Candidates:", candidates);

  console.log("Checking Auth...");
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users?.find(u => u.email === 'kadsumut@gmail.com');
  console.log("Auth User:", user ? { id: user.id, email: user.email } : "Not found in auth");
}

checkUser();
