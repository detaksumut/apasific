import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('leadership').select('body_name, members_json').like('body_name', 'Editorial Board%');
  
  if (error) return NextResponse.json({ error: error.message });
  
  let result = '';
  if (!data || data.length === 0) return NextResponse.json({ result: 'No data' });
  
  data.forEach(board => {
     result += `\n--- ${board.body_name} ---\n`;
     let members: any[] = [];
     if (typeof board.members_json === 'string') {
        try { members = JSON.parse(board.members_json); } catch(e) {}
     } else {
        members = board.members_json || [];
     }
     
     let found = false;
     members.forEach((m: any) => {
       const j = (m.jabatan || '').toLowerCase();
       if (j.includes('layout') || j.includes('cover') || j.includes('publish') || j.includes('admin') || j.includes('copy')) {
         result += `- ${m.jabatan}: ${m.nama}\n`;
         found = true;
       }
     });
     
     if (!found) result += `- Belum ada staf produksi yang ditambahkan ke jurnal ini.\n`;
  });
  
  return NextResponse.json({ result });
}
