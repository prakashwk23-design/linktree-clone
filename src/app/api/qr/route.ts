import QRCode from "qrcode";
import { getUserByUsername } from "@/lib/data";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = (url.searchParams.get("username") ?? "").replace(/^@/, "").trim();
  const size = Math.min(Math.max(Number(url.searchParams.get("size")) || 512, 128), 1024);

  if (!username) {
    return Response.json({ error: "username is required" }, { status: 400 });
  }

  const user = getUserByUsername(username);
  if (!user) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const profileUrl = `${url.origin}/${user.username}`;
  const png = await QRCode.toBuffer(profileUrl, {
    type: "png",
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1e2330ff", light: "#ffffffff" },
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${user.username}-qr.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
