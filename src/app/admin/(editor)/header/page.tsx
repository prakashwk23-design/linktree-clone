export const instant = false;

import { requireUser } from "@/lib/auth";
import { getCollections, getLinks, getSocials } from "@/lib/data";
import { HeaderEditor } from "@/components/admin/HeaderEditor";

export const metadata = { title: "Header" };

export default async function HeaderPage() {
  const user = await requireUser();
  const links = getLinks(user.id, true);
  const socials = getSocials(user.id);
  const collections = getCollections(user.id);

  return <HeaderEditor user={user} links={links} socials={socials} collections={collections} />;
}
