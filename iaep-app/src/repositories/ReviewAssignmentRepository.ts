export class ReviewAssignmentRepository {
  private static getSupabaseAdmin() {
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');

    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        ""
    );
  }

  static async getAssignmentsForReviewer(
    userId: string,
    email: string | null
  ): Promise<any[]> {
    const supabaseAdmin = this.getSupabaseAdmin();

    try {
      /*
       * REVIEWER READ IDENTITY
       *
       * Reviewer dashboard lookup is EMAIL-FIRST.
       * reviewer_email is the authoritative matching key for the
       * reviewer assignment queue.
       *
       * userId is retained as an input for compatibility, but is NOT
       * allowed to prevent a valid email assignment from being found.
       */
      if (!email) {
        return [];
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return [];
      }

      const { data: assignments, error } = await supabaseAdmin
        .from("review_assignments")
        .select("*, submissions(*, journals(name))")
        .ilike("reviewer_email", normalizedEmail)
        .order("assigned_at", { ascending: false });

      if (error) {
        console.error(
          "ReviewAssignmentRepository Supabase query failed:",
          error
        );
        return [];
      }

      if (!assignments || assignments.length === 0) {
        return [];
      }

      /*
       * Normalize submissions.
       *
       * Supabase remains the only production source.
       * If the nested relation is unavailable, resolve the submission
       * directly from the Supabase submissions table.
       */
      const normalizedAssignments = await Promise.all(
        assignments.map(async (assign: any) => {
          let submission = assign.submissions;
          const submissionId = assign.submission_id;

          if ((!submission || !submission.title) && submissionId) {
            try {
              const { data: submissionData, error: submissionError } =
                await supabaseAdmin
                  .from("submissions")
                  .select("*, journals(name)")
                  .or(
                    `id.eq.${submissionId},submission_id.eq.${submissionId}`
                  )
                  .maybeSingle();

              if (!submissionError && submissionData) {
                submission = submissionData;
              }
            } catch (error) {
              console.error(
                "ReviewAssignmentRepository submission lookup failed:",
                error
              );
            }
          }

          return {
            ...assign,
            submissions: submission || null,
          };
        })
      );

      /*
       * Preserve existing behavior:
       * one active/latest assignment per submission for this reviewer.
       *
       * Newer assigned_at wins.
       */
      const dedupedMap = new Map<string, any>();

      normalizedAssignments.forEach((assignment: any) => {
        const submissionId =
          assignment.submission_id ||
          assignment.submissions?.id ||
          "";

        if (!submissionId) return;

        const existing = dedupedMap.get(submissionId);

        if (!existing) {
          dedupedMap.set(submissionId, assignment);
          return;
        }

        const existingTime = new Date(
          existing.assigned_at || 0
        ).getTime();

        const currentTime = new Date(
          assignment.assigned_at || 0
        ).getTime();

        if (currentTime > existingTime) {
          dedupedMap.set(submissionId, assignment);
        }
      });

      return Array.from(dedupedMap.values());
    } catch (error) {
      console.error(
        "ReviewAssignmentRepository failed to load:",
        error
      );

      return [];
    }
  }
}
