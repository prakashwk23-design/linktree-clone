export const instant = false;

import { requireUser } from "@/lib/auth";
import { getCollections, getLinks, getSocials } from "@/lib/data";
import { LinkEditor } from "@/components/admin/LinkEditor";

export const metadata = { title: "Links" };

export default async function LinksPage() {
  const user = await requireUser();
  const links = getLinks(user.id);
  const socials = getSocials(user.id);
  const collections = getCollections(user.id);

  return <LinkEditor user={user} links={links} socials={socials} collections={collections} />;
}
