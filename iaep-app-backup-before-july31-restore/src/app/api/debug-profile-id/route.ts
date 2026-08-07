import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const doc = await db.collection('profiles').doc('4dOYvkkPwaONjE25qkiC1C5MOH53').get();
    
    return NextResponse.json({
       exists: doc.exists,
       data: doc.exists ? doc.data() : null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
