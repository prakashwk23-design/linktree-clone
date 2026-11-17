import { getShortLinkByCode, incrementShortLinkClicks } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const link = getShortLinkByCode(code);

  if (!link) {
    return new Response(null, { status: 302, headers: { Location: "/" } });
  }

  incrementShortLinkClicks(link.id);

  const target = link.target.trim();
  const safe = /^(https?:\/\/|mailto:|tel:)/i.test(target) ? target : `https://${target}`;

  return new Response(null, { status: 302, headers: { Location: encodeURI(safe), "Cache-Control": "no-store" } });
}
