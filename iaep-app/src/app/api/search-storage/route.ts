import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        // Let's get a list of all folders in manuscripts
        const { data: folders, error: folderError } = await supabase.storage.from('manuscripts').list();
        if (folderError) throw folderError;

        let potentialMatches: any[] = [];
        let allFiles: any[] = [];

        // Scan the first 100 folders to avoid Vercel timeout, just in case
        for (const folder of (folders || []).slice(0, 150)) {
            if (folder.name === '.emptyFolderPlaceholder') continue;
            
            const { data: files } = await supabase.storage.from('manuscripts').list(folder.name + '/');
            if (files) {
                for (const f of files) {
                    if (f.name === '.emptyFolderPlaceholder') continue;
                    const name = f.name.toLowerCase();
                    allFiles.push({ path: `${folder.name}/${f.name}`, created_at: f.created_at });
                    
                    if (name.includes('inclusive') || 
                        name.includes('finance') || 
                        name.includes('fintech') || 
                        name.includes('sharia') || 
                        name.includes('peer') || 
                        name.includes('lending')) {
                        potentialMatches.push({
                            folder: folder.name,
                            file: f.name,
                            created_at: f.created_at,
                            size: f.metadata?.size
                        });
                    }
                }
            }
        }

        return NextResponse.json({
            matches: potentialMatches,
            totalFoldersScanned: folders?.length,
            totalFilesFound: allFiles.length,
            recentFiles: allFiles.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)
        });
    } catch(e: any) {
        return NextResponse.json({ error: e.message });
    }
}
