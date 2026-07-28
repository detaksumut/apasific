import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const envPath = 'd:/Users/RJRAKP/rjrakp/.env';
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    let supabaseUrl = '';
    let serviceRoleKey = '';
    
    envContent.split('\n').forEach(line => {
      const tLine = line.trim();
      if (tLine.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = tLine.split('=')[1].trim();
      if (tLine.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=')) serviceRoleKey = tLine.split('=')[1].trim();
    });

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Could not find rjrakp env credentials" });
    }

    const rjrakpClient = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await rjrakpClient
      .from('submissions')
      .select('id, title, status, stage, created_at');

    if (error) throw error;

    const counts = {};
    data.forEach(s => {
      const status = s.status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    });

    const published = data.filter(s => s.status?.toLowerCase() === 'published');

    return NextResponse.json({
      success: true,
      total_submissions_in_rjrakp: data.length,
      counts_by_status: counts,
      published_submissions: published
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
