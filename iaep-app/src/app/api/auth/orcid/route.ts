import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const orcidBaseUrl = process.env.ORCID_BASE_URL || "https://orcid.org";
  const clientId = process.env.ORCID_CLIENT_ID || "";
  
  const { origin } = new URL(request.url);
  const redirectUri = process.env.ORCID_REDIRECT_URI || `${origin}/api/auth/orcid/callback`;
  
  const state = Math.random().toString(36).substring(2, 15);
  const authorizeUrl = `${orcidBaseUrl}/oauth/authorize?client_id=${clientId}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  const response = NextResponse.redirect(authorizeUrl);

  // Set secure cookie for CSRF state
  response.cookies.set("orcid_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 menit
  });

  return response;
}
