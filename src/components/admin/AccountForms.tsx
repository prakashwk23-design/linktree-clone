"use client";

import { AlertTriangle, Check, Loader2, Lock } from "lucide-react";
import { useActionState, useState } from "react";
import { changePasswordAction, deleteAccountAction, updateAccountAction } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";

export function PersonalForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateAccountAction, {});

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="account-name">
          <Input id="account-name" name="name" defaultValue={name} required />
        </Field>
        <Field label="Email" htmlFor="account-email">
          <Input id="account-email" name="email" type="email" defaultValue={email} required />
        </Field>
      </div>
      {state.error ? (
        <p role="alert" className="text-[12px] font-medium text-[#a52727]">
          {state.error}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <Button type="submit" variant="dark" size="sm" disabled={pending}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {pending ? "Saving…" : "Save details"}
        </Button>
        {state.ok ? (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-forest">
            <Check className="h-3.5 w-3.5" /> {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, {});
  const [localError, setLocalError] = useState("");

  return (
    <form
      action={action}
      className="space-y-4"
      onSubmit={(event) => {
        const form = event.currentTarget;
        const next = (form.elements.namedItem("next") as HTMLInputElement | null)?.value ?? "";
        const confirm = (form.elements.namedItem("confirm") as HTMLInputElement | null)?.value ?? "";
        if (next !== confirm) {
          event.preventDefault();
          setLocalError("Your new passwords don't match.");
        } else {
          setLocalError("");
        }
      }}
    >
      <Field label="Current password" htmlFor="password-current">
        <Input id="password-current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor="password-next" hint="At least 8 characters.">
          <Input id="password-next" name="next" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirm new password" htmlFor="password-confirm">
          <Input id="password-confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
      </div>
      {(state.error || localError) ? (
        <p role="alert" className="text-[12px] font-medium text-[#a52727]">
          {localError || state.error}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <Button type="submit" variant="dark" size="sm" disabled={pending}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
          {pending ? "Updating…" : "Update password"}
        </Button>
        {state.ok ? (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-forest">
            <Check className="h-3.5 w-3.5" /> {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccountAction, {});
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" className="border-[#c43333]/30 text-[#c43333] hover:bg-[#c43333]/5" onClick={() => setOpen(true)}>
        Delete account
      </Button>
    );
  }

  return (
    <form action={action} className="rounded-xl border border-[#c43333]/25 bg-[#c43333]/[0.04] p-4">
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#a52727]">
        <AlertTriangle className="h-4 w-4" /> This permanently deletes your page, links and analytics.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <Field label='Type "DELETE" to confirm' htmlFor="confirm-delete" className="flex-1">
          <Input id="confirm-delete" name="confirm" placeholder="DELETE" autoComplete="off" required />
        </Field>
        <Button type="submit" variant="dark" size="md" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Delete forever
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {state.error ? <p className="mt-2 text-[11.5px] font-medium text-[#a52727]">{state.error}</p> : null}
    </form>
  );
}
