import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck, FileText, CheckCircle, Search, Eye, UserPlus } from "lucide-react";
import MakeDecisionAction from "@/components/dashboard/MakeDecisionAction";
import { cookies } from "next/headers";

export default async function ReviewResultsPage() {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();

  // Dual-Auth Check: Fallback to Firebase Cookie if Supabase fails
  if (!user) {
    const cookieStore = await cookies();
    const fbToken = cookieStore.get('firebase_session')?.value;
    const fallbackUserId = cookieStore.get('supabase_fallback_session')?.value;
    
    if (fbToken || fallbackUserId) {
        try {
            if (fbToken) {
               const payloadBase64 = fbToken.split('.')[1];
               const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
               user = { id: payload.uid, email: "editor@firebase.local" } as any;
            }
        } catch (e) { }
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "editor@fallback.local" } as any;
        }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }

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

  const { createClient: createSupabaseAdmin } = await import('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch submissions that are in Review stage or relevant statuses (bypassing RLS with admin client)
  const { data: submissions } = await supabaseAdmin
    .from("submissions")
    .select("*, journals(name), profiles:author_id(full_name)")
    .or("stage.eq.Review,status.in.(Under Review,Reviewed,Revision Required,Review,Pending Review,submitted)")
    .order("updated_at", { ascending: false });

  let articles = submissions || [];

  // --- Fetch all reviewers ---
  let allReviewers: any[] = [];
  try {
    const { data: reviewers } = await supabaseAdmin.from("profiles").select("*").eq("role", "reviewer");
    allReviewers = reviewers || [];
  } catch (e) {
    console.warn("Supabase fetch for reviewers failed", e);
  }

  // --- Fetch Review Assignments ---
  let assignmentsMap: Record<string, any[]> = {};
  try {
    const { data: assignmentsData } = await supabaseAdmin
      .from("review_assignments")
      .select("*");
      
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
  } catch (e) {
    console.warn("Supabase fetch for assignments failed", e);
  }
  
  // Attach assignments
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

  // Filter ONLY articles that have completed reviews or are in Reviewed/Revision Required status
  articles = articles.filter(article => {
    const hasCompletedReview = article.assignments && article.assignments.some((a: any) => a.status === 'completed');
    const isReviewedStatus = ['Reviewed', 'Revision Required'].includes(article.status);
    return hasCompletedReview || isReviewedStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pemeriksaan Hasil Review</h1>
          <p className="text-zinc-400 mt-2 text-sm">Periksa catatan dari mitra bestari (reviewer) dan ambil keputusan editorial.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#c9a84c]" />
            Naskah Dalam Proses Evaluasi
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari naskah..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
            />
          </div>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada hasil review</h3>
            <p className="text-zinc-500 text-sm">Tidak ada naskah yang selesai direview saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {articles.map((article: any) => {
              const isCompleted = article.status === 'Reviewed' || (article.assignments && article.assignments.some((a: any) => a.status === 'completed'));
              return (
                <div key={article.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {article.journals?.name || "Jurnal Tidak Diketahui"}
                        </span>
                        {isCompleted ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Selesai Direview
                          </span>
                        ) : article.status === 'Revision Required' ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            Menunggu Revisi Author
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Sedang Direview
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#c9a84c] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        Author: <span className="text-zinc-300">{article.profiles?.full_name || 'Penulis'}</span> &bull; 
                        Update terakhir: {new Date(article.updated_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>

                      {article.assignments && article.assignments.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-zinc-800/50 pt-3">
                          {article.assignments.map((assignment: any) => {
                            const rev = allReviewers.find(r => r.id === assignment.reviewer_id);
                            const revName = rev ? rev.full_name : 'Reviewer Terhapus';
                            return (
                              <div key={assignment.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm bg-zinc-800/30 p-2 rounded-lg border border-zinc-700/50 w-fit">
                                <div className="flex items-center gap-2">
                                  <UserPlus className="w-3.5 h-3.5 text-[#c9a84c]" />
                                  <span className="text-zinc-300 font-medium">{revName}</span>
                                </div>
                                <div className="sm:border-l sm:border-zinc-700 sm:pl-2">
                                  {assignment.status === 'pending' && <span className="text-[10px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Menunggu Respons</span>}
                                  {assignment.status === 'accepted' && <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Diterima / Mulai Review</span>}
                                  {assignment.status === 'completed' && <span className="text-[10px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Selesai Direview</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div className="shrink-0 flex flex-wrap items-center justify-end gap-3">
                      <Link href={`/dashboard/editor/submissions/${article.id || article.submission_id}`} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700">
                        <Eye className="w-4 h-4 text-zinc-400" /> Lihat Detail
                      </Link>
                      {isCompleted && (
                        <MakeDecisionAction article={article} />
                      )}
                    </div>
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
