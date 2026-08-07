import { NextResponse } from 'next/server';
import { getFirestore } from '@/utils/firebase/db';

export async function GET() {
  const db = getFirestore();
  const doc = await db.collection('submissions').doc('sub_1784062294881_r2jx1m4').get();
  const data = doc.data();
  return NextResponse.json({
    data: data,
    keys: Object.keys(data || {})
  });
}
