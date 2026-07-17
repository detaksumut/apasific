import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const docRef = db.collection('certificates').doc('HNBeeQd8IAOVoKhSmog0');
    
    await docRef.update({
      edition: 'Vol. 2 No. 1 (2026)',
      journal: 'AJITE - Journal of IT & Engineering'
    });

    return NextResponse.json({ success: true, message: "Certificate reverted to Vol. 2 No. 1" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
