import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: specific } = await supabase
    .from('submissions')
    .select('id, title, file_url, blind_manuscript_url, status')
    .eq('id', '8f8ddddb-d5a2-460e-ab21-f5d59ad8e6a0');

  const { data: underReview } = await supabase
    .from('submissions')
    .select('id, title, file_url, blind_manuscript_url, status')
    .in('status', ['Editor Assigned', 'Under Review'])
    .order('created_at', { ascending: false })
    .limit(10);
    
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, manuscript_file, submission_id, status')
    .eq('submission_id', '8f8ddddb-d5a2-460e-ab21-f5d59ad8e6a0');

  console.log(JSON.stringify({ specific, underReview, reviews }, null, 2));
}

check();
