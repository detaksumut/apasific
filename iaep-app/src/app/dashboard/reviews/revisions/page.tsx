import { redirect } from "next/navigation";
import { FileEdit, AlertCircle, Download } from "lucide-react";
import ReviewStatusBadge from "@/components/reviewer/ReviewStatusBadge";
import ReviewAssignmentAction from "@/components/reviewer/ReviewAssignmentAction";
import { ReviewQueueService } from "@/services/ReviewQueueService";

export default async function ReviewerRevisionsPage() {
  const { getCurrentUser } = await import('@/app/actions/auth');
  const user: any = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }
  const userId = user.id;
  const userEmail = user.email || null;

  // Retrieve assignments in the revision queue
  const assignments = await ReviewQueueService.getRevisionQueue(userId, userEmail);

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
                    <ReviewStatusBadge status={assignment.status} />
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700">
                      {assignment.submissions?.journals?.name || "JURNAL"}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-white group-hover:text-[#c9a84c] transition-colors leading-snug">
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
                      <span className="text-zinc-400 capitalize">
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
                  <ReviewAssignmentAction assignment={assignment} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
