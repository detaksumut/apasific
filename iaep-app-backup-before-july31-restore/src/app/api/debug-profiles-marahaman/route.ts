import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const result: any = { profiles: [] };
    
    const profilesSnap = await db.collection('profiles').get();
    
    for (const doc of profilesSnap.docs) {
      const data = doc.data();
      if (
        (data.email && data.email.toLowerCase().includes('marahaman')) ||
        (data.username && data.username.toLowerCase().includes('marahaman')) ||
        (data.full_name && data.full_name.toLowerCase().includes('marahaman'))
      ) {
         result.profiles.push({ id: doc.id, ...data });
      }
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
