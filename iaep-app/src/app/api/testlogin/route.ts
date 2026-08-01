import { NextResponse } from 'next/server';
import { loginUser } from '@/app/actions/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'kadinmedan1@gmail.com';
  const pass = searchParams.get('pass') || 'mikrosistem';
  
  try {
    const result = await loginUser(email, pass);
    return NextResponse.json({ result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack });
  }
}
