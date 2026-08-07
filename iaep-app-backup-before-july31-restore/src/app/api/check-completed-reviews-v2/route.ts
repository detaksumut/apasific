import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let fbCompleted: any[] = [];
    let fbAll: any[] = [];

    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const snap = await db.collection('review_assignments').get();
      
      snap.forEach((doc: any) => {
        const d = doc.data();
        const item = { id: doc.id, ...d };
        fbAll.push(item);
        if (d.status === 'completed') {
          fbCompleted.push(item);
        }
      });
    } catch(e: any) {
      return NextResponse.json({ error: e.message });
    }

    return NextResponse.json({
      totalFirestore: fbAll.length,
      completedFirestoreCount: fbCompleted.length,
      completedFirestoreItems: fbCompleted
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
