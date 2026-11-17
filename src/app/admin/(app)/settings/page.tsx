export const instant = false;

import { redirect } from "next/navigation";

export default function SettingsPage() {
  redirect("/admin/account");
}
