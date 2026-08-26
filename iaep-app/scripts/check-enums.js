const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function inspectEnum() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  let supabaseUrl = '';
  let supabaseServiceKey = '';
  envFile.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseServiceKey = line.split('=')[1].trim().replace(/['"]/g, '');
  });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase.from('profiles').select('role');
  const roles = [...new Set(data.map(d => d.role))];
  console.log('Existing roles in profiles table:', roles);
}

inspectEnum();
