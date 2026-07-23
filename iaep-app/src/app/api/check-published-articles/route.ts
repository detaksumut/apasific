import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Ambil semua artikel Published dari Supabase beserta nama jurnal
  const { data, error } = await sb
    .from("submissions")
    .select(`id, title, status, stage, doi, zenodo_id, journal_id, journals(name)`)
    .in("status", ["Published", "Accepted", "Production Completed"])
    .order("created_at", { ascending: false });

  const articles = (data || []).map(a => ({
    id: a.id,
    title: (a.title || '').substring(0, 70),
    status: a.status,
    doi: a.doi || '-',
    zenodo_id: a.zenodo_id || '-',
    journal: (a.journals as any)?.name || 'No journal linked',
    journal_id: a.journal_id || null,
  }));

  // Group by journal
  const byJournal: Record<string, any[]> = {};
  for (const art of articles) {
    const jName = art.journal;
    if (!byJournal[jName]) byJournal[jName] = [];
    byJournal[jName].push(art);
  }

  return NextResponse.json({
    total: articles.length,
    by_journal: byJournal,
    error: error?.message || null
  });
}
