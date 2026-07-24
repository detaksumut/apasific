import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabaseAdmin.storage.from('documents').list('galleys');
  console.log('GALLEYS:', data);
  const { data: d2 } = await supabaseAdmin.storage.from('documents').list('');
  console.log('DOCS:', d2);
}
run();
