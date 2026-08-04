import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  try {
    // 1. Get AJAF journal ID
    const { data: ajafJournals } = await supabaseAdmin
      .from('journals')
      .select('id, name')
      .ilike('name', '%AJAF%');

    let ajafId = ajafJournals?.[0]?.id;

    if (!ajafId) {
      // Find or insert AJAF journal
      const { data: newJ } = await supabaseAdmin
        .from('journals')
        .insert({ name: 'AJAF - Akuntansi, Audit & Perpajakan', abbreviation: 'AJAF' })
        .select('id')
        .single();
      ajafId = newJ?.id;
    }

    if (!ajafId) {
      return NextResponse.json({ error: 'AJAF journal not found' }, { status: 404 });
    }

    // 2. Update submission 7375625f-3137-3834-3532-323331373834 and any Zakat/Tax articles to AJAF
    const { data: updated, error } = await supabaseAdmin
      .from('submissions')
      .update({ journal_id: ajafId })
      .or(`id.eq.7375625f-3137-3834-3532-323331373834,title.ilike.%Zakat and Tax Accounting%`)
      .select('id, title, journal_id');

    return NextResponse.json({ 
      success: true, 
      ajafId, 
      updatedCount: updated?.length || 0,
      updated 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
