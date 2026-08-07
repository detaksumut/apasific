const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { error } = await supabase.rpc('run_sql', { sql: 'ALTER TABLE public.review_assignments ADD COLUMN IF NOT EXISTS role_assigner text;' });
  console.log("RPC Error:", error);
}
run();
