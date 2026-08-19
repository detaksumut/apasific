// src/app/api/asia-index/[recordId]/route.ts
import { NextResponse } from 'next/server';
import { AsiaIndexService } from '@/services/asia-index/AsiaIndexService';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await params;
    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // 1. Try to find by asia_record_id or article_id
    let articleId = recordId;
    const { data: recordRow } = await supabase
      .from('asia_index_records')
      .select('article_id, asia_record_id')
      .or(`asia_record_id.eq.${recordId},article_id.eq.${recordId}`)
      .maybeSingle();

    if (recordRow?.article_id) {
      articleId = recordRow.article_id;
    }

    // 2. Fetch submission data
    const { data: submission } = await supabase
      .from('submissions')
      .select('*, profiles:author_id(full_name, orcid_id), journals:journal_id(name, pissn, eissn)')
      .eq('id', articleId)
      .maybeSingle();

    const fullRecord = await AsiaIndexService.resolveOrRegisterAsiaRecord(
      articleId,
      submission || undefined
    );

    return NextResponse.json({
      success: true,
      record: fullRecord,
      schemaOrg: {
        '@context': 'https://schema.org',
        '@type': 'ScholarlyArticle',
        'headline': fullRecord.identification.title,
        'identifier': fullRecord.recordInfo.asiaRecordId,
        'sameAs': fullRecord.identification.doiUrl,
        'author': fullRecord.authorIdentity.authors.map(name => ({
          '@type': 'Person',
          'name': name
        })),
        'publisher': {
          '@type': 'Organization',
          'name': fullRecord.recordInfo.publicationOrigin
        }
      }
    });
  } catch (error: any) {
    console.error('Error resolving ASIA Index record API:', error);
    return NextResponse.json(
      { error: 'Failed to resolve ASIA record', details: error?.message },
      { status: 500 }
    );
  }
}
