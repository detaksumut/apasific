import { NextResponse } from 'next/server';
import { getFirestore } from '@/utils/firebase/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const docId = '7375625f-3137-3834-3436-393333383834';
    const doc = await db.collection('submissions').doc(docId).get();
    
    if (doc.exists) {
      return NextResponse.json({ 
        success: true, 
        id: doc.id,
        data: doc.data()
      });
    }
    return NextResponse.json({ success: false, error: "Document not found" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
