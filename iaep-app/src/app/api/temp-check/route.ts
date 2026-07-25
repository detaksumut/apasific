import { NextResponse } from 'next/server';

export async function GET() {
  let results: any[] = [];
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    if (db) {
      const collections = ['submissions', 'review_assignments', 'reviews'];
      for (const col of collections) {
        const snap = await db.collection(col).get();
        snap.forEach(doc => {
          const data = doc.data();
          const str = JSON.stringify(data);
          if (str.toUpperCase().includes('CARBON SEQUESTRATION') || str.toUpperCase().includes('ENHALUS')) {
            results.push({ collection: col, id: doc.id, data });
          }
        });
      }
    }
  } catch(e: any) {
    results.push({ error: e.message });
  }
  return NextResponse.json({ results });
}
