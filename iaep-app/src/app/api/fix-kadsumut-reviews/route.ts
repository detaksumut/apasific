import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const snap = await db.collection('review_assignments')
      .where('reviewer_id', '==', 'demo-user-1784054537519')
      .get();
      
    let updated = 0;
    const batch = db.batch();
    
    snap.docs.forEach(doc => {
       batch.update(doc.ref, {
          reviewer_id: '4dOYvkkPwaONjE25qkiC1C5MOH53',
          reviewer_email: 'kadsumut@gmail.com'
       });
       updated++;
    });
    
    if (updated > 0) {
       await batch.commit();
    }
    
    return NextResponse.json({ success: true, updated_count: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
