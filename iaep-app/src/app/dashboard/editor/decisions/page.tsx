import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DecisionListWithModal from "@/components/dashboard/DecisionListWithModal";

export default async function DecisionsHistoryPage() {
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

  // Fetch submissions that have a final or intermediate decision using supabaseAdmin
  let articles: any[] = [];
  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { data: supaData } = await supabaseAdmin
      .from("submissions")
      .select("*, journals(name), profiles:author_id(full_name)")
      .order("updated_at", { ascending: false });

    // Fetch all review assignments
    const { data: assignmentsData } = await supabaseAdmin.from("review_assignments").select("*");

    if (supaData) {
      const isDecisionDoc = (a: any) => 
        ["Accepted", "accepted", "Rejected", "rejected", "Desk Reject", "Published", "Production Completed"].includes(a.status) ||
        Boolean(a.doi || a.zenodo_id);

      const filtered = supaData.filter(isDecisionDoc);

      // Title Deduplication
      const seenTitles = new Set<string>();
      articles = filtered.filter(a => {
        const clean = (a.title || '').trim().toLowerCase();
        if (!clean || seenTitles.has(clean)) return false;
        seenTitles.add(clean);
        return true;
      });

      // Attach assignments to each article
      if (assignmentsData) {
        articles = articles.map(art => {
          const matchingAssigns = assignmentsData.filter(assign => 
            assign.submission_id === art.id || 
            assign.submission_id === art.submission_id
          );
          return { ...art, assignments: matchingAssigns };
        });
      }
    }
  } catch (e) {
    console.error("Fetch error in DecisionsHistoryPage:", e);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Riwayat Keputusan</h1>
          <p className="text-zinc-400 mt-2 text-sm">Arsip naskah yang telah diberikan keputusan akhir (Accepted / Rejected / Published).</p>
        </div>
      </div>

      <DecisionListWithModal articles={articles} />
    </div>
  );
}
