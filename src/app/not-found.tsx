import Link from "next/link";
import { MarketingFooter } from "@/components/site/MarketingFooter";
import { MarketingHeader } from "@/components/site/MarketingHeader";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="bg-chalk">
      <MarketingHeader />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[720px] flex-col items-center justify-center px-5 py-20 text-center">
        <p className="font-display text-[92px] font-extrabold leading-none tracking-[-0.05em] text-shade/15">404</p>
        <h1 className="mt-2 font-display text-[34px] font-extrabold tracking-[-0.03em] text-shade sm:text-[44px]">
          This link doesn&apos;t exist.
        </h1>
        <p className="mt-3 max-w-[420px] text-[14px] leading-relaxed text-shade/55">
          The page you&apos;re looking for may have moved, or the username is still available. Want to claim it?
        </p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/register" variant="primary" size="lg">
            Claim your Linktree
          </ButtonLink>
          <ButtonLink href="/discover" variant="outline" size="lg">
            Explore profiles
          </ButtonLink>
        </div>
        <p className="mt-6 text-[12px] text-shade/55">
          If you own this link,{" "}
          <Link href="/login" className="font-semibold text-grape hover:underline">
            log in
          </Link>{" "}
          to manage it.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
