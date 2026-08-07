import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const snap = await db.collection('review_assignments').get();
    
    let all: any[] = [];
    snap.docs.forEach((doc: any) => {
       all.push({id: doc.id, reviewer_id: doc.data().reviewer_id, email: doc.data().reviewer_email});
    });
    
    return NextResponse.json({ assignments: all });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
