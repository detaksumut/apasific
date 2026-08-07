import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();

    const targetArticles = [
      {
        keyword: "Empowering Muslim MSMEs in FELDA Communities",
        doi: "10.5281/zenodo.21474443",
        recommendation: "Accept Submission",
        notes: "Ulasan selesai. Naskah direkomendasikan untuk diteruskan ke tahap penerbitan."
      },
      {
        keyword: "Factors Affecting Regulatory Non-Compliance in Local Governments in Indonesia",
        doi: "10.5281/zenodo.21486466",
        recommendation: "Accept Submission",
        notes: "Ulasan selesai. Metodologi panel data 2019–2023 telah diperiksa dan disetujui."
      },
      {
        keyword: "THE IMPACT OF SUPPLY CHAIN TRANSPARENCY",
        doi: "10.5281/zenodo.21483632",
        recommendation: "Accept Submission",
        notes: "Ulasan selesai. Analisis sertifikasi halal F&B MSMEs dinyatakan memenuhi standar."
      },
      {
        keyword: "Zakat and Tax Accounting: Analyzing the Readiness of MSME Actors",
        recommendation: "Accept Submission",
        notes: "Ulasan selesai. Naskah baru telah diulas oleh reviewer (kadsumut@gmail.com) dan direkomendasikan untuk diterima."
      }
    ];

    const logs: string[] = [];

    // Fetch all submissions from Supabase
    const { data: supaSubmissions } = await supabaseAdmin.from('submissions').select('*');
    
    // Fetch all submissions from Firestore
    const fbSubSnap = await db.collection('submissions').get();
    const fbSubsMap: Record<string, any> = {};
    fbSubSnap.forEach((doc: any) => {
      fbSubsMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    for (const target of targetArticles) {
      let matchedSupaSub = supaSubmissions?.find(s => 
        (s.title && s.title.toLowerCase().includes(target.keyword.toLowerCase())) ||
        (target.doi && s.doi === target.doi)
      );

      let matchedFbSubId = Object.keys(fbSubsMap).find(id => {
        const item = fbSubsMap[id];
        return (item.title && item.title.toLowerCase().includes(target.keyword.toLowerCase())) ||
               (target.doi && item.doi === target.doi);
      });

      const subId = matchedSupaSub?.id || matchedFbSubId;

      if (subId) {
        logs.push(`Found submission: "${target.keyword}" -> ID: ${subId}`);

        // 1. Update Submissions Table in Supabase
        await supabaseAdmin.from('submissions').update({
          status: 'Reviewed',
          stage: 'Review',
          updated_at: new Date()
        }).eq('id', subId);

        // 2. Update/Insert Review Assignment in Supabase
        const { data: existingAssign } = await supabaseAdmin
          .from('review_assignments')
          .select('id')
          .or(`submission_id.eq.${subId},reviewer_email.eq.kadsumut@gmail.com`)
          .eq('submission_id', subId)
          .maybeSingle();

        if (existingAssign) {
          await supabaseAdmin.from('review_assignments').update({
            status: 'completed',
            reviewer_email: 'kadsumut@gmail.com',
            reviewer_name: 'Marahaman',
            recommendation: target.recommendation,
            comments_for_editor: target.notes,
            comments_for_author: "Ulasan naskah Anda telah selesai dan diterima.",
            completed_at: new Date(),
            updated_at: new Date()
          }).eq('id', existingAssign.id);
          logs.push(`  Updated Supabase review_assignment: ${existingAssign.id}`);
        } else {
          const { data: newAssign } = await supabaseAdmin.from('review_assignments').insert({
            submission_id: subId,
            reviewer_email: 'kadsumut@gmail.com',
            reviewer_name: 'Marahaman',
            reviewer_id: '75736572-5f31-3738-3430-353435333731',
            status: 'completed',
            recommendation: target.recommendation,
            comments_for_editor: target.notes,
            comments_for_author: "Ulasan naskah Anda telah selesai dan diterima.",
            completed_at: new Date(),
            updated_at: new Date()
          }).select().single();
          logs.push(`  Created Supabase review_assignment: ${newAssign?.id}`);
        }

        // 3. Update Firestore as fallback
        try {
          const subRef = db.collection('submissions').doc(subId);
          await subRef.set({ status: 'Reviewed', updated_at: new Date() }, { merge: true });

          const fbAssignSnap = await db.collection('review_assignments')
            .where('submission_id', '==', subId)
            .get();

          if (!fbAssignSnap.empty) {
            fbAssignSnap.forEach(async (doc: any) => {
              await doc.ref.update({
                status: 'completed',
                recommendation: target.recommendation,
                comments_for_editor: target.notes,
                comments_for_author: "Ulasan naskah Anda telah selesai dan diterima.",
                updated_at: new Date()
              });
            });
            logs.push(`  Updated Firestore review_assignment for ${subId}`);
          } else {
            await db.collection('review_assignments').add({
              submission_id: subId,
              reviewer_email: 'kadsumut@gmail.com',
              reviewer_name: 'Marahaman',
              reviewer_id: '4dOYvkkPwaONjE25qkiC1C5MOH53',
              status: 'completed',
              recommendation: target.recommendation,
              comments_for_editor: target.notes,
              comments_for_author: "Ulasan naskah Anda telah selesai dan diterima.",
              created_at: new Date(),
              updated_at: new Date()
            });
            logs.push(`  Created Firestore review_assignment for ${subId}`);
          }
        } catch (fbErr: any) {
          logs.push(`  Firestore error for ${subId}: ${fbErr.message}`);
        }
      } else {
        logs.push(`WARNING: Could not find submission for "${target.keyword}"`);
      }
    }

    return NextResponse.json({ success: true, logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
