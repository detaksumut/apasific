import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== 'apasific2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        const { data: files, error } = await supabaseAdmin.storage.from('manuscripts').list('undefined', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) {
            return NextResponse.json({ error: error.message });
        }

        const validFiles = files.filter(f => 
            f.name.toLowerCase().endsWith('.pdf') || 
            f.name.toLowerCase().endsWith('.docx') ||
            f.name.toLowerCase().endsWith('.doc')
        );

        // Map to public URLs for easy clicking
        const filesWithUrls = validFiles.map(f => {
            const { data } = supabaseAdmin.storage.from('manuscripts').getPublicUrl(`undefined/${f.name}`);
            return {
                name: f.name,
                created_at: f.created_at,
                url: data.publicUrl
            };
        });

        // Get missing submissions from database
        const { data: missingSubmissions } = await supabaseAdmin
            .from('submissions')
            .select('id, title, author_id, created_at, status')
            .is('file_url', null)
            .in('status', ['Awaiting Reviewers', 'Under Review'])
            .order('created_at', { ascending: false });

        return NextResponse.json({ 
            total_orphaned_files: validFiles.length,
            orphaned_files: filesWithUrls,
            missing_url_submissions: missingSubmissions || []
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
