import type { ReactNode } from "react";

export function Phone({
  children,
  className = "",
  size = "md",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "sm"
      ? { outer: "w-[236px] rounded-[38px] border-[8px]", screen: "h-[460px] rounded-[30px]" }
      : size === "lg"
        ? { outer: "w-[330px] rounded-[52px] border-[10px]", screen: "h-[680px] rounded-[42px]" }
        : { outer: "w-[292px] rounded-[46px] border-[9px]", screen: "h-[600px] rounded-[37px]" };

  return (
    <div className={`relative ${dims.outer} border-shade bg-shade p-[2px] phone-shadow ${className}`}>
      <div className={`relative overflow-hidden bg-white ${dims.screen}`}>
        <div aria-hidden="true" className="absolute left-1/2 top-2 z-20 h-[18px] w-[86px] -translate-x-1/2 rounded-full bg-shade" />
        <div className="hide-scrollbar h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function PhoneGlow({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />;
}
