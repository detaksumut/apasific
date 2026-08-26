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

async function inspectSub() {
  const id = '3866e0a6-3b57-48ca-8bcd-4646af83c017';
  console.log(`Inspecting submission ID ${id} ...`);

  const { data: sub, error: subErr } = await supabase
    .from('submissions')
    .select('*, journals(name, slug)')
    .eq('id', id)
    .single();

  if (subErr) {
    console.error('Sub error:', subErr);
  } else {
    console.log('=== SUBMISSION DATA ===');
    console.log(JSON.stringify(sub, null, 2));

    // Get author info
    if (sub.author_id) {
      const { data: author } = await supabase.from('profiles').select('*').eq('id', sub.author_id).single();
      console.log('=== AUTHOR PROFILE ===', author);
    }
  }

  // Check review assignments
  const { data: revs } = await supabase.from('review_assignments').select('*, profiles:reviewer_id(full_name, email)').eq('submission_id', id);
  console.log('=== REVIEW ASSIGNMENTS ===', revs);
}

inspectSub();
