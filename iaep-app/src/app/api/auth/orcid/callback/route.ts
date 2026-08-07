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

    const { orcid } = tokenData;

    // 2. Lookup & Login Local User using the standard Authentication Runtime (loginWithOrcid) - Blocker 3
    const loginResult = await loginWithOrcid(orcid);

    if (loginResult.success && loginResult.user) {
      const existingUser = loginResult.user;

      // Update last_login
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", existingUser.id);

      // Redirect based on central roles resolver
      const role = existingUser.role || "author";
      const redirectPath = getDashboardPath(role) || "/dashboard/member";
      
      const response = NextResponse.redirect(`${request.nextUrl.origin}${redirectPath}`);
      response.cookies.delete("orcid_oauth_state");
      return response;
    }

    // 3. User baru -> Redirect ke Register Wizard (reg_access_token removed - Blocker 2)
    const registrationSessionId = `reg_sess_${Math.random().toString(36).substring(2, 15)}`;
    const regResponse = NextResponse.redirect(`${request.nextUrl.origin}/auth/register`);
    regResponse.cookies.delete("orcid_oauth_state");

    regResponse.cookies.set("registration_session_id", registrationSessionId, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
    regResponse.cookies.set("reg_orcid_id", orcid, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });

    return regResponse;

  } catch (error) {
    console.error("ORCID Callback Error:", error);
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/login?error=Authentication+Failed`);
  }
}
