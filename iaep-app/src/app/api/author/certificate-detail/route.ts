import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getFirestore } from '@/utils/firebase/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing certificate id' }, { status: 400 });

  const supabase = await createClient();
  const db = getFirestore();

  let cert: any = null;

  // 1. Try Supabase
  try {
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .single();
    if (data) cert = data;
  } catch (e) {}

  // 2. Try Firestore fallback if not found in Supabase
  if (!cert) {
    try {
      const doc = await db.collection('certificates').doc(id).get();
      if (doc.exists) {
        const data = doc.data()!;
        cert = {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at || new Date().toISOString()
        };
      }
    } catch (e) {
      console.error("Firestore cert fetch failed", e);
    }
  }

  if (!cert) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  // 3. Resolve user details and submission details
  let authorName = 'Author';
  let title = cert.title || 'Sertifikat Publikasi Naskah';
  let journalName = cert.journal || 'APASIFIC Journal';

  // Get author name from profiles first
  if (cert.user_id) {
    try {
      const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', cert.user_id).single();
      if (prof?.full_name) {
        authorName = prof.full_name;
      } else {
        // Try Firestore profile lookup
        const uDoc = await db.collection('profiles').doc(cert.user_id).get();
        if (uDoc.exists) {
          authorName = uDoc.data()?.full_name || 'Author';
        }
      }
    } catch (e) {}
  }

  // Get submission title, journal, and author name fallback if reference_id exists
  if (cert.reference_id) {
    try {
      const { data: sub } = await supabase
        .from('submissions')
        .select('*, journals:journal_id(name), profiles:author_id(full_name)')
        .eq('id', cert.reference_id)
        .single();
      
      if (sub) {
        title = sub.title;
        if (sub.journals?.name) journalName = sub.journals.name;
        if (sub.profiles?.full_name) authorName = sub.profiles.full_name;
      } else {
        // Try Firestore submission lookup
        const subDoc = await db.collection('submissions').doc(cert.reference_id).get();
        if (subDoc.exists) {
          const sData = subDoc.data()!;
          title = sData.title || title;
          if (sData.journal_id) {
             const { data: jData } = await supabase.from('journals').select('name').eq('id', sData.journal_id).single();
             if (jData) journalName = jData.name;
          }

          // Resolve author name from Firestore submission data
          let subAuthor = '';
          try {
            const parsed = typeof sData.abstract === 'string' ? JSON.parse(sData.abstract) : sData.abstract;
            if (parsed?.authors?.[0]?.full_name) subAuthor = parsed.authors[0].full_name;
          } catch (e) {}
          if (!subAuthor) subAuthor = sData.author || sData.author_name;
          if (subAuthor) authorName = subAuthor;
        }
      }
    } catch (e) {}
  }

  // Double fallback check: if authorName is still 'Author', check the abstract from Firestore submissions for this user
  if (authorName === 'Author' && cert.user_id) {
    try {
      const subSnapshot = await db.collection('submissions').where('author_id', '==', cert.user_id).limit(1).get();
      if (!subSnapshot.empty) {
        const sData = subSnapshot.docs[0].data();
        let subAuthor = '';
        try {
          const parsed = typeof sData.abstract === 'string' ? JSON.parse(sData.abstract) : sData.abstract;
          if (parsed?.authors?.[0]?.full_name) subAuthor = parsed.authors[0].full_name;
        } catch (e) {}
        if (!subAuthor) subAuthor = sData.author || sData.author_name;
        if (subAuthor) authorName = subAuthor;
      }
    } catch (e) {}
  }

  return NextResponse.json({
    certificate: {
      id: cert.id,
      title: title,
      author: authorName,
      journal: journalName,
      edition: cert.edition || 'Vol. 2 No. 1 (2026)',
      date: cert.date || (cert.created_at ? new Date(cert.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID')),
      type: cert.type || 'author_publication',
      reference_id: cert.reference_id
    }
  });
}
