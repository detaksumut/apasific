import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getFirestore } from '@/utils/firebase/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = await createClient();
  const db = getFirestore();

  // 1. Try Supabase
  const { data: sbSub } = await supabase
    .from('submissions')
    .select('*, journals(name), profiles(full_name)')
    .eq('id', id)
    .single();

  if (sbSub) return NextResponse.json({ submission: sbSub });

  // 2. Firestore fallback
  try {
    const doc = await db.collection('submissions').doc(id).get();
    if (doc.exists) {
      const fd = doc.data() as Record<string, any>;

      let jName = 'APASIFIC Journal';
      if (fd.journal_id) {
        const { data: jData } = await supabase.from('journals').select('name').eq('id', fd.journal_id).single();
        if (jData) jName = jData.name;
      }

      let authorName = 'Author';
      // Try to get author name from abstract JSON (authors array)
      try {
        const parsed = typeof fd.abstract === 'string' ? JSON.parse(fd.abstract) : fd.abstract;
        if (parsed?.authors?.[0]?.full_name) authorName = parsed.authors[0].full_name;
      } catch (e) {}

      // Fallback to Supabase profile
      if (authorName === 'Author' && fd.author_id) {
        const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', fd.author_id).single();
        if (prof?.full_name) authorName = prof.full_name;
      }

      return NextResponse.json({
        submission: {
          id: doc.id,
          title: fd.title,
          status: fd.status,
          created_at: fd.created_at?.toDate ? fd.created_at.toDate().toISOString() : new Date().toISOString(),
          journals: { name: jName },
          profiles: { full_name: authorName },
        }
      });
    }
  } catch (e) {
    console.error('Firestore submission fetch failed:', e);
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
