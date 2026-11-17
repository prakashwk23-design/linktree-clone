import { getLinkById, recordClick } from "@/lib/data";

function referrerHost(value: string | null): string {
  if (!value) return "direct";
  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "direct";
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = getLinkById(id);

  if (!link) {
    return new Response(null, { status: 302, headers: { Location: "/" } });
  }

  recordClick(link.id, link.user_id, referrerHost(request.headers.get("referer")));

  const target = link.url.trim();
  const safe = /^(https?:\/\/|mailto:|tel:)/i.test(target) ? target : `https://${target}`;

  // Location headers must be ASCII; encode any stray unicode/spaces in the URL.
  return new Response(null, { status: 302, headers: { Location: encodeURI(safe), "Cache-Control": "no-store" } });
}
