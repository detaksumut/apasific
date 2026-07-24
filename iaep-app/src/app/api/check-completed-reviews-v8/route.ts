import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const snap = await db.collection('submissions').get();

    const items: any[] = [];
    snap.forEach((doc: any) => {
      items.push({ id: doc.id, title: doc.data()?.title });
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
