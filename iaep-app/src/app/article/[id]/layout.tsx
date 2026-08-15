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
      .select('*, journal:journals(name, eissn, pissn), profiles:author_id(id, full_name, orcid_id, email)')
      .eq('id', id)
      .single();

    if (!article) return null;

    // Fetch authors from article_authors
    const { data: authors } = await supabase
      .from('article_authors')
      .select('*')
      .eq('article_id', id)
      .order('author_order', { ascending: true });

    // Enrich each author with all academic identifiers from author_identifiers table
    const enrichedAuthors = await Promise.all((authors || []).map(async (author: any) => {
      let profileId: string | null = null;
      let orcid_id = author.orcid_id || '';
      let sinta_id = '', scopus_id = '', wos_id = '', google_scholar = '', researchgate = '';

      if (author.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, orcid_id')
          .eq('email', author.email)
          .maybeSingle();

        if (profile) {
          profileId = profile.id;
          if (!orcid_id) orcid_id = profile.orcid_id || '';
        }
      }

      // Also check via article's linked author_id
      if (!profileId && article.author_id) {
        profileId = article.author_id;
      }

      if (profileId) {
        // Fetch from author_identifiers (primary source)
        const { data: identifiers } = await supabase
          .from('author_identifiers')
          .select('identifier_type, identifier_value')
          .eq('profile_id', profileId);

        if (identifiers) {
          identifiers.forEach((ident: any) => {
            const type = ident.identifier_type.toUpperCase();
            if (type === 'ORCID' && !orcid_id)       orcid_id      = ident.identifier_value;
            else if (type === 'SINTA')               sinta_id      = ident.identifier_value;
            else if (type === 'GOOGLE_SCHOLAR')      google_scholar = ident.identifier_value;
            else if (type === 'SCOPUS')              scopus_id     = ident.identifier_value;
            else if (type === 'WOS')                 wos_id        = ident.identifier_value;
            else if (type === 'RESEARCHGATE')        researchgate  = ident.identifier_value;
          });
        }
      }

      return { ...author, orcid_id, sinta_id, scopus_id, wos_id, google_scholar, researchgate };
    }));

    // Compute ISSN (prefer eissn, fallback pissn)
    const journalObj = article.journal || {};
    const issn = journalObj.eissn || journalObj.pissn || '';

    return {
      ...article,
      journal: { ...journalObj, issn },
      authors: enrichedAuthors
    };
  } catch (e) {
    console.error("Error fetching article sitemap metadata:", e);
    return null;
  }
}

import { MetadataEngine } from '@/services/metadata/MetadataEngine';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return {};

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.apasific.org';
  return MetadataEngine.generate(article, origin);
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
  
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.apasific.org';
  const jsonLd = article ? MetadataEngine.generateJsonLd(article, origin) : {};

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

