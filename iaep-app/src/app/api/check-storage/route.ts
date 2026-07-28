import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const entityId = '7375625f-3137-3834-3533-303330323837';
    const bucket = 'manuscripts';
    const results: any = {};
    
    // 1. Check exact entityId folder
    const { data: exactFiles } = await supabase.storage.from(bucket).list(entityId + '/');
    results.exactFolder = exactFiles;
    
    // 2. Check unhexed ID folder
    const unhexedId = Buffer.from(entityId.replace(/-/g, ''), 'hex').toString('utf8');
    results.unhexedId = unhexedId;
    const { data: unhexedFiles } = await supabase.storage.from(bucket).list(unhexedId + '/');
    results.unhexedFolder = unhexedFiles;
    
    // 3. Check submission row in DB
    const { data: submissionData } = await supabase.from('submissions').select('*').eq('id', entityId).single();
    results.submissionRow = submissionData;
    
    // 4. Try searching the whole bucket for the title maybe? (if it's not too large)
    // Actually just searching the root for the unhexed ID
    const { data: rootFiles } = await supabase.storage.from(bucket).list('', { search: unhexedId });
    results.rootSearch = rootFiles;
    
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
