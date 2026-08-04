import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Manually inject cookies for Kadsumut
        const cookieStore = await cookies();
        cookieStore.set('firebase_session', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJkZW1vLXVzZXItMTc4NDA1IiwiZW1haWwiOiJrYWRzdW11dEBnbWFpbC5jb20ifQ.dummy', { httpOnly: true });

        const user = await getCurrentUser();
        return NextResponse.json({ user });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack });
    }
}
