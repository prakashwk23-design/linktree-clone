"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { createSession, destroySession, requireUser } from "@/lib/auth";
import { canCreateCollection } from "@/lib/collections";
import {
  cleanUsername,
  deleteSocialConnection,
  getCollectionCount,
  getUserByEmail,
  getUserByUsername,
  RESERVED_USERNAMES,
} from "@/lib/data";
import { isSocialProvider } from "@/lib/social";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { ActionState } from "@/lib/types";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const bool = (fd: FormData, key: string) => (fd.get(key) === "on" || fd.get(key) === "1" ? 1 : 0);

function refreshProfile(username: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/links");
  revalidatePath("/admin/header");
  revalidatePath("/admin/design");
  revalidatePath("/admin/insights");
  revalidatePath(`/${username}`);
  revalidatePath("/discover");
}

function ownsCollection(userId: string, collectionId: string): boolean {
  if (!collectionId) return false;
  return !!db.prepare("SELECT id FROM collections WHERE id = ? AND user_id = ?").get(collectionId, userId);
}

export async function registerAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const username = cleanUsername(str(fd, "username"));
  const name = str(fd, "name") || username;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Your password needs at least 8 characters." };
  if (username.length < 3) return { error: "Your linktr.ee username needs at least 3 characters." };
  if (RESERVED_USERNAMES.has(username)) return { error: "That username is reserved. Try another one." };
  if (getUserByEmail(email)) return { error: "An account with that email already exists. Try logging in." };
  if (getUserByUsername(username)) return { error: "That username is taken. Try another one." };

  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id,email,password_hash,username,name,bio,avatar,plan,theme,button_style,corner_style,font,layout,title_style,wallpaper,show_footer,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
    id,
    email,
    hashPassword(password),
    username,
    name,
    "",
    "",
    "free",
    "chartreuse",
    "solid",
    "rounded",
    "dm-sans",
    "classic",
    "text",
    "fill",
    1,
    new Date().toISOString(),
  );

  await createSession(id);
  redirect("/admin");
}

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const identifier = str(fd, "identifier").toLowerCase();
  const password = str(fd, "password");
  if (!identifier || !password) return { error: "Enter your email or username and password." };

  const found = identifier.includes("@") ? getUserByEmail(identifier) : getUserByUsername(identifier);

  if (!found) return { error: "We couldn't find an account with those details." };
  const withPassword = getUserByEmail(found.email);
  if (!withPassword || !verifyPassword(password, withPassword.password_hash)) {
    return { error: "That password doesn't match. Try again." };
  }

  await createSession(found.id);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function updateHeaderAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = str(fd, "title");
  const bio = str(fd, "bio");
  const avatar = str(fd, "avatar");
  const username = cleanUsername(str(fd, "username"));
  const layout = str(fd, "layout") || "classic";
  const titleStyle = str(fd, "titleStyle") || "text";

  if (!name) return { error: "Add a title so visitors know who you are." };
  if (bio.length > 160) return { error: "Keep your bio under 160 characters." };
  if (username !== user.username) {
    if (username.length < 3) return { error: "Your username needs at least 3 characters." };
    if (RESERVED_USERNAMES.has(username)) return { error: "That username is reserved." };
    const existing = getUserByUsername(username);
    if (existing && existing.id !== user.id) return { error: "That username is taken." };
  }

  db.prepare("UPDATE users SET name = ?, bio = ?, avatar = ?, username = ?, layout = ?, title_style = ? WHERE id = ?").run(
    name,
    bio,
    avatar,
    username,
    layout,
    titleStyle,
    user.id,
  );
  refreshProfile(user.username);
  if (username !== user.username) refreshProfile(username);
  return { ok: true, message: "Header updated" };
}

export async function updateDesignAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const theme = str(fd, "theme") || "chartreuse";
  const wallpaper = str(fd, "wallpaper") || "fill";
  const buttonStyle = str(fd, "buttonStyle") || "solid";
  const cornerStyle = str(fd, "cornerStyle") || "rounded";
  const font = str(fd, "font") || "dm-sans";
  const showFooter = bool(fd, "showFooter");

  db.prepare("UPDATE users SET theme = ?, wallpaper = ?, button_style = ?, corner_style = ?, font = ?, show_footer = ? WHERE id = ?").run(
    theme,
    wallpaper,
    buttonStyle,
    cornerStyle,
    font,
    showFooter,
    user.id,
  );
  refreshProfile(user.username);
  return { ok: true, message: "Design updated" };
}

export async function updateAccountAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  if (!name) return { error: "Your name can't be empty." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  const existing = getUserByEmail(email);
  if (existing && existing.id !== user.id) return { error: "That email is already in use." };
  db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, user.id);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Details saved" };
}

export async function changePasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const current = str(fd, "current");
  const next = str(fd, "next");
  if (next.length < 8) return { error: "Your new password needs at least 8 characters." };
  const withPassword = getUserByEmail(user.email);
  if (!withPassword || !verifyPassword(current, withPassword.password_hash)) {
    return { error: "Your current password is incorrect." };
  }
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(next), user.id);
  // Changing a password signs out every other device. Keep this one signed in.
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
  await createSession(user.id);
  return { ok: true, message: "Password updated" };
}

/** Paid plans go through Cashfree checkout; this only handles dropping to Free. */
export async function downgradePlanAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  if (str(fd, "plan") !== "free") return;
  db.prepare("UPDATE users SET plan = 'free' WHERE id = ?").run(user.id);
  revalidatePath("/admin", "layout");
  revalidatePath("/pricing");
  redirect("/admin/account?downgraded=free");
}

export async function addLinkAction(fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const title = str(fd, "title").slice(0, 120);
  let url = str(fd, "url");
  const thumbnail = str(fd, "thumbnail").slice(0, 8);
  const visible = bool(fd, "visible");
  const requestedCollection = str(fd, "collection_id");
  const collectionId = ownsCollection(user.id, requestedCollection) ? requestedCollection : null;
  if (!title) return { error: "Add a title for your link." };
  if (!url) return { error: "Add a URL for your link." };
  if (!/^mailto:|^tel:/i.test(url) && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    new URL(url);
  } catch {
    return { error: "That URL doesn't look right. Try something like https://example.com." };
  }
  const max = db.prepare("SELECT COALESCE(MAX(position), -1) as p FROM links WHERE user_id = ?").get(user.id) as { p: number };
  db.prepare(
    "INSERT INTO links (id,user_id,title,url,type,position,visible,thumbnail,collection_id,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
  ).run(
    randomUUID(),
    user.id,
    title,
    url,
    thumbnail ? "featured" : "link",
    max.p + 1,
    visible,
    thumbnail,
    collectionId,
    new Date().toISOString(),
  );
  refreshProfile(user.username);
  return { ok: true, message: "Link added" };
}

export async function updateLinkAction(fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(fd, "id");
  const title = str(fd, "title").slice(0, 120);
  let url = str(fd, "url");
  const thumbnail = str(fd, "thumbnail").slice(0, 8);
  const visible = bool(fd, "visible");
  const requestedCollection = str(fd, "collection_id");
  const collectionId = ownsCollection(user.id, requestedCollection) ? requestedCollection : null;
  const owned = db.prepare("SELECT id FROM links WHERE id = ? AND user_id = ?").get(id, user.id);
  if (!owned) return { error: "That link no longer exists. Refresh the page." };
  if (!title) return { error: "Add a title for your link." };
  if (!url) return { error: "Add a URL for your link." };
  if (!/^mailto:|^tel:/i.test(url) && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    new URL(url);
  } catch {
    return { error: "That URL doesn't look right. Try something like https://example.com." };
  }
  db.prepare(
    "UPDATE links SET title = ?, url = ?, thumbnail = ?, type = ?, visible = ?, collection_id = ? WHERE id = ? AND user_id = ?",
  ).run(
    title,
    url,
    thumbnail,
    thumbnail ? "featured" : "link",
    visible,
    collectionId,
    id,
    user.id,
  );
  refreshProfile(user.username);
  return { ok: true, message: "Link updated" };
}

export async function deleteLinkAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const id = str(fd, "id");
  db.prepare("DELETE FROM links WHERE id = ? AND user_id = ?").run(id, user.id);
  refreshProfile(user.username);
}

export async function toggleLinkAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const id = str(fd, "id");
  const visible = bool(fd, "visible");
  db.prepare("UPDATE links SET visible = ? WHERE id = ? AND user_id = ?").run(visible, id, user.id);
  refreshProfile(user.username);
}

export async function reorderLinks(ids: string[]): Promise<void> {
  const user = await requireUser();
  const update = db.prepare("UPDATE links SET position = ? WHERE id = ? AND user_id = ?");
  ids.forEach((id, index) => update.run(index, id, user.id));
  refreshProfile(user.username);
}

export async function createCollectionAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = str(fd, "name").slice(0, 60);
  if (!name) return { error: "Give your collection a name." };

  const count = getCollectionCount(user.id);
  if (!canCreateCollection(user.plan, count)) {
    return { error: "Free includes 1 collection. Upgrade to Starter for unlimited collections." };
  }

  const max = db.prepare("SELECT COALESCE(MAX(position), -1) as p FROM collections WHERE user_id = ?").get(user.id) as {
    p: number;
  };
  db.prepare("INSERT INTO collections (id,user_id,name,position,created_at) VALUES (?,?,?,?,?)").run(
    randomUUID(),
    user.id,
    name,
    max.p + 1,
    new Date().toISOString(),
  );
  refreshProfile(user.username);
  return { ok: true, message: "Collection created" };
}

export async function renameCollectionAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const id = str(fd, "id");
  const name = str(fd, "name").slice(0, 60);
  if (!id || !name) return;
  db.prepare("UPDATE collections SET name = ? WHERE id = ? AND user_id = ?").run(name, id, user.id);
  refreshProfile(user.username);
}

export async function deleteCollectionAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const id = str(fd, "id");
  if (!id) return;
  // Links survive; they move back to the main list.
  db.prepare("UPDATE links SET collection_id = NULL WHERE collection_id = ? AND user_id = ?").run(id, user.id);
  db.prepare("DELETE FROM collections WHERE id = ? AND user_id = ?").run(id, user.id);
  refreshProfile(user.username);
}

export async function reorderCollections(ids: string[]): Promise<void> {
  const user = await requireUser();
  const update = db.prepare("UPDATE collections SET position = ? WHERE id = ? AND user_id = ?");
  ids.forEach((id, index) => update.run(index, id, user.id));
  refreshProfile(user.username);
}

export async function addSocialAction(fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const platform = str(fd, "platform") || "instagram";
  let url = str(fd, "url");
  if (!url) return { error: "Add your profile URL." };
  if (platform === "email") {
    const address = url.replace(/^mailto:/i, "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return { error: "Enter a valid email address." };
    url = `mailto:${address}`;
  } else {
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      return { error: "That URL doesn't look right. Try something like https://instagram.com/yourname." };
    }
  }
  const max = db.prepare("SELECT COALESCE(MAX(position), -1) as p FROM socials WHERE user_id = ?").get(user.id) as { p: number };
  db.prepare("INSERT INTO socials (id,user_id,platform,url,position) VALUES (?,?,?,?,?)").run(
    randomUUID(),
    user.id,
    platform,
    url,
    max.p + 1,
  );
  refreshProfile(user.username);
  return { ok: true, message: "Icon added" };
}

export async function deleteSocialAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const id = str(fd, "id");
  db.prepare("DELETE FROM socials WHERE id = ? AND user_id = ?").run(id, user.id);
  refreshProfile(user.username);
}

export async function addContactAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const name = str(fd, "name");
  const email = str(fd, "email");
  const source = str(fd, "source") || "Linktree";
  if (!name || !email) return;
  db.prepare("INSERT INTO contacts (id,user_id,name,email,source,created_at) VALUES (?,?,?,?,?,?)").run(
    randomUUID(),
    user.id,
    name,
    email,
    source,
    new Date().toISOString(),
  );
  revalidatePath("/admin/audience");
}

export async function addProductAction(fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = str(fd, "name").slice(0, 120);
  const description = str(fd, "description").slice(0, 500);
  const cover = str(fd, "cover").slice(0, 8);
  const price = Number.parseFloat(str(fd, "price") || "0");
  if (!name) return { error: "Give your product a name." };
  if (!Number.isFinite(price) || price < 0) return { error: "Enter a price of 0 or more." };
  db.prepare(
    "INSERT INTO products (id,user_id,name,description,cover,price_cents,sales,created_at) VALUES (?,?,?,?,?,?,?,?)",
  ).run(
    randomUUID(),
    user.id,
    name,
    description,
    cover,
    Math.round(price * 100),
    0,
    new Date().toISOString(),
  );
  revalidatePath("/admin/earn");
  return { ok: true, message: "Product published" };
}

export async function createShortLinkAction(fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  let target = str(fd, "target");
  const customCode = cleanUsername(str(fd, "code"));
  if (!target) return { error: "Add a destination URL." };
  if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
  try {
    new URL(target);
  } catch {
    return { error: "That URL doesn't look right. Try something like https://example.com." };
  }

  let code = customCode;
  if (code) {
    const exists = db.prepare("SELECT id FROM short_links WHERE code = ? COLLATE NOCASE").get(code);
    if (exists) return { error: `The code "${code}" is already taken. Try another one.` };
  } else {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      code = Math.random().toString(36).slice(2, 8);
      if (!db.prepare("SELECT id FROM short_links WHERE code = ?").get(code)) break;
    }
  }

  db.prepare("INSERT INTO short_links (id,user_id,code,target,clicks,created_at) VALUES (?,?,?,?,?,?)").run(
    randomUUID(),
    user.id,
    code,
    target,
    0,
    new Date().toISOString(),
  );
  revalidatePath("/admin/link-shortener");
  return { ok: true, message: "Short link created" };
}

export async function deleteShortLinkAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const id = str(fd, "id");
  db.prepare("DELETE FROM short_links WHERE id = ? AND user_id = ?").run(id, user.id);
  revalidatePath("/admin/link-shortener");
}

export async function disconnectSocialAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const provider = str(fd, "provider");
  if (!isSocialProvider(provider)) return;
  deleteSocialConnection(user.id, provider);
  revalidatePath("/admin/account");
}

export async function deleteAccountAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser();
  const confirmation = str(fd, "confirm");
  if (confirmation !== "DELETE") return { error: 'Type "DELETE" to confirm.' };
  // Analytics tables have no foreign keys, so clean them up explicitly.
  db.prepare("DELETE FROM views WHERE user_id = ?").run(user.id);
  db.prepare("DELETE FROM clicks WHERE user_id = ?").run(user.id);
  db.prepare("DELETE FROM searches WHERE user_id = ?").run(user.id);
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(user.id);
  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  await destroySession();
  redirect("/");
}

export async function seedLinkAction(): Promise<void> {
  const user = await requireUser();
  const count = db.prepare("SELECT COUNT(*) as n FROM links WHERE user_id = ?").get(user.id) as { n: number };
  if (count.n > 0) return;
  const demoLinks = [
    ["My latest video", "https://youtube.com", "🎬"],
    ["Shop my presets", "https://example.com", "📸"],
    ["Join my newsletter", "https://example.com", "💌"],
  ];
  const insert = db.prepare(
    "INSERT INTO links (id,user_id,title,url,type,position,visible,thumbnail,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
  );
  demoLinks.forEach(([title, url, thumb], i) => insert.run(randomUUID(), user.id, title, url, "featured", i, 1, thumb, new Date().toISOString()));
  refreshProfile(user.username);
}
