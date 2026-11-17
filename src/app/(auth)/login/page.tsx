import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Linktree to manage your links, design and analytics.",
};

export default function LoginPage() {
  return <LoginForm />;
}
