const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function updateDanilProfile() {
  console.log('=== UPDATE DANIL PROFILE AS SUPERVISOR ===\n');

  const envFile = fs.readFileSync('.env.local', 'utf8');
  let supabaseUrl = '';
  let supabaseServiceKey = '';
  envFile.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseServiceKey = line.split('=')[1].trim().replace(/['"]/g, '');
  });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      role: 'supervisor',
      status: 'Active',
      full_name: 'Muhammad Danil'
    })
    .ilike('email', 'danil@apasific.org')
    .select();

  if (error) {
    console.error('Error updating profile:', error);
  } else {
    console.log('Successfully updated danil profile:', JSON.stringify(data, null, 2));
  }
}

updateDanilProfile();
