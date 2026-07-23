import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();

    // Get the specific assignment for Dr. Eko
    const snap = await db.collection('review_assignments').get();
    const results = snap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      // convert timestamps to readable strings
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at,
      updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || doc.data().updated_at,
      accepted_at: doc.data().accepted_at?.toDate?.()?.toISOString() || doc.data().accepted_at,
      assigned_at: doc.data().assigned_at?.toDate?.()?.toISOString() || doc.data().assigned_at,
      deadline: doc.data().deadline?.toDate?.()?.toISOString() || doc.data().deadline,
    }));

    return NextResponse.json({ count: results.length, data: results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
