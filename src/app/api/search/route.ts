import { NextResponse } from "next/server";
import { getUserById, recordSearch } from "@/lib/data";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_EVENTS = 40;
const buckets = new Map<string, number[]>();

function allowed(key: string): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_EVENTS) {
    buckets.set(key, recent);
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Keep the in-memory map from growing forever on a long-running server.
  if (buckets.size > 5000) {
    for (const [bucketKey, times] of buckets) {
      if (times.every((time) => now - time >= WINDOW_MS)) buckets.delete(bucketKey);
    }
  }

  return true;
}

/** Records a settled profile search. Fire-and-forget from ProfileLinks. */
export async function POST(request: Request) {
  let body: { userId?: unknown; query?: unknown; results?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (typeof body.userId !== "string" || typeof body.query !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const query = body.query.trim().slice(0, 80);
  if (query.length < 2) return NextResponse.json({ ok: false }, { status: 400 });
  if (!getUserById(body.userId)) return NextResponse.json({ ok: false }, { status: 404 });

  const results =
    typeof body.results === "number" && Number.isFinite(body.results)
      ? Math.max(0, Math.min(10000, Math.round(body.results)))
      : 0;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(`${ip}:${body.userId}`)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  recordSearch(body.userId, query, results);
  return NextResponse.json({ ok: true });
}
