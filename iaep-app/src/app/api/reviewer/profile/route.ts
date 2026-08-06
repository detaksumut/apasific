import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';
import { ReviewerRecognitionService } from '@/services/reviewer/ReviewerRecognitionService';

export async function GET() {
  try {
    // 1. Authenticate user
    const user: any = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Akses ditolak: pengguna tidak terautentikasi.' }, { status: 401 });
    }

    // 2. Fetch Reviewer academic stats
    const profile = await ReviewerRecognitionService.getReviewerAcademicProfile(user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profil akademis reviewer tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      reviewer_id: user.id,
      profile
    });

  } catch (error: any) {
    console.error('[ReviewerProfileRoute] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
