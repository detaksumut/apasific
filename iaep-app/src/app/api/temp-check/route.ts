import { NextResponse } from 'next/server';
import { getFirestore } from '@/utils/firebase/db';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const db = getFirestore();
    const doc = await db.collection('submissions').doc('sub_178430525613_1y2sofu').get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Document not found' });
    }

    const data = doc.data() || {};
    let phone = data.phone;
    
    if (!phone && data.author_id) {
       const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
       );
       const { data: profile } = await supabaseAdmin.from('profiles').select('phone').eq('id', data.author_id).single();
       if (profile) phone = profile.phone;
    }

    return NextResponse.json({ 
      submission_id: 'sub_178430525613_1y2sofu',
      title: data.title,
      author_name: data.profiles?.full_name || data.author_name || 'Unknown',
      phone_in_firestore: data.phone || null,
      resolved_phone: phone || 'Not found'
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
