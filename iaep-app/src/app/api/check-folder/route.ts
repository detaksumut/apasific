import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const bucket = 'manuscripts';
    const folderPath = 'sub_1784530302874_8ggumuu';
    
    const { data: files } = await supabase.storage.from(bucket).list(folderPath + '/');
    
    return NextResponse.json({ folderPath, files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
