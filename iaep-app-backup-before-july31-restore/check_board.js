require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkBoard() {
  const { data, error } = await supabase.from('leadership').select('body_name, members_json').like('body_name', 'Editorial Board%');
  if (error) { console.error(error); return; }
  
  if (!data || data.length === 0) {
      console.log('No Editorial Boards found in database.');
      return;
  }

  data.forEach(board => {
     console.log('\n--- ' + board.body_name + ' ---');
     let members = [];
     if (typeof board.members_json === 'string') {
        try { members = JSON.parse(board.members_json); } catch(e) {}
     } else {
        members = board.members_json || [];
     }
     
     let found = false;
     members.forEach(m => {
       const j = (m.jabatan || '').toLowerCase();
       if (j.includes('layout') || j.includes('cover') || j.includes('publish') || j.includes('admin') || j.includes('copy')) {
         console.log('- ' + m.jabatan + ': ' + m.nama);
         found = true;
       }
     });
     
     if (!found) console.log('- Belum ada staf produksi yang ditambahkan ke jurnal ini.');
  });
}
checkBoard();
