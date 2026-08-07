import { NextResponse } from 'next/server';
import { getFirestore } from '@/utils/firebase/db';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

function toUuid(id: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
  const hex = Buffer.from(id).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const supabase = await createClient();
  const db = getFirestore();

  const userId = user.id;
  const uuidId = toUuid(userId);
  const searchIds = Array.from(new Set([userId, uuidId]));

  // 1. Supabase
  const { data: sbSubs } = await supabase
    .from('submissions')
    .select('*, journals(name)')
    .in('author_id', searchIds)
    .order('created_at', { ascending: false });

  const finalSubs: any[] = sbSubs ? [...sbSubs] : [];

  // 2. Firestore
  try {
    for (const searchId of searchIds) {
      const fbSnap = await db.collection('submissions').where('author_id', '==', searchId).get();
      for (const doc of fbSnap.docs) {
        if (!finalSubs.find(s => s.id === doc.id)) {
          const fbData = doc.data() as Record<string, any>;
          let jName = 'APASIFIC Jurnal';
          if (fbData.journal_id) {
            const { data: jData } = await supabase.from('journals').select('name').eq('id', fbData.journal_id).single();
            if (jData) jName = jData.name;
          }
          finalSubs.push({
            id: doc.id,
            ...fbData,
            journals: { name: jName },
            created_at: fbData.created_at?.toDate ? fbData.created_at.toDate().toISOString() : new Date().toISOString(),
            updated_at: fbData.updated_at?.toDate ? fbData.updated_at.toDate().toISOString() : new Date().toISOString(),
          });
        }
      }
    }
  } catch (err) {
    console.warn('Firestore submissions fetch error', err);
  }

  finalSubs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ submissions: finalSubs });
}
