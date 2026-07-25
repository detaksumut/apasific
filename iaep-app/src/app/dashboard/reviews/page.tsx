import { redirect } from "next/navigation";
import { Clock, CheckCircle, AlertCircle, FileSignature } from "lucide-react";
import ReviewStatusBadge from "@/components/reviewer/ReviewStatusBadge";
import ReviewAssignmentAction from "@/components/reviewer/ReviewAssignmentAction";
import { ReviewQueueService } from "@/services/ReviewQueueService";
import { ReviewAssignmentRepository } from "@/repositories/ReviewAssignmentRepository";

export default async function ReviewerDashboard() {
  const { getCurrentUser } = await import('@/app/actions/auth');
  const user: any = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }
  const userId = user.id;
  const userEmail = user.email || null;

  // Retrieve assignments using Repository & Service
  const allAssignments = await ReviewAssignmentRepository.getAssignmentsForReviewer(userId, userEmail);
  const activeAssignments = await ReviewQueueService.getActiveQueue(userId, userEmail);

  // Compute stats
  const pendingAssignments = allAssignments.filter(a => a.status === 'pending');
  const inProgress = allAssignments.filter(a => a.status === 'accepted' || a.status === 'revision_pending' || a.status === 'revision_pending');
  const completed = allAssignments.filter(a => a.status === 'completed');
  
  const overdue = allAssignments.filter(a => 
    (a.status === 'accepted' || a.status === 'revision_pending') && 
    a.deadline && 
    new Date(a.deadline) < new Date()
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Reviewer</h1>
          <p className="text-zinc-400 mt-2 text-sm">Selamat datang kembali, tinjau tugas dan aktivitas reviu Anda.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-amber-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Tugas Menunggu</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-amber-500/10 transition-colors">
              <FileSignature className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">
            {pendingAssignments.length + inProgress.length}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Ulasan Selesai</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
              <CheckCircle className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
            {completed.length}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-red-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Terlewat Batas Waktu</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-red-500/10 transition-colors">
              <Clock className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white group-hover:text-red-400 transition-colors">
            {overdue.length}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-emerald-500" />
          Daftar Antrean Aktif
        </h2>

        {/* Pending & Active Assignments List */}
        <div className="space-y-4">
          {activeAssignments.length === 0 ? (
            <div className="p-12 border border-zinc-800/80 rounded-xl bg-zinc-900/30 text-center">
              <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">Belum ada tugas review aktif untuk Anda saat ini.</p>
            </div>
          ) : (
            activeAssignments.map((assignment: any) => (
              <div 
                key={assignment.id} 
                className="p-6 border border-zinc-800/80 rounded-xl bg-zinc-900/50 relative overflow-hidden group hover:border-[#c9a84c]/30 transition-all duration-300"
              >
                {/* Visual Status Indicator on Left Border */}
                {assignment.status === 'pending' && <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>}
                {(assignment.status === 'accepted' || assignment.status === 'reviewing') && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>}
                {(assignment.status === 'revision_pending' || assignment.status === 'revision_pending') && <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>}

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <ReviewStatusBadge status={assignment.status} />
                  <span className="text-xs font-semibold text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700">
                    {assignment.submissions?.journals?.name || "JURNAL"}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-[#c9a84c] transition-colors">
                  {assignment.submissions?.title || "Judul Naskah Tidak Ditemukan"}
                </h3>
                
                {/* Abstract Preview */}
                {assignment.submissions?.abstract && (
                  <div className="mb-4">
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                      {assignment.submissions.abstract}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-zinc-400 mb-4 border-t border-zinc-800/60 pt-4">
                  <div>Ditugaskan: <span className="text-zinc-300 font-medium">{new Date(assignment.assigned_at).toLocaleDateString('id-ID')}</span></div>
                  {assignment.deadline && (
                    <div>Batas Waktu: <span className="text-red-400 font-medium">{new Date(assignment.deadline).toLocaleDateString('id-ID')}</span></div>
                  )}
                </div>

                {/* Unified Action buttons and forms */}
                <ReviewAssignmentAction assignment={assignment} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
