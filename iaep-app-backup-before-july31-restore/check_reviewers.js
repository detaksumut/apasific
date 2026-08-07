const fs = require('fs');
const envConfig = fs.readFileSync('.env.local', 'utf8').split('\n');
for (let line of envConfig) {
  if (line.includes('=')) {
    const [key, val] = line.split('=');
    process.env[key.trim()] = val.trim();
  }
}
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error, count } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'reviewer');
  if (error) {
    console.error(error);
  } else {
    console.log(`TOTAL REVIEWERS IN APASIFIC DB: ${count}`);
    if (data.length > 0) {
      console.log("Samples:");
      console.log(data.slice(0, 5).map(r => `- ${r.full_name} (${r.academic_field})`).join('\n'));
    }
  }
}
check();
