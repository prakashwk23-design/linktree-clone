import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "./password";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "linktree.db");

function sleepSync(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** Retry SQLite "database is locked" errors (build workers and dev reloads can race). */
function withRetry<T>(fn: () => T, attempts = 20): T {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
      if ((error as { errcode?: number }).errcode !== 5) throw error;
      sleepSync(50 + attempt * 25);
    }
  }
  throw lastError;
}

function createDb(): DatabaseSync {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const database = new DatabaseSync(DB_PATH);
  database.exec("PRAGMA busy_timeout = 8000;");
  withRetry(() => database.exec("PRAGMA journal_mode = WAL;"));
  database.exec("PRAGMA foreign_keys = ON;");
  withRetry(() =>
    database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      name TEXT NOT NULL,
      bio TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT '',
      plan TEXT NOT NULL DEFAULT 'free',
      theme TEXT NOT NULL DEFAULT 'chartreuse',
      button_style TEXT NOT NULL DEFAULT 'solid',
      corner_style TEXT NOT NULL DEFAULT 'rounded',
      font TEXT NOT NULL DEFAULT 'dm-sans',
      layout TEXT NOT NULL DEFAULT 'classic',
      title_style TEXT NOT NULL DEFAULT 'text',
      wallpaper TEXT NOT NULL DEFAULT 'fill',
      show_footer INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'link',
      position INTEGER NOT NULL DEFAULT 0,
      visible INTEGER NOT NULL DEFAULT 1,
      thumbnail TEXT NOT NULL DEFAULT '',
      collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS socials (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      url TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      referrer TEXT NOT NULL DEFAULT 'direct',
      country TEXT NOT NULL DEFAULT 'IN'
    );

    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      link_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      referrer TEXT NOT NULL DEFAULT 'direct'
    );

    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      query TEXT NOT NULL,
      results_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS social_connections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      account_name TEXT NOT NULL DEFAULT '',
      access_token TEXT NOT NULL DEFAULT '',
      refresh_token TEXT NOT NULL DEFAULT '',
      expires_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      UNIQUE (user_id, provider)
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'Linktree',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      cover TEXT NOT NULL DEFAULT '',
      price_cents INTEGER NOT NULL DEFAULT 0,
      sales INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS short_links (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      code TEXT UNIQUE NOT NULL,
      target TEXT NOT NULL,
      clicks INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL,
      billing TEXT NOT NULL DEFAULT 'monthly',
      amount INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'pending',
      cf_order_id TEXT NOT NULL DEFAULT '',
      payment_session_id TEXT NOT NULL DEFAULT '',
      cf_payment_id TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      paid_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_links_user ON links(user_id, position);
    CREATE INDEX IF NOT EXISTS idx_links_collection ON links(collection_id);
    CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id, position);
    CREATE INDEX IF NOT EXISTS idx_views_user_date ON views(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_clicks_user_date ON clicks(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_searches_user_date ON searches(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_payments_user_date ON payments(user_id, created_at);
  `),
  );

  // Databases created before a column existed miss out on CREATE TABLE IF NOT EXISTS.
  withRetry(() => {
    const columns = database.prepare("PRAGMA table_info(products)").all() as { name: string }[];
    if (!columns.some((column) => column.name === "cover")) {
      try {
        database.exec("ALTER TABLE products ADD COLUMN cover TEXT NOT NULL DEFAULT ''");
      } catch (error) {
        // Build workers can race on the same database file; another one won.
        if (!/duplicate column name/i.test((error as Error).message)) throw error;
      }
    }
  });

  withRetry(() => {
    const columns = database.prepare("PRAGMA table_info(links)").all() as { name: string }[];
    if (!columns.some((column) => column.name === "collection_id")) {
      try {
        database.exec(
          "ALTER TABLE links ADD COLUMN collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL",
        );
      } catch (error) {
        if (!/duplicate column name/i.test((error as Error).message)) throw error;
      }
    }
  });

  return database;
}

const globalForDb = globalThis as unknown as { __linktreeDb?: DatabaseSync };

export const db: DatabaseSync = globalForDb.__linktreeDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__linktreeDb = db;

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

type SeedUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  plan: string;
  theme: string;
  buttonStyle: string;
  corner: string;
  font: string;
  layout?: string;
  links: { title: string; url: string; emoji?: string; collection?: string }[];
  socials: { platform: string; url: string }[];
};

const DEMO_COLLECTIONS = [
  { id: "col_watch", name: "Watch", position: 0 },
  { id: "col_listen", name: "Listen", position: 1 },
  { id: "col_resources", name: "Resources", position: 2 },
];

function seed(): void {
  withRetry(() => {
    db.exec("BEGIN IMMEDIATE;");
    try {
      const count = db.prepare("SELECT COUNT(*) as n FROM users").get() as { n: number };
      if (count.n > 0) {
        db.exec("COMMIT;");
        return;
      }
      seedData();
      db.exec("COMMIT;");
    } catch (error) {
      db.exec("ROLLBACK;");
      throw error;
    }
  });
}

function seedData(): void {
  const password = hashPassword("demo1234");
  const createdAt = now();

  const users: SeedUser[] = [
    {
      id: "usr_demo",
      email: "demo@linktr.ee",
      username: "demo",
      name: "Demo Creator",
      bio: "Filmmaker & educator. I make things for the internet. 🎥",
      plan: "pro",
      theme: "midnight",
      buttonStyle: "glass",
      corner: "rounded",
      font: "dm-sans",
      links: [
        { title: "Book a 1:1 creator call", url: "https://cal.com/example/creator-call", emoji: "📅" },
        { title: "My website", url: "https://example.com", emoji: "🌐" },
        { title: "Work with me", url: "https://example.com/work-with-me", emoji: "🤝" },
        { title: "Press kit", url: "https://example.com/press", emoji: "📰" },
        { title: "Latest blog post", url: "https://example.com/blog", emoji: "✍️" },
        { title: "My new video is live", url: "https://youtube.com/watch?v=dQw4w9WgXcQ", emoji: "🎬", collection: "col_watch" },
        { title: "Watch the full tutorial", url: "https://youtube.com/watch?v=example", emoji: "🎥", collection: "col_watch" },
        { title: "Behind the scenes vlog", url: "https://youtube.com/watch?v=bts", emoji: "🎞️", collection: "col_watch" },
        { title: "Listen to my podcast", url: "https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk", emoji: "🎧", collection: "col_listen" },
        { title: "My Spotify playlist", url: "https://open.spotify.com/playlist/example", emoji: "🎶", collection: "col_listen" },
        { title: "Shop my Lightroom presets", url: "https://shop.example.com/presets", emoji: "📸", collection: "col_resources" },
        { title: "Join 12,000 creators on my newsletter", url: "https://newsletter.example.com", emoji: "💌", collection: "col_resources" },
        { title: "Free creator checklist", url: "https://example.com/checklist", emoji: "✅", collection: "col_resources" },
        { title: "My gear list", url: "https://example.com/gear", emoji: "🎒", collection: "col_resources" },
      ],
      socials: [
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "tiktok", url: "https://tiktok.com" },
        { platform: "youtube", url: "https://youtube.com" },
        { platform: "x", url: "https://x.com" },
      ],
    },
    {
      id: "usr_maya",
      email: "maya@example.com",
      username: "mayachen",
      name: "Maya Chen",
      bio: "Product designer. Drawing interfaces and tiny worlds.",
      plan: "pro",
      theme: "bubblegum",
      buttonStyle: "solid",
      corner: "pill",
      font: "space",
      links: [
        { title: "Portfolio", url: "https://example.com/portfolio", emoji: "🎨" },
        { title: "My design newsletter", url: "https://example.com/newsletter", emoji: "💌" },
        { title: "Shop my icon sets", url: "https://example.com/icons", emoji: "✨" },
        { title: "Book a portfolio review", url: "https://example.com/review", emoji: "📅" },
      ],
      socials: [
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "dribbble", url: "https://dribbble.com" },
        { platform: "linkedin", url: "https://linkedin.com" },
      ],
    },
    {
      id: "usr_jordan",
      email: "jordan@example.com",
      username: "jordanbeats",
      name: "Jordan Lee",
      bio: "Producer / DJ. New pack every Friday. 🎛️",
      plan: "premium",
      theme: "ocean",
      buttonStyle: "glass",
      corner: "rounded",
      font: "space",
      links: [
        { title: "Stream my new EP", url: "https://open.spotify.com", emoji: "🔊" },
        { title: "Free drum kit", url: "https://example.com/drumkit", emoji: "🥁" },
        { title: "Book me for a show", url: "https://example.com/booking", emoji: "🎟️" },
        { title: "Join the Discord", url: "https://discord.com", emoji: "💬" },
      ],
      socials: [
        { platform: "spotify", url: "https://spotify.com" },
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "tiktok", url: "https://tiktok.com" },
      ],
    },
    {
      id: "usr_studio",
      email: "studio@example.com",
      username: "studionine",
      name: "Studio Nine",
      bio: "An independent design studio in Lisbon. Brand, web, film.",
      plan: "pro",
      theme: "chalk",
      buttonStyle: "solid",
      corner: "square",
      font: "fraunces",
      links: [
        { title: "Selected work", url: "https://example.com/work", emoji: "🗂️" },
        { title: "Meet the team", url: "https://example.com/team", emoji: "👋" },
        { title: "Start a project", url: "https://example.com/contact", emoji: "🛠️" },
      ],
      socials: [
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "linkedin", url: "https://linkedin.com" },
        { platform: "email", url: "mailto:hello@example.com" },
      ],
    },
    {
      id: "usr_nova",
      email: "nova@example.com",
      username: "nova",
      name: "Nova Reyes",
      bio: "Illustrator painting loud little feelings. Commissions open.",
      plan: "starter",
      theme: "sunset",
      buttonStyle: "solid",
      corner: "pill",
      font: "dm-sans",
      links: [
        { title: "Shop prints", url: "https://example.com/prints", emoji: "🖼️" },
        { title: "Commission info", url: "https://example.com/commissions", emoji: "🖌️" },
        { title: "Latest sketchbook", url: "https://example.com/sketchbook", emoji: "📓" },
      ],
      socials: [
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "tiktok", url: "https://tiktok.com" },
      ],
    },
    {
      id: "usr_sam",
      email: "sam@example.com",
      username: "eatwithsam",
      name: "Sam Rivera",
      bio: "Big flavours, small kitchens. Recipes and supper club tickets.",
      plan: "pro",
      theme: "forest",
      buttonStyle: "solid",
      corner: "rounded",
      font: "fraunces",
      links: [
        { title: "This week's recipe", url: "https://example.com/recipe", emoji: "🍝" },
        { title: "Supper club tickets", url: "https://example.com/tickets", emoji: "🎟️" },
        { title: "My spice kit", url: "https://example.com/spices", emoji: "🌶️" },
        { title: "Watch on YouTube", url: "https://youtube.com", emoji: "📺" },
      ],
      socials: [
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "youtube", url: "https://youtube.com" },
        { platform: "tiktok", url: "https://tiktok.com" },
      ],
    },
    {
      id: "usr_filmclub",
      email: "filmclub@example.com",
      username: "filmclub",
      name: "The Film Club",
      bio: "One great film, every Sunday. Tickets, notes and merch.",
      plan: "free",
      theme: "cherry",
      buttonStyle: "glass",
      corner: "rounded",
      font: "space",
      links: [
        { title: "This Sunday's film", url: "https://example.com/screening", emoji: "🎞️" },
        { title: "Get tickets", url: "https://example.com/tickets", emoji: "🎟️" },
        { title: "Listen to the pod", url: "https://open.spotify.com", emoji: "🎙️" },
      ],
      socials: [
        { platform: "youtube", url: "https://youtube.com" },
        { platform: "instagram", url: "https://instagram.com" },
      ],
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id,email,password_hash,username,name,bio,avatar,plan,theme,button_style,corner_style,font,layout,title_style,wallpaper,show_footer,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  const insertLink = db.prepare(`
    INSERT INTO links (id,user_id,title,url,type,position,visible,thumbnail,collection_id,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `);
  const insertSocial = db.prepare(`
    INSERT INTO socials (id,user_id,platform,url,position) VALUES (?,?,?,?,?)
  `);
  const insertCollection = db.prepare(`
    INSERT INTO collections (id,user_id,name,position,created_at) VALUES (?,?,?,?,?)
  `);

  for (const u of users) {
    insertUser.run(
      u.id,
      u.email,
      password,
      u.username,
      u.name,
      u.bio,
      "",
      u.plan,
      u.theme,
      u.buttonStyle,
      u.corner,
      u.font,
      u.layout ?? "classic",
      "text",
      "fill",
      1,
      createdAt,
    );
    if (u.id === "usr_demo") {
      DEMO_COLLECTIONS.forEach((collection) =>
        insertCollection.run(collection.id, u.id, collection.name, collection.position, createdAt),
      );
    }
    u.links.forEach((link, i) => {
      insertLink.run(
        uid(),
        u.id,
        link.title,
        link.url,
        link.emoji ? "featured" : "link",
        i,
        1,
        link.emoji ?? "",
        link.collection ?? null,
        createdAt,
      );
    });
    u.socials.forEach((s, i) => insertSocial.run(uid(), u.id, s.platform, s.url, i));
  }

  // Contacts for the demo account
  const insertContact = db.prepare("INSERT INTO contacts (id,user_id,name,email,source,created_at) VALUES (?,?,?,?,?,?)");
  const contacts = [
    ["Aisha Patel", "aisha@example.com", "Newsletter"],
    ["Marcus Brown", "marcus@example.com", "Linktree form"],
    ["Priya Sharma", "priya@example.com", "Instagram"],
    ["Tom Becker", "tom@example.com", "Linktree form"],
    ["Lena Fischer", "lena@example.com", "Newsletter"],
  ];
  contacts.forEach(([name, email, source], i) =>
    insertContact.run(uid(), "usr_demo", name, email, source, new Date(Date.now() - i * 86400000 * 2).toISOString()),
  );

  // Products
  const insertProduct = db.prepare(
    "INSERT INTO products (id,user_id,name,description,cover,price_cents,sales,created_at) VALUES (?,?,?,?,?,?,?,?)",
  );
  insertProduct.run(uid(), "usr_demo", "Creator Preset Pack", "12 Lightroom presets for warm, cinematic edits.", "🎨", 190000, 34, createdAt);
  insertProduct.run(uid(), "usr_demo", "The Creator Playbook", "A 48-page guide to planning, filming and shipping.", "📕", 290000, 12, createdAt);
  insertProduct.run(uid(), "usr_demo", "1:1 Portfolio Review", "45 minutes of feedback on your reel and website.", "💻", 750000, 4, createdAt);

  // Short link
  db.prepare("INSERT INTO short_links (id,user_id,code,target,clicks,created_at) VALUES (?,?,?,?,?,?)").run(
    uid(),
    "usr_demo",
    "creator-kit",
    "https://example.com/creator-kit",
    42,
    createdAt,
  );

  // Seeded analytics for the last 14 days
  const insertView = db.prepare("INSERT INTO views (user_id,created_at,referrer,country) VALUES (?,?,?,?)");
  const insertClick = db.prepare("INSERT INTO clicks (link_id,user_id,created_at,referrer) VALUES (?,?,?,?)");
  const demoLinks = db.prepare("SELECT id FROM links WHERE user_id = ? ORDER BY position").all("usr_demo") as { id: string }[];
  const referrers = ["direct", "instagram.com", "tiktok.com", "youtube.com", "google.com", "x.com"];
  const countries = ["IN", "US", "GB", "DE", "BR", "AU"];

  let state = 7;
  const rnd = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  for (let day = 13; day >= 0; day--) {
    const base = Date.now() - day * 86400000;
    const views = 26 + Math.floor(rnd() * 80) + (13 - day) * 2;
    const clicks = 8 + Math.floor(rnd() * 42);
    for (let i = 0; i < views; i++) {
      const at = new Date(base - Math.floor(rnd() * 86400000 * 0.85)).toISOString();
      insertView.run("usr_demo", at, referrers[Math.floor(rnd() * referrers.length)], countries[Math.floor(rnd() * countries.length)]);
    }
    for (let i = 0; i < clicks; i++) {
      const at = new Date(base - Math.floor(rnd() * 86400000 * 0.85)).toISOString();
      const link = demoLinks[Math.floor(rnd() * rnd() * demoLinks.length)];
      insertClick.run(link.id, "usr_demo", at, referrers[Math.floor(rnd() * referrers.length)]);
    }
  }

  // Searches on the demo page (including zero-result queries that signal demand).
  const insertSearch = db.prepare(
    "INSERT INTO searches (user_id,query,results_count,created_at) VALUES (?,?,?,?)",
  );
  const searchSeeds = [
    { query: "presets", results: 1, count: 9 },
    { query: "podcast", results: 1, count: 7 },
    { query: "newsletter", results: 1, count: 6 },
    { query: "lightroom", results: 1, count: 5 },
    { query: "video", results: 3, count: 4 },
    { query: "gear", results: 1, count: 3 },
    { query: "templates", results: 0, count: 4 },
    { query: "press kit", results: 0, count: 2 },
    { query: "booking", results: 1, count: 2 },
  ];
  for (const seed of searchSeeds) {
    for (let i = 0; i < seed.count; i++) {
      const at = new Date(Date.now() - Math.floor(rnd() * 13 * 86400000)).toISOString();
      insertSearch.run("usr_demo", seed.query, seed.results, at);
    }
  }

  // A little traffic for the public profiles
  for (const u of users.slice(1)) {
    for (let day = 6; day >= 0; day--) {
      const base = Date.now() - day * 86400000;
      const views = 4 + Math.floor(rnd() * 18);
      for (let i = 0; i < views; i++) {
        insertView.run(u.id, new Date(base - Math.floor(rnd() * 80000000)).toISOString(), referrers[Math.floor(rnd() * referrers.length)], countries[Math.floor(rnd() * countries.length)]);
      }
    }
  }
}

seed();
