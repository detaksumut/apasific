const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = 'https://aroasmlrlpjbjokvxlgo.supabase.co';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    const val = v.join('=').trim().replace(/^["']|["']$/g, '');
    if (k.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
    if (k.trim() === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = val;
    if (!supabaseKey && k.trim() === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = val;
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findReview() {
  const id = '37d7642f-c75a-4b7e-b27b-1294840aed52';
  const { data: rev } = await supabase.from('review_assignments').select('*').eq('id', id);
  console.log('Direct ID search in review_assignments:', rev);

  const { data: bySubId } = await supabase.from('submissions').select('*').eq('id', id);
  console.log('Direct ID search in submissions:', bySubId);

  // Search if any table has 37d7642f
  const tables = ['submissions', 'review_assignments', 'articles', 'decisions', 'production_assignments'];
  for (const t of tables) {
    try {
      const { data } = await supabase.from(t).select('*').eq('id', id);
      if (data && data.length > 0) {
        console.log(`Found in table ${t}:`, data);
      }
    } catch(e) {}
  }
}

findReview();
