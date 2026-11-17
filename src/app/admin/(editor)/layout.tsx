export const instant = false;

import { requireUser } from "@/lib/auth";
import { EditorShell } from "@/components/admin/EditorShell";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <EditorShell user={{ name: user.name, username: user.username, avatar: user.avatar }}>{children}</EditorShell>
  );
}
