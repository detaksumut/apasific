import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminCertificates() {
  const supabase = await createClient();

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
        user_id: d.user_id,
        ...d,
        created_at: d.created_at?.toDate ? d.created_at.toDate() : new Date(),
        author_name: d.author_name || "Unknown Author",
        author_email: d.author_email || d.user_id || "Unknown Email",
        article_title: d.title || d.article_title || "",
        journal_name: d.journal || d.journal_name || "",
        issue_volume: d.edition || d.issue_volume || ""
      };
    });
    
    // Attempt to enrich with emails if profiles exist in Supabase
    try {
      const { data: profSnap } = await supabase.from('profiles').select('id, full_name, name, email');
      const profileMap = new Map();
      if (profSnap) {
        profSnap.forEach(p => profileMap.set(p.id, p));
      }
      fbCerts.forEach((c: any) => {
        if (c.user_id && profileMap.has(c.user_id)) {
          const p = profileMap.get(c.user_id);
          if (p.full_name || p.name) c.author_name = p.full_name || p.name;
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

  return (
    <div className="p-8 min-h-screen bg-[#05050a] text-gray-200 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-[#c9a84c] text-3xl font-bold font-serif mb-2">Sertifikat Publikasi</h2>
            <p className="text-gray-400 mt-2">Pantau seluruh Sertifikat Publikasi Artikel yang diterbitkan oleh sistem</p>
          </div>
        </div>

        <div className="bg-[#0d0d1a] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#151522] text-[#c9a84c] border-b border-gray-800">
                <th className="p-4 font-semibold text-sm">Penulis</th>
                <th className="p-4 font-semibold text-sm">Artikel</th>
                <th className="p-4 font-semibold text-sm">Jurnal & Volume</th>
                <th className="p-4 font-semibold text-sm">Tanggal Terbit</th>
                <th className="p-4 font-semibold text-sm text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    Belum ada sertifikat publikasi yang diterbitkan.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{cert.author_name || cert.authorName || cert.author || "Unknown"}</div>
                      <div className="text-xs text-gray-400 mt-1">{cert.author_email || cert.authorEmail || cert.email || "No email"}</div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="text-sm text-gray-300 font-medium line-clamp-2" title={cert.article_title || cert.title}>
                        {cert.article_title || cert.title}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-[#e8c97a]">{cert.journal_name || cert.journal}</div>
                      <div className="text-xs text-gray-400 mt-1">{cert.issue_volume || cert.edition || cert.issueVolume}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-300">
                        {new Date(cert.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Link 
                        href={`/dashboard/certificates/print/${cert.id}`} 
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30 hover:bg-[#c9a84c]/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Lihat Sertifikat
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
