import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('id, title, file_url')
            .ilike('title', '%Analisis Komparatif Performa Database Supabase dan Firebase%');
            
        if (error) return NextResponse.json({ error: error.message });
        
        let results = [];
        for (const sub of submissions || []) {
            let actualFolder = sub.id;
            try {
                const hex = sub.id.replace(/-/g, '');
                const str = Buffer.from(hex, 'hex').toString('utf8');
                if (str.startsWith('sub_')) actualFolder = str.replace(/\0/g, '');
            } catch(e) {}
            if (sub.file_url && sub.file_url.includes('/')) {
                actualFolder = sub.file_url.split('/')[0];
            }
            
            // List EVERYTHING in the bucket for this folder
            const { data: bucketFiles } = await supabase.storage.from('manuscripts').list(actualFolder);
            
            results.push({
                id: sub.id,
                title: sub.title,
                db_file_url: sub.file_url,
                actualFolder_searched: actualFolder,
                files_found_in_storage: bucketFiles?.map(f => f.name) || []
            });
        }
        
        return NextResponse.json({ results });
    } catch(e: any) {
        return NextResponse.json({ error: e.message });
    }
}
