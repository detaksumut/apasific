// src/app/article/[id]/page.tsx

export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import ArticlePaywallClient from '@/components/article/ArticlePaywallClient';
import { AsiaIndexService } from '@/services/asia-index/AsiaIndexService';

async function getArticleData(id: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the submission
    const { data: data, error: fetchErr } = await supabase
      .from('submissions')
      .select('*, profiles:author_id(full_name, orcid_id), journals:journal_id(name, pissn, eissn)')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !data) return null;
    if (data.status !== 'Published' && data.status !== 'published') {
      return null;
    }

    // Fetch authors from article_authors
    const { data: dbAuthors } = await supabase
      .from('article_authors')
      .select('*')
      .eq('article_id', id)
      .order('author_order', { ascending: true });

    // Fetch external publication records
    const { data: extPubs } = await supabase
      .from('external_publication_records')
      .select('*')
      .eq('publication_id', id);

    // Fetch external discovery records
    const { data: extDiscoveries } = await supabase
      .from('external_discovery_records')
      .select('*')
      .eq('publication_id', id);

    // Enrich ORCID and other identifiers if missing in article_authors
    const enrichedAuthors = await Promise.all((dbAuthors || []).map(async (author: any) => {
      let orcid_id = author.orcid_id || "";
      let sinta_id = "";
      let scopus_id = "";
      let wos_id = "";
      let ssrn_id = "";
      let google_scholar = "";

      if (author.email) {
        // 1. Fetch profile matching the author's email
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, orcid_id')
          .eq('email', author.email)
          .maybeSingle();

        if (profile) {
          if (!orcid_id) orcid_id = profile.orcid_id || "";

          // 2. Fetch identifiers from author_identifiers
          const { data: identifiers } = await supabase
            .from('author_identifiers')
            .select('*')
            .eq('profile_id', profile.id);

          if (identifiers) {
            identifiers.forEach((ident: any) => {
              const type = ident.identifier_type.toUpperCase();
              if (type === 'ORCID' && !orcid_id) orcid_id = ident.identifier_value;
              else if (type === 'SINTA') sinta_id = ident.identifier_value;
              else if (type === 'GOOGLE_SCHOLAR') google_scholar = ident.identifier_value;
              else if (type === 'SCOPUS' || type === 'SCOPUS AUTHOR ID') scopus_id = ident.identifier_value;
              else if (type === 'WOS' || type === 'RESEARCHERID (WOS)' || type === 'WEB OF SCIENCE') wos_id = ident.identifier_value;
              else if (type === 'SSRN' || type === 'SSRN AUTHOR ID') ssrn_id = ident.identifier_value;
            });
          }
        }
      }

      return {
        ...author,
        orcid_id: orcid_id || "",
        sinta_id,
        google_scholar,
        scopus_id,
        wos_id,
        ssrn_id
      };
    }));

    // Construct the flat author string list for backward compatibility
    const authorNames = enrichedAuthors.map(a => a.full_name).join(', ');
    const firstAuthor = enrichedAuthors[0] || {};
    const firstOrcid = enrichedAuthors.find(a => a.orcid_id)?.orcid_id || data.profiles?.orcid_id || "";

    const googleScholar = enrichedAuthors.find(a => a.google_scholar)?.google_scholar || "";
    const wos = firstAuthor.wos_id || data.profiles?.wos || "";
    const ssrn = firstAuthor.ssrn_id || data.profiles?.ssrn || "";
    
    let hiddenDoi = data.doi || "";
    if (!hiddenDoi && typeof data.abstract === 'string' && data.abstract.trim().startsWith('{')) {
      try {
        const parsedAbs = JSON.parse(data.abstract);
        if (parsedAbs.doi) hiddenDoi = parsedAbs.doi;
      } catch (e) {}
    }

    const journalObj = data.journals || {};
    const journalName = journalObj.name || "APASIFIC IAEP";
    const journalIssn = journalObj.eissn || journalObj.pissn || "";

    const baseArticle = {
      id: data.id,
      title: data.title || "",
      author: data.author || authorNames || data.profiles?.full_name || "Penulis Tidak Diketahui",
      journal: journalName,
      journal_id: data.journal_id || "",
      date: data.published_at 
        ? new Date(data.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : (data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"),
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
      article_authors: enrichedAuthors,
      extPubs,
      extDiscoveries,
      scopus_citations: data.scopus_citations
    };

    // Additive ASIA Index Record Resolution (fail-safe)
    let asiaRecord = null;
    try {
      asiaRecord = await AsiaIndexService.resolveOrRegisterAsiaRecord(id, baseArticle);
    } catch (asiaErr) {
      console.warn('[Article Page] AsiaIndexService resolution skipped:', asiaErr);
    }

    return {
      ...baseArticle,
      asiaRecord
    };
  } catch (e) {
    console.error("Error loading article server-side:", e);
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await getArticleData(id);

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan | APASIFIC'
    };
  }

  const authors = (article.article_authors || [])
    .map((author: any) => author.full_name)
    .filter(Boolean);

  const publicationDate =
    article.published_at ||
    article.created_at ||
    '';

  const pdfUrl = article.pdf_url
    ? `https://www.apasific.org/api/article/${article.id}/pdf`
    : '';

  return {
    title: article.title,
    description: article.abstract || '',
    authors: authors.map((name: string) => ({ name })),
    alternates: {
      canonical: `https://www.apasific.org/article/${article.id}`
    },
    other: {
      citation_title: article.title,
      citation_author: authors,
      citation_publication_date: publicationDate
        ? new Date(publicationDate).toISOString().split('T')[0]
        : '',
      citation_journal_title: article.journal || '',
      citation_volume: article.volume || '',
      citation_issue: article.issue || '',
      citation_issn: article.issn || '',
      citation_pdf_url: pdfUrl,
      citation_doi: article.doi
        ? article.doi.replace(/^https?:\/\/doi\.org\//i, '')
        : ''
    }
  };
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
