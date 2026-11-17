import type { Collection, Plan } from "./types";

/** Free includes one collection; every paid plan is unlimited. */
export const FREE_COLLECTION_LIMIT = 1;

export function collectionLimit(plan: Plan): number {
  return plan === "free" ? FREE_COLLECTION_LIMIT : Number.POSITIVE_INFINITY;
}

export function canCreateCollection(plan: Plan, currentCount: number): boolean {
  return currentCount < collectionLimit(plan);
}

/** URL-safe anchor for a collection, e.g. "Watch later" → "watch-later". */
export function slugifyCollection(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "collection";
}

/**
 * Stable slugs for a user's collections. Duplicate names get -2, -3, … so
 * every collection keeps its own shareable #anchor.
 */
export function collectionSlugs(collections: Pick<Collection, "id" | "name">[]): Map<string, string> {
  const used = new Map<string, number>();
  const slugs = new Map<string, string>();

  for (const collection of collections) {
    const base = slugifyCollection(collection.name);
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    slugs.set(collection.id, count === 1 ? base : `${base}-${count}`);
  }

  return slugs;
}
