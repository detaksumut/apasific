import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const assignmentId = resolvedParams.id;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    let assignData: any = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId);

    // 1. Fetch assignment from Supabase if UUID
    if (isUuid) {
      try {
        const { data } = await supabaseAdmin
          .from('review_assignments')
          .select('*, submissions(*, journals(name))')
          .or(`id.eq.${assignmentId},submission_id.eq.${assignmentId}`)
          .maybeSingle();

        if (data) assignData = data;
      } catch(e) {}
    }

    // 2. Fetch assignment from Firestore fallback
    if (!assignData) {
      try {
        const { getFirestore } = await import('@/utils/firebase/db');
        const db = getFirestore();
        if (db) {
          const doc = await db.collection('review_assignments').doc(assignmentId).get();
          if (doc.exists) {
            assignData = { id: doc.id, ...doc.data() };
          }
        }
      } catch(e) {
        console.warn("Firestore fetch review_assignments skipped:", e);
      }
    }

    if (!assignData) {
      // Fallback: create mock/empty assignData if ID exists
      assignData = { id: assignmentId, submission_id: assignmentId, title: "Naskah Review (" + assignmentId + ")" };
    }

    // 3. Fetch submission data
    let sub = assignData.submissions;
    const targetSubId = assignData.submission_id || assignmentId;

    if (!sub || !sub.title) {
      if (targetSubId) {
        const isSubUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetSubId);
        if (isSubUuid) {
          try {
            const { data: subData } = await supabaseAdmin
              .from('submissions')
              .select('*, journals(name)')
              .or(`id.eq.${targetSubId},submission_id.eq.${targetSubId}`)
              .maybeSingle();
            if (subData) sub = subData;
          } catch(e) {}
        }
      }

      if ((!sub || !sub.title) && targetSubId) {
        try {
          const { getFirestore } = await import('@/utils/firebase/db');
          const db = getFirestore();
          if (db) {
            const subDoc = await db.collection('submissions').doc(targetSubId).get();
            if (subDoc.exists) {
              const sd = subDoc.data();
              sub = {
                id: subDoc.id,
                title: sd?.title,
                abstract: sd?.abstract,
                file_url: sd?.file_url || sd?.manuscript_url || sd?.cover_file_url,
                journals: sd?.journals || { name: 'Jurnal' }
              };
            }
          }
        } catch(e) {}
      }
    }

    const dueDateStr = assignData.deadline
      ? new Date(assignData.deadline?.toDate ? assignData.deadline.toDate() : assignData.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : "Batas Waktu Standar (14 Hari)";

    return NextResponse.json({
      id: String(assignData.id || assignmentId),
      submission_id: String(targetSubId || ""),
      title: String(sub?.title || assignData.title || "Judul Naskah Tidak Ditemukan"),
      abstract: String(sub?.abstract || assignData.abstract || "Tidak ada abstrak tersedia."),
      type: String(sub?.type || "Articles"),
      journal: String(sub?.journals?.name || assignData.journal_name || "JURNAL"),
      dueDate: String(dueDateStr),
      round: Number(assignData.round || 1),
      file_url: String(sub?.file_url || sub?.manuscript_url || assignData.file_url || ""),
      status: String(assignData.status || 'pending'),
      recommendation: String(assignData.recommendation || ''),
      comments_for_author: String(assignData.comments_for_author || ''),
      comments_for_editor: String(assignData.comments_for_editor || ''),
      correction_notes: String(assignData.correction_notes || '')
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
