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
