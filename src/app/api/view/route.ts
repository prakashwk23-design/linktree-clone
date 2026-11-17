import { recordView, getUserById } from "@/lib/data";

const WINDOW_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 5000;
const recentViews = new Map<string, number>();

/** One view per visitor per profile per 30 minutes, so refreshes don't inflate stats. */
function isDuplicate(key: string): boolean {
  const now = Date.now();
  const last = recentViews.get(key);
  if (last && now - last < WINDOW_MS) return true;

  if (recentViews.size >= MAX_ENTRIES) {
    for (const [entry, at] of recentViews) {
      if (now - at >= WINDOW_MS) recentViews.delete(entry);
    }
    if (recentViews.size >= MAX_ENTRIES) recentViews.clear();
  }

  recentViews.set(key, now);
  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "local";
  return request.headers.get("x-real-ip")?.trim() || "local";
}

export async function POST(request: Request) {
  let body: { userId?: string; referrer?: string } | null = null;
  try {
    body = (await request.json()) as { userId?: string; referrer?: string };
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const userId = body?.userId;
  if (!userId || !getUserById(userId)) {
    return Response.json({ ok: false, error: "Unknown profile" }, { status: 404 });
  }

  const key = `${clientIp(request)}:${userId}`;
  if (isDuplicate(key)) {
    return Response.json({ ok: true, counted: false });
  }

  let referrer = (body?.referrer ?? "direct").toLowerCase();
  if (referrer && referrer !== "direct") {
    try {
      referrer = new URL(referrer).hostname.replace(/^www\./, "");
    } catch {
      referrer = "direct";
    }
  }

  const country = (request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? "IN").toUpperCase();
  recordView(userId, referrer || "direct", country.slice(0, 2));

  return Response.json({ ok: true, counted: true });
}
