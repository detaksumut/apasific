// src/app/api/cron/metrics-sync/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { CitationSyncService } from '@/services/citation-intelligence/CitationSyncService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 1. Authorization Secret Check (pg_cron bearer key validation)
  const authHeader = request.headers.get('Authorization') || '';
  const expectedToken = `Bearer ${process.env.CRON_SECRET || 'apasific-cron-secret-token-key-default'}`;

  if (authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized: invalid cron authorization token' }, { status: 401 });
  }

  try {
    // 2. Trigger Bulk Synchronization
    const syncService = new CitationSyncService();
    const result = await syncService.syncAllActiveCitations();

    return NextResponse.json({
      message: 'Citation metrics synchronization job completed',
      ...result
    });
  } catch (error: any) {
    console.error('Fatal error during metrics sync job run:', error);
    return NextResponse.json({
      error: error.message || 'Fatal Cron Job Failure'
    }, { status: 500 });
  }
}
