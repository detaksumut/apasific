import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getFirestore } from '@/utils/firebase/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // 1. Query Supabase for non-null/non-empty DOIs
    const { data: sbData, error: sbError } = await supabaseAdmin
      .from('submissions')
      .select('id, title, status, stage, doi, zenodo_id')
      .not('doi', 'is', null);
      
    if (sbError) throw sbError;
    
    const sbList = (sbData || []).filter(s => s.doi && s.doi.trim() !== '');

    // 2. Query Firestore for non-null/non-empty DOIs
    const db = getFirestore();
    const fsSnap = await db.collection('submissions').get();
    const fsList: any[] = [];
    
    fsSnap.docs.forEach((doc: any) => {
      const data = doc.data();
      if (data.doi && data.doi.trim() !== '') {
        fsList.push({
          id: doc.id,
          title: data.title || 'Untitled',
          status: data.status,
          stage: data.stage || null,
          doi: data.doi,
          zenodo_id: data.zenodo_id || null
        });
      }
    });

    return NextResponse.json({
      success: true,
      total_in_supabase: sbList.length,
      supabase_dois: sbList,
      total_in_firestore: fsList.length,
      firestore_dois: fsList
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
