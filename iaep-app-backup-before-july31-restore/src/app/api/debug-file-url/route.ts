import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();

        const hexId = '7375625f-3137-3834-3436-353736303538';
        const originalId = 'sub_17-84-46-576058';

        const { data: d1 } = await supabase.from('submissions').select('id, title, file_url, revised_file_url').eq('id', hexId).single();
        const { data: d2 } = await supabase.from('submissions').select('id, title, file_url, revised_file_url').eq('id', originalId).single();

        let f1 = null, f2 = null;
        try {
            const doc1 = await db.collection('submissions').doc(hexId).get();
            if(doc1.exists) f1 = doc1.data();
        } catch(e) {}
        try {
            const doc2 = await db.collection('submissions').doc(originalId).get();
            if(doc2.exists) f2 = doc2.data();
        } catch(e) {}

        const { data: revs } = await supabase.from('review_assignments').select('*').eq('submission_id', hexId);
        const { data: revs2 } = await supabase.from('review_assignments').select('*').eq('submission_id', originalId);

        return NextResponse.json({
            supabaseHex: d1,
            supabaseOrig: d2,
            firestoreHex: f1 ? { id: hexId, title: f1.title, file_url: f1.file_url } : null,
            firestoreOrig: f2 ? { id: originalId, title: f2.title, file_url: f2.file_url } : null,
            reviewsHex: revs,
            reviewsOrig: revs2
        });
    } catch(e: any) {
        return NextResponse.json({ error: e.message });
    }
}
