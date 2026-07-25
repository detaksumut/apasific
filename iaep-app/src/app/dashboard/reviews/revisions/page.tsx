import { redirect } from "next/navigation";
import { FileEdit, Eye, AlertCircle, Download } from "lucide-react";
import Link from "next/link";

export default async function ReviewerRevisionsPage() {
  const { getCurrentUser } = await import('@/app/actions/auth');
  const user: any = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }
  const userId = user.id;

  let assignments: any[] = [];
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    // Build all possible candidate IDs for this reviewer
    const candidateIds = new Set<string>();
    if (userId) candidateIds.add(userId);
    if ((user as any).json_id) candidateIds.add((user as any).json_id);
    if (user.email && !user.email.includes('fallback@')) candidateIds.add(user.email);

    Array.from(candidateIds).forEach(id => {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        const hex = Buffer.from(id).toString('hex').padEnd(32, '0').slice(0, 32);
        candidateIds.add(`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`);
      }
    });

    // Step 1: Get all completed assignments for this reviewer (no join filter on revised_file_url)
    const { data: rawAssignments } = await supabaseAdmin
      .from("review_assignments")
      .select("*, submissions(*, journals(name))")
      .in("reviewer_id", Array.from(candidateIds))
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    // Step 2: Filter in JS — only show assignments where the submission has a revised_file_url
    if (rawAssignments) {
      assignments = rawAssignments.filter(
        (a: any) => a.submissions && a.submissions.revised_file_url
      );
    }

    // Also try matching by reviewer_email if no results
    if (assignments.length === 0 && user.email) {
      const { data: byEmail } = await supabaseAdmin
        .from("review_assignments")
        .select("*, submissions(*, journals(name))")
        .eq("reviewer_email", user.email.toLowerCase())
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      if (byEmail) {
        const filtered = byEmail.filter(
          (a: any) => a.submissions && a.submissions.revised_file_url
        );
        // Merge and deduplicate
        const existingIds = new Set(assignments.map((a: any) => a.id));
        filtered.forEach((a: any) => {
          if (!existingIds.has(a.id)) assignments.push(a);
        });
      }
    }
  } catch (error: any) {
    console.warn("Reviewer revisions fetch error:", error?.message || error);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Revision</h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Daftar naskah yang telah direvisi oleh Penulis dan diteruskan kepada Anda untuk diperiksa kembali.
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden min-h-[300px]">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <AlertCircle className="w-12 h-12 mb-4 opacity-20 text-emerald-500" />
            <p className="text-sm">Belum ada naskah revisi yang diteruskan kepada Anda.</p>
            <p className="text-xs mt-1 text-zinc-600">Naskah revisi dari Author akan muncul di sini setelah Editor meneruskannya.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {assignments.map((assignment: any) => (
              <div
                key={assignment.id}
                className="p-6 hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between group"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <FileEdit className="w-3 h-3" /> File Revisi Tersedia
                    </span>
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700">
                      {assignment.submissions?.journals?.name || "JURNAL"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                    {assignment.submissions?.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                    <div>
                      Review selesai:{" "}
                      <span className="text-zinc-400">
                        {assignment.completed_at
                          ? new Date(assignment.completed_at).toLocaleDateString("id-ID")
                          : "-"}
                      </span>
                    </div>
                    <div>
                      Rekomendasi Anda:{" "}
                      <span className={`font-medium ${
                        assignment.recommendation === "accept" || assignment.recommendation === "Accept Submission"
                          ? "text-emerald-400"
                          : assignment.recommendation?.includes("revision") || assignment.recommendation?.includes("Revision")
                          ? "text-amber-400"
                          : "text-red-400"
                      }`}>
                        {assignment.recommendation || "Tidak ada"}
                      </span>
                    </div>
                  </div>

                  {/* Download revised file directly */}
                  {assignment.submissions?.revised_file_url && (
                    <a
                      href={assignment.submissions.revised_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 rounded-lg hover:bg-amber-500/15 transition-colors w-fit"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh File Revisi Author
                    </a>
                  )}
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/dashboard/reviews/${assignment.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-emerald-500/50 text-emerald-400 hover:text-white hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors bg-emerald-500/10"
                  >
                    <Eye className="w-4 h-4" />
                    Buka & Upload Review Final
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
