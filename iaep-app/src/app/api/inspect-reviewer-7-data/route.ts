import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();

    const snap = await db.collection('review_assignments').get();

    const fbItems: any[] = [];
    snap.forEach((doc: any) => {
      const d = doc.data();
      fbItems.push({
        id: doc.id,
        submission_id: d.submission_id,
        reviewer_id: d.reviewer_id,
        reviewer_email: d.reviewer_email,
        status: d.status
      });
    });

    const completed = fbItems.filter(i => i.status === 'completed');

    return NextResponse.json({
      totalFirestoreAssignments: fbItems.length,
      completedCount: completed.length,
      completedItems: completed
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
