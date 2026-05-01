import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const code = reqUrl.searchParams.get("code");
  const error = reqUrl.searchParams.get("error");
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?google_error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?google_error=no_code`);
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/?google_error=oauth_creds_missing`
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${baseUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokenRes.ok || !tokens.refresh_token) {
    const msg =
      tokens.error_description ||
      tokens.error ||
      "no_refresh_token_returned";
    return NextResponse.redirect(
      `${baseUrl}/?google_error=${encodeURIComponent(msg)}`
    );
  }

  const sb = supabaseAdmin();
  const { error: dbErr } = await sb.from("oauth_tokens").upsert({
    provider: "google",
    refresh_token: tokens.refresh_token,
    scope: tokens.scope || null,
    updated_at: new Date().toISOString(),
  });

  if (dbErr) {
    return NextResponse.redirect(
      `${baseUrl}/?google_error=${encodeURIComponent(dbErr.message)}`
    );
  }

  return NextResponse.redirect(`${baseUrl}/?google_connected=1`);
}
