import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';
import { isEditorOrAbove } from '@/lib/permissions';
import { ReviewerWorkloadService } from '@/services/reviewer/ReviewerWorkloadService';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const user: any = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Akses ditolak: pengguna tidak terautentikasi.' }, { status: 401 });
    }

    // 2. Authorize: Editor only
    const role = String(user.role || (user.roles && user.roles[0]) || '').toLowerCase();
    if (!isEditorOrAbove(role)) {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Editor yang memiliki hak akses.' }, { status: 403 });
    }

    const body = await req.json();
    const { submissionId, reviewerId } = body;

    if (!submissionId || !reviewerId) {
      return NextResponse.json({ error: 'submissionId dan reviewerId wajib diisi.' }, { status: 400 });
    }

    // 3. Conflict of Interest check
    const coi = await ReviewerWorkloadService.checkConflictOfInterest(submissionId, reviewerId);
    
    // 4. Calculate reputation stats
    const stats = await ReviewerWorkloadService.calculateReputationScore(reviewerId);

    return NextResponse.json({
      success: true,
      conflict: coi,
      reputation: stats
    });
  } catch (error: any) {
    console.error('[ReviewerCheckRoute] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
