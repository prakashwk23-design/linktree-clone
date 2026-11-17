"use client";

import Link from "next/link";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAction } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div>
      <h1 className="font-display text-[34px] font-extrabold tracking-[-0.035em] text-shade">Welcome back</h1>
      <p className="mt-2 text-[14px] text-shade/55">Log in to manage your Linktree.</p>

      <form action={action} className="mt-8 space-y-4">
        <Field label="Email or username" htmlFor="identifier">
          <Input
            id="identifier"
            name="identifier"
            autoComplete="username"
            placeholder="you@example.com"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-10"
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

        {state.error ? (
          <p role="alert" className="rounded-xl bg-[#c43333]/[0.08] px-3.5 py-2.5 text-[12.5px] font-medium text-[#a52727]">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Logging in…
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setIdentifier("demo@linktr.ee");
          setPassword("demo1234");
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-grape/30 bg-grape/[0.04] px-4 py-3 text-[12.5px] font-semibold text-grape transition hover:bg-grape/[0.08]"
      >
        <Sparkles className="h-4 w-4" /> Use demo account (demo@linktr.ee / demo1234)
      </button>

      <p className="mt-8 text-center text-[13px] text-shade/55">
        New to Linktree?{" "}
        <Link href="/register" className="font-semibold text-grape hover:underline">
          Sign up free
        </Link>
      </p>

      <p className="mt-3 text-center text-[11.5px] text-shade/55">
        By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}
