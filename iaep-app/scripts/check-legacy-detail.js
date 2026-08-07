// Polyfill WebSocket for Node.js < 22 to satisfy Supabase JS SDK
global.WebSocket = require('ws');

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.warn("Failed to parse .env.local file:", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase environment variables missing in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function cleanDoi(rawDoi) {
  if (!rawDoi) return '';
  return rawDoi.replace(/https?:\/\/doi\.org\//i, '').trim();
}

class MetadataEngine {
  static generate(article, origin) {
    const title = article.title || 'Untitled Article';
    const abstract = article.abstract || '';
    const doiValue = cleanDoi(article.doi);
    const doiUrl = doiValue ? `https://doi.org/${doiValue}` : '';
    const journalTitle = article.journals?.name || 'APASIFIC Jurnal';
    const issn = article.journals?.issn || '';
    const vol = article.volume || '';
    const issue = article.issue || '';
    const firstPage = article.firstpage || '1';
    const lastPage = article.lastpage || '';
    const license = article.license || 'CC BY 4.0';
    const lang = article.language || 'eng';
    
    const authors = article.article_authors || [];
    const authorNames = authors.map(a => a.full_name);
    const authorOrcids = authors
      .map(a => a.orcid_id ? `https://orcid.org/${a.orcid_id}` : '')
      .filter(Boolean);

    const rawPdfUrl = article.file_url_galley || article.file_url || '';
    const pdfUrl = rawPdfUrl
      ? (rawPdfUrl.startsWith('http') ? rawPdfUrl : `${origin}${rawPdfUrl.startsWith('/') ? '' : '/'}${rawPdfUrl}`)
      : '';

    const articleUrl = `${origin}/article/${article.id}`;
    const pubDate = article.published_at || article.created_at || '';
    const dateStr = pubDate ? new Date(pubDate).toISOString().split('T')[0] : '';
    const contributor = article.editor?.full_name || '';
    const keywordsStr = Array.isArray(article.keywords) ? article.keywords.join(', ') : (article.keywords || '');

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

  static generateJsonLd(article, origin) {
    const authors = article.article_authors || [];
    const keywordsList = Array.isArray(article.keywords)
      ? article.keywords
      : (article.keywords ? article.keywords.split(',').map(k => k.trim()) : []);

    const licenseUrl = article.license && article.license.includes('http')
      ? article.license
      : 'https://creativecommons.org/licenses/by/4.0/';

    const doiValue = cleanDoi(article.doi);
    const doiUrl = doiValue ? `https://doi.org/${doiValue}` : '';

    return {
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": article.title,
      "author": authors.map(a => ({
        "@type": "Person",
        "name": a.full_name,
        "affiliation": a.affiliation || undefined,
        "sameAs": a.orcid_id ? `https://orcid.org/${a.orcid_id}` : undefined
      })),
      "datePublished": article.published_at || article.created_at ? new Date(article.published_at || article.created_at).toISOString().split('T')[0] : undefined,
      "isPartOf": {
        "@type": "Periodical",
        "name": article.journals?.name || 'APASIFIC Jurnal'
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

async function verifyLegacyArticles() {
  const ids = [
    'ec978306-7ad9-419a-8f77-f2473d78928a', // Halal certification
    '7375625f-3137-3834-3533-303330323837', // Murabahah MSMEs in Hutan Percha
    '7375625f-3137-3834-3436-393333383834'  // Carbon sequestration
  ];

  for (const id of ids) {
    console.log(`\n======================================================================`);
    console.log(`AUDIT ARTICLE ID: ${id}`);
    console.log(`======================================================================`);

    const { data: article, error } = await supabase
      .from('submissions')
      .select('*, article_authors(*), journals:journal_id(name)')
      .eq('id', id)
      .maybeSingle();

    if (error || !article) {
      console.error(`Article ${id} not found in submissions table.`);
      continue;
    }

    console.log(`Title: ${article.title}`);
    console.log(`Database Authors (article_authors):`);
    console.table(article.article_authors || []);

    const origin = "https://www.apasific.org";
    const metadata = MetadataEngine.generate(article, origin);
    const jsonLd = MetadataEngine.generateJsonLd(article, origin);

    console.log("\n--- SIMULATED OAI-PMH RECORD METADATA ---");
    const sortedAuthors = [...(article.article_authors || [])]
      .sort((a, b) => (a.author_order || 0) - (b.author_order || 0))
      .map(a => a.full_name);
      
    console.log(`<dc:title>${article.title}</dc:title>`);
    sortedAuthors.forEach(a => console.log(`<dc:creator>${a}</dc:creator>`));
    console.log(`<dc:publisher>Association of Asia Pacific Academician (APASIFIC)</dc:publisher>`);
    console.log(`<dc:identifier>${origin}/article/${article.id}</dc:identifier>`);
    console.log(`<dc:rights>${article.license || 'CC BY 4.0'}</dc:rights>`);
    if (article.doi) {
      const doiVal = cleanDoi(article.doi);
      console.log(`<dc:relation>info:eu-repo/semantics/altIdentifier/doi/${doiVal}</dc:relation>`);
      console.log(`<dc:relation>https://doi.org/${doiVal}</dc:relation>`);
    }

    console.log("\n--- HTML META TAGS ---");
    if (metadata.other) {
      Object.entries(metadata.other).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach(item => console.log(`<meta name="${key}" content="${item}" />`));
        } else {
          console.log(`<meta name="${key}" content="${val}" />`);
        }
      });
    }

    console.log("\n--- JSON-LD STRUCTURE ---");
    console.log(JSON.stringify(jsonLd, null, 2));
  }
}

verifyLegacyArticles();
