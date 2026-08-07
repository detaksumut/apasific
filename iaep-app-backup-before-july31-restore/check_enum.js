const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: d2, error: e2 } = await supabase.from('submissions').select('status').limit(100);
  if (e2) console.error(e2);
  else console.log('Submissions statuses:', [...new Set(d2.map(x=>x.status))]);
}
run();
