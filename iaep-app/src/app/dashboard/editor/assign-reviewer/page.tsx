import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserPlus, Search, BookOpen, Clock } from "lucide-react";
import { cookies } from "next/headers";
import AssignReviewerAction from "@/components/dashboard/AssignReviewerAction";


export default async function AssignReviewerPage() {
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
        } catch (e) {
            console.error("Firebase token verification failed in AssignReviewer", e);
        }
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "editor@fallback.local" } as any;
        }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch articles waiting for reviewers
  let articles: any[] = [];
  try {
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name)")
      .in("status", ["Awaiting Reviewers", "Pending Reviewer Approval", "Under Review"])
      .order("created_at", { ascending: false });
      
    if (error) {
       console.warn("Supabase fetch error in AssignReviewer:", error.message);
    }
    articles = submissions || [];
  } catch (e) {
    console.warn("Supabase fetch exception in AssignReviewer");
  }

  // Always fetch from Firestore as fallback to merge items that Supabase missed (e.g. Firebase UIDs)
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    
    const submissionsSnapshot = await db.collection('submissions')
      .orderBy('created_at', 'desc')
      .get();
      
    const allowedStatuses = ["Awaiting Reviewers", "Pending Reviewer Approval", "Under Review"];
    
    const fbArticles = submissionsSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            status: data.status,
            created_at: data.created_at ? data.created_at.toDate() : new Date(),
            journals: data.journals || { name: 'Unknown Journal' },
            profiles: { full_name: 'Author' }
        };
      })
      .filter(article => allowedStatuses.includes(article.status));
      
    // Merge Firestore articles that are not in Supabase
    fbArticles.forEach(fbArt => {
       if (!articles.find(a => a.id === fbArt.id || a.submission_id === fbArt.id)) {
           articles.push(fbArt);
       }
    });
    
    // Re-sort the merged array
    articles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (fbErr) {
    console.error("Firestore fallback failed", fbErr);
  }

  // Fetch all reviewers
  let allReviewers: any[] = [];
  try {
    const { data: reviewers } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "reviewer");
    allReviewers = reviewers || [];
  } catch (e) {
    console.warn("Supabase fetch for reviewers failed", e);
  }

  // Fallback / Merge from local JSON if Supabase is missing reviewers
  try {
    const fs = await import('fs');
    const path = await import('path');
    const jsonPath = path.join(process.cwd(), 'apasific_registered_users.json');
    if (fs.existsSync(jsonPath)) {
      const usersData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const jsonReviewers = usersData.filter((u: any) => u.role === 'reviewer');
      
      jsonReviewers.forEach((jr: any) => {
        // Only add if not already in allReviewers (matching by email)
        if (!allReviewers.find(r => r.email === jr.email)) {
          allReviewers.push({
            id: jr.id,
            full_name: jr.full_name,
            email: jr.email,
            role: 'reviewer',
            academic_field: jr.journal || 'General',
            university: jr.university,
            country: jr.country
          });
        }
      });
    }
  } catch (err) {
    console.error("Failed to load fallback reviewers from JSON", err);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Assign Reviewer</h1>
          <p className="text-zinc-400 mt-2 text-sm">Pilih naskah dan tugaskan ke mitra bestari (reviewer) yang sesuai dengan bidang keahlian.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#c9a84c]" />
            Naskah Menunggu Reviewer
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari naskah atau author..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
            />
          </div>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada naskah</h3>
            <p className="text-zinc-500 text-sm">Tidak ada naskah yang memerlukan penugasan reviewer saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {articles.map((article: any) => (
              <div key={article.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Jurnal Tidak Diketahui"}
                      </span>
                      {article.status === 'Under Review' ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Sedang Direview
                        </span>
                      ) : article.status === 'Pending Reviewer Approval' ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Menunggu Persetujuan
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Menunggu Reviewer
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#c9a84c] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Author: <span className="text-zinc-300">{article.profiles?.full_name || 'Penulis'}</span> &bull; 
                      <Clock className="inline w-3 h-3 ml-2 mr-1" /> {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="shrink-0">
                    <AssignReviewerAction article={article} reviewers={allReviewers} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
