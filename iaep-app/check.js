require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.from('submissions').select('*').eq('id', '7375625f-3137-3834-3532-323331373834').single();
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}

run();
