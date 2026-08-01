const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aroasmlrlpjbjokvxlgo.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg';
const supabaseAdmin = createClient(url, key, { auth: { persistSession: false } });

async function checkAuth() {
  console.log("Checking Supabase Auth...");
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.log("Auth is DOWN:", error);
  } else {
    console.log(`Auth is UP! Found ${data.users.length} users.`);
    // Try to find the users
    const emails = ['kadinmedan1@gmail.com', 'kadsumut@gmail.com'];
    for (const email of emails) {
      const user = data.users.find(u => u.email === email);
      if (user) {
        console.log(`${email} EXISTS in Supabase Auth.`);
      } else {
        console.log(`${email} DOES NOT EXIST in Supabase Auth!`);
      }
    }
  }
}
checkAuth();
