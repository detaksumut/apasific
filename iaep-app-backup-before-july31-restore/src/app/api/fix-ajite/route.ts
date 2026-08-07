import { NextResponse } from 'next/server';
import { getFirestore } from '@/utils/firebase/db';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const articleId = 'sub_1784062294881_r2jx1m4'; // AJITE Article

    // 1. Update Firestore
    const db = getFirestore();
    await db.collection('submissions').doc(articleId).update({
      status: 'Published',
      stage: 'Published',
      updated_at: new Date()
    });
    console.log('✅ Firestore updated successfully');

    // 2. Update Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase
          .from('submissions')
          .update({ status: 'Published', stage: 'Published' })
          .eq('id', articleId);
          
        if (error) {
            console.error('❌ Error updating Supabase:', error);
            return NextResponse.json({ success: false, db: 'Firestore updated, Supabase failed', error });
        }
    }

    return NextResponse.json({ success: true, message: `Article ${articleId} fixed to Published.` });
  } catch (error: any) {
    console.error('Failed to fix article:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
