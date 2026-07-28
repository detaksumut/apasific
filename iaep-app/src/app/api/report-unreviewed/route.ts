import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Fetch submissions that are not yet reviewed
        // Usually, these are statuses like 'queued' or 'Awaiting Reviewers'
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select(`
                id,
                title,
                status,
                created_at,
                author_id,
                profiles:author_id (full_name, email, phone)
            `)
            .in('status', ['queued', 'Awaiting Reviewers', 'pending'])
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message });
        }

        // Get missing emails from auth.users
        let authUsers: any[] = [];
        try {
            const { data: { users } } = await supabase.auth.admin.listUsers();
            if (users) authUsers = users;
        } catch (e) {
            console.warn("Failed to fetch auth users", e);
        }

        const report = submissions?.map(s => {
            let email = Array.isArray(s.profiles) ? s.profiles[0]?.email : s.profiles?.email;
            if (!email) {
                 const match = authUsers.find(u => u.id === s.author_id);
                 if (match) email = match.email;
            }
            return {
                id: s.id,
                title: s.title,
                status: s.status,
                date: new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                email: email || 'Tidak ada email (User belum melengkapi profil/migrasi lama)'
            };
        });

        return NextResponse.json({
            count: report?.length || 0,
            report
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
