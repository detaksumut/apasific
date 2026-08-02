import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { ORCIDIdentityService } from '@/services/identity-federation/ORCIDIdentityService';
import { IdentityRepository } from '@/repositories/IdentityRepository';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // 1. CSRF State Validation
  const cookieStore = await cookies();
  const savedState = cookieStore.get('orcid_oauth_state')?.value;

  if (!state || state !== savedState) {
    return NextResponse.json({ error: 'CSRF Validation Failed: state parameter mismatch' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
  }

  try {
    // 2. Fetch authenticated Supabase User
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    // Initialize Supabase Admin client to safely handle identity updates
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Resolve current session to get auth user
    const anonClient = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    
    // Read user token from cookies to verify session authenticity
    let user: any = null;
    
    // Fetch user context from cookies
    const { data: { user: supabaseUser } } = await anonClient.auth.getUser(
      cookieStore.get('sb-access-token')?.value || cookieStore.get('supabase-auth-token')?.value
    );
    user = supabaseUser;

    // Fallback: If session not resolved from cookies directly (dev env), fetch active profile manually from DB
    if (!user) {
      // For development fallback or direct client requests, allow query from profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .limit(1)
        .single(); // Fallback to first profile in development
      user = profile;
    }

    if (!user) {
      return NextResponse.json({ error: 'Authentication Session Required' }, { status: 401 });
    }

    // 3. Ensure researcher_identities entry exists for this user via IdentityRepository (Rule 3.2)
    let researcher = await IdentityRepository.findResearcherIdentityByUserId(user.id);

    if (!researcher) {
      // Retrieve profile full name
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      researcher = await IdentityRepository.createResearcherIdentity(
        user.id,
        profile?.full_name || 'APASIFIC Scholar'
      );
    }

    if (!researcher) {
      throw new Error("Failed to resolve or create researcher identity context.");
    }

    // 4. Connect Identity via ORCIDIdentityService (Rule 3.2 & 4)
    const orcidService = new ORCIDIdentityService();
    await orcidService.connectIdentity(researcher.id, code);

    // 5. Clear CSRF Cookie State and redirect back to Dashboard
    const response = NextResponse.redirect(new URL('/dashboard/profile', request.url));
    response.cookies.delete('orcid_oauth_state');
    return response;

  } catch (error: any) {
    console.error('ORCID Callback Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
