import { db } from "./db";
import type {
  AnalyticsPoint,
  BillingPeriod,
  Collection,
  CollectionStat,
  Contact,
  Link,
  Payment,
  PaymentStatus,
  Plan,
  Product,
  ShortLink,
  Social,
  SocialConnection,
  TopLink,
  User,
} from "./types";

export const RESERVED_USERNAMES = new Set([
  "admin",
  "login",
  "logout",
  "register",
  "signup",
  "pricing",
  "discover",
  "help",
  "about",
  "blog",
  "privacy",
  "terms",
  "api",
  "s",
  "settings",
  "dashboard",
  "linktree",
  "support",
  "marketplace",
  "templates",
  "features",
  "enterprise",
  "trust",
  "newsroom",
  "careers",
  "contact",
  "static",
  "_next",
]);

/** SQLite returns null-prototype rows; React needs plain objects for client props. */
function plain<T>(row: T | undefined | null): T | null {
  return row ? ({ ...row } as T) : null;
}

function plainAll<T>(rows: T[]): T[] {
  return rows.map((row) => ({ ...row }) as T);
}

/** Columns safe to hand to pages and client components (never the password hash). */
const USER_COLUMNS = [
  "id",
  "email",
  "username",
  "name",
  "bio",
  "avatar",
  "plan",
  "theme",
  "button_style",
  "corner_style",
  "font",
  "layout",
  "title_style",
  "wallpaper",
  "show_footer",
  "created_at",
] as const;

function userColumns(prefix = ""): string {
  return USER_COLUMNS.map((column) => (prefix ? `${prefix}.${column}` : column)).join(", ");
}

export function getUserByUsername(username: string): User | null {
  return plain(
    db.prepare(`SELECT ${userColumns()} FROM users WHERE username = ? COLLATE NOCASE`).get(username) as User | undefined,
  );
}

export function getUserById(id: string): User | null {
  return plain(db.prepare(`SELECT ${userColumns()} FROM users WHERE id = ?`).get(id) as User | undefined);
}

export function getUserByEmail(email: string): (User & { password_hash: string }) | null {
  return plain(
    db.prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE").get(email) as
      | (User & { password_hash: string })
      | undefined,
  );
}

export function getLinks(userId: string, onlyVisible = false): Link[] {
  const sql = onlyVisible
    ? "SELECT * FROM links WHERE user_id = ? AND visible = 1 ORDER BY position ASC"
    : "SELECT * FROM links WHERE user_id = ? ORDER BY position ASC";
  return plainAll(db.prepare(sql).all(userId) as Link[]);
}

export function getCollections(userId: string): Collection[] {
  return plainAll(
    db.prepare("SELECT * FROM collections WHERE user_id = ? ORDER BY position ASC, created_at ASC").all(userId) as Collection[],
  );
}

export function getCollectionCount(userId: string): number {
  return (db.prepare("SELECT COUNT(*) as n FROM collections WHERE user_id = ?").get(userId) as { n: number }).n;
}

export function getSocials(userId: string): Social[] {
  return plainAll(db.prepare("SELECT * FROM socials WHERE user_id = ? ORDER BY position ASC").all(userId) as Social[]);
}

/** Connected OAuth accounts. Tokens stay server-side; the UI only reads account_name. */
export function getSocialConnections(userId: string): SocialConnection[] {
  return plainAll(
    db.prepare("SELECT * FROM social_connections WHERE user_id = ?").all(userId) as SocialConnection[],
  );
}

export function upsertSocialConnection(input: {
  userId: string;
  provider: string;
  accountName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}): void {
  db.prepare(
    `INSERT INTO social_connections (id,user_id,provider,account_name,access_token,refresh_token,expires_at,created_at)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(user_id, provider) DO UPDATE SET
       account_name = excluded.account_name,
       access_token = excluded.access_token,
       refresh_token = excluded.refresh_token,
       expires_at = excluded.expires_at`,
  ).run(
    crypto.randomUUID(),
    input.userId,
    input.provider,
    input.accountName,
    input.accessToken,
    input.refreshToken,
    input.expiresAt,
    new Date().toISOString(),
  );
}

export function deleteSocialConnection(userId: string, provider: string): void {
  db.prepare("DELETE FROM social_connections WHERE user_id = ? AND provider = ?").run(userId, provider);
}

export function getContacts(userId: string): Contact[] {
  return plainAll(
    db.prepare("SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC").all(userId) as Contact[],
  );
}

export function getProducts(userId: string): Product[] {
  return plainAll(
    db.prepare("SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC").all(userId) as Product[],
  );
}

export function getShortLinks(userId: string): ShortLink[] {
  return plainAll(
    db.prepare("SELECT * FROM short_links WHERE user_id = ? ORDER BY created_at DESC").all(userId) as ShortLink[],
  );
}

export function getLinkById(id: string): Link | null {
  return plain(db.prepare("SELECT * FROM links WHERE id = ?").get(id) as Link | undefined);
}

export function getShortLinkByCode(code: string): ShortLink | null {
  return plain(
    db.prepare("SELECT * FROM short_links WHERE code = ? COLLATE NOCASE").get(code) as ShortLink | undefined,
  );
}

export function recordView(userId: string, referrer = "direct", country = "IN"): void {
  db.prepare("INSERT INTO views (user_id, created_at, referrer, country) VALUES (?,?,?,?)").run(
    userId,
    new Date().toISOString(),
    referrer || "direct",
    country || "IN",
  );
}

export function recordClick(linkId: string, userId: string, referrer = "direct"): void {
  db.prepare("INSERT INTO clicks (link_id, user_id, created_at, referrer) VALUES (?,?,?,?)").run(
    linkId,
    userId,
    new Date().toISOString(),
    referrer || "direct",
  );
}

export function recordSearch(userId: string, query: string, resultsCount: number): void {
  db.prepare("INSERT INTO searches (user_id, query, results_count, created_at) VALUES (?,?,?,?)").run(
    userId,
    query.slice(0, 80),
    Math.max(0, Math.round(resultsCount)),
    new Date().toISOString(),
  );
}

export type SearchQueryStat = {
  query: string;
  count: number;
  results: number;
};

export function getSearchStats(
  userId: string,
  days = 7,
): { total: number; top: SearchQueryStat[]; empty: { query: string; count: number }[] } {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const total = (
    db.prepare("SELECT COUNT(*) as n FROM searches WHERE user_id = ? AND created_at >= ?").get(userId, since) as {
      n: number;
    }
  ).n;

  const top = plainAll(
    db
      .prepare(
        `SELECT lower(trim(query)) as query, COUNT(*) as count, MAX(results_count) as results
         FROM searches
         WHERE user_id = ? AND created_at >= ?
         GROUP BY lower(trim(query))
         ORDER BY count DESC, query ASC
         LIMIT 8`,
      )
      .all(userId, since) as SearchQueryStat[],
  );

  const empty = plainAll(
    db
      .prepare(
        `SELECT lower(trim(query)) as query, COUNT(*) as count
         FROM searches
         WHERE user_id = ? AND created_at >= ? AND results_count = 0
         GROUP BY lower(trim(query))
         ORDER BY count DESC, query ASC
         LIMIT 6`,
      )
      .all(userId, since) as { query: string; count: number }[],
  );

  return { total, top, empty };
}

export function incrementShortLinkClicks(id: string): void {
  db.prepare("UPDATE short_links SET clicks = clicks + 1 WHERE id = ?").run(id);
}

export function getDailyStats(userId: string, days = 30): { date: string; views: number; clicks: number }[] {
  const analytics = getAnalytics(userId, days);
  return analytics.points.map((point) => ({ date: point.date, views: point.views, clicks: point.clicks }));
}

export function getLinkCount(userId: string): number {
  return (db.prepare("SELECT COUNT(*) as n FROM links WHERE user_id = ?").get(userId) as { n: number }).n;
}

export function getViewCount(userId: string, days = 7): number {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return (db.prepare("SELECT COUNT(*) as n FROM views WHERE user_id = ? AND created_at >= ?").get(userId, since) as { n: number }).n;
}

export function getClickCount(userId: string, days = 7): number {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return (db.prepare("SELECT COUNT(*) as n FROM clicks WHERE user_id = ? AND created_at >= ?").get(userId, since) as { n: number }).n;
}

export function getAnalytics(userId: string, days = 7): {
  points: AnalyticsPoint[];
  views: number;
  clicks: number;
  ctr: number;
  prevViews: number;
  prevClicks: number;
} {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const since = start.toISOString();
  const prevSince = new Date(start.getTime() - days * 86400000).toISOString();

  const viewRows = db
    .prepare(
      "SELECT substr(created_at,1,10) as d, COUNT(*) as n FROM views WHERE user_id = ? AND created_at >= ? GROUP BY d",
    )
    .all(userId, since) as { d: string; n: number }[];
  const clickRows = db
    .prepare(
      "SELECT substr(created_at,1,10) as d, COUNT(*) as n FROM clicks WHERE user_id = ? AND created_at >= ? GROUP BY d",
    )
    .all(userId, since) as { d: string; n: number }[];

  const viewMap = new Map(viewRows.map((r) => [r.d, r.n]));
  const clickMap = new Map(clickRows.map((r) => [r.d, r.n]));

  const points: AnalyticsPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const key = d.toISOString().slice(0, 10);
    points.push({
      date: key,
      label: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      views: viewMap.get(key) ?? 0,
      clicks: clickMap.get(key) ?? 0,
    });
  }

  const views = points.reduce((a, p) => a + p.views, 0);
  const clicks = points.reduce((a, p) => a + p.clicks, 0);
  const prevViews = (
    db.prepare("SELECT COUNT(*) as n FROM views WHERE user_id = ? AND created_at >= ? AND created_at < ?").get(userId, prevSince, since) as {
      n: number;
    }
  ).n;
  const prevClicks = (
    db.prepare("SELECT COUNT(*) as n FROM clicks WHERE user_id = ? AND created_at >= ? AND created_at < ?").get(userId, prevSince, since) as {
      n: number;
    }
  ).n;

  return {
    points,
    views,
    clicks,
    ctr: views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0,
    prevViews,
    prevClicks,
  };
}

export function getTopLinks(userId: string, days = 7): TopLink[] {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return plainAll(
    db
      .prepare(
        `SELECT l.id, l.title, COUNT(c.id) as clicks
       FROM links l LEFT JOIN clicks c ON c.link_id = l.id AND c.created_at >= ?
       WHERE l.user_id = ?
       GROUP BY l.id
       ORDER BY clicks DESC, l.position ASC
       LIMIT 8`,
      )
      .all(since, userId) as TopLink[],
  );
}

export function getReferrers(userId: string, days = 7): { referrer: string; count: number }[] {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return plainAll(
    db
      .prepare(
        "SELECT referrer, COUNT(*) as count FROM views WHERE user_id = ? AND created_at >= ? GROUP BY referrer ORDER BY count DESC LIMIT 6",
      )
      .all(userId, since) as { referrer: string; count: number }[],
  );
}

export function getCollectionStats(userId: string, days = 7): CollectionStat[] {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return plainAll(
    db
      .prepare(
        `SELECT c.id, c.name,
           (SELECT COUNT(*) FROM links l WHERE l.collection_id = c.id) as links,
           (SELECT COUNT(*) FROM clicks cl JOIN links l ON l.id = cl.link_id
             WHERE l.collection_id = c.id AND cl.created_at >= ?) as clicks
         FROM collections c
         WHERE c.user_id = ?
         ORDER BY clicks DESC, c.position ASC`,
      )
      .all(since, userId) as CollectionStat[],
  );
}

export function getCountries(userId: string, days = 7): { country: string; count: number }[] {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  return plainAll(
    db
      .prepare(
        "SELECT country, COUNT(*) as count FROM views WHERE user_id = ? AND created_at >= ? GROUP BY country ORDER BY count DESC LIMIT 6",
      )
      .all(userId, since) as { country: string; count: number }[],
  );
}

export function getSetupProgress(user: User): { done: number; total: number; steps: { label: string; done: boolean; href: string }[] } {
  const links = getLinkCount(user.id);
  const socials = getSocials(user.id).length;
  const steps = [
    { label: "Claim your Linktree", done: true, href: "/admin/header" },
    { label: "Add a profile title", done: user.name.trim().length > 0, href: "/admin/header" },
    { label: "Write a short bio", done: user.bio.trim().length > 0, href: "/admin/header" },
    { label: "Add your first link", done: links > 0, href: "/admin/links" },
    { label: "Add social icons", done: socials > 0, href: "/admin/links" },
    { label: "Choose a theme", done: !!user.theme, href: "/admin/design" },
  ];
  return { done: steps.filter((s) => s.done).length, total: steps.length, steps };
}

export function getDiscoverProfiles(): (User & { linkCount: number })[] {
  const rows = db
    .prepare(
      `SELECT ${userColumns("u")}, COUNT(l.id) as linkCount
       FROM users u LEFT JOIN links l ON l.user_id = u.id
       GROUP BY u.id ORDER BY u.created_at ASC`,
    )
    .all() as (User & { linkCount: number })[];
  return plainAll(rows);
}

export function getPlatformStats(): { profiles: number; links: number; views: number; clicks: number } {
  return {
    profiles: (db.prepare("SELECT COUNT(*) as n FROM users").get() as { n: number }).n,
    links: (db.prepare("SELECT COUNT(*) as n FROM links").get() as { n: number }).n,
    views: (db.prepare("SELECT COUNT(*) as n FROM views").get() as { n: number }).n,
    clicks: (db.prepare("SELECT COUNT(*) as n FROM clicks").get() as { n: number }).n,
  };
}

export function createPayment(input: {
  id: string;
  userId: string;
  plan: Plan;
  billing: BillingPeriod;
  amount: number;
  currency?: string;
  status?: PaymentStatus;
}): Payment {
  const at = new Date().toISOString();
  db.prepare(
    `INSERT INTO payments (id,user_id,plan,billing,amount,currency,status,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?)`,
  ).run(
    input.id,
    input.userId,
    input.plan,
    input.billing,
    input.amount,
    input.currency ?? "INR",
    input.status ?? "pending",
    at,
    at,
  );
  const payment = getPaymentById(input.id);
  if (!payment) throw new Error("Payment could not be created.");
  return payment;
}

export function getPaymentById(id: string): Payment | null {
  return plain(db.prepare("SELECT * FROM payments WHERE id = ?").get(id) as Payment | undefined);
}

export function getPayments(userId: string): Payment[] {
  return plainAll(
    db.prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC").all(userId) as Payment[],
  );
}

export function updatePaymentOrder(id: string, cfOrderId: string, paymentSessionId: string): void {
  db.prepare("UPDATE payments SET cf_order_id = ?, payment_session_id = ?, updated_at = ? WHERE id = ?").run(
    cfOrderId,
    paymentSessionId,
    new Date().toISOString(),
    id,
  );
}

export function setPaymentStatus(id: string, status: PaymentStatus): void {
  db.prepare("UPDATE payments SET status = ?, updated_at = ? WHERE id = ? AND status NOT IN ('paid','demo')").run(
    status,
    new Date().toISOString(),
    id,
  );
}

/**
 * Marks a Cashfree order as paid and unlocks the plan. Safe to call more than
 * once: webhooks and the return URL can both land on the same order.
 */
export function completePayment(orderId: string, cfPaymentId = "", status: "paid" | "demo" = "paid"): Payment | null {
  const payment = getPaymentById(orderId);
  if (!payment) return null;
  if (payment.status === "paid" || payment.status === "demo") return payment;

  const at = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      "UPDATE payments SET status = ?, cf_payment_id = ?, paid_at = ?, updated_at = ? WHERE id = ?",
    ).run(status, cfPaymentId || payment.cf_payment_id, at, at, orderId);
    db.prepare("UPDATE users SET plan = ? WHERE id = ?").run(payment.plan, payment.user_id);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return getPaymentById(orderId);
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^mailto:|^tel:/i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function cleanUsername(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 30);
}
