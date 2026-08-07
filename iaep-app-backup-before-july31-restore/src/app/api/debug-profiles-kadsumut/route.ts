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
        (data.email && data.email.toLowerCase().includes('kadsumut')) ||
        (data.username && data.username.toLowerCase().includes('kadsumut')) ||
        (data.full_name && data.full_name.toLowerCase().includes('kadsumut'))
      ) {
         result.profiles.push({ id: doc.id, ...data });
      }
    }
    
    // Check if there are users with role = 'reviewer' to see who they are
    result.all_reviewers = [];
    for (const doc of profilesSnap.docs) {
       const data = doc.data();
       if (data.role === 'reviewer' || data.role === 'co-admin' || (data.roles && data.roles.includes('reviewer'))) {
          result.all_reviewers.push({ id: doc.id, email: data.email, role: data.role, full_name: data.full_name });
       }
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
