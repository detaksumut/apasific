import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const result: any = { profiles: [] };
    
    const snap = await db.collection('profiles').get();
    
    snap.docs.forEach(doc => {
       const data = doc.data();
       if (data.email === 'kadsumut@gmail.com') {
          result.profiles.push({ id: doc.id, ...data });
       }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
