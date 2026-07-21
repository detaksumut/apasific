import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, CheckCircle, ArrowRight, Plus } from "lucide-react";
import { cookies } from "next/headers";
import { getFirebaseAdmin } from "@/utils/firebase/server";
import { getFirestore } from "@/utils/firebase/db";

export default async function AuthorDashboard() {
  const supabase = await createClient();
  
  // 1. Dual-Auth Check: Try Supabase first, fallback to Firebase Cookie
  let { data: { user } } = await supabase.auth.getUser();
  let userName = 'Author';
  let userId = '';
  
  if (!user) {
    const cookieStore = await cookies();
    const fbToken = cookieStore.get('firebase_session')?.value;
    const fallbackUserId = cookieStore.get('supabase_fallback_session')?.value;
    
    if (fbToken || fallbackUserId) {
        try {
            const admin = getFirebaseAdmin();
            if (fbToken) {
               // fbToken is a Custom Token (JWT), not an ID Token. Decode it manually to get UID.
               const payloadBase64 = fbToken.split('.')[1];
               const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
               const fbUser = await admin.auth().getUser(payload.uid);
               user = { id: fbUser.uid, email: fbUser.email, user_metadata: { full_name: fbUser.displayName } } as any;
            }
        } catch (e) {
            console.error("Firebase token verification failed", e);
        }
        
        if (!user && fallbackUserId) {
           user = { id: fallbackUserId, email: "user@example.com", user_metadata: { full_name: "Author" } } as any;
        }
    }
  }

  if (!user) {
    redirect("/auth/login");
  }

  userId = user.id;

  // FIX THE ROOT CAUSE: Convert Firebase UID into a deterministic 32-char valid UUID format
  // so it matches what we save in submissions and profiles
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      const hex = Buffer.from(userId).toString('hex').padEnd(32, '0').slice(0, 32);
      userId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
  }

  // 2. Dual-Database Profile Fetch: Try Supabase, fallback to Firestore
  let role = 'author';
  try {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('full_name, role').eq('id', userId).single();
      if (profile && !profileError) {
          userName = profile.full_name;
          if (profile.role) role = profile.role.toLowerCase();
      } else {
          throw new Error("Supabase profile failed or empty");
      }
  } catch (e) {
      // Fallback to Firestore
      try {
          const db = getFirestore();
          const profileDoc = await db.collection('profiles').doc(userId).get();
          if (profileDoc.exists) {
              const data = profileDoc.data();
              userName = data?.full_name || user.user_metadata?.full_name || user.email || 'Author';
              if (data?.role) role = data.role.toLowerCase();
          }
      } catch(fbErr) {
          userName = user.user_metadata?.full_name || user.email || 'Author';
      }
  }

  const cookieStore = await cookies();
  const cookieRole = cookieStore.get('user_role')?.value;
  if (cookieRole && role === 'author') role = cookieRole.toLowerCase();

  // Redirect based on role if they hit the root dashboard
  if (role === 'layout editor') redirect('/dashboard/production/layout');
  if (role === 'cover editor') redirect('/dashboard/production/cover');
  if (role === 'publish editor') redirect('/dashboard/production/publish');
  if (role === 'admin editor') redirect('/dashboard/production/supervisor');
  if (role === 'supervisor') redirect('/dashboard/production/supervisor');
  if (role === 'editor') redirect('/dashboard/editor');
  if (role === 'admin') redirect('/dashboard/admin');
  if (role === 'reviewer') redirect('/dashboard/reviews');
  if (role === 'co_admin' || role === 'co-admin') redirect('/dashboard/admin/users');

  // 3. Dual-Database Submissions Fetch: Try Supabase, fallback to Firestore
  let articles: any[] = [];
  try {
      const { data: submissions, error } = await supabase
        .from("submissions")
        .select("*, journals(name)")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      articles = submissions || [];
  } catch (e) {
      console.warn("Supabase fetch failed, falling back to Firestore for submissions");
      try {
          const db = getFirestore();
          const submissionsSnapshot = await db.collection('submissions')
            .where('author_id', '==', userId)
            .orderBy('created_at', 'desc')
            .get();
          
          articles = submissionsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                  submission_id: doc.id,
                  title: data.title,
                  status: data.status,
                  created_at: data.created_at ? data.created_at.toDate() : new Date(),
                  journals: data.journals || { name: 'Unknown Journal' }
              };
          });
      } catch (fbErr) {
          console.error("Both databases failed to fetch submissions", fbErr);
          articles = [];
      }
  }
  
  const totalArticles = articles.length;
  const pendingArticles = articles.filter(a => ['queued', 'under_review'].includes(a.status)).length;
  const acceptedArticles = articles.filter(a => a.status === 'accepted').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Author Dashboard</h1>
          <p className="text-zinc-400 mt-2 text-sm">Welcome back, <span className="font-semibold text-zinc-300">{userName}</span>. Here is the overview of your manuscripts.</p>
        </div>
        <Link 
          href="/dashboard/submit" 
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium text-sm rounded-md hover:bg-emerald-500 transition-colors shadow-sm ring-1 ring-emerald-500/50"
        >
          <Plus className="w-4 h-4" />
          Submit New Article
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Articles */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Articles</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
              <FileText className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <p className="text-4xl font-light text-white">{totalArticles}</p>
        </div>

        {/* Pending Articles */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">In Review</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
              <Clock className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <p className="text-4xl font-light text-white">{pendingArticles}</p>
        </div>

        {/* Accepted Articles */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-6 rounded-xl hover:border-emerald-500/30 transition-colors relative group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Accepted</h3>
            <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-emerald-500/10 transition-colors">
              <CheckCircle className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <p className="text-4xl font-light text-white">{acceptedArticles}</p>
        </div>
      </div>

      {/* Recent Submissions List */}
      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50 flex justify-between items-center">
          <h3 className="font-semibold text-white text-sm">Recent Submissions</h3>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {articles.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <FileText className="w-10 h-10 text-zinc-700 mb-4" />
              <p className="text-zinc-500 text-sm">You haven't submitted any articles yet.</p>
              <Link href="/dashboard/submit" className="text-emerald-500 hover:text-emerald-400 text-sm mt-2 font-medium">Create your first submission &rarr;</Link>
            </div>
          ) : (
            articles.slice(0, 5).map((article) => (
              <div key={article.submission_id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex justify-between items-center gap-6">
                  <div className="flex-1">
                    <Link href={`/dashboard/submissions/${article.submission_id}`}>
                      <h4 className="font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors text-base line-clamp-1">{article.title}</h4>
                    </Link>
                    <div className="text-xs text-zinc-500 mt-2.5 flex flex-wrap gap-x-4 gap-y-2 items-center">
                       <span className="text-zinc-400 font-medium">{article.journals?.name || 'Unknown Journal'}</span>
                       <span className="text-zinc-700">•</span>
                       <span className={`uppercase font-semibold tracking-wider text-[10px] px-2 py-0.5 rounded-full border ${article.status === 'accepted' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`}>
                         {article.status.replace('_', ' ')}
                       </span>
                       <span className="text-zinc-700">•</span>
                       <span>{new Date(article.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/submissions/${article.submission_id}`} className="text-zinc-500 hover:text-emerald-500 transition-colors p-2 rounded-lg hover:bg-emerald-500/10 flex-shrink-0">
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
