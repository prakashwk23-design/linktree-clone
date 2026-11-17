export const instant = false;

import { requireUser } from "@/lib/auth";
import { getCollections, getLinks, getSocials } from "@/lib/data";
import { DesignEditor } from "@/components/admin/DesignEditor";

export const metadata = { title: "Design" };

export default async function DesignPage() {
  const user = await requireUser();
  const links = getLinks(user.id, true);
  const socials = getSocials(user.id);
  const collections = getCollections(user.id);

  return <DesignEditor user={user} links={links} socials={socials} collections={collections} />;
}
