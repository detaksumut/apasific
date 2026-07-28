import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const entityId = '7375625f-3137-3834-3533-303330323837';
    
    // File URL is inside the folder
    const exactFilePath = 'sub_1784530302874_8ggumuu/1784530304695_anonymous.docx';
    
    const { error, data } = await supabase.from('submissions').update({
      file_url: exactFilePath
    }).eq('id', entityId).select();

    if (error) {
      return NextResponse.json({ success: false, error });
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
