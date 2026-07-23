import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    
    // Check if kadsumut profile exists
    const snap = await db.collection('profiles').where('email', '==', 'kadsumut@gmail.com').get();
    
    if (snap.empty) {
        // Create one
        await db.collection('profiles').doc('4dOYvkkPwaONjE25qkiC1C5MOH53').set({
            email: 'kadsumut@gmail.com',
            full_name: 'Marahaman',
            role: 'reviewer',
            academic_field: 'General',
            created_at: new Date()
        });
        return NextResponse.json({ created: true });
    }
    
    // Ensure role is reviewer
    const doc = snap.docs[0];
    if (doc.data().role !== 'reviewer') {
        await doc.ref.update({ role: 'reviewer' });
        return NextResponse.json({ updated: true });
    }
    
    return NextResponse.json({ exists: true, data: doc.data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
