import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolvePublicationDateString } from '@/services/publication/PublicationDateResolver';
import { PublicationMetadataValidator } from '@/services/publication/PublicationMetadataValidator';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const journalId = url.searchParams.get('journalId');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Fetch Journal details
    let journalQuery = supabase.from('journals').select('*');
    if (journalId) {
      journalQuery = journalQuery.eq('id', journalId);
    }
    const { data: journals } = await journalQuery;

    if (!journals || journals.length === 0) {
      return NextResponse.json({ error: 'Journal tidak ditemukan.' }, { status: 404 });
    }

    const exportData: any[] = [];

    for (const journal of journals) {
      // 2. Fetch published articles
      const { data: records } = await supabase
        .from('submissions')
        .select('*, profiles:author_id(full_name, email, orcid)')
        .eq('journal_id', journal.id)
        .eq('status', 'Published');

      if (!records || records.length === 0) continue;

      const articlesPayload = records.map(record => {
        // Enforce Validation Checks
        const validation = PublicationMetadataValidator.validate(record);
        
        let abstractRaw = record.abstract;
        let parsedAbstract = '';
        let explicitAuthors: any[] = [];

        if (typeof abstractRaw === 'string' && abstractRaw.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(abstractRaw);
            parsedAbstract = parsed.abstract_en || parsed.abstract || '';
            explicitAuthors = parsed.authors || [];
          } catch {
            parsedAbstract = abstractRaw;
          }
        } else {
          parsedAbstract = abstractRaw || '';
        }

        const pubDate = resolvePublicationDateString(record);

        return {
          article_id: record.id,
          title: record.title,
          abstract: parsedAbstract,
          doi: record.doi || null,
          publication_date: pubDate,
          volume: record.volume || null,
          issue: record.issue || null,
          url: `${url.protocol}//${url.host}/article/${record.id}`,
          license: record.license || 'CC BY 4.0',
          authors: explicitAuthors.length > 0 ? explicitAuthors.map(a => ({
            name: a.full_name || a.name,
            orcid: a.orcid || null,
            affiliation: a.affiliation || null
          })) : [
            {
              name: record.author || record.author_name || 'Unknown Author',
              orcid: record.profiles?.orcid || null,
              affiliation: record.university || null
            }
          ],
          // Indexing readiness report fields
          indexing_readiness: {
            status: validation.status,
            isValid: validation.isValid,
            missing_fields: validation.errors,
            warnings: validation.warnings
          }
        };
      });

      exportData.push({
        journal_id: journal.id,
        journal_name: journal.name,
        issn: journal.issn || null,
        publisher: 'Association of Asia Pacific Academician (APASIFIC)',
        country: 'Indonesia',
        articles: articlesPayload
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      scope: 'SINTA_READINESS_METADATA_EXPORT',
      data: exportData
    }, {
      headers: {
        'Cache-Control': 'public, max-age=1800'
      }
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
