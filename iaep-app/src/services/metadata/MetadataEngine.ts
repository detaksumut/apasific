import { Metadata } from 'next';

function cleanDoi(rawDoi: string): string {
  if (!rawDoi) return '';
  return rawDoi.replace(/https?:\/\/doi\.org\//i, '').trim();
}

export class MetadataEngine {
  static generate(article: any, origin: string): Metadata {
    const title = article.title || 'Untitled Article';
    const abstract = article.abstract || '';
    
    const doiValue = cleanDoi(article.doi);
    const doiUrl = doiValue ? `https://doi.org/${doiValue}` : '';
    
    const journalTitle = article.journal?.name || 'APASIFIC Jurnal';
    const issn = article.journal?.issn || '';
    const vol = article.volume || '';
    const issue = article.issue || '';
    const firstPage = article.firstpage || '1';
    const lastPage = article.lastpage || '';
    const license = article.license || 'CC BY 4.0';
    const lang = article.language || 'eng';
    
    const authors = article.authors || [];
    const authorNames = authors.map((a: any) => a.full_name);
    const authorOrcids = authors
      .map((a: any) => a.orcid_id ? `https://orcid.org/${a.orcid_id}` : '')
      .filter(Boolean);

    const rawPdfUrl = article.file_url_galley || article.file_url || '';
    const pdfUrl = rawPdfUrl
      ? (rawPdfUrl.startsWith('http') ? rawPdfUrl : `${origin}${rawPdfUrl.startsWith('/') ? '' : '/'}${rawPdfUrl}`)
      : '';

    const articleUrl = `${origin}/article/${article.id}`;
    const pubDate = article.published_at || article.created_at || '';
    const dateStr = pubDate ? new Date(pubDate).toISOString().split('T')[0] : '';
    
    const contributor = article.editor?.full_name || '';
    const keywordsStr = Array.isArray(article.keywords) 
      ? article.keywords.join(', ') 
      : (article.keywords || '');

    // Collect external profile URLs from enriched first author
    const firstAuthor = authors[0] || {};
    const orcidUrl       = firstAuthor.orcid_id       ? `https://orcid.org/${firstAuthor.orcid_id}` : '';
    const sintaUrl       = firstAuthor.sinta_id       ? `https://sinta.kemdikbud.go.id/authors/detail?id=${firstAuthor.sinta_id}&view=overview` : '';
    const scopusUrl      = firstAuthor.scopus_id      ? `https://www.scopus.com/authid/detail.uri?authorId=${firstAuthor.scopus_id}` : '';
    const wosUrl         = firstAuthor.wos_id         ? `https://www.webofscience.com/wos/author/record/${firstAuthor.wos_id}` : '';
    const scholarUrl     = firstAuthor.google_scholar ? `https://scholar.google.com/citations?user=${firstAuthor.google_scholar}` : '';
    const rgRaw          = firstAuthor.researchgate   || '';
    const researchgateUrl = rgRaw ? (rgRaw.startsWith('http') ? rgRaw : `https://www.researchgate.net/profile/${rgRaw}`) : '';

    return {
      title,
      description: abstract,
      alternates: { canonical: articleUrl },
      openGraph: {
        title,
        description: abstract,
        url: articleUrl,
        type: 'article',
        siteName: 'APASIFIC',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: abstract,
      },
      other: {
        // --- Dublin Core (DC) ---
        'DC.title': title,
        'DC.creator': authorNames.length > 0 ? authorNames : ['APASIFIC Author'],
        'DC.subject': article.discipline || keywordsStr || '',
        'DC.description': abstract,
        'DC.publisher': 'Association of Asia Pacific Academician (APASIFIC)',
        'DC.contributor': contributor,
        'DC.date': dateStr,
        'DC.type': 'Text',
        'DC.identifier': doiValue ? `doi:${doiValue}` : articleUrl,
        'DC.source': journalTitle + (issn ? ` (ISSN: ${issn})` : ''),
        'DC.language': lang,
        'DC.relation': doiUrl,
        'DC.coverage': article.country || '',
        'DC.rights': license,
        'DC.format': 'application/pdf',
        
        // --- Google Scholar (Highwire Press citation tags) ---
        'citation_title': title,
        'citation_author': authorNames.length > 0 ? authorNames : ['APASIFIC Author'],
        'citation_author_orcid': authorOrcids,
        'citation_publication_date': dateStr,
        'citation_journal_title': journalTitle,
        'citation_issn': issn,
        'citation_volume': vol,
        'citation_issue': issue,
        'citation_firstpage': firstPage,
        'citation_lastpage': lastPage,
        'citation_pdf_url': pdfUrl,
        'citation_doi': doiValue,
        'citation_abstract': abstract,
        'citation_keywords': keywordsStr,
        'citation_language': lang,
        'citation_publisher': 'Association of Asia Pacific Academician (APASIFIC)',
        'citation_fulltext_world_readable': 'yes',
        'citation_abstract_html_url': articleUrl,
        'citation_public_url': articleUrl,

        // --- Author External Profile Links (crawlable by ORCID, Scopus, WoS, Google Scholar) ---
        ...(orcidUrl        ? { 'citation_author_institution_orcid': orcidUrl }       : {}),
        ...(sintaUrl        ? { 'citation_author_sinta_url': sintaUrl }               : {}),
        ...(scopusUrl       ? { 'citation_author_scopus_url': scopusUrl }             : {}),
        ...(wosUrl          ? { 'citation_author_wos_url': wosUrl }                   : {}),
        ...(scholarUrl      ? { 'citation_author_scholar_url': scholarUrl }           : {}),
        ...(researchgateUrl ? { 'citation_author_researchgate_url': researchgateUrl } : {}),
      }
    };
  }

  static generateJsonLd(article: any, origin: string) {
    const authors = article.authors || [];
    const keywordsList = Array.isArray(article.keywords)
      ? article.keywords
      : (article.keywords ? article.keywords.split(',').map((k: string) => k.trim()) : []);

    const licenseUrl = article.license && article.license.includes('http')
      ? article.license
      : 'https://creativecommons.org/licenses/by/4.0/';

    const doiValue = cleanDoi(article.doi);
    const doiUrl = doiValue ? `https://doi.org/${doiValue}` : '';

    return {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": article.title,
      "author": authors.map((a: any) => {
        // Build all known sameAs URLs for this author
        const sameAsLinks: string[] = [];
        if (a.orcid_id)       sameAsLinks.push(`https://orcid.org/${a.orcid_id}`);
        if (a.sinta_id)       sameAsLinks.push(`https://sinta.kemdikbud.go.id/authors/detail?id=${a.sinta_id}&view=overview`);
        if (a.scopus_id)      sameAsLinks.push(`https://www.scopus.com/authid/detail.uri?authorId=${a.scopus_id}`);
        if (a.wos_id)         sameAsLinks.push(`https://www.webofscience.com/wos/author/record/${a.wos_id}`);
        if (a.google_scholar) sameAsLinks.push(`https://scholar.google.com/citations?user=${a.google_scholar}`);
        if (a.researchgate) {
          sameAsLinks.push(a.researchgate.startsWith('http') ? a.researchgate : `https://www.researchgate.net/profile/${a.researchgate}`);
        }

        return {
          "@type": "Person",
          "name": a.full_name,
          "affiliation": a.affiliation || undefined,
          "sameAs": sameAsLinks.length === 1 ? sameAsLinks[0] : (sameAsLinks.length > 1 ? sameAsLinks : undefined)
        };
      }),
      "datePublished": (article.published_at || article.created_at)
        ? new Date(article.published_at || article.created_at).toISOString().split('T')[0]
        : undefined,
      "isPartOf": {
        "@type": "Periodical",
        "name": article.journal?.name || 'APASIFIC Jurnal',
        "issn": article.journal?.issn || undefined
      },
      "publisher": {
        "@type": "Organization",
        "name": "Association of Asia Pacific Academician (APASIFIC)",
        "url": origin
      },
      "identifier": doiValue
        ? { "@type": "PropertyValue", "propertyID": "DOI", "value": doiValue }
        : undefined,
      "url": `${origin}/article/${article.id}`,
      "sameAs": doiUrl || undefined,
      "keywords": keywordsList.length > 0 ? keywordsList : undefined,
      "license": licenseUrl,
      "inLanguage": article.language || 'en',
      "abstract": article.abstract || undefined
    };
  }
}
