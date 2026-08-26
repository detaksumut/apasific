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

async function searchAll() {
  console.log('Searching all submissions...');
  const { data: allSubs } = await supabase
    .from('submissions')
    .select('id, title, file_url, status, journals(name)');

  console.log(`Total submissions: ${allSubs?.length || 0}`);
  
  const keywords = ['maqasid', 'systematic', 'literature', 'perspective', 'agenda', '1786716379913'];

  for (const s of allSubs || []) {
    const fullStr = `${s.id} ${s.title} ${s.file_url}`.toLowerCase();
    const matched = keywords.filter(k => fullStr.includes(k));
    if (matched.length > 0) {
      console.log(`\nMatch found for [${matched.join(', ')}]:`);
      console.log(`ID: ${s.id}`);
      console.log(`Title: ${s.title}`);
      console.log(`File: ${s.file_url}`);
      console.log(`Status: ${s.status}`);
      console.log(`Journal: ${s.journals?.name}`);
    }
  }

  // Also search review assignments
  const { data: allRevs } = await supabase.from('review_assignments').select('*');
  console.log(`\nTotal review assignments: ${allRevs?.length || 0}`);
  for (const r of allRevs || []) {
    const fullStr = JSON.stringify(r).toLowerCase();
    const matched = keywords.filter(k => fullStr.includes(k));
    if (matched.length > 0) {
      console.log(`\nReview Match found [${matched.join(', ')}]:`, r);
    }
  }
}

searchAll();
