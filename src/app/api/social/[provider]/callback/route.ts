import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { upsertSocialConnection } from "@/lib/data";
import { appOrigin, exchangeCodeForTokens, fetchAccountName, isSocialProvider } from "@/lib/social";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = appOrigin(request);
  const back = (query: string) => NextResponse.redirect(`${origin}/admin/account?${query}#integrations`);

  if (!isSocialProvider(provider)) return NextResponse.json({ error: "Unknown provider" }, { status: 404 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const url = new URL(request.url);
  const jar = await cookies();
  const raw = jar.get("lt_oauth")?.value;
  let pending: { provider?: string; state?: string; verifier?: string } = {};
  try {
    pending = raw ? (JSON.parse(raw) as typeof pending) : {};
  } catch {
    pending = {};
  }

  const code = url.searchParams.get("code") ?? "";
  const returnedState = url.searchParams.get("state") ?? "";
  if (!pending.state || pending.provider !== provider || returnedState !== pending.state) {
    return back(`social=${provider}&error=state`);
  }
  if (!code) return back(`social=${provider}&error=denied`);

  try {
    const tokens = await exchangeCodeForTokens(provider, {
      code,
      redirectUri: `${origin}/api/social/${provider}/callback`,
      verifier: pending.verifier,
    });
    const accountName = (await fetchAccountName(provider, tokens.accessToken)) || provider;
    upsertSocialConnection({
      userId: user.id,
      provider,
      accountName,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
    });

    const response = back(`connected=${provider}`);
    response.cookies.delete("lt_oauth");
    return response;
  } catch {
    return back(`social=${provider}&error=exchange`);
  }
}
