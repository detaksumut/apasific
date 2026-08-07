import { NextResponse } from 'next/server';
import { getFirestore } from '@/utils/firebase/db';

export async function GET() {
  try {
    const db = getFirestore();
    await db.collection('submissions').doc('sub_1784062294881_r2jx1m4').update({
      doi: '10.5281/zenodo.21368192'
    });
    return NextResponse.json({ success: true, message: 'Berhasil! DOI telah dikembalikan ke format Zenodo (zenodo.21368192).' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
