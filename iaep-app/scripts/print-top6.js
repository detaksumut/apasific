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

async function printTop6() {
  const { data: subs } = await supabase
    .from('submissions')
    .select('id, title, created_at, status, file_url, journals(name)')
    .order('created_at', { ascending: false })
    .limit(6);

  console.log(JSON.stringify(subs, null, 2));
}

printTop6();
