export const instant = false;

import { Suspense } from "react";
import { requireUser } from "@/lib/auth";

async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <>{children}</>;
}

function AdminLoading() {
  return (
    <div className="min-h-screen bg-chalk" aria-busy="true">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-[248px] lg:border-r lg:border-shade/10 lg:bg-white">
        <div className="space-y-3 p-5">
          <div className="h-5 w-24 animate-pulse rounded bg-shade/10" />
          <div className="h-14 animate-pulse rounded-2xl bg-shade/5" />
          <div className="space-y-2 pt-4">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-8 animate-pulse rounded-xl bg-shade/5" />
            ))}
          </div>
        </div>
      </div>
      <div className="lg:pl-[248px]">
        <div className="mx-auto w-full max-w-[1120px] space-y-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-8 w-52 animate-pulse rounded bg-shade/10" />
          <div className="h-4 w-72 animate-pulse rounded bg-shade/5" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-3xl bg-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
