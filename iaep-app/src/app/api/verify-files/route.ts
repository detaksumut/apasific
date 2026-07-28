import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: submissions } = await supabase
            .from('submissions')
            .select('id, title, file_url, revised_file_url')
            .in('status', ['queued', 'Awaiting Reviewers', 'pending'])
            .order('created_at', { ascending: false });

        if (!submissions) return NextResponse.json({ error: "No data" });

        const { resolveFile } = await import('@/utils/storageResolver');

        let report = [];
        for (const s of submissions) {
            let hasFile = false;
            let fileMessage = "Tidak ada file";
            
            const targetPath = s.revised_file_url || s.file_url;
            if (targetPath) {
                // Check if file is in storage bucket directly by using storage API
                try {
                    const parts = targetPath.split('/');
                    if (parts.length > 1) {
                         const folder = parts[0];
                         const { data: files } = await supabase.storage.from('manuscripts').list(folder + '/');
                         if (files && files.find(f => f.name === parts.slice(1).join('/'))) {
                             hasFile = true;
                             fileMessage = "Ada";
                         } else {
                             fileMessage = "Ada URL tapi file fisik hilang!";
                         }
                    } else {
                         // File is just a name in root
                         const { data: files } = await supabase.storage.from('manuscripts').list('');
                         if (files && files.find(f => f.name === targetPath)) {
                             hasFile = true;
                             fileMessage = "Ada";
                         } else {
                             fileMessage = "Ada URL tapi file fisik hilang!";
                         }
                    }
                } catch(e) {
                    fileMessage = "Error cek file";
                }
            } else {
                // Check using resolveFile just in case it's in a hex folder
                const res = await resolveFile('manuscripts', s.id);
                if (res) {
                    hasFile = true;
                    fileMessage = "Ada (ditemukan via resolver)";
                } else {
                    fileMessage = "URL Kosong & File Fisik Tidak Ditemukan";
                }
            }

            report.push({
                title: s.title,
                status_file: fileMessage
            });
        }

        return NextResponse.json(report);
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
