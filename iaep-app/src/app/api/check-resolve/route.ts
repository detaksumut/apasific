import { NextResponse } from 'next/server';
import { resolveFile } from '@/utils/storageResolver';

export async function GET() {
  const result = await resolveFile({
    bucket: 'manuscripts',
    path: '',
    entityId: '7375625f-3137-3834-3533-303330323837',
    entityType: 'submission'
  });

  return NextResponse.json({
    result
  });
}
