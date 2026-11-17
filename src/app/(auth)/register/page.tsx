import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Claim your free Linktree and put everything you are behind one simple link.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
