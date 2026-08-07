import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Sama persis dengan query di AJAF page
  const { data: ajafJournals } = await sb.from('journals').select('id, name').ilike('name', '%AJAF%');
  const ajafIds = (ajafJournals || []).map((j: any) => j.id);

  const { data, error } = await sb
    .from("submissions")
    .select(`id, title, status, doi, zenodo_id, journal_id, journals(name)`)
    .in("status", ["Published", "Accepted", "Production Completed"])
    .in('journal_id', ajafIds.length > 0 ? ajafIds : ['no-id']);

  return NextResponse.json({
    ajaf_journals: ajafJournals,
    ajaf_ids: ajafIds,
    articles_found: data?.length || 0,
    articles: data?.map(a => ({ id: a.id, title: (a.title || '').substring(0, 60), status: a.status, journal_id: a.journal_id, journal_name: (a.journals as any)?.name })),
    error: error?.message || null
  });
}
