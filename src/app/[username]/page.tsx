export const instant = false;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileBody } from "@/components/profile/ProfileBody";
import { ProfileShare } from "@/components/profile/ProfileShare";
import { ProfileTracker } from "@/components/profile/ProfileTracker";
import { RESERVED_USERNAMES, getCollections, getLinks, getSocials, getUserByUsername } from "@/lib/data";
import { getTheme } from "@/lib/themes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = getUserByUsername(username);
  if (!user) return { title: "Page not found" };

  const title = `${user.name} (@${user.username})`;
  const description = user.bio || `Check out ${user.name}'s links on Linktree.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "Linktree",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  if (RESERVED_USERNAMES.has(username.toLowerCase())) notFound();

  const user = getUserByUsername(username);
  if (!user) notFound();

  const links = getLinks(user.id, true);
  const socials = getSocials(user.id);
  const collections = getCollections(user.id);
  const theme = getTheme(user.theme);

  return (
    <main className="relative min-h-screen w-full">
      <ProfileTracker userId={user.id} />
      <div className="absolute right-4 top-4 z-20">
        <ProfileShare name={user.name} username={user.username} dark={theme.dark} />
      </div>
      <ProfileBody
        user={user}
        links={links}
        socials={socials}
        collections={collections}
        analyticsUserId={user.id}
      />
    </main>
  );
}
