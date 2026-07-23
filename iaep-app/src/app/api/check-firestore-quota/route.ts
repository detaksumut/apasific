import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const snap = await db.collection('review_assignments').limit(1).get();
    return NextResponse.json({ success: true, count: snap.size });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
}
