import { NextResponse } from 'next/server';
import { getFirestore } from '@/utils/firebase/db';

export async function GET() {
  const db = getFirestore();
  const doc = await db.collection('submissions').doc('sub_1784062294881_r2jx1m4').get();
  const data = doc.data() || {};
  
  const textToSearch = JSON.stringify(data);
  const doiRegex = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;
  const matches = textToSearch.match(doiRegex);
  
  return NextResponse.json({
    hasDoi: !!matches,
    matches: matches || []
  });
}
