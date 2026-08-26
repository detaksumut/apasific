// src/app/api/auth/orcid/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTarget = searchParams.get('redirect') || '/dashboard/profile';
  
  // Environment variables for ORCID OAuth (Supports Production, Sandbox, or Configurable)
  const isSandbox = process.env.ORCID_ENVIRONMENT === 'sandbox';
  const orcidDomain = isSandbox ? 'https://sandbox.orcid.org' : 'https://orcid.org';
  const clientId = process.env.ORCID_CLIENT_ID || 'APP-DEMO-APASIFIC-ORCID';
  
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const callbackUrl = process.env.ORCID_REDIRECT_URI || `${protocol}://${host}/api/auth/orcid/callback`;

  // Store target in state or query
  const state = Buffer.from(JSON.stringify({ redirectTarget, ts: Date.now() })).toString('base64');

  const authUrl = `${orcidDomain}/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(authUrl);
}
