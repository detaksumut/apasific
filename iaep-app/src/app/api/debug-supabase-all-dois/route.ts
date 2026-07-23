import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: pubArticles } = await supabase.from('published_articles').select('*');
  const { data: submissions } = await supabase.from('submissions').select('id, journal_id, title, doi').not('doi', 'is', null);
  
  return NextResponse.json({ 
    published_articles: pubArticles,
    submissions_with_doi: submissions
  });
}
