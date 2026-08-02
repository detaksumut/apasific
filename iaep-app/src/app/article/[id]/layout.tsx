// src/app/article/[id]/layout.tsx

import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';

async function getArticle(id: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: article } = await supabase
      .from('submissions')
      .select('*, journal:journals(name, issn)')
      .eq('id', id)
      .single();

    if (!article) return null;

    // Fetch authors from article_authors
    const { data: authors } = await supabase
      .from('article_authors')
      .select('*')
      .eq('article_id', id)
      .order('author_order', { ascending: true });

    // Enrich ORCID if missing in article_authors but present in researcher_identifiers
    const enrichedAuthors = await Promise.all((authors || []).map(async (author: any) => {
      if (author.orcid_id) return author;

      if (author.email) {
        // Find profile id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', author.email)
          .maybeSingle();

        if (profile) {
          // Find researcher identity
          const { data: researcher } = await supabase
            .from('researcher_identities')
            .select('id')
            .eq('user_id', profile.id)
            .maybeSingle();

          if (researcher) {
            // Find verified ORCID identifier
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

    return {
      ...article,
      authors: enrichedAuthors
    };
  } catch (e) {
    console.error("Error fetching article sitemap metadata:", e);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return {};

  const authorsList = article.authors || [];
  const authorNames = authorsList.map((a: any) => a.full_name);
  const authorOrcids = authorsList.map((a: any) => a.orcid_id ? `https://orcid.org/${a.orcid_id}` : '').filter(Boolean);

  return {
    title: article.title,
    description: article.abstract,
    other: {
      'citation_title': article.title,
      'citation_author': authorNames.length > 0 ? authorNames : ['APASIFIC Author'],
      'citation_author_id': authorOrcids,
      'citation_publication_date': article.created_at ? new Date(article.created_at).toISOString().split('T')[0] : '',
      'citation_pdf_url': article.file_url || '',
      'citation_doi': article.doi || '',
      'citation_issn': article.journal?.issn || '',
      'citation_journal_title': article.journal?.name || 'APASIFIC Jurnal',
      'citation_volume': article.volume || '',
      'citation_issue': article.issue || '',
      'citation_firstpage': article.firstpage || '1',
      'citation_lastpage': article.lastpage || '',
    }
  };
}

export default async function ArticleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);
  
  let jsonLd = {};
  if (article) {
    const authorsList = article.authors || [];
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": article.title,
      "author": authorsList.map((a: any) => ({
        "@type": "Person",
        "name": a.full_name,
        "affiliation": a.affiliation || undefined,
        "sameAs": a.orcid_id ? `https://orcid.org/${a.orcid_id}` : undefined
      })),
      "datePublished": article.created_at ? new Date(article.created_at).toISOString().split('T')[0] : undefined,
      "isPartOf": {
        "@type": "Periodical",
        "name": article.journal?.name || 'APASIFIC Jurnal'
      },
      "publisher": {
        "@type": "Organization",
        "name": "ASIA"
      },
      "identifier": article.doi || undefined,
      "url": `https://apasific.org/article/${id}`,
      "sameAs": article.doi ? `https://doi.org/${article.doi}` : undefined
    };
  }

  return (
    <>
      {article && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
