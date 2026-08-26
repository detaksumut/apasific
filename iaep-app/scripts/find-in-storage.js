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

async function findInStorage() {
  console.log('Listing all buckets in Supabase Storage...');
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log('Buckets:', buckets?.map(b => b.name));

  for (const b of buckets || []) {
    const { data: files } = await supabase.storage.from(b.name).list('', { limit: 100 });
    for (const f of files || []) {
      if (f.name.includes('1786716379913') || f.name.toLowerCase().includes('maqasid') || f.name.toLowerCase().includes('sustainability')) {
        console.log(`[Bucket: ${b.name}] MATCH ROOT: ${f.name}`);
      }
      if (!f.id) { // folder
        const { data: subFiles } = await supabase.storage.from(b.name).list(f.name, { limit: 100 });
        for (const sf of subFiles || []) {
          if (sf.name.includes('1786716379913') || sf.name.toLowerCase().includes('maqasid') || sf.name.toLowerCase().includes('sustainability')) {
            console.log(`[Bucket: ${b.name}] MATCH SUB: ${f.name}/${sf.name}`);
          }
        }
      }
    }
  }
}

findInStorage();
