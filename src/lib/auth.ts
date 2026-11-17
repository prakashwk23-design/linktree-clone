import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "./db";
import type { User } from "./types";

export const SESSION_COOKIE = "lt_session";
const SESSION_DAYS = 30;

export type SessionUser = User;

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get(token, new Date().toISOString()) as (User & { password_hash?: string }) | undefined;
  if (!row) return null;
  // Never hand the password hash to pages or client components.
  const user = { ...row };
  delete user.password_hash;
  return user as User;
}

export async function requireUser(): Promise<User> {
  // Session reads depend on request cookies and the current time, so this
  // subtree must render per request rather than during prerendering.
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  db.prepare("INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)").run(token, userId, expires.toISOString());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  store.delete(SESSION_COOKIE);
}

export async function getSessionUserOrRedirect(): Promise<User> {
  return requireUser();
}
