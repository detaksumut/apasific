import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, CheckCircle, ArrowRight, Plus } from "lucide-react";

export default async function AuthorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch author's submissions
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*, journals(name)")
    .eq("submitter_id", user.id)
    .order("created_at", { ascending: false });

  const articles = submissions || [];
  
  const totalArticles = articles.length;
  const pendingArticles = articles.filter(a => ['queued', 'under_review'].includes(a.status)).length;
  const acceptedArticles = articles.filter(a => a.status === 'accepted').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-amber-500 font-bold tracking-wide">Author Dashboard</h1>
          <p className="text-zinc-400 mt-2">Welcome back, {user.user_metadata?.full_name || 'Author'}. Here is the overview of your manuscripts.</p>
        </div>
        <Link 
          href="/dashboard/submit" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-semibold rounded-lg hover:from-amber-500 hover:to-yellow-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <Plus className="w-5 h-5" />
          Submit New Article
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Articles */}
        <div className="bg-black/40 border border-amber-500/20 p-6 rounded-xl shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Total Articles</h3>
            <FileText className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-4xl font-bold font-serif text-white relative z-10">{totalArticles}</p>
        </div>

        {/* Pending Articles */}
        <div className="bg-black/40 border border-amber-500/20 p-6 rounded-xl shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">In Review</h3>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-4xl font-bold font-serif text-white relative z-10">{pendingArticles}</p>
        </div>

        {/* Accepted Articles */}
        <div className="bg-black/40 border border-amber-500/20 p-6 rounded-xl shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Accepted</h3>
            <CheckCircle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-4xl font-bold font-serif text-white relative z-10">{acceptedArticles}</p>
        </div>
      </div>

      <div className="bg-black/40 border border-amber-500/20 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-500/20 bg-black/60 flex justify-between items-center">
          <h3 className="font-bold text-amber-500 text-sm uppercase tracking-wider">Recent Submissions</h3>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {articles.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-zinc-500 text-sm mb-4">You haven't submitted any articles yet.</p>
            </div>
          ) : (
            articles.slice(0, 5).map((article) => (
              <div key={article.submission_id} className="p-6 hover:bg-white/5 transition-colors group">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">{article.title}</h4>
                    <div className="text-xs text-zinc-500 mt-2 flex gap-3 items-center">
                       <span className="bg-zinc-900 px-2 py-1 rounded text-zinc-400 border border-zinc-800">{article.journals?.name || 'Unknown Journal'}</span>
                       <span>•</span>
                       <span className="uppercase text-amber-600 font-bold tracking-wider text-[10px] bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">{article.status}</span>
                       <span>•</span>
                       <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/submissions/${article.submission_id}`} className="text-zinc-500 hover:text-amber-500 transition-colors p-2 bg-black/40 rounded-full border border-transparent hover:border-amber-500/30">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
