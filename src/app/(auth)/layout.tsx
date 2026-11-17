import Link from "next/link";
import { Logo, StarMark } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1fr_0.92fr]">
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <Logo className="text-shade" />
          <Link href="/" className="text-[12.5px] font-semibold text-shade/50 transition hover:text-shade">
            ← Back to linktr.ee
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-shade/55">
          <span>© 2026 Linktree</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-shade">
              Privacy
            </Link>
            <Link href="/" className="hover:text-shade">
              Terms
            </Link>
            <Link href="/pricing" className="hover:text-shade">
              Pricing
            </Link>
          </div>
        </footer>
      </div>

      <aside className="relative hidden overflow-hidden bg-chartreuse p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-56 w-56 rounded-full bg-forest/20 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <span className="rounded-full border border-shade/20 bg-white/40 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-shade/70">
            Link in bio
          </span>
          <StarMark className="h-7 w-7 text-shade" />
        </div>

        <div className="relative mx-auto w-full max-w-[360px]">
          <div className="rotate-[-2deg] rounded-[30px] border border-shade/10 bg-white/85 p-5 shadow-[0_30px_80px_-30px_rgba(30,35,48,0.35)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Avatar name="Maya Chen" size={46} />
              <div>
                <p className="font-display text-[15px] font-bold text-shade">Maya Chen</p>
                <p className="text-[11.5px] text-shade/60">@mayachen</p>
              </div>
              <span className="ml-auto rounded-full bg-chartreuse px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-shade">
                Pro
              </span>
            </div>
            <div className="mt-5 space-y-2">
              {["My portfolio", "New icon set — 40% off", "Design notes newsletter"].map((label, index) => (
                <div
                  key={label}
                  className={`flex items-center justify-between rounded-full px-4 py-3 text-[12.5px] font-semibold ${
                    index === 1 ? "bg-shade text-white" : "bg-chalk text-shade"
                  }`}
                >
                  {label}
                  <span className={index === 1 ? "text-chartreuse" : "text-shade/50"}>↗</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-shade/10 pt-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-shade/55">12.4k clicks</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-shade/55">Since Tuesday</span>
            </div>
          </div>

          <div className="absolute -left-10 top-1/2 rounded-2xl bg-shade px-4 py-3 text-white shadow-xl">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/65">Views</p>
            <p className="font-display text-[22px] font-extrabold leading-none">+128%</p>
          </div>
          <div className="absolute -right-6 bottom-8 rounded-2xl bg-white px-4 py-3 shadow-xl">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-shade/60">New subscribers</p>
            <p className="font-display text-[22px] font-extrabold leading-none text-forest">1,204</p>
          </div>
        </div>

        <blockquote className="relative max-w-[400px]">
          <p className="font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.03em] text-shade">
            “Everything I make, sell and share — behind one link.”
          </p>
          <footer className="mt-4 text-[12px] font-semibold text-shade/50">Maya Chen · Designer & creator</footer>
        </blockquote>
      </aside>
    </div>
  );
}
