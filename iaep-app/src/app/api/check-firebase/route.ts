import { NextResponse } from 'next/server';
import { getFirestore } from '@/utils/firebase/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('profiles').count().get();
    const count = snapshot.data().count;

    return NextResponse.json({ 
        success: true, 
        message: 'Koneksi Firestore Berhasil',
        total_profiles_in_firestore: count
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
