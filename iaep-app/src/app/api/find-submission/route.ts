import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();

    // Find all submissions
    const snap = await db.collection('submissions').orderBy('created_at', 'desc').get();

    const results = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title,
        author: d.author,
        author_email: d.author_email,
        stage: d.stage,
        status: d.status,
        file_url: d.file_url || null,
        revised_file_url: d.revised_file_url || null,
        created_at: d.created_at ? d.created_at.toDate().toISOString() : null,
      };
    });

    return NextResponse.json({ count: results.length, data: results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
