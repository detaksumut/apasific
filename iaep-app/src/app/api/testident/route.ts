import { NextResponse } from 'next/server';
import { IdentityRepository } from '@/repositories/IdentityRepository';

export async function GET(request: Request) {
  try {
    const email = 'kadinmedan1@gmail.com';
    const profile = await IdentityRepository.findIdentityByEmail(email);
    const system = await IdentityRepository.findIdentityFromSystemSettings(email);
    
    return NextResponse.json({
      profile,
      system
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack });
  }
}
