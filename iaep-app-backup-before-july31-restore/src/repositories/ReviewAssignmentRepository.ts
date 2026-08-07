import { ReviewStatus } from "@/domain/reviewer/ReviewStatus";

export class ReviewAssignmentRepository {
  private static getSupabaseAdmin() {
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
  }

  static async getAssignmentsForReviewer(userId: string, email: string | null): Promise<any[]> {
    const supabaseAdmin = this.getSupabaseAdmin();
    let rawAssignments: any[] = [];

    if (!userId) return [];

    try {
      // 1. Fetch strictly by UUID from Supabase (Identity Core)
      const { data: dataById } = await supabaseAdmin
        .from("review_assignments")
        .select("*, submissions(*, journals(name))")
        .eq("reviewer_id", userId)
        .order("assigned_at", { ascending: false });

      if (dataById) {
        rawAssignments.push(...dataById);
      }

      // Fallback: Fetch from Firestore only if Supabase returned nothing
      if (rawAssignments.length === 0) {
        try {
          const { getFirestore } = await import('@/utils/firebase/db');
          const db = getFirestore();
          
          let snap;
          if (email) {
            // Use email to find legacy assignments safely without fetching entire collection
            snap = await db.collection('review_assignments').where('reviewer_email', '==', email).get();
          } else {
            snap = await db.collection('review_assignments').where('reviewer_id', '==', userId).get();
          }

          snap.forEach((doc: any) => {
            const d = doc.data();
            rawAssignments.push({
              id: doc.id,
              submission_id: d.submission_id,
              reviewer_id: d.reviewer_id || '',
              reviewer_email: d.reviewer_email || '',
              status: d.status || 'pending',
              recommendation: d.recommendation || d.decision || null,
              comments_for_author: d.comments_for_author || d.commentsForAuthor || null,
              comments_for_editor: d.comments_for_editor || d.commentsForEditor || null,
              assigned_at: d.assigned_at?.toDate ? d.assigned_at.toDate() : new Date(d.assigned_at || Date.now()),
              completed_at: d.completed_at?.toDate ? d.completed_at.toDate() : d.completed_at ? new Date(d.completed_at) : null,
              deadline: d.deadline?.toDate ? d.deadline.toDate() : d.deadline
            });
          });
        } catch (e) {
          console.warn("Firestore assignments load fallback failed", e);
        }
      }

      // 2. Enrich and normalize submissions from Supabase or Firestore fallbacks
      rawAssignments = await Promise.all(
        rawAssignments.map(async (assign: any) => {
          let sub = assign.submissions;
          const targetSubId = assign.submission_id;

          if ((!sub || !sub.title) && targetSubId) {
            try {
              const { data: subData } = await supabaseAdmin
                .from("submissions")
                .select("*, journals(name)")
                .or(`id.eq.${targetSubId},submission_id.eq.${targetSubId}`)
                .maybeSingle();

              if (subData) sub = subData;
            } catch (e) {}

            // Firestore submission fallback
            if (!sub || !sub.title) {
              try {
                const { getFirestore } = await import('@/utils/firebase/db');
                const db = getFirestore();
                const subDoc = await db.collection('submissions').doc(targetSubId).get();
                if (subDoc.exists) {
                   const sd = subDoc.data();
                   sub = {
                     id: subDoc.id,
                     title: sd?.title,
                     abstract: sd?.abstract,
                     revised_file_url: sd?.revised_file_url || null,
                     file_url: sd?.file_url || sd?.manuscript_url || null,
                     journals: sd?.journals || { name: 'Jurnal' }
                   };
                }
              } catch(e) {}
            }
          }

          return {
            ...assign,
            submissions: sub
          };
        })
      );

      // 3. Deduplicate by submission_id (keep the newest assignment based on assigned_at)
      const dedupedMap = new Map<string, any>();
      rawAssignments.forEach((assign) => {
        const subId = assign.submission_id || assign.submissions?.id || '';
        if (!subId) return;

        const existing = dedupedMap.get(subId);
        if (!existing) {
          dedupedMap.set(subId, assign);
        } else {
          // Keep the newer assignment based on assigned_at time
          const existingTime = new Date(existing.assigned_at).getTime();
          const currentTime = new Date(assign.assigned_at).getTime();
          if (currentTime > existingTime) {
            dedupedMap.set(subId, assign);
          }
        }
      });

      return Array.from(dedupedMap.values());

    } catch (error) {
      console.error("ReviewAssignmentRepository failed to load:", error);
      return [];
    }
  }
}
