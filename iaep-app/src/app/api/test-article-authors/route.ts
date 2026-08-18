import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const id = '728aa905-57c4-492b-b1df-a8e6518918e4';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: article, error: articleError } = await supabase
    .from('submissions')
    .select('id, title, author, author_id, status')
    .eq('id', id)
    .maybeSingle();

  const { data: authors, error: authorsError } = await supabase
    .from('article_authors')
    .select('*')
    .eq('article_id', id)
    .order('author_order', { ascending: true });

  return NextResponse.json({
    article,
    articleError,
    article_authors: authors,
    authorsError
  });
}
