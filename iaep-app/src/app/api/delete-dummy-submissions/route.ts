import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getFirestore } from '@/utils/firebase/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logs: string[] = [];
  try {
    // 1. Inisialisasi Firebase Admin & Firestore
    const db = getFirestore();
    const fsSnap = await db.collection('submissions').get();
    
    let fsDeletedCount = 0;
    const fsDeletedIds: string[] = [];

    // Hapus dari Firestore jika judulnya 'Untitled', null, atau kosong
    for (const doc of fsSnap.docs) {
      const data = doc.data();
      const title = (data.title || '').trim();
      
      if (!title || title.toLowerCase() === 'untitled') {
        await doc.ref.delete();
        fsDeletedCount++;
        fsDeletedIds.push(doc.id);
        logs.push(`[Firestore] Hapus naskah dummy ID: ${doc.id}`);
      }
    }

    // 2. Inisialisasi Supabase
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Hapus naskah dari Supabase jika judulnya 'Untitled', null, atau kosong
    // PENTING: Hanya hapus yang judulnya 'Untitled' atau kosong agar tidak menghapus naskah asli
    const { data: deletedSupa, error: supaError } = await supabaseAdmin
      .from('submissions')
      .delete()
      .or('title.ilike.untitled,title.is.null,title.eq.')
      .select('id, title');

    if (supaError) throw supaError;

    const supaDeletedCount = deletedSupa ? deletedSupa.length : 0;
    if (deletedSupa) {
      deletedSupa.forEach(row => {
        logs.push(`[Supabase] Hapus naskah dummy ID: ${row.id} (Judul: ${row.title})`);
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        firestore_deleted: fsDeletedCount,
        firestore_deleted_ids: fsDeletedIds,
        supabase_deleted: supaDeletedCount,
        supabase_deleted_rows: deletedSupa
      },
      logs
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      logs
    }, { status: 500 });
  }
}
