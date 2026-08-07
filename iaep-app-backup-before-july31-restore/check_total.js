const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

global.WebSocket = require('ws');

async function checkTotal() {
  try {
    const envPath = 'd:/Users/RJRAKP/rjrakp/.env';
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    let supabaseUrl = '';
    let serviceRoleKey = '';
    
    envContent.split('\n').forEach(line => {
      const tLine = line.trim();
      if (tLine.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = tLine.split('=')[1].trim();
      if (tLine.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=')) serviceRoleKey = tLine.split('=')[1].trim();
    });

    const rjrakpAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false }});

    const { data, error, count } = await rjrakpAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'reviewer');

    if (error) throw error;

    console.log("=======================================");
    console.log(`TOTAL REVIEWER DI DATABASE RJRAKP SAAT INI: ${count} ORANG`);
    console.log("=======================================");

  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkTotal();
