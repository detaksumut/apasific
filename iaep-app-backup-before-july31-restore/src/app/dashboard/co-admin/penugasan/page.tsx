"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileText, UserPlus, Users, Search, GraduationCap, X, CheckCircle, Clock } from "lucide-react";
import { assignReviewer } from "@/app/actions/editor";

export default function PenugasanReviewerPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Assignment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // 1. Fetch Submissions awaiting reviewers
    const { data: subsData } = await supabase
      .from("submissions")
      .select("*, journals(name)")
      .eq("status", "Awaiting Reviewers")
      .order("created_at", { ascending: false });
    
    // 2. Fetch Reviewers using centralized server action (handles system_settings & profiles)
    const editorActions = await import("@/app/actions/editor");
    const revsRes = await editorActions.getActiveReviewers();
    const revsData = revsRes.success && revsRes.reviewers ? revsRes.reviewers : [];
      
    // 3. Fetch active review counts to calculate availability
    let activeCounts: Record<string, number> = {};
    const { data: activeReviews } = await supabase
      .from("review_assignments")
      .select("reviewer_id")
      .in("status", ["pending", "accepted", "under_review"]);
      
    if (activeReviews) {
      activeReviews.forEach(r => {
        if (r.reviewer_id) {
          activeCounts[r.reviewer_id] = (activeCounts[r.reviewer_id] || 0) + 1;
        }
      });
    }

    if (subsData) setSubmissions(subsData);
    if (revsData) {
      // Inject availability count
      const revsWithCounts = revsData.map(r => ({
        ...r,
        active_reviews: activeCounts[r.id] || 0
      }));
      setReviewers(revsWithCounts);
    }
    setLoading(false);
  };

  const openAssignModal = (submission: any) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleAssign = async (reviewer: any) => {
    setIsAssigning(reviewer.id);
    try {
      const res = await assignReviewer(selectedSubmission.id, reviewer.id, reviewer.full_name, reviewer.email);
      if (!res.success) throw new Error(res.error || "Gagal menugaskan reviewer");
      
      setIsModalOpen(false);
      fetchData(); // Refresh lists
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsAssigning(null);
    }
  };

  const filteredReviewers = reviewers.filter(r => {
    const nameMatch = (r.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const fieldMatch = (r.academic_field || "").toLowerCase().includes(fieldFilter.toLowerCase());
    return nameMatch && fieldMatch;
  });

  if (loading) return <div className="text-zinc-400 p-8 text-center animate-pulse">Memuat data...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-white tracking-tight">Penugasan Reviewer</h1>
        <p className="text-zinc-400 mt-2 text-sm">Tugaskan reviewer pada naskah yang telah lolos tahap administrasi awal.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-zinc-300 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Judul & Jurnal</th>
                <th className="px-6 py-4">Waktu Masuk</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Users className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">Tidak ada naskah yang menunggu penugasan reviewer.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium mb-1 line-clamp-2">{sub.title || "Tanpa Judul"}</div>
                      <span className="inline-block px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md font-medium text-[10px] mt-1">
                        {sub.journals?.name || "Jurnal Tidak Diketahui"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {new Date(sub.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 rounded-full font-medium text-xs">
                        <Clock className="w-3 h-3" /> {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openAssignModal(sub)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#c9a84c] hover:bg-[#e8c97a] text-black rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(201,168,76,0.2)] hover:shadow-[0_0_20px_rgba(201,168,76,0.4)]"
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign Reviewer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">Tugaskan Reviewer</h2>
                <p className="text-sm text-zinc-400 mt-1">Naskah: <span className="text-[#c9a84c]">{selectedSubmission.title}</span></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <GraduationCap className="w-4 h-4 text-[#c9a84c] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  placeholder="Filter Bidang Ilmu..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]"
                />
              </div>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama reviewer..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReviewers.map(reviewer => (
                  <div key={reviewer.id} className="p-4 border border-zinc-800 rounded-xl bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors flex flex-col justify-between">
                    <div className="mb-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white text-base">{reviewer.full_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${reviewer.active_reviews >= 3 ? 'bg-red-500/20 text-red-400' : reviewer.active_reviews > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {reviewer.active_reviews} Review Aktif
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-xs text-zinc-400">Bidang: <span className="text-zinc-300">{reviewer.academic_field || '-'}</span></span>
                        <span className="text-xs text-zinc-500">Univ: {reviewer.university || '-'}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAssign(reviewer)}
                      disabled={isAssigning !== null || reviewer.active_reviews >= 5}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                        ${isAssigning === reviewer.id ? 'bg-zinc-700 text-zinc-400' : 
                          reviewer.active_reviews >= 5 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' :
                          'bg-zinc-800 text-white hover:bg-[#c9a84c] hover:text-black border border-zinc-700 hover:border-[#c9a84c]'
                        }
                      `}
                    >
                      {isAssigning === reviewer.id ? "Menugaskan..." : 
                       reviewer.active_reviews >= 5 ? "Reviewer Penuh" : "Pilih Reviewer Ini"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
