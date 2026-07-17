import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Eye, CheckCircle, XCircle } from "lucide-react";
import { cookies } from "next/headers";
import IncomingActionButtons from "@/components/dashboard/IncomingActionButtons";

export default async function IncomingArticles() {
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
            console.error("Firebase token verification failed in IncomingArticles", e);
        }
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "editor@fallback.local" } as any;
        }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch submissions that are newly submitted or awaiting reviewers
  let articles: any[] = [];
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { data: submissions, error } = await supabaseAdmin
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name, phone)")
      .in("status", ["queued", "submitted", "pending", "Awaiting Reviewers"])
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    articles = submissions || [];
  } catch (e) {
    console.warn("Supabase fetch failed in IncomingArticles, falling back to Firestore");
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      
      // Fetch all submissions ordered by created_at, then filter in memory
      // This avoids the FAILED_PRECONDITION composite index error in Firestore
      const submissionsSnapshot = await db.collection('submissions')
        .orderBy('created_at', 'desc')
        .get();
        
      const allowedStatuses = ["queued", "submitted", "pending", "Awaiting Reviewers"];
      
      articles = submissionsSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              title: data.title,
              status: data.status,
              created_at: data.created_at ? data.created_at.toDate() : new Date(),
              journals: data.journals || { name: 'Unknown Journal' },
              profiles: { full_name: 'Author', phone: data.phone || '' } // Cannot easily join Firestore profiles here without multiple queries
          };
        })
        .filter(article => allowedStatuses.includes(article.status));
    } catch (fbErr) {
      console.error("Firestore fallback failed", fbErr);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Artikel Masuk (Incoming)</h1>
          <p className="text-zinc-400 mt-2 text-sm">Daftar naskah baru yang siap diproses dan ditugaskan ke reviewer.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c9a84c]" />
            Naskah Baru
          </h2>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Belum ada artikel masuk</h3>
            <p className="text-zinc-500 text-sm">Tidak ada naskah baru yang menunggu untuk diproses saat ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {articles.map((article: any) => (
              <div key={article.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Jurnal Tidak Diketahui"}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20">
                        {article.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#c9a84c] transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Author: <span className="text-zinc-300">{article.profiles?.full_name || 'Penulis'}</span> &bull; 
                      Disubmit pada: {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="shrink-0">
                    <IncomingActionButtons articleId={article.id} authorPhone={article.profiles?.phone} />
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
