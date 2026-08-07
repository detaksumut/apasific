import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const result: any = {
      reviewer_email: 'kadsumut@gmail.com',
      ajaf_journal_id: '5f6bca5a-39e2-442b-a2e0-5b3f35614b4e',
      assignments_found: [],
      articles_reviewed: 0,
      details: []
    };
    
    // First, find the user ID for kadsumut@gmail.com
    const profilesSnap = await db.collection('profiles').where('email', '==', 'kadsumut@gmail.com').get();
    let userId = '';
    if (!profilesSnap.empty) {
      userId = profilesSnap.docs[0].id;
      result.user_id = userId;
    } else {
      // If we can't find by email in profiles, let's just fetch all assignments and filter by email if it exists, or ID.
      // Usually review_assignments has reviewer_id or email
    }

    const assignmentsSnap = await db.collection('review_assignments').get();
    
    for (const doc of assignmentsSnap.docs) {
      const data = doc.data();
      // Check if this assignment belongs to kadsumut
      if (data.reviewer_id === userId || data.reviewer_email === 'kadsumut@gmail.com') {
         // Need to check if it's AJAF. We might need to fetch the submission to check its journal_id
         const subDoc = await db.collection('submissions').doc(data.submission_id).get();
         if (subDoc.exists) {
            const subData = subDoc.data()!;
            if (subData.journal_id === result.ajaf_journal_id) {
               result.assignments_found.push({
                  assignment_id: doc.id,
                  submission_id: data.submission_id,
                  submission_title: subData.title,
                  assignment_status: data.status,
                  submission_status: subData.status
               });
               
               if (data.status === 'completed' || data.status === 'Reviewed') {
                 result.articles_reviewed++;
                 result.details.push(subData.title);
               }
            }
         }
      }
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
