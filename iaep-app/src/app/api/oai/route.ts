import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolvePublicationDateString } from '@/services/publication/PublicationDateResolver';

const OAI_NAMESPACE = "http://www.openarchives.org/OAI/2.0/";
const XSI_NAMESPACE = "http://www.w3.org/2001/XMLSchema-instance";
const SCHEMA_LOCATION = "http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd";

function escapeXml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, function (c) {
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

function cleanDoi(rawDoi: string): string {
    if (!rawDoi) return '';
    return rawDoi.replace(/https?:\/\/doi\.org\//i, '').trim();
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const verb = url.searchParams.get('verb');
    const baseUrl = `${url.protocol}//${url.host}/api/oai`;
    
    const responseDate = new Date().toISOString();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="${OAI_NAMESPACE}" 
         xmlns:xsi="${XSI_NAMESPACE}"
         xsi:schemaLocation="${SCHEMA_LOCATION}">
  <responseDate>${responseDate}</responseDate>`;

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        if (!verb) {
            xml += `\n  <request>${baseUrl}</request>
  <error code="badVerb">Illegal OAI verb</error>
</OAI-PMH>`;
            return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
        }

        xml += `\n  <request verb="${verb}">${baseUrl}</request>`;

        if (verb === 'Identify') {
            xml += `
  <Identify>
    <repositoryName>APASIFIC Journals Repository</repositoryName>
    <baseURL>${baseUrl}</baseURL>
    <protocolVersion>2.0</protocolVersion>
    <adminEmail>admin@apasific.org</adminEmail>
    <earliestDatestamp>2024-01-01T00:00:00Z</earliestDatestamp>
    <deletedRecord>no</deletedRecord>
    <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
  </Identify>`;
        } 
        else if (verb === 'ListMetadataFormats') {
            xml += `
  <ListMetadataFormats>
    <metadataFormat>
      <metadataPrefix>oai_dc</metadataPrefix>
      <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
      <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
    </metadataFormat>
  </ListMetadataFormats>`;
        }
        else if (verb === 'ListSets') {
            const { data: journals } = await supabase.from('journals').select('id, name');
            xml += `\n  <ListSets>`;
            if (journals) {
                for (const j of journals) {
                    xml += `
    <set>
      <setSpec>${escapeXml(j.id)}</setSpec>
      <setName>${escapeXml(j.name)}</setName>
    </set>`;
                }
            }
            xml += `\n  </ListSets>`;
        }
        else if (verb === 'ListIdentifiers' || verb === 'ListRecords') {
            const metadataPrefix = url.searchParams.get('metadataPrefix');
            const set = url.searchParams.get('set');
            
            if (metadataPrefix !== 'oai_dc') {
                xml += `\n  <error code="cannotDisseminateFormat">metadataPrefix must be oai_dc</error>\n</OAI-PMH>`;
                return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
            }

            // Single Source of Truth: query from article_authors
            let query = supabase.from('submissions')
                .select('*, article_authors(*, profiles:author_id(full_name)), journals:journal_id(name)')
                .eq('status', 'Published')
                .order('created_at', { ascending: false });

            if (set) {
                query = query.eq('journal_id', set);
            }

            const fromParam = url.searchParams.get('from');
            const untilParam = url.searchParams.get('until');
            if (fromParam)  (query as any) = query.gte('published_at', fromParam);
            if (untilParam) (query as any) = query.lte('published_at', untilParam.length === 10 ? untilParam + 'T23:59:59Z' : untilParam);

            const { data: records, error } = await query;
            if (error) {
                console.error('[OAI] SUPABASE QUERY ERROR:', JSON.stringify(error));
                xml += `\n  <error code="internalServerError">${escapeXml(error.message || 'Database query failed')}</error>\n</OAI-PMH>`;
                return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
            }

            if (!records || records.length === 0) {
                console.error('[OAI] QUERY SUCCESS BUT ZERO RECORDS');
                xml += `\n  <error code="noRecordsMatch">No matching records found</error>\n</OAI-PMH>`;
                return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
            }

            xml += `\n  <${verb}>`;
            
            for (const record of records) {
                const identifier = `oai:apasific.org:article/${record.id}`;
                const datestamp = new Date(record.updated_at || record.created_at).toISOString();
                const setSpec = record.journal_id;
                
                xml += `
    <${verb === 'ListIdentifiers' ? 'header' : 'record'}>
      ${verb === 'ListRecords' ? '<header>' : ''}
        <identifier>${escapeXml(identifier)}</identifier>
        <datestamp>${datestamp}</datestamp>
        <setSpec>${escapeXml(setSpec)}</setSpec>
      ${verb === 'ListRecords' ? '</header>' : ''}`;
                
                if (verb === 'ListRecords') {
                    const abstract = record.abstract || '';
                    const journalName = record.journals?.name || record.journal_id || 'APASIFIC';
                    
                    // Single Source of Truth: article_authors
                    const authorsList = record.article_authors || [];
                    if (authorsList.length === 0) {
                        console.error(`[Data Integrity Error] Published article ${record.id} has no author relationship in article_authors. Journal ID: ${record.journal_id}, DOI: ${record.doi || 'None'}`);
                    }

                    const sortedAuthors = [...authorsList]
                        .sort((a, b) => (a.author_order || 0) - (b.author_order || 0))
                        .map((a: any) => a.full_name || a.profiles?.full_name || '')
                        .filter(Boolean);

                    const doiValue = cleanDoi(record.doi);
                    const doiUrl = doiValue ? `https://doi.org/${doiValue}` : '';
                    
                    const stablePdfUrl = (record.file_url_galley || record.file_url)
                        ? `${url.protocol}//${url.host}/api/article/${record.id}/pdf`
                        : '';

                    xml += `
      <metadata>
        <oai_dc:dc 
            xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
          <dc:title>${escapeXml(String(record.title || '').replace(/^\s*\[[^\]]+\]\s*/i, '').trim())}</dc:title>`;
                    
                    for (const author of sortedAuthors) {
                        xml += `\n          <dc:creator>${escapeXml(author)}</dc:creator>`;
                    }
                    
                    if (record.keywords) {
                        const kws = record.keywords.split(',').map((k: string) => k.replace(/^\s*\[[^\]]+\]\s*/i, '').trim()).filter(Boolean);
                        for (const kw of kws) {
                            if (kw) xml += `\n          <dc:subject>${escapeXml(kw)}</dc:subject>`;
                        }
                    }
                    
                    xml += `
          <dc:description>${escapeXml(abstract.substring(0, 3000))}</dc:description>
          <dc:publisher>Association of Asia Pacific Academician (APASIFIC)</dc:publisher>
          <dc:date>${resolvePublicationDateString(record)}</dc:date>
          <dc:type>info:eu-repo/semantics/article</dc:type>
          <dc:format>application/pdf</dc:format>
          <dc:identifier>${escapeXml(`${url.protocol}//${url.host}/article/${record.id}`)}</dc:identifier>
          ${(record.file_url_galley || record.file_url) ? `<dc:identifier>${escapeXml(`${url.protocol}//${url.host}/api/article/${record.id}/pdf`)}</dc:identifier>` : ''}
${stablePdfUrl ? `          <dc:identifier>${escapeXml(stablePdfUrl)}</dc:identifier>` : ''}
          <dc:rights>info:eu-repo/semantics/openAccess</dc:rights>
          <dc:rights>${escapeXml(record.license || 'CC BY 4.0')}</dc:rights>`;

                    if (doiValue) {
                        xml += `
          <dc:relation>info:eu-repo/semantics/altIdentifier/doi/${escapeXml(doiValue)}</dc:relation>
          <dc:relation>${escapeXml(doiUrl)}</dc:relation>`;
                    }

                    xml += `
          <dc:source>${escapeXml(journalName)}</dc:source>
          <dc:language>${escapeXml(record.language || 'eng')}</dc:language>
        </oai_dc:dc>
      </metadata>
    </record>`;
                }
                else {
                    xml += `\n    </header>`;
                }
            }
            
            xml += `\n  </${verb}>`;
        }
        else if (verb === 'GetRecord') {
            const identifier = url.searchParams.get('identifier');
            const metadataPrefix = url.searchParams.get('metadataPrefix');
            
            if (metadataPrefix !== 'oai_dc') {
                xml += `\n  <error code="cannotDisseminateFormat">metadataPrefix must be oai_dc</error>\n</OAI-PMH>`;
                return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
            }
            
            if (!identifier) {
                xml += `\n  <error code="badArgument">Missing identifier argument</error>\n</OAI-PMH>`;
                return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
            }

            const idMatch = identifier.match(/oai:apasific\.org:article\/(.+)$/);
            if (!idMatch) {
                xml += `\n  <error code="idDoesNotExist">Invalid identifier format</error>\n</OAI-PMH>`;
                return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
            }
            
            const uuid = idMatch[1];
            // Single Source of Truth: query from article_authors
            const { data: record, error } = await supabase.from('submissions')
                .select('*, article_authors(*, profiles:author_id(full_name)), journals:journal_id(name)')
                .eq('id', uuid)
                .eq('status', 'Published')
                .single();
                
            if (error || !record) {
                xml += `\n  <error code="idDoesNotExist">Record not found</error>\n</OAI-PMH>`;
                return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
            }

            const datestamp = new Date(record.updated_at || record.created_at).toISOString();
            const setSpec = record.journal_id;
            const abstract = record.abstract || '';
            
            // Single Source of Truth: article_authors
            const authorsList = record.article_authors || [];
            if (authorsList.length === 0) {
                console.error(`[Data Integrity Error] Published article ${record.id} has no author relationship in article_authors. Journal ID: ${record.journal_id}, DOI: ${record.doi || 'None'}`);
            }

            const sortedAuthors = [...authorsList]
                .sort((a, b) => (a.author_order || 0) - (b.author_order || 0))
                .map((a: any) => a.full_name || a.profiles?.full_name || '')
                .filter(Boolean);
            
            const journalName = record.journals?.name || record.journal_id || 'APASIFIC';

            const doiValue = cleanDoi(record.doi);
            const doiUrl = doiValue ? `https://doi.org/${doiValue}` : '';

            xml += `
  <GetRecord>
    <record>
      <header>
        <identifier>${escapeXml(identifier)}</identifier>
        <datestamp>${datestamp}</datestamp>
        <setSpec>${escapeXml(setSpec)}</setSpec>
      </header>
      <metadata>
        <oai_dc:dc 
            xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
            xmlns:dc="http://purl.org/dc/elements/1.1/"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
          <dc:title>${escapeXml(String(record.title || '').replace(/^\s*\[[^\]]+\]\s*/i, '').trim())}</dc:title>`;
            
            for (const author of sortedAuthors) {
                xml += `\n          <dc:creator>${escapeXml(author)}</dc:creator>`;
            }
            
            if (record.keywords) {
                const kws = record.keywords.split(',').map((k: string) => k.replace(/^\s*\[[^\]]+\]\s*/i, '').trim()).filter(Boolean);
                for (const kw of kws) {
                    if (kw) xml += `\n          <dc:subject>${escapeXml(kw)}</dc:subject>`;
                }
            }
            
            xml += `
          <dc:description>${escapeXml(abstract.substring(0, 3000))}</dc:description>
          <dc:publisher>Association of Asia Pacific Academician (APASIFIC)</dc:publisher>
          <dc:date>${resolvePublicationDateString(record)}</dc:date>
          <dc:type>info:eu-repo/semantics/article</dc:type>
          <dc:format>application/pdf</dc:format>
          <dc:identifier>${escapeXml(`${url.protocol}//${url.host}/article/${record.id}`)}</dc:identifier>
          ${(record.file_url_galley || record.file_url) ? `<dc:identifier>${escapeXml(`${url.protocol}//${url.host}/api/article/${record.id}/pdf`)}</dc:identifier>` : ''}
          <dc:rights>info:eu-repo/semantics/openAccess</dc:rights>
          <dc:rights>${escapeXml(record.license || 'CC BY 4.0')}</dc:rights>`;

            if (doiValue) {
                xml += `
          <dc:relation>info:eu-repo/semantics/altIdentifier/doi/${escapeXml(doiValue)}</dc:relation>
          <dc:relation>${escapeXml(doiUrl)}</dc:relation>`;
            }

            xml += `
          <dc:source>${escapeXml(journalName)}</dc:source>
          <dc:language>${escapeXml(record.language || 'eng')}</dc:language>
        </oai_dc:dc>
      </metadata>
    </record>
  </GetRecord>`;
        }
        else {
            xml += `\n  <error code="badVerb">Illegal OAI verb</error>`;
        }

        xml += `\n</OAI-PMH>`;
        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store',
            }
        });

    } catch (e: any) {
        xml += `\n  <error code="badArgument">System Error: ${escapeXml(e.message)}</error>\n</OAI-PMH>`;
        return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
    }
}
