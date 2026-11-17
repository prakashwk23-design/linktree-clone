import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { appOrigin, buildAuthorizeUrl, isSocialProvider, newCodeVerifier, newOAuthState, socialConfigured } from "@/lib/social";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = appOrigin(request);

  if (!isSocialProvider(provider)) return NextResponse.json({ error: "Unknown provider" }, { status: 404 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  // Without OAuth credentials, bounce back with a clear message instead of
  // sending the user to a broken provider URL.
  if (!socialConfigured(provider)) {
    return NextResponse.redirect(`${origin}/admin/account?social=${provider}&error=not_configured#integrations`);
  }

  const state = newOAuthState();
  const verifier = newCodeVerifier();
  const redirectUri = `${origin}/api/social/${provider}/callback`;
  const authorizeUrl = buildAuthorizeUrl(provider, { redirectUri, state, verifier });

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("lt_oauth", JSON.stringify({ provider, state, verifier }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
