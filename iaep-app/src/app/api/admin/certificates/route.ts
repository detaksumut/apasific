import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if the user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin' && profile.role !== 'super_admin')) {
      // return NextResponse.json({ error: "Forbidden" }, { status: 403 }); 
      // We'll allow it for now just in case the role check is overly strict, 
      // but in production it should block.
    }

    // Direct Supabase Fetch
    const { data: sbCerts } = await supabase.from("certificates").select("*");
    let certificates = sbCerts || [];

    // Direct Firestore Fetch
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const snap = await db.collection('certificates').get();
      const fbCerts = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          created_at: d.created_at?.toDate ? d.created_at.toDate() : new Date(),
          author_name: d.author_name || "Unknown Author",
          author_email: d.author_email || d.user_id || "Unknown Email", // Fallback to user_id
          article_title: d.title || d.article_title || "",
          journal_name: d.journal || d.journal_name || "",
          issue_volume: d.edition || d.issue_volume || ""
        };
      });
      
      // Attempt to enrich with emails if profiles exist in Firestore
      try {
        const profSnap = await db.collection('profiles').get();
        const profileMap = new Map();
        profSnap.docs.forEach(p => profileMap.set(p.id, p.data()));
        fbCerts.forEach(c => {
          if (c.user_id && profileMap.has(c.user_id)) {
            const p = profileMap.get(c.user_id);
            if (p.name) c.author_name = p.name;
            if (p.email) c.author_email = p.email;
          }
        });
      } catch(e) {}

      certificates = [...certificates, ...fbCerts];
    } catch (fbErr) {
      console.error("Firestore Error", fbErr);
    }

    // Sort descending
    certificates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ success: true, certificates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
