import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const result: any = {
      all_assignments: []
    };
    
    const assignmentsSnap = await db.collection('review_assignments').get();
    
    for (const doc of assignmentsSnap.docs) {
      const data = doc.data();
      const subDoc = await db.collection('submissions').doc(data.submission_id).get();
      let subTitle = 'Unknown';
      let subJournal = 'Unknown';
      
      if (subDoc.exists) {
         const subData = subDoc.data()!;
         subTitle = subData.title || 'No Title';
         subJournal = subData.journal_id || 'No Journal ID';
      }
      
      result.all_assignments.push({
        id: doc.id,
        reviewer_id: data.reviewer_id,
        reviewer_email: data.reviewer_email || 'No email',
        submission_id: data.submission_id,
        status: data.status,
        journal_id: subJournal,
        submission_title: subTitle
      });
    }
    
    // Also let's check who kadsumut@gmail.com is in profiles
    const profilesSnap = await db.collection('profiles').where('email', '==', 'kadsumut@gmail.com').get();
    result.kadsumut_profile = profilesSnap.docs.map(d => ({id: d.id, ...d.data()}));
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
