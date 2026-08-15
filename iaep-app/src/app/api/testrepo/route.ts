import { NextResponse } from 'next/server';
import { IdentityRepository } from '@/repositories/IdentityRepository';

export async function GET() {
  const email = 'danil@apasific.org';

  const profile = await IdentityRepository.findIdentityByEmail(email);
  const system = await IdentityRepository.findIdentityFromSystemSettings(email);

  return NextResponse.json({
    email,
    profile,
    system
  });
}
