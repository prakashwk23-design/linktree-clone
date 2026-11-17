"use client";

import { Banknote, Check, Package, Plus, ShoppingBag, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { addProductAction } from "@/app/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import type { ActionState, Product } from "@/lib/types";

const EMOJIS = ["🛍️", "🎨", "📕", "🎧", "📸", "💻", "🎟️", "✨"];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export function EarnManager({ products, currency }: { products: Product[]; currency: string }) {
  const [productOpen, setProductOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [emoji, setEmoji] = useState("🛍️");
  const [state, setState] = useState<ActionState>({});
  const [pending, startTransition] = useTransition();

  function openProduct() {
    setState({});
    setProductOpen(true);
  }

  function submitProduct(formData: FormData) {
    setState({});
    startTransition(async () => {
      const result = await addProductAction(formData);
      if (result.ok) {
        setProductOpen(false);
        setEmoji("🛍️");
      } else {
        setState(result);
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setPayoutOpen(true)}>
          <Banknote className="h-3.5 w-3.5" /> Set up payouts
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={openProduct}>
          <Plus className="h-3.5 w-3.5" /> Add product
        </Button>
      </div>

      <section className="mt-5">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-shade/20 bg-white px-6 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-chartreuse/40 text-forest">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-[18px] font-bold text-shade">Start selling in minutes</h2>
            <p className="mx-auto mt-1 max-w-[380px] text-[12.5px] leading-relaxed text-shade/60">
              Add a digital download, service or physical product. Buyers check out right from your Linktree.
            </p>
            <Button type="button" variant="primary" size="md" className="mt-4" onClick={openProduct}>
              <Plus className="h-4 w-4" /> Add your first product
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-2xl border border-shade/10 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-chartreuse/35 text-xl">
                    {product.cover ? product.cover : <Package className="h-5 w-5 text-forest" />}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-forest">
                    <Check className="h-2.5 w-2.5" /> Live
                  </span>
                </div>
                <h2 className="mt-3 text-[13.5px] font-bold text-shade">{product.name}</h2>
                <p className="mt-1 line-clamp-2 min-h-[32px] text-[11.5px] leading-relaxed text-shade/60">
                  {product.description || "No description yet."}
                </p>
                <div className="mt-3 flex items-end justify-between border-t border-shade/10 pt-3">
                  <div>
                    <p className="font-display text-[19px] font-extrabold leading-none text-shade">
                      {currency}
                      {money(product.price_cents / 100)}
                    </p>
                    <p className="mt-1 text-[10px] text-shade/55">{product.sales} sold</p>
                  </div>
                  <p className="text-[11.5px] font-bold text-forest">
                    {currency}
                    {money((product.price_cents * product.sales) / 100)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={productOpen}
        onClose={() => setProductOpen(false)}
        title="Add a product"
        description="Sell a download, service or physical item from your page."
        size="md"
      >
        <form
          onSubmit={(event) => {
            // Own the submit so a validation error keeps what the user typed.
            event.preventDefault();
            submitProduct(new FormData(event.currentTarget));
          }}
          className="space-y-4"
        >
          <Field label="Product name" htmlFor="product-name">
            <Input id="product-name" name="name" placeholder="Creator preset pack" required />
          </Field>
          <Field label="Description" htmlFor="product-description">
            <Textarea id="product-description" name="description" rows={3} placeholder="What's included?" />
          </Field>
          <Field label="Price" htmlFor="product-price" hint="Use 0 for a free download.">
            <div className="flex items-center overflow-hidden rounded-xl border border-shade/15 bg-white focus-within:border-shade/40">
              <span className="border-r border-shade/10 px-3.5 text-[13px] font-semibold text-shade/60">{currency}</span>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue="199.00"
                className="h-11 w-full bg-transparent px-3.5 text-[14px] text-shade outline-none"
                required
              />
            </div>
          </Field>
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-shade">Cover</p>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEmoji(option)}
                  className={`grid h-9 w-9 place-items-center rounded-lg border text-base transition ${
                    emoji === option ? "border-grape bg-grape/10" : "border-shade/10 hover:border-shade/25"
                  }`}
                  aria-pressed={emoji === option}
                >
                  {option}
                </button>
              ))}
            </div>
            <input type="hidden" name="cover" value={emoji} />
          </div>
          {state.error ? (
            <p role="alert" className="rounded-xl bg-[#c43333]/[0.08] px-3.5 py-2.5 text-[12px] font-medium text-[#a52727]">
              {state.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setProductOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Publishing…" : "Publish product"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        title="Set up payouts"
        description="Connect an account to receive money from sales."
        size="sm"
      >
        <div className="rounded-2xl bg-chartreuse/30 p-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-forest">
            <Sparkles className="h-3 w-3" /> Demo mode
          </span>
          <p className="mt-2 text-[12.5px] leading-relaxed text-shade/65">
            Payouts are mocked in this clone. In a production build this would open Cashfree payouts onboarding, verify
            your identity and deposit earnings to your bank account.
          </p>
        </div>
        <div className="mt-4 space-y-2 text-[12px] text-shade/55">
          <p className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-forest" /> 0% selling fees on Pro
          </p>
          <p className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-forest" /> Weekly payouts
          </p>
          <p className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-forest" /> Support for 135+ currencies
          </p>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="button" variant="primary" onClick={() => setPayoutOpen(false)}>
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  );
}
