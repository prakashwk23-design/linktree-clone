export const instant = false;

import { Download, Nfc, QrCode, Sparkles, Truck } from "lucide-react";
import { MockButton } from "@/components/admin/MockButton";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Logo, StarMark } from "@/components/ui/Logo";
import { PlatformBadge } from "@/components/ui/PlatformIcon";
import { requireUser } from "@/lib/auth";
import { getSocials } from "@/lib/data";

export const metadata = { title: "Business cards" };

export default async function BusinessCardsPage() {
  const user = await requireUser();
  const socials = getSocials(user.id);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-shade/60">Tools</p>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-[-0.03em] text-shade sm:text-[32px]">
            Business cards
          </h1>
          <p className="mt-1 text-[12.5px] text-shade/60">
            A tap-to-share card with your Linktree and QR code built in.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/qr?username=${encodeURIComponent(user.username)}`}
            download={`${user.username}-qr.png`}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-shade/15 bg-white px-4 text-[12px] font-semibold text-shade/70 transition hover:border-shade/30 hover:text-shade"
          >
            <Download className="h-3.5 w-3.5" /> Download QR
          </a>
          <MockButton
            title="Order a physical card"
            message="Card ordering and NFC fulfillment are mocked in this clone. A production build would send your design to a print partner and ship a metal or recycled-PVC card."
            variant="primary"
          >
            <Truck className="h-3.5 w-3.5" /> Order card
          </MockButton>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-shade/10 bg-white p-5 sm:p-7">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-shade/55">Your card</p>

          <div className="mt-4 flex justify-center">
            <div className="relative aspect-[1.62/1] w-full max-w-[500px] overflow-hidden rounded-[22px] bg-shade p-6 text-white shadow-xl">
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-chartreuse/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-grape/40 blur-2xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} src={user.avatar || undefined} size={40} ring="rgba(255,255,255,0.2)" />
                    <div>
                      <p className="font-display text-[15px] font-bold leading-tight">{user.name}</p>
                      <p className="text-[10.5px] text-white/50">@{user.username}</p>
                    </div>
                  </div>
                  <Logo className="text-white" svgClassName="h-[16px] w-auto opacity-70" />
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-chartreuse">
                      One link. Everything.
                    </p>
                    <p className="mt-1 text-[13px] text-white/70">linktr.ee/{user.username}</p>
                    <div className="mt-3 flex gap-1.5">
                      {socials.slice(0, 5).map((social) => (
                        <PlatformBadge key={social.id} platform={social.platform} size={22} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/qr?username=${encodeURIComponent(user.username)}`}
                      alt="QR code"
                      width={72}
                      height={72}
                      className="h-[72px] w-[72px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {[
              { icon: Nfc, label: "Tap to share", note: "NFC chip" },
              { icon: QrCode, label: "Scan to open", note: "Dynamic QR" },
              { icon: Sparkles, label: "Always current", note: "No reprints" },
            ].map(({ icon: Icon, label, note }) => (
              <div key={label} className="rounded-xl bg-chalk/70 px-3 py-3 text-center">
                <Icon className="mx-auto h-4 w-4 text-grape" />
                <p className="mt-1.5 text-[11.5px] font-semibold text-shade">{label}</p>
                <p className="text-[10px] text-shade/60">{note}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-3xl bg-grape p-5 text-white">
            <StarMark className="h-6 w-6 text-chartreuse" />
            <h2 className="mt-3 font-display text-[22px] font-bold leading-tight">Make a first impression that taps.</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-white/60">
              One card, every link. Update your Linktree and the QR code stays the same — no reprints, ever.
            </p>
            <ButtonLink href={`/${user.username}`} external variant="chartreuse" size="sm" className="mt-4">
              Preview my card
            </ButtonLink>
          </section>

          <section className="rounded-3xl border border-shade/10 bg-white p-5">
            <h2 className="text-[13px] font-bold text-shade">Card details</h2>
            <dl className="mt-3 space-y-2.5 text-[11.5px]">
              {[
                ["Name", user.name],
                ["Handle", `@${user.username}`],
                ["Link", `linktr.ee/${user.username}`],
                ["Finish", "Recycled PVC · matte"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 border-b border-shade/10 pb-2 last:border-0 last:pb-0">
                  <dt className="text-shade/60">{label}</dt>
                  <dd className="truncate font-semibold text-shade">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-3xl border border-dashed border-shade/15 bg-chartreuse/20 p-4 text-[11px] leading-relaxed text-shade/55">
            Your design updates automatically when you change your header. The QR code always points to your live page.
          </section>
        </div>
      </div>
    </div>
  );
}
