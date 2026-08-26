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

async function listFolder() {
  const folder = '3866e0a6-3b57-48ca-8bcd-4646af83c017';
  const { data: files } = await supabase.storage.from('manuscripts').list(folder);
  console.log(`Files in ${folder}:`, files);

  // Check if any submission in Supabase or Firestore has file_url matching this folder
  const { data: subs } = await supabase.from('submissions').select('*').ilike('file_url', `%${folder}%`);
  console.log('Submissions with this folder in file_url:', subs);
}

listFolder();
