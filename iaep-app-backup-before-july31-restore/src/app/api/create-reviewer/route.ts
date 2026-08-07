import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { signUpUser } = await import('@/app/actions/auth');

    const result = await signUpUser({
      email: 'dr.eko@apasific.org',
      password: 'reviewer123',
      fullName: 'Dr. Eko Prasetyo',
      phone: '+6281234567890',
      country: 'Indonesia',
      university: 'Universitas Sumatera Utara',
      discipline: 'Education Technology',
      role: 'reviewer',
      orcid: '',
      googleScholar: '',
      scopus: '',
      wos: '',
      sinta: ''
    });

    return NextResponse.json({
      done: true,
      result,
      credentials: {
        email: 'dr.eko@apasific.org',
        password: 'reviewer123',
        role: 'reviewer',
        name: 'Dr. Eko Prasetyo'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}

