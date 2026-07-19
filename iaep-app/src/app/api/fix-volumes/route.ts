import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Naskah 1: Marahman -> Vol 2 No 1
        const title1 = "Integrated Academic Ecosystem Enterprise Architecture";
        const { data: sub1 } = await supabaseAdmin.from('submissions').select('id').ilike('title', `%${title1}%`).order('created_at', { ascending: true }).limit(1).single();
        if (sub1) {
            await supabaseAdmin.from('certificates').update({ edition: "Vol 2 No 1 (2026)" }).eq('reference_id', sub1.id);
        }

        // Naskah 2: Muhibbuddin -> Vol 2 No 2
        const title2 = "Implementation of the Integrated Academic Ecosystem";
        const { data: sub2 } = await supabaseAdmin.from('submissions').select('id').ilike('title', `%${title2}%`).order('created_at', { ascending: false }).limit(1).single();
        if (sub2) {
            await supabaseAdmin.from('certificates').update({ edition: "Vol 2 No 2 (2026)" }).eq('reference_id', sub2.id);
        }
        
        return NextResponse.json({ success: true, message: "Berhasil update database. Silakan regenerasi sampul di Dashboard." });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
