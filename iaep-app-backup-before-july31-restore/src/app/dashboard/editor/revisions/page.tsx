import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { FileEdit, Search, AlertCircle, Phone, Download } from "lucide-react";
import FonnteForwardButton from "@/components/FonnteForwardButton";

export default async function RevisionsPage() {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const cookieStore = await cookies();
    const fbToken = cookieStore.get('firebase_session')?.value;
    const fallbackUserId = cookieStore.get('supabase_fallback_session')?.value;
    
    if (fbToken || fallbackUserId) {
        user = { id: fallbackUserId || "firebase-user", email: "editor@local" } as any;
    } else {
        redirect("/auth/login");
    }
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

  // Fetch all submissions
  const { data: submissions } = await supabaseAdmin
    .from("submissions")
    .select("*, journals(name), profiles:author_id(full_name, phone)")
    .order("updated_at", { ascending: false });

  // Fetch all review assignments
  const { data: assignments } = await supabaseAdmin
    .from("review_assignments")
    .select("*, reviewer:profiles!review_assignments_reviewer_id_fkey(full_name, phone)");

  if (assignments) {
    for (let i = 0; i < assignments.length; i++) {
      const a = assignments[i];
      if (!a.reviewer && a.reviewer_email) {
        const { data: prof } = await supabaseAdmin.from('profiles').select('full_name, phone').eq('email', a.reviewer_email).single();
        if (prof) {
          a.reviewer = { full_name: prof.full_name, phone: prof.phone };
        }
      }
    }
  }

  // Map assignments to submissions
  const revisionSubmissions: any[] = [];
  const assignmentsMap: Record<string, any[]> = {};

  if (assignments) {
    assignments.forEach(assignment => {
      const k1 = String(assignment.submission_id || '');
      const k2 = unhexUuid(k1);
      
      if (k1) {
        if (!assignmentsMap[k1]) assignmentsMap[k1] = [];
        assignmentsMap[k1].push(assignment);
      }
      if (k2 && k2 !== k1) {
        if (!assignmentsMap[k2]) assignmentsMap[k2] = [];
        assignmentsMap[k2].push(assignment);
      }
    });
  }

  // Filter submissions that have revision requests
  if (submissions) {
    submissions.forEach(sub => {
      const subAssignments = assignmentsMap[sub.id] || [];
      const hasRevisionRequest = subAssignments.some(
        a => ['major_revision', 'revisions_major', 'minor_revision', 'revisions_minor'].includes(a.recommendation)
      );

      if (hasRevisionRequest) {
        // Attach final_review_file_url if any reviewer uploaded it
        const finalReviewFile = subAssignments.find((a: any) => a.final_review_file_url)?.final_review_file_url || null;
        const finalReviewNotes = subAssignments.find((a: any) => a.final_review_notes)?.final_review_notes || '';
        revisionSubmissions.push({
          ...sub,
          reviews: subAssignments,
          final_review_file_url: finalReviewFile,
          final_review_notes: finalReviewNotes
        });
      }
    });
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileEdit className="w-8 h-8 text-orange-400" />
            Permintaan Revisi
          </h1>
          <p className="text-gray-400">Daftar naskah yang membutuhkan revisi dari penulis berdasarkan rekomendasi reviewer.</p>
        </div>
      </div>

      <div className="bg-[#151525] rounded-xl shadow-2xl border border-white/5 overflow-hidden">
        {revisionSubmissions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
            <p>Tidak ada naskah yang sedang menunggu revisi saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a2e] border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                  <th className="p-4 font-semibold">Naskah</th>
                  <th className="p-4 font-semibold">Penulis</th>
                  <th className="p-4 font-semibold">Rekomendasi Reviewer</th>
                  <th className="p-4 font-semibold text-center">Revisi Author</th>
                  <th className="p-4 font-semibold text-center">File Final Reviewer</th>
                  <th className="p-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {revisionSubmissions.map((sub) => {
                  const revisionReviews = sub.reviews.filter((r: any) => 
                    ['major_revision', 'revisions_major', 'minor_revision', 'revisions_minor'].includes(r.recommendation)
                  );
                  
                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-200 mb-1 line-clamp-2">{sub.title}</div>
                        <div className="text-xs text-gray-500">
                          ID: {sub.id.substring(0,8)}... | {sub.journals?.name || 'No Journal'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-300">{sub.profiles?.full_name || 'Unknown'}</div>
                        {sub.profiles?.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" /> {sub.profiles.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 items-start">
                          {revisionReviews.map((rev: any, idx: number) => (
                            <span key={idx} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              (rev.recommendation === 'major_revision' || rev.recommendation === 'revisions_major') 
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {(rev.recommendation === 'major_revision' || rev.recommendation === 'revisions_major') ? 'Revisi Mayor' : 'Revisi Minor'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {sub.revised_file_url ? (
                          <a href={sub.revised_file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs border border-green-500/20 mx-auto hover:bg-green-500/20 transition-colors">
                            <Download className="w-3 h-3" /> Unduh Revisi
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs border border-red-500/20 mx-auto">
                            Menunggu Penulis
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {sub.final_review_file_url ? (
                          <div className="flex flex-col items-center gap-1">
                            <a href={sub.final_review_file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                              <Download className="w-3 h-3" /> File Final
                            </a>
                            {sub.final_review_notes && (
                              <div className="text-xs text-gray-500 max-w-[120px] truncate" title={sub.final_review_notes}>{sub.final_review_notes}</div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-zinc-800 text-zinc-500 rounded-full text-xs border border-zinc-700 mx-auto">
                            Menunggu Reviewer
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {sub.revised_file_url && (
                            <FonnteForwardButton 
                              title={sub.title} 
                              revisedFileUrl={sub.revised_file_url} 
                              reviews={sub.reviews} 
                            />
                          )}
                          <Link 
                            href={`/dashboard/editor/submissions/${sub.id}`}
                            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shadow-lg shadow-orange-900/20"
                          >
                            Tindak Lanjuti
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
