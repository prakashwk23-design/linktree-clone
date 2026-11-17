import "server-only";
import { createHash, randomBytes } from "node:crypto";

export type SocialProvider = "instagram" | "tiktok" | "youtube" | "spotify" | "x";

type ProviderDef = {
  label: string;
  /** Env vars that must be present for this provider to be enabled. */
  env: [string, string];
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string;
  /** X/Twitter requires PKCE (S256). */
  pkce?: boolean;
  /** Spotify + X authenticate the token request with HTTP Basic. */
  basicAuth?: boolean;
  /** TikTok names its client id "client_key" instead of "client_id". */
  clientIdParam?: string;
};

export const SOCIAL_PROVIDERS: Record<SocialProvider, ProviderDef> = {
  instagram: {
    label: "Instagram",
    env: ["INSTAGRAM_CLIENT_ID", "INSTAGRAM_CLIENT_SECRET"],
    authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: "instagram_basic,pages_show_list",
  },
  tiktok: {
    label: "TikTok",
    env: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scopes: "user.info.basic",
    clientIdParam: "client_key",
  },
  youtube: {
    label: "YouTube",
    env: ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET"],
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: "https://www.googleapis.com/auth/youtube.readonly",
  },
  spotify: {
    label: "Spotify",
    env: ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"],
    authorizeUrl: "https://accounts.spotify.com/authorize",
    tokenUrl: "https://accounts.spotify.com/api/token",
    scopes: "user-read-private",
    basicAuth: true,
  },
  x: {
    label: "X",
    env: ["X_CLIENT_ID", "X_CLIENT_SECRET"],
    authorizeUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: "users.read tweet.read offline.access",
    pkce: true,
    basicAuth: true,
  },
};

export function isSocialProvider(value: string): value is SocialProvider {
  return value in SOCIAL_PROVIDERS;
}

/** Public origin used for OAuth redirect URIs. */
export function appOrigin(request: Request): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  if (configured) return configured;
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || url.host;
  return `${proto}://${host}`;
}

function credentials(provider: SocialProvider): { id: string; secret: string } {
  const [idKey, secretKey] = SOCIAL_PROVIDERS[provider].env;
  return {
    id: (process.env[idKey] ?? "").trim(),
    secret: (process.env[secretKey] ?? "").trim(),
  };
}

export function socialConfigured(provider: SocialProvider): boolean {
  const { id, secret } = credentials(provider);
  return Boolean(id && secret);
}

export function newOAuthState(): string {
  return randomBytes(16).toString("hex");
}

export function newCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function codeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function buildAuthorizeUrl(
  provider: SocialProvider,
  input: { redirectUri: string; state: string; verifier?: string },
): string {
  const def = SOCIAL_PROVIDERS[provider];
  const { id } = credentials(provider);
  const params = new URLSearchParams({
    [def.clientIdParam ?? "client_id"]: id,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: def.scopes,
    state: input.state,
  });
  if (provider === "youtube") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }
  if (def.pkce && input.verifier) {
    params.set("code_challenge", codeChallenge(input.verifier));
    params.set("code_challenge_method", "S256");
  }
  return `${def.authorizeUrl}?${params.toString()}`;
}

export type OAuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export async function exchangeCodeForTokens(
  provider: SocialProvider,
  input: { code: string; redirectUri: string; verifier?: string },
): Promise<OAuthTokens> {
  const def = SOCIAL_PROVIDERS[provider];
  const { id, secret } = credentials(provider);

  const params = new URLSearchParams({
    [def.clientIdParam ?? "client_id"]: id,
    client_secret: secret,
    code: input.code,
    grant_type: "authorization_code",
    redirect_uri: input.redirectUri,
  });
  if (def.pkce && input.verifier) params.set("code_verifier", input.verifier);

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  if (def.basicAuth) {
    headers.Authorization = `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
  }

  const response = await fetch(def.tokenUrl, {
    method: "POST",
    headers,
    body: params.toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });

  const data = (await response.json().catch(() => null)) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error_description?: string;
    error?: string;
  } | null;

  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description ?? data?.error ?? `${SOCIAL_PROVIDERS[provider].label} could not connect.`);
  }

  const expiresAt = data.expires_in ? new Date(Date.now() + data.expires_in * 1000).toISOString() : "";
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? "",
    expiresAt,
  };
}

/** Best-effort display name for the connected account. */
export async function fetchAccountName(provider: SocialProvider, accessToken: string): Promise<string> {
  try {
    const auth = { Authorization: `Bearer ${accessToken}` };
    let url = "";
    switch (provider) {
      case "spotify":
        url = "https://api.spotify.com/v1/me";
        break;
      case "youtube":
        url = "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true";
        break;
      case "instagram":
        url = "https://graph.facebook.com/v19.0/me?fields=username";
        break;
      case "tiktok":
        url = "https://open.tiktokapis.com/v2/user/info/?fields=display_name";
        break;
      case "x":
        url = "https://api.twitter.com/2/users/me";
        break;
    }
    const response = await fetch(url, { headers: auth, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) return "";
    const data = (await response.json()) as Record<string, unknown>;
    const name =
      (data.display_name as string) ??
      (data.username as string) ??
      (data.name as string) ??
      ((data.data as { user?: { display_name?: string }; username?: string } | undefined)?.user?.display_name ??
        (data.data as { username?: string } | undefined)?.username ??
        ((data.items as { snippet?: { title?: string } }[] | undefined)?.[0]?.snippet?.title ?? ""));
    return typeof name === "string" ? name : "";
  } catch {
    return "";
  }
}
