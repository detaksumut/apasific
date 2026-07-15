import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';
import { createClient } from '@/utils/supabase/server';
import { getFirestore } from '@/utils/firebase/db';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const url = new URL(req.url);
  const submissionId = url.searchParams.get('id');
  if (!submissionId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = await createClient();
  const db = getFirestore();

  // 1. Supabase history
  const { data: sbHistory } = await supabase
    .from('submission_history')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });

  let history: any[] = sbHistory || [];

  // 2. Firestore history fallback
  if (history.length === 0) {
    try {
      const fbSnap = await db.collection('submission_history')
        .where('submission_id', '==', submissionId)
        .orderBy('created_at', 'asc')
        .get();
      history = fbSnap.docs.map(doc => {
        const d = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          ...d,
          created_at: d.created_at?.toDate ? d.created_at.toDate().toISOString() : new Date().toISOString()
        };
      });
    } catch (e) {
      console.warn('Firestore history fetch failed:', e);
    }
  }

  // 3. If still empty, synthesize initial "Submitted" entry from submission itself
  if (history.length === 0) {
    const { data: sbSub } = await supabase.from('submissions').select('created_at, status').eq('id', submissionId).single();
    if (sbSub) {
      history.push({ id: 'init', action: 'Naskah Disubmit', details: 'Naskah berhasil dikirimkan ke sistem APASIFIC.', created_at: sbSub.created_at });
    } else {
      // Try Firestore
      try {
        const fbDoc = await db.collection('submissions').doc(submissionId).get();
        if (fbDoc.exists) {
          const fd = fbDoc.data() as Record<string, any>;
          const ca = fd.created_at?.toDate ? fd.created_at.toDate().toISOString() : new Date().toISOString();
          history.push({ id: 'init', action: 'Naskah Disubmit', details: 'Naskah berhasil dikirimkan ke sistem APASIFIC.', created_at: ca });
          if (fd.status && fd.status !== 'Pending') {
            history.push({ id: 'status1', action: `Status: ${fd.status}`, details: `Naskah saat ini berstatus ${fd.status}`, created_at: fd.updated_at?.toDate ? fd.updated_at.toDate().toISOString() : ca });
          }
        }
      } catch (e) {}
    }
  }

  return NextResponse.json({ history });
}
