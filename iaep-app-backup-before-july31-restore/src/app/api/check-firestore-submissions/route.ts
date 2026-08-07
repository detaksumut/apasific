import { NextResponse } from 'next/server';
import { getFirestore } from '@/utils/firebase/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('submissions').get();
    
    const counts: Record<string, number> = {};
    const publishedDetails: any[] = [];
    
    snapshot.docs.forEach((doc: any) => {
      const data = doc.data();
      const status = data.status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
      
      publishedDetails.push({
        id: doc.id,
        title: data.title || 'Untitled',
        status: data.status,
        journal_id: data.journal_id || null,
        created_at: data.created_at?.toDate ? data.created_at.toDate().toISOString() : data.created_at || null
      });
    });

    return NextResponse.json({ 
      success: true, 
      total_submissions_in_firestore: snapshot.docs.length,
      counts_by_status: counts,
      submissions: publishedDetails
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
