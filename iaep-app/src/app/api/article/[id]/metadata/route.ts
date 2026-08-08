// src/app/api/article/[id]/metadata/route.ts
// Dedicated metadata endpoint for academic crawlers (Google Scholar, OpenAIRE, BASE, Scopus, etc.)
// URL: /api/article/[id]/metadata?format=json|jsonld|bibtex|dc
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Escape all XML special characters properly
function xmlEscape(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function getArticleMetadata(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: article } = await supabase
    .from('submissions')
    .select('*, journals:journal_id(name, eissn, pissn), profiles:author_id(id, full_name, email, orcid_id)')
    .eq('id', id)
    .eq('status', 'Published')
    .maybeSingle();

  if (!article) return null;

  // Try article_authors first
  const { data: authors } = await supabase
    .from('article_authors')
    .select('*')
    .eq('article_id', id)
    .order('author_order', { ascending: true });

  // If no article_authors found, fall back to the linked profile (author_id)
  let baseAuthors: any[] = authors && authors.length > 0 ? authors : [];

  if (baseAuthors.length === 0 && article.profiles) {
    // Create a synthetic author entry from linked profile
    baseAuthors = [{
      full_name: article.profiles.full_name || article.author || 'Unknown Author',
      email: article.profiles.email || '',
      affiliation: null,
      author_order: 1,
    }];
  }

  // Enrich each author with all academic identifiers
  const enrichedAuthors = await Promise.all(baseAuthors.map(async (author: any) => {
    let profileId: string | null = null;
    const ids: Record<string, string> = {};

    // Try to find profile by email first
    if (author.email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, orcid_id')
        .eq('email', author.email)
        .maybeSingle();
      if (profile) {
        profileId = profile.id;
        if (profile.orcid_id) ids['ORCID'] = profile.orcid_id;
      }
    }

    // Fallback to article's linked author_id
    if (!profileId && article.author_id) {
      profileId = article.author_id;
      if (article.profiles?.orcid_id) ids['ORCID'] = article.profiles.orcid_id;
    }

    if (profileId) {
      const { data: idents } = await supabase
        .from('author_identifiers')
        .select('identifier_type, identifier_value')
        .eq('profile_id', profileId);

      (idents || []).forEach((d: any) => {
        ids[d.identifier_type.toUpperCase()] = d.identifier_value;
      });
    }

    return { ...author, identifiers: ids };
  }));

  const journal = article.journals || {};
  const issn = journal.eissn || journal.pissn || '';
  const doi = (article.doi || '').replace(/https?:\/\/doi\.org\//i, '').trim();
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.apasific.org';

  // Use stable redirect URL instead of expiring signed URL
  const stablePdfUrl = (article.file_url_galley || article.file_url)
    ? `${origin}/api/article/${id}/pdf`
    : null;

  return { article, enrichedAuthors, journal, issn, doi, origin, stablePdfUrl };
}

function buildAuthorIdentifiers(a: any) {
  const ids = a.identifiers || {};
  return {
    ORCID:          ids['ORCID']          ? { id: ids['ORCID'],          url: `https://orcid.org/${ids['ORCID']}` } : undefined,
    SINTA:          ids['SINTA']           ? { id: ids['SINTA'],           url: `https://sinta.kemdikbud.go.id/authors/detail?id=${ids['SINTA']}&view=overview` } : undefined,
    SCOPUS:         ids['SCOPUS']          ? { id: ids['SCOPUS'],          url: `https://www.scopus.com/authid/detail.uri?authorId=${ids['SCOPUS']}` } : undefined,
    WOS:            ids['WOS']             ? { id: ids['WOS'],             url: `https://www.webofscience.com/wos/author/record/${ids['WOS']}` } : undefined,
    GOOGLE_SCHOLAR: ids['GOOGLE_SCHOLAR']  ? { id: ids['GOOGLE_SCHOLAR'],  url: `https://scholar.google.com/citations?user=${ids['GOOGLE_SCHOLAR']}` } : undefined,
    RESEARCHGATE:   ids['RESEARCHGATE']    ? { url: ids['RESEARCHGATE'].startsWith('http') ? ids['RESEARCHGATE'] : `https://www.researchgate.net/profile/${ids['RESEARCHGATE']}` } : undefined,
  };
}

function buildSameAs(identifiers: Record<string, string>): string[] {
  const links: string[] = [];
  if (identifiers['ORCID'])          links.push(`https://orcid.org/${identifiers['ORCID']}`);
  if (identifiers['SINTA'])           links.push(`https://sinta.kemdikbud.go.id/authors/detail?id=${identifiers['SINTA']}&view=overview`);
  if (identifiers['SCOPUS'])          links.push(`https://www.scopus.com/authid/detail.uri?authorId=${identifiers['SCOPUS']}`);
  if (identifiers['WOS'])             links.push(`https://www.webofscience.com/wos/author/record/${identifiers['WOS']}`);
  if (identifiers['GOOGLE_SCHOLAR'])  links.push(`https://scholar.google.com/citations?user=${identifiers['GOOGLE_SCHOLAR']}`);
  if (identifiers['RESEARCHGATE'])    links.push(identifiers['RESEARCHGATE'].startsWith('http') ? identifiers['RESEARCHGATE'] : `https://www.researchgate.net/profile/${identifiers['RESEARCHGATE']}`);
  return links;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = req.nextUrl.searchParams.get('format') || 'json';

  const meta = await getArticleMetadata(id);
  if (!meta) {
    return NextResponse.json({ error: 'Article not found or not published' }, { status: 404 });
  }

  const { article, enrichedAuthors, journal, issn, doi, origin, stablePdfUrl } = meta;
  const pubDate = article.published_at || article.created_at || '';
  const dateStr = pubDate ? new Date(pubDate).toISOString().split('T')[0] : '';
  const articleUrl = `${origin}/article/${id}`;
  const pdfUrl = stablePdfUrl;

  // ---- JSON (default) ----
  if (format === 'json') {
    return NextResponse.json({
      schema: 'APASIFIC Academic Metadata v1.0',
      article_url: articleUrl,
      metadata_url: `${origin}/api/article/${id}/metadata`,
      title: article.title,
      abstract: article.abstract,
      keywords: article.keywords ? article.keywords.split(',').map((k: string) => k.trim()) : [],
      language: article.language || 'en',
      doi: doi ? `https://doi.org/${doi}` : null,
      publisher: {
        name: 'Association of Asia Pacific Academician (APASIFIC)',
        url: origin,
        issn_e: journal.eissn || null,
        issn_p: journal.pissn || null,
      },
      journal: { name: journal.name, issn },
      volume: article.volume || null,
      issue: article.issue || null,
      date_published: dateStr,
      license: article.license || 'CC BY 4.0',
      pdf_url: pdfUrl,
      authors: enrichedAuthors.map((a: any) => ({
        name: a.full_name,
        email: a.email || undefined,
        affiliation: a.affiliation || undefined,
        identifiers: buildAuthorIdentifiers(a),
      })),
      also_available_as: {
        jsonld:      `${origin}/api/article/${id}/metadata?format=jsonld`,
        bibtex:      `${origin}/api/article/${id}/metadata?format=bibtex`,
        dublin_core: `${origin}/api/article/${id}/metadata?format=dc`,
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  // ---- JSON-LD (Schema.org) ----
  if (format === 'jsonld') {
    const jsonld = {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: article.title,
      abstract: article.abstract,
      datePublished: dateStr,
      inLanguage: article.language || 'en',
      url: articleUrl,
      sameAs: doi ? `https://doi.org/${doi}` : undefined,
      identifier: doi ? { '@type': 'PropertyValue', propertyID: 'DOI', value: doi } : undefined,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      isPartOf: { '@type': 'Periodical', name: journal.name, issn: issn || undefined },
      publisher: { '@type': 'Organization', name: 'Association of Asia Pacific Academician (APASIFIC)', url: origin },
      author: enrichedAuthors.map((a: any) => {
        const sameAs = buildSameAs(a.identifiers || {});
        return {
          '@type': 'Person',
          name: a.full_name,
          affiliation: a.affiliation || undefined,
          sameAs: sameAs.length === 1 ? sameAs[0] : (sameAs.length > 1 ? sameAs : undefined)
        };
      }),
      keywords: article.keywords || undefined,
    };
    return new NextResponse(JSON.stringify(jsonld, null, 2), {
      headers: { 'Content-Type': 'application/ld+json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }
    });
  }

  // ---- BibTeX ----
  if (format === 'bibtex') {
    const key = (enrichedAuthors[0]?.full_name?.split(' ').pop() || 'Author') + (dateStr.substring(0, 4) || '2026');
    const authorStr = enrichedAuthors.map((a: any) => a.full_name).join(' and ');
    const bibtex = [
      `@article{${key},`,
      `  title     = {${(article.title || '').replace(/[{}]/g, '')}},`,
      `  author    = {${authorStr}},`,
      `  journal   = {${journal.name || 'APASIFIC Jurnal'}},`,
      `  year      = {${dateStr.substring(0, 4) || '2026'}},`,
      `  volume    = {${article.volume || ''}},`,
      `  number    = {${article.issue || ''}},`,
      `  issn      = {${issn}},`,
      `  doi       = {${doi || ''}},`,
      `  url       = {${articleUrl}},`,
      `  publisher = {Association of Asia Pacific Academician (APASIFIC)},`,
      `  license   = {CC BY 4.0},`,
      `}`,
    ].join('\n');
    return new NextResponse(bibtex, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Disposition': `attachment; filename="${key}.bib"`, 'Access-Control-Allow-Origin': '*' }
    });
  }

  // ---- Dublin Core XML ----
  if (format === 'dc') {
    const authorTags = enrichedAuthors.map((a: any) => `  <dc:creator>${xmlEscape(a.full_name)}</dc:creator>`).join('\n');
    const orcidTags = enrichedAuthors
      .filter((a: any) => a.identifiers?.['ORCID'])
      .map((a: any) => `  <dc:identifier>https://orcid.org/${xmlEscape(a.identifiers['ORCID'])}</dc:identifier>`)
      .join('\n');

    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"`,
      `           xmlns:dc="http://purl.org/dc/elements/1.1/"`,
      `           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
      `           xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">`,
      `  <dc:title>${xmlEscape(article.title || '')}</dc:title>`,
      authorTags,
      `  <dc:description>${xmlEscape(article.abstract || '')}</dc:description>`,
      `  <dc:publisher>Association of Asia Pacific Academician (APASIFIC)</dc:publisher>`,
      `  <dc:date>${dateStr}</dc:date>`,
      `  <dc:type>Text</dc:type>`,
      `  <dc:format>application/pdf</dc:format>`,
      `  <dc:identifier>${doi ? xmlEscape(`https://doi.org/${doi}`) : xmlEscape(articleUrl)}</dc:identifier>`,
      orcidTags,
      `  <dc:source>${xmlEscape(journal.name || 'APASIFIC Jurnal')}${issn ? ` (ISSN: ${issn})` : ''}</dc:source>`,
      `  <dc:language>${article.language || 'en'}</dc:language>`,
      `  <dc:rights>CC BY 4.0 - https://creativecommons.org/licenses/by/4.0/</dc:rights>`,
      `  <dc:subject>${xmlEscape(article.keywords || '')}</dc:subject>`,
      doi ? `  <dc:relation>${xmlEscape(`https://doi.org/${doi}`)}</dc:relation>` : '',
      pdfUrl ? `  <dc:relation>${xmlEscape(pdfUrl)}</dc:relation>` : '',
      `</oai_dc:dc>`,
    ].filter(Boolean).join('\n');

    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }
    });
  }

  return NextResponse.json({ error: 'Unsupported format. Use ?format=json|jsonld|bibtex|dc' }, { status: 400 });
}
