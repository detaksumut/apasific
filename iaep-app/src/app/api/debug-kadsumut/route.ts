import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Cari profil kadsumut@gmail.com
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role')
      .ilike('email', '%kadsumut%')
      .single();

    if (!profile) {
      return NextResponse.json({ found: false, message: 'Profil kadsumut tidak ditemukan di Supabase' });
    }

    // 2. Cari semua reviews yang dilakukan kadsumut
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('id, submission_id, status, recommendation, created_at, updated_at')
      .eq('reviewer_id', profile.id)
      .order('updated_at', { ascending: false });

    // 3. Ambil detail submission yang sudah Published
    const submissionIds = (reviews || []).map(r => r.submission_id).filter(Boolean);
    
    let publishedSubmissions: any[] = [];
    let allSubmissions: any[] = [];

    if (submissionIds.length > 0) {
      const { data: subs } = await supabaseAdmin
        .from('submissions')
        .select('id, title, status, stage, doi, volume, issue, created_at, journals(name)')
        .in('id', submissionIds);
      
      allSubmissions = subs || [];
      publishedSubmissions = allSubmissions.filter(s => s.status === 'Published' || s.status === 'Production Completed');
    }

    // 4. Juga cek Firestore untuk reviews kadsumut
    let firestoreReviews: any[] = [];
    let firestorePublished: any[] = [];
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const reviewSnap = await db.collection('reviews')
        .where('reviewer_id', '==', profile.id)
        .get();
      firestoreReviews = reviewSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Cek juga dengan email langsung
      const reviewSnap2 = await db.collection('reviews')
        .where('reviewer_email', '==', 'kadsumut@gmail.com')
        .get();
      const fromEmail = reviewSnap2.docs.map(d => ({ id: d.id, ...d.data() }));
      firestoreReviews = [...firestoreReviews, ...fromEmail];

      // Cross-check submission Published
      for (const rev of firestoreReviews) {
        if (rev.submission_id) {
          const subDoc = await db.collection('submissions').doc(rev.submission_id).get();
          if (subDoc.exists) {
            const subData = subDoc.data()!;
            if (subData.status === 'Published' || subData.status === 'Production Completed') {
              firestorePublished.push({ id: subDoc.id, title: subData.title, status: subData.status, doi: subData.doi });
            }
          }
        }
      }
    } catch(e: any) {
      firestoreReviews = [{ error: e.message }];
    }

    return NextResponse.json({
      reviewer: profile,
      total_reviews_supabase: (reviews || []).length,
      total_reviews_firestore: firestoreReviews.filter(r => !r.error).length,
      firestore_error: firestoreReviews.find(r => r.error)?.error || null,
      published_submissions: publishedSubmissions.map(s => ({
        id: s.id,
        title: s.title,
        status: s.status,
        stage: s.stage,
        doi: s.doi,
        volume: s.volume,
        issue: s.issue,
        journal: (s.journals as any)?.name,
      })),
      all_reviewed_submissions: allSubmissions.map(s => ({
        id: s.id,
        title: s.title?.substring(0, 60),
        status: s.status,
      })),
      firestore_published: firestorePublished,
      reviews_detail: (reviews || []).map(r => ({
        submission_id: r.submission_id,
        status: r.status,
        recommendation: r.recommendation,
        updated_at: r.updated_at,
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
