import { redirect } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";
import ReviewStatusBadge from "@/components/reviewer/ReviewStatusBadge";
import ReviewAssignmentAction from "@/components/reviewer/ReviewAssignmentAction";
import { ReviewQueueService } from "@/services/ReviewQueueService";

export default async function ReviewHistoryPage() {
  const { getCurrentUser } = await import('@/app/actions/auth');
  const user: any = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }
  const userId = user.id;
  const userEmail = user.email || null;

  // Retrieve completed reviews history
  const assignments = await ReviewQueueService.getCompletedQueue(userId, userEmail);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Riwayat Review</h1>
        <p className="text-zinc-400 mt-2 text-sm">Daftar riwayat review artikel yang telah selesai Anda kerjakan.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden min-h-[300px]">
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
            <AlertCircle className="w-12 h-12 mb-4 text-zinc-700" />
            <p>Belum ada riwayat review yang selesai.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {assignments.map(assignment => {
              const subTitle = assignment.submissions?.title || "Judul Naskah";
              const journalName = assignment.submissions?.journals?.name || "JURNAL";

              return (
                <div key={assignment.id} className="p-6 hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between group">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ReviewStatusBadge status={assignment.status} />
                      <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700">
                        {journalName}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white group-hover:text-[#c9a84c] transition-colors leading-snug">
                      {subTitle}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                      <div>
                        Selesai:{" "}
                        <span className="text-zinc-300">
                          {assignment.completed_at
                            ? new Date(assignment.completed_at).toLocaleDateString("id-ID")
                            : "-"}
                        </span>
                      </div>
                      <div>
                        Rekomendasi Anda:{" "}
                        <span className="text-zinc-300 capitalize">
                          {assignment.recommendation || "Tidak ada"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <ReviewAssignmentAction assignment={assignment} showDelete={true} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
