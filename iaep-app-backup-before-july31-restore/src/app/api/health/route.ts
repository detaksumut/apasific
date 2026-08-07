import { NextResponse } from 'next/server';
import { logger, metrics } from '@/infrastructure/observability';

export async function GET() {
  logger.info({ event: 'HEALTH_CHECK_PINGED' });
  metrics.recordCounter('health_check_hits', 1);

  const healthData = {
    status: 'ACTIVE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0', // Phase N.2 release
    services: {
      identityCore: 'ACTIVE',
      publicationEngine: 'ACTIVE',
      aiEngine: 'ACTIVE'
    }
  };

  return NextResponse.json(healthData, { status: 200 });
}
