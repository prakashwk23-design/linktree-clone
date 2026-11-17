import { getCurrentUser } from "@/lib/auth";
import { getContacts, getDailyStats } from "@/lib/data";

function csvCell(cell: string | number): string {
  let value = String(cell);
  // Neutralize spreadsheet formula injection (Excel/Sheets evaluate these on open).
  if (/^[=+\-@\t\r]/.test(value)) value = `'${value}`;
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function csv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (type === "contacts") {
    const contacts = getContacts(user.id);
    const rows: (string | number)[][] = [
      ["Name", "Email", "Source", "Added"],
      ...contacts.map((contact) => [contact.name, contact.email, contact.source, contact.created_at]),
    ];
    return new Response(csv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${user.username}-contacts.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const range = Number(url.searchParams.get("range")) || 30;
  const days = [7, 14, 30].includes(range) ? range : 30;
  const stats = getDailyStats(user.id, days);
  const rows: (string | number)[][] = [
    ["Date", "Views", "Clicks"],
    ...stats.map((row) => [row.date, row.views, row.clicks]),
    ["Total", stats.reduce((sum, row) => sum + row.views, 0), stats.reduce((sum, row) => sum + row.clicks, 0)],
  ];

  return new Response(csv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${user.username}-analytics-${days}d.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
