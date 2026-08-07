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

// Inline MetadataEngine to simulate metadata rendering natively
class MetadataEngine {
  static generate(article, origin) {
    const title = article.title || 'Untitled Article';
    const abstract = article.abstract || '';
    const doi = article.doi || '';
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

    const rawPdfUrl = article.file_url || '';
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
        'DC.identifier': doi ? `doi:${doi}` : articleUrl,
        'DC.source': journalTitle + (issn ? ` (ISSN: ${issn})` : ''),
        'DC.language': lang,
        'DC.relation': doi ? `https://doi.org/${doi}` : '',
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
        'citation_doi': doi,
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
      "identifier": article.doi || undefined,
      "url": `${origin}/article/${article.id}`,
      "sameAs": article.doi ? `https://doi.org/${article.doi}` : undefined,
      "keywords": keywordsList.length > 0 ? keywordsList : undefined,
      "license": licenseUrl,
      "inLanguage": article.language || 'en'
    };
  }
}

async function runVerification() {
  console.log("\n==================================================");
  console.log("TEST 1: SELECT FROM article_authors (Top 10)");
  console.log("==================================================");
  
  const { data: authors, error: authorsErr } = await supabase
    .from('article_authors')
    .select('article_id, author_order, full_name, email, affiliation, orcid_id, is_corresponding')
    .order('created_at', { ascending: false })
    .limit(10);

  if (authorsErr) {
    console.error("Failed to query article_authors:", authorsErr.message);
  } else {
    console.table(authors);
  }

  console.log("\n==================================================");
  console.log("TEST 2: SELECT FROM submissions (Top 5)");
  console.log("==================================================");

  const { data: submissions, error: subErr } = await supabase
    .from('submissions')
    .select('id, title, abstract, keywords')
    .order('created_at', { ascending: false })
    .limit(5);

  if (subErr) {
    console.error("Failed to query submissions:", subErr.message);
  } else {
    submissions.forEach((s, idx) => {
      console.log(`\n[Submission ${idx + 1}]`);
      console.log(`ID: ${s.id}`);
      console.log(`Title: ${s.title}`);
      console.log(`Abstract: "${s.abstract}"`);
      console.log(`Keywords: ${s.keywords}`);
    });
  }

  if (submissions && submissions.length > 0) {
    const latestSub = submissions[0];
    
    console.log("\n==================================================");
    console.log(`TEST 3 & 4 & 5 & 6 & 7: Metadata Engine Output for Latest Sub: ${latestSub.id}`);
    console.log("==================================================");
    
    // Fetch full enriched article details (simulate layout.tsx)
    const { data: fullSub, error: detailErr } = await supabase
      .from('submissions')
      .select('*, article_authors(*), journals:journal_id(name)')
      .eq('id', latestSub.id)
      .maybeSingle();

    if (detailErr) {
      console.error("Supabase single fetch error:", detailErr.message);
    } else if (fullSub) {
      const origin = "https://www.apasific.org";
      const metadata = MetadataEngine.generate(fullSub, origin);
      const jsonLd = MetadataEngine.generateJsonLd(fullSub, origin);

      console.log("\n--- JSON-LD STRUCTURE ---");
      console.log(JSON.stringify(jsonLd, null, 2));

      console.log("\n--- GOOGLE SCHOLAR & DUBLIN CORE META TAGS ---");
      console.log(`Canonical URL: ${metadata.alternates?.canonical}`);
      console.log(`OpenGraph Title: ${metadata.openGraph?.title}`);
      console.log(`OpenGraph Description: ${metadata.openGraph?.description}`);
      console.log("");
      
      if (metadata.other) {
        Object.entries(metadata.other).forEach(([key, val]) => {
          console.log(`<meta name="${key}" content="${Array.isArray(val) ? val.join(', ') : val}" />`);
        });
      }
    } else {
      console.error("Failed to fetch full submission details for layout simulation.");
    }
  }
}

runVerification();
