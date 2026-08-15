import { NextResponse } from 'next/server';
import { IdentityRepository } from '@/repositories/IdentityRepository';
import { IdentityResolver } from '@/services/identity/IdentityResolver';

export async function GET() {
  const email = 'danil@apasific.org';

  const profile = await IdentityRepository.findIdentityByEmail(email);
  const system = await IdentityRepository.findIdentityFromSystemSettings(email);

  if (!profile) {
    return NextResponse.json({
      email,
      profile,
      system,
      error: 'Profile not found'
    });
  }

  const sessionUser = {
    id: profile.id,
    email,
    full_name: profile.full_name,
    app_metadata: {}
  };

  const identity = await IdentityResolver.resolve(sessionUser);

  return NextResponse.json({
    email,
    profile,
    system,
    resolver: identity
  });
}
