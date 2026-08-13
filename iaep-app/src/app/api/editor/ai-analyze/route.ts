import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';
import { isEditorOrAbove } from '@/lib/permissions';
import { AIReviewerService } from '@/services/reviewer/AIReviewerService';

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const user: any = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Akses ditolak: pengguna tidak terautentikasi.' }, { status: 401 });
    }

    // 2. Authorize: must be Editor or above
    const roles = Array.isArray(user.roles) ? user.roles : [];

    const role =
      roles.length > 0
        ? String(roles[0]).toLowerCase()
        : String(user.role || '').toLowerCase();

    console.log('[AIAnalyzeRoute] Identity:', {
      id: user.id,
      email: user.email,
      roles: user.roles,
      resolvedRole: role,
    });

    if (!isEditorOrAbove(role)) {
      return NextResponse.json({ error: 'Akses ditolak: Anda tidak memiliki hak akses Editor.' }, { status: 403 });
    }

    const body = await req.json();
    const submissionId = body.submissionId;

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID wajib diisi.' }, { status: 400 });
    }

    // 3. Trigger AI Analysis Workflow
    const result = await AIReviewerService.analyzeManuscript(submissionId, user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'AI Analysis failed.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, assessment: result.assessment });
  } catch (error: any) {
    console.error('[AIAnalyzeRoute] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
