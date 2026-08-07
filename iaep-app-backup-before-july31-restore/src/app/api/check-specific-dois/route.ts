import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const targetDois = [
      '10.5281/zenodo.21633609',
      '10.5281/zenodo.21580255',
      '10.5281/zenodo.21535734',
      '10.5281/zenodo.21535711',
      '10.5281/zenodo.21535685',
      '10.5281/zenodo.21535656'
    ];

    const targetZenodoIds = targetDois.map(doi => doi.split('.').pop() || '');

    // Cari di tabel submissions
    const { data, error } = await supabaseAdmin
      .from('submissions')
      .select('id, title, status, stage, doi, zenodo_id, created_at')
      .or(`doi.in.(${targetDois.join(',')}),zenodo_id.in.(${targetZenodoIds.join(',')})`);

    if (error) throw error;

    const results = targetDois.map(doi => {
      const zenId = doi.split('.').pop() || '';
      const found = (data || []).find(s => 
        (s.doi && s.doi.trim() === doi) || 
        (s.zenodo_id && String(s.zenodo_id).trim() === zenId)
      );

      return {
        doi,
        zenodo_id: zenId,
        found_in_database: !!found,
        database_record: found || null
      };
    });

    return NextResponse.json({
      success: true,
      query_count: targetDois.length,
      results
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
