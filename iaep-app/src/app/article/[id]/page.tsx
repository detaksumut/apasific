// src/app/article/[id]/page.tsx

import { createClient } from '@supabase/supabase-js';
import ArticlePaywallClient from '@/components/article/ArticlePaywallClient';

async function getArticleData(id: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the submission
    const { data: data, error: fetchErr } = await supabase
      .from('submissions')
      .select('*, profiles:author_id(full_name, orcid, google_scholar, wos, ssrn), journals:journal_id(name, issn)')
      .eq('id', id)
      .eq('status', 'Published')
      .maybeSingle();

    if (fetchErr || !data) return null;

    // Fetch authors from article_authors
    const { data: dbAuthors } = await supabase
      .from('article_authors')
      .select('*')
      .eq('article_id', id)
      .order('author_order', { ascending: true });

    // Enrich ORCID if missing in article_authors but present in researcher_identifiers
    const enrichedAuthors = await Promise.all((dbAuthors || []).map(async (author: any) => {
      if (author.orcid_id) return author;

      if (author.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', author.email)
          .maybeSingle();

        if (profile) {
          const { data: researcher } = await supabase
            .from('researcher_identities')
            .select('id')
            .eq('user_id', profile.id)
            .maybeSingle();

          if (researcher) {
            const { data: identifier } = await supabase
              .from('researcher_identifiers')
              .select('identifier_value')
              .eq('researcher_id', researcher.id)
              .eq('provider', 'ORCID')
              .eq('verification_status', 'VERIFIED')
              .maybeSingle();

            if (identifier) {
              return {
                ...author,
                orcid_id: identifier.identifier_value
              };
            }
          }
        }
      }
      return author;
    }));

    // Construct the flat author string list for backward compatibility
    const authorNames = enrichedAuthors.map(a => a.full_name).join(', ');
    const firstOrcid = enrichedAuthors.find(a => a.orcid_id)?.orcid_id || data.profiles?.orcid || "";
    const googleScholar = data.profiles?.google_scholar || "";
    const wos = data.profiles?.wos || "";
    const ssrn = data.profiles?.ssrn || "";
    
    let hiddenDoi = data.doi || "";
    if (!hiddenDoi && typeof data.abstract === 'string' && data.abstract.trim().startsWith('{')) {
      try {
        const parsedAbs = JSON.parse(data.abstract);
        if (parsedAbs.doi) hiddenDoi = parsedAbs.doi;
      } catch (e) {}
    }

    const journalObj = data.journals || {};
    const journalName = journalObj.name || "APASIFIC IAEP";
    const journalIssn = journalObj.issn || "";

    return {
      id: data.id,
      title: data.title || "",
      author: authorNames || data.profiles?.full_name || "Penulis Tidak Diketahui",
      journal: journalName,
      journal_id: data.journal_id || "",
      date: data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID') : "Baru saja dipublikasi",
      abstract: data.abstract || "Abstrak tidak tersedia.",
      keywords: data.keywords ? data.keywords.split(',') : [],
      price: 50000,
      pdf_url: data.file_url_galley || data.file_url || "",
      orcid: firstOrcid,
      google_scholar: googleScholar,
      wos: wos,
      ssrn: ssrn,
      doi: hiddenDoi,
      zenodo_id: data.zenodo_id || "",
      cover_file_url: data.cover_file_url || "",
      volume: data.volume || "",
      issue: data.issue || "",
      created_at: data.created_at || "",
      published_at: data.published_at || "",
      issn: journalIssn,
      article_authors: enrichedAuthors
    };
  } catch (e) {
    console.error("Error loading article server-side:", e);
    return null;
  }
}

export default async function ArticlePaywallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleData(id);

  if (!article) {
    return (
      <div className="min-h-screen text-[#e8e8f0] font-sans pt-32 bg-[#05050a] flex flex-col items-center justify-center">
        <div className="text-center max-w-md p-8 bg-[#111120] border border-gray-800 rounded-2xl shadow-2xl">
          <svg className="w-16 h-16 text-[#c9a84c] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Artikel Tidak Ditemukan</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Artikel yang Anda cari tidak terdaftar atau belum dipublikasikan secara publik.
          </p>
          <a href="/" className="bg-[#c9a84c] text-black font-bold py-2 px-6 rounded-lg hover:bg-[#e8c97a] transition-all block text-center">
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return <ArticlePaywallClient initialArticle={article} id={id} />;
}
