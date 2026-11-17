export const instant = false;

import { Banknote, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { EarnManager } from "@/components/admin/EarnManager";
import { requireUser } from "@/lib/auth";
import { getProducts } from "@/lib/data";

export const metadata = { title: "Earn" };

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default async function EarnPage() {
  const user = await requireUser();
  const products = getProducts(user.id);
  const revenue = products.reduce((sum, product) => sum + (product.price_cents * product.sales) / 100, 0);
  const sales = products.reduce((sum, product) => sum + product.sales, 0);
  const avg = sales > 0 ? revenue / sales : 0;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">Earn</p>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            Turn your link into income
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/60">
            Sell products, downloads and services without leaving your page.
          </p>
        </div>
        <EarnManager products={products} currency="₹" />
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total revenue", value: money(revenue), icon: Wallet, tone: "text-forest" },
          { label: "Products sold", value: sales.toLocaleString(), icon: ShoppingBag, tone: "text-grape" },
          { label: "Average order", value: money(avg), icon: TrendingUp, tone: "text-cobalt" },
          { label: "Available to pay out", value: money(revenue * 0.82), icon: Banknote, tone: "text-[#780016]" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-shade/10 bg-white p-4">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-shade/60">
              <Icon className={`h-3.5 w-3.5 ${tone}`} /> {label}
            </span>
            <p className="tabular mt-2 font-display text-[26px] font-extrabold leading-none tracking-tight text-shade">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl bg-grape p-5 text-white sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-chartreuse">Pro perk</p>
            <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight">Keep 100% of what you sell.</h2>
            <p className="mt-1 max-w-[480px] text-[12.5px] leading-relaxed text-white/60">
              You&apos;re on the {user.plan === "free" ? "Free" : "Pro"} plan. Pro and Premium sellers pay 0% platform
              fees on products. Payouts are mocked in this demo.
            </p>
          </div>
          <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-[11.5px] font-semibold">
            <Banknote className="h-4 w-4 text-chartreuse" /> INR
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-shade">Recent sales</h2>
            <p className="text-[11.5px] text-shade/60">A simple view of your latest orders</p>
          </div>
        </div>
        {products.length === 0 ? (
          <p className="mt-6 text-center text-[12px] text-shade/60">No sales yet. Add a product to get started.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-shade/10">
                  <th className="pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-shade/55">Product</th>
                  <th className="pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-shade/55">Buyer</th>
                  <th className="pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-shade/55">Status</th>
                  <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-shade/55">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-shade/10">
                {products.flatMap((product) =>
                  Array.from({ length: Math.min(product.sales, 2) }).map((_, index) => (
                    <tr key={`${product.id}-${index}`} className="text-[12px]">
                      <td className="py-3 font-semibold text-shade">{product.name}</td>
                      <td className="py-3 text-shade/55">{["Aisha P.", "Marcus B."][index % 2]}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-semibold text-forest">
                          Paid
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-shade">
                        {money(product.price_cents / 100)}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
