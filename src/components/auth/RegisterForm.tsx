"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { registerAction } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";

function cleanUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 30);
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, {});
  const [username, setUsername] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div>
      <h1 className="font-display text-[34px] font-extrabold tracking-[-0.035em] text-shade">Claim your Linktree</h1>
      <p className="mt-2 text-[14px] text-shade/55">One link for everything you are. Free forever.</p>

      <form action={action} className="mt-8 space-y-4">
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" autoComplete="name" placeholder="Your name" />
        </Field>

        <Field
          label="Your linktr.ee username"
          htmlFor="username"
          hint={
            <span>
              Your profile will be at{" "}
              <span className="font-semibold text-shade/70">linktr.ee/{username || "yourname"}</span>
            </span>
          }
        >
          <div className="flex items-center overflow-hidden rounded-xl border border-shade/15 bg-white transition focus-within:border-shade/40 focus-within:ring-4 focus-within:ring-shade/[0.06]">
            <span className="pl-3.5 text-[14px] text-shade/60">linktr.ee/</span>
            <input
              id="username"
              name="username"
              autoComplete="username"
              placeholder="yourname"
              value={username}
              onChange={(event) => setUsername(cleanUsername(event.target.value))}
              className="h-11 w-full bg-transparent px-1.5 pr-3.5 text-[15px] text-shade outline-none placeholder:text-shade/50"
              required
              minLength={3}
              maxLength={30}
            />
          </div>
        </Field>

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </Field>

        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              className="pr-10"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-shade/60 transition hover:text-shade"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-shade/55">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-0.5 h-4 w-4 flex-none rounded border-shade/25 accent-grape"
          />
          <span>
            I agree to the{" "}
            <Link href="/" className="font-semibold text-shade underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/" className="font-semibold text-shade underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {state.error ? (
          <p role="alert" className="rounded-xl bg-[#c43333]/[0.08] px-3.5 py-2.5 text-[12.5px] font-medium text-[#a52727]">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating your Linktree…
            </>
          ) : (
            "Sign up free"
          )}
        </Button>
      </form>

      <p className="mt-3 text-center text-[11.5px] text-shade/55">No credit card required. Cancel anytime.</p>

      <p className="mt-7 text-center text-[13px] text-shade/55">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-grape hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
