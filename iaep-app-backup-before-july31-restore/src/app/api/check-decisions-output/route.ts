import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: supaData } = await supabaseAdmin
      .from("submissions")
      .select("*, journals(name)")
      .order("updated_at", { ascending: false });

    let articles: any[] = [];
    if (supaData) {
      const isDecisionDoc = (a: any) => 
        ["Accepted", "accepted", "Rejected", "rejected", "Desk Reject", "Published", "Production Completed"].includes(a.status) ||
        Boolean(a.doi || a.zenodo_id);

      const filtered = supaData.filter(isDecisionDoc);

      const seenTitles = new Set<string>();
      articles = filtered.filter(a => {
        const clean = (a.title || '').trim().toLowerCase();
        if (!clean || seenTitles.has(clean)) return false;
        seenTitles.add(clean);
        return true;
      });
    }

    return NextResponse.json({
      count: articles.length,
      articles: articles.map(a => ({
        id: a.id,
        title: a.title,
        status: a.status,
        doi: a.doi
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
