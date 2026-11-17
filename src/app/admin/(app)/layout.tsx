export const instant = false;

import { requireUser } from "@/lib/auth";
import { getSetupProgress } from "@/lib/data";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const progress = getSetupProgress(user);

  return (
    <AdminShell
      user={{ name: user.name, username: user.username, avatar: user.avatar, plan: user.plan }}
      progress={{ done: progress.done, total: progress.total }}
    >
      {children}
    </AdminShell>
  );
}
