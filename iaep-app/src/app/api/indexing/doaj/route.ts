import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolvePublicationDateString } from '@/services/publication/PublicationDateResolver';
import { PublicationMetadataValidator } from '@/services/publication/PublicationMetadataValidator';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const journalId = url.searchParams.get('journalId');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Fetch active journals
    let journalQuery = supabase.from('journals').select('*');
    if (journalId) {
      journalQuery = journalQuery.eq('id', journalId);
    }
    const { data: journals } = await journalQuery;

    if (!journals || journals.length === 0) {
      return NextResponse.json({ error: 'Journal tidak ditemukan.' }, { status: 404 });
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<doajXml xmlns="http://www.doaj.org/schemas/doajXml/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.doaj.org/schemas/doajXml/1.0 http://www.doaj.org/schemas/doajXml/1.0/doajXml.xsd">`;

    for (const journal of journals) {
      // 2. Fetch published articles under this journal
      const { data: records } = await supabase
        .from('submissions')
        .select('*, profiles:author_id(full_name, email, orcid)')
        .eq('journal_id', journal.id)
        .eq('status', 'Published');

      if (!records || records.length === 0) continue;

      for (const record of records) {
        // Enforce Validation Checks
        const validation = PublicationMetadataValidator.validate(record);
        if (!validation.isValid) continue; // Skip articles NOT_READY_FOR_INDEXING

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

        xml += `
  <record>
    <!-- Journal Level Metadata -->
    <journalTitle>${escapeXml(journal.name)}</journalTitle>
    <issn>${escapeXml(record.issn || journal.issn || '')}</issn>
    <publisher>Association of Asia Pacific Academician (APASIFIC)</publisher>
    <publicationDate>${pubDate}</publicationDate>
    <volume>${escapeXml(record.volume || '')}</volume>
    <issue>${escapeXml(record.issue || '')}</issue>
    <language>eng</language>
    <license>CC BY 4.0</license>
    
    <!-- Article Level Metadata -->
    <title>${escapeXml(record.title)}</title>
    <authors>`;

        if (explicitAuthors.length > 0) {
          explicitAuthors.forEach(a => {
            xml += `
      <author>
        <name>${escapeXml(a.full_name || a.name)}</name>
        ${a.orcid ? `<orcid>${escapeXml(a.orcid)}</orcid>` : ''}
        ${a.affiliation ? `<affiliation>${escapeXml(a.affiliation)}</affiliation>` : ''}
      </author>`;
          });
        } else {
          xml += `
      <author>
        <name>${escapeXml(record.author || record.author_name || 'Unknown Author')}</name>
        ${record.profiles?.orcid ? `<orcid>${escapeXml(record.profiles.orcid)}</orcid>` : ''}
        ${record.university ? `<affiliation>${escapeXml(record.university)}</affiliation>` : ''}
      </author>`;
        }

        xml += `
    </authors>
    <abstract>${escapeXml(parsedAbstract)}</abstract>
    <doi>${escapeXml(record.doi || '')}</doi>
    <fulltextUrl>${escapeXml(`${url.protocol}//${url.host}/article/${record.id}`)}</fulltextUrl>
  </record>`;
      }
    }

    xml += `\n</doajXml>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'text/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
