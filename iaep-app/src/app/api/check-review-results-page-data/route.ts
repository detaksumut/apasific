import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

function unhexUuid(uuidStr: string): string {
  if (!uuidStr) return "";
  try {
    const hex = uuidStr.replace(/-/g, "").replace(/0+$/, "");
    if (/^[0-9a-f]+$/i.test(hex) && hex.length >= 8) {
      return Buffer.from(hex, "hex").toString("utf8");
    }
  } catch(e) {}
  return uuidStr;
}

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: submissions } = await supabaseAdmin
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name)")
      .order("updated_at", { ascending: false });

    let articles = submissions || [];

    let assignmentsMap: Record<string, any[]> = {};
    const { data: assignmentsData } = await supabaseAdmin.from("review_assignments").select("*");

    if (assignmentsData) {
      assignmentsData.forEach(assignment => {
        const k1 = String(assignment.submission_id || '');
        const k2 = unhexUuid(k1);
        const k3 = String(assignment.id || '');

        [k1, k2, k3].forEach(k => {
          if (k) {
            if (!assignmentsMap[k]) assignmentsMap[k] = [];
            if (!assignmentsMap[k].some((a: any) => a.id === assignment.id)) {
              assignmentsMap[k].push(assignment);
            }
          }
        });
      });
    }

    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const snap = await db.collection('review_assignments').get();
      
      snap.forEach((doc: any) => {
        const d = doc.data();
        const assignment = {
          id: doc.id,
          submission_id: d.submission_id,
          reviewer_id: d.reviewer_id,
          reviewer_email: d.reviewer_email,
          reviewer_name: d.reviewer_name || d.reviewer_email,
          status: d.status || 'pending',
          recommendation: d.recommendation || d.decision,
          comments_for_editor: d.comments_for_editor || d.commentsForEditor,
          comments_for_author: d.comments_for_author || d.commentsForAuthor,
          annotated_file_url: d.annotated_file_url || d.fileUrl,
          updated_at: d.updated_at?.toDate ? d.updated_at.toDate() : d.updated_at
        };

        const k1 = String(assignment.submission_id || '');
        const k2 = unhexUuid(k1);
        const k3 = String(assignment.id || '');

        [k1, k2, k3].forEach(k => {
          if (k) {
            if (!assignmentsMap[k]) assignmentsMap[k] = [];
            const existingIdx = assignmentsMap[k].findIndex((a: any) => a.id === assignment.id || a.submission_id === assignment.submission_id);
            if (existingIdx === -1) {
              assignmentsMap[k].push(assignment);
            } else if (assignment.status === 'completed' && assignmentsMap[k][existingIdx].status !== 'completed') {
              assignmentsMap[k][existingIdx] = { ...assignmentsMap[k][existingIdx], ...assignment };
            }
          }
        });
      });
    } catch (e) {}

    articles = articles.map(article => {
       const candKeys = [
         String(article.id || ''),
         String(article.submission_id || ''),
         unhexUuid(String(article.id || ''))
       ].filter(Boolean);

       let articleAssignments: any[] = [];
       for (const k of candKeys) {
         if (assignmentsMap[k] && assignmentsMap[k].length > 0) {
           articleAssignments = assignmentsMap[k];
           break;
         }
       }

       const activeAssignments = articleAssignments.filter(a => a.status !== 'rejected');
       return { ...article, assignments: activeAssignments };
    });

    articles = articles.filter(article => {
      const hasCompletedReview = article.assignments && article.assignments.some((a: any) => a.status === 'completed');
      const isReviewedStatus = ['Reviewed', 'Revision Required'].includes(article.status);
      return hasCompletedReview || isReviewedStatus;
    });

    return NextResponse.json({
      totalResultArticles: articles.length,
      articles: articles.map(a => ({
        id: a.id,
        title: a.title,
        status: a.status,
        assignmentsCount: a.assignments?.length,
        completedAssignment: a.assignments?.find((x: any) => x.status === 'completed')
      }))
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
