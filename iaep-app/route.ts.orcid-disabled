// src/app/api/auth/orcid/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { loginWithOrcid } from "@/app/actions/auth";
import { getDashboardPath } from "@/lib/roles";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get("orcid_oauth_state")?.value;

  if (!state || state !== savedState || !code) {
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/login?error=OAuth+Authentication+Failed`);
  }

  const orcidBaseUrl = process.env.ORCID_BASE_URL || "https://orcid.org";
  const clientId = process.env.ORCID_CLIENT_ID || "";
  const clientSecret = process.env.ORCID_CLIENT_SECRET || "";
  const redirectUri = process.env.ORCID_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/orcid/callback`;

  try {
    // 1. Token Exchange
    const tokenRes = await fetch(`${orcidBaseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const { orcid, name } = tokenData;

    // 2. Lookup & Login using Natural Identity Linking
    const loginResult = await loginWithOrcid(orcid, name);

    if (loginResult.success && loginResult.user) {
      const existingUser = loginResult.user;

      // Update last_login
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", existingUser.id);

      // Redirect based on central roles resolver (always returns a valid path)
      const role = existingUser.role || "author";
      const redirectPath = getDashboardPath(role);

      const response = NextResponse.redirect(`${request.nextUrl.origin}${redirectPath}`);
      response.cookies.delete("orcid_oauth_state");
      return response;
    }

    // Should not reach here — loginWithOrcid always auto-registers if user not found
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/login?error=Authentication+Failed`);

  } catch (error) {
    console.error("ORCID Callback Error:", error);
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/login?error=Authentication+Failed`);
  }
}

