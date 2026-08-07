import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const doc = await db.collection('submissions').doc('sub_1784062294881_r2jx1m4').get();
    
    if (doc.exists) {
        return NextResponse.json({ data: doc.data() });
    }
    return NextResponse.json({ error: "Not found" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
