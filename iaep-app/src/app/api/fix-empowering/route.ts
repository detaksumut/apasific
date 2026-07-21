import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Cari naskah Empowering Muslim MSMEs di Supabase
        const { data: sub } = await supabaseAdmin
            .from('submissions')
            .select('*')
            .ilike('title', '%Empowering Muslim MSMEs%')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!sub) {
            return NextResponse.json({ success: false, error: "Artikel tidak ditemukan di Supabase" });
        }

        // Paksakan pembuatan data di Firestore beserta dummy cover (karena URL aslinya hilang)
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        const docRef = db.collection('submissions').doc(sub.id);
        
        await docRef.set({
            ...sub,
            created_at: new Date(sub.created_at),
            updated_at: new Date(),
            cover_file_url: "https://apasific.org/logo-apasific.png" // Dummy cover agar lolos filter
        }, { merge: true });

        return NextResponse.json({ 
            success: true, 
            message: "Berhasil merestorasi naskah ke Firestore! Silakan refresh dashboard Pertinggal Anda.",
            article_id: sub.id,
            title: sub.title
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
