import { ReviewStatus } from "@/domain/reviewer/ReviewStatus";

export class ReviewAssignmentRepository {
  private static getSupabaseAdmin() {
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
  }

  private static unhexUuid(uuidStr: string): string {
    if (!uuidStr) return "";
    try {
      const hex = uuidStr.replace(/-/g, "").replace(/0+$/, "");
      if (/^[0-9a-f]+$/i.test(hex) && hex.length >= 8) {
        return Buffer.from(hex, "hex").toString("utf8");
      }
    } catch(e) {}
    return uuidStr;
  }

  static async getAssignmentsForReviewer(userId: string, email: string | null): Promise<any[]> {
    const supabaseAdmin = this.getSupabaseAdmin();
    let rawAssignments: any[] = [];

    // 1. Build all candidate IDs for the reviewer
    const candidateIds = new Set<string>();
    if (userId) candidateIds.add(userId);
    if (email && !email.includes('fallback@')) {
      candidateIds.add(email);
      candidateIds.add(email.toLowerCase());
    }

    // Convert non-UUID IDs to hex UUIDs
    Array.from(candidateIds).forEach(id => {
      if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
         const hex = Buffer.from(id).toString('hex').padEnd(32, '0').slice(0, 32);
         candidateIds.add(`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`);
      }
    });

    const idArray = Array.from(candidateIds);
    const userEmail = email && !email.includes('fallback@') ? email.toLowerCase() : null;

    try {
      // Fetch by ID in Supabase
      const { data: dataById } = await supabaseAdmin
        .from("review_assignments")
        .select("*, submissions(*, journals(name))")
        .in("reviewer_id", idArray)
        .order("assigned_at", { ascending: false });

      if (dataById) {
        rawAssignments.push(...dataById);
      }

      // Fetch by Email in Supabase
      if (userEmail) {
        const { data: dataByEmail } = await supabaseAdmin
          .from("review_assignments")
          .select("*, submissions(*, journals(name))")
          .eq("reviewer_email", userEmail)
          .order("assigned_at", { ascending: false });

        if (dataByEmail) {
          const existingIds = new Set(rawAssignments.map(a => a.id));
          dataByEmail.forEach((a: any) => {
            if (!existingIds.has(a.id)) rawAssignments.push(a);
          });
        }
      }

      // Fallback: Fetch from Firestore only if Supabase returned nothing
      if (rawAssignments.length === 0) {
        try {
          const { getFirestore } = await import('@/utils/firebase/db');
          const db = getFirestore();
          const snap = await db.collection('review_assignments').get();

          snap.forEach((doc: any) => {
            const d = doc.data();
            const rId = d.reviewer_id || '';
            const rEmail = d.reviewer_email || '';
            if (candidateIds.has(rId) || candidateIds.has(rEmail) || (userEmail && rEmail.toLowerCase() === userEmail)) {
               rawAssignments.push({
                 id: doc.id,
                 submission_id: d.submission_id,
                 reviewer_id: rId,
                 reviewer_email: rEmail,
                 status: d.status || 'pending',
                 recommendation: d.recommendation || d.decision || null,
                 comments_for_author: d.comments_for_author || d.commentsForAuthor || null,
                 comments_for_editor: d.comments_for_editor || d.commentsForEditor || null,
                 assigned_at: d.assigned_at?.toDate ? d.assigned_at.toDate() : new Date(d.assigned_at || Date.now()),
                 completed_at: d.completed_at?.toDate ? d.completed_at.toDate() : d.completed_at ? new Date(d.completed_at) : null,
                 deadline: d.deadline?.toDate ? d.deadline.toDate() : d.deadline
               });
            }
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
