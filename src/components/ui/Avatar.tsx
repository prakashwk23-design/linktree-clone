/* eslint-disable @next/next/no-img-element */
const GRADIENTS: [string, string][] = [
  ["#ff9a5a", "#f25278"],
  ["#7b2cbf", "#2665d6"],
  ["#d2e823", "#4a8f29"],
  ["#e9c0e9", "#8b3dff"],
  ["#ffd166", "#ff7a59"],
  ["#5ce1e6", "#2665d6"],
  ["#394154", "#1e2330"],
  ["#f7b2d9", "#ff7a59"],
];

function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  return hash;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "L";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = 96,
  className = "",
  ring,
  shape = "full",
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  ring?: string;
  shape?: "full" | "rounded";
}) {
  const [a, b] = GRADIENTS[hashCode(name || "Linktree") % GRADIENTS.length];
  const style = {
    width: size,
    height: size,
    background: src ? undefined : `linear-gradient(145deg, ${a}, ${b})`,
    boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
  };
  return (
    <span
      className={`relative inline-flex flex-none items-center justify-center overflow-hidden ${shape === "rounded" ? "rounded-2xl" : "rounded-full"} ${className}`}
      style={style}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span
          className="font-display font-semibold tracking-tight text-white"
          style={{ fontSize: Math.max(12, Math.round(size * 0.34)) }}
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}

export function AvatarGradient({ name }: { name: string }) {
  const [a, b] = GRADIENTS[hashCode(name || "Linktree") % GRADIENTS.length];
  return <span className="block h-full w-full" style={{ background: `linear-gradient(145deg, ${a}, ${b})` }} />;
}
