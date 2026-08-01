import { NextResponse } from 'next/server';
import { IdentityRepository } from '@/repositories/IdentityRepository';

export async function GET() {
  const email = 'kadinmedan1@gmail.com';
  const system = await IdentityRepository.findIdentityFromSystemSettings(email);
  return NextResponse.json({ system });
}
