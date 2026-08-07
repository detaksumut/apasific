import { Metadata } from 'next';

function cleanDoi(rawDoi: string): string {
  if (!rawDoi) return '';
  // Strip out prefix URL if present to get only the raw DOI (e.g., 10.5281/zenodo.xxx)
  return rawDoi.replace(/https?:\/\/doi\.org\//i, '').trim();
}

export class MetadataEngine {
  static generate(article: any, origin: string): Metadata {
    const title = article.title || 'Untitled Article';
    const abstract = article.abstract || '';
    
    // Normalize DOI values
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

    // Ensure PDF URL is absolute - check file_url_galley first
    const rawPdfUrl = article.file_url_galley || article.file_url || '';
    const pdfUrl = rawPdfUrl
      ? (rawPdfUrl.startsWith('http') ? rawPdfUrl : `${origin}${rawPdfUrl.startsWith('/') ? '' : '/'}${rawPdfUrl}`)
      : '';

    const articleUrl = `${origin}/article/${article.id}`;
    const pubDate = article.published_at || article.created_at || '';
    const dateStr = pubDate ? new Date(pubDate).toISOString().split('T')[0] : '';
    
    // Contributor (Editor if available)
    const contributor = article.editor?.full_name || '';

    // Convert keywords to clean string
    const keywordsStr = Array.isArray(article.keywords) 
      ? article.keywords.join(', ') 
      : (article.keywords || '');

    return {
      title,
      description: abstract,
      alternates: {
        canonical: articleUrl,
      },
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
        
        // --- Google Scholar (citation) ---
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

    // Normalize DOI values
    const doiValue = cleanDoi(article.doi);
    const doiUrl = doiValue ? `https://doi.org/${doiValue}` : '';

    return {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": article.title,
      "author": authors.map((a: any) => ({
        "@type": "Person",
        "name": a.full_name,
        "affiliation": a.affiliation || undefined,
        "sameAs": a.orcid_id ? `https://orcid.org/${a.orcid_id}` : undefined
      })),
      "datePublished": article.published_at || article.created_at ? new Date(article.published_at || article.created_at).toISOString().split('T')[0] : undefined,
      "isPartOf": {
        "@type": "Periodical",
        "name": article.journal?.name || 'APASIFIC Jurnal'
      },
      "publisher": {
        "@type": "Organization",
        "name": "Association of Asia Pacific Academician (APASIFIC)"
      },
      "identifier": doiValue || undefined,
      "url": `${origin}/article/${article.id}`,
      "sameAs": doiUrl || undefined,
      "keywords": keywordsList.length > 0 ? keywordsList : undefined,
      "license": licenseUrl,
      "inLanguage": article.language || 'en'
    };
  }
}
