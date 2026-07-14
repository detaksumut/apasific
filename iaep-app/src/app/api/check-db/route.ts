import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Cek jumlah data di tabel-tabel utama
    const { count: profilesCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
    const { count: submissionsCount } = await supabaseAdmin.from('submissions').select('*', { count: 'exact', head: true });
    const { count: reviewsCount } = await supabaseAdmin.from('review_assignments').select('*', { count: 'exact', head: true });
    const { count: settingsCount } = await supabaseAdmin.from('system_settings').select('*', { count: 'exact', head: true });
    
    return NextResponse.json({ 
        success: true,
        data_counts: {
            profiles: profilesCount,
            submissions: submissionsCount,
            review_assignments: reviewsCount,
            system_settings: settingsCount
        }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
