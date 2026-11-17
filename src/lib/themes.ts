export type Theme = {
  id: string;
  name: string;
  /** CSS background for the public profile page */
  background: string;
  text: string;
  muted: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  accent: string;
  swatches: [string, string, string];
  dark: boolean;
};

export const THEMES: Theme[] = [
  {
    id: "chartreuse",
    name: "Chartreuse",
    background: "#d2e823",
    text: "#1e2330",
    muted: "rgba(30,35,48,0.66)",
    buttonBg: "#ffffff",
    buttonText: "#1e2330",
    buttonBorder: "rgba(30,35,48,0.10)",
    accent: "#254f1a",
    swatches: ["#d2e823", "#ffffff", "#254f1a"],
    dark: false,
  },
  {
    id: "midnight",
    name: "Midnight",
    background: "#1e2330",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.66)",
    buttonBg: "rgba(255,255,255,0.10)",
    buttonText: "#ffffff",
    buttonBorder: "rgba(255,255,255,0.16)",
    accent: "#d2e823",
    swatches: ["#1e2330", "#394154", "#d2e823"],
    dark: true,
  },
  {
    id: "ocean",
    name: "Ocean",
    background: "linear-gradient(160deg,#2665d6 0%,#173f96 100%)",
    text: "#f6f7f2",
    muted: "rgba(246,247,242,0.70)",
    buttonBg: "rgba(255,255,255,0.12)",
    buttonText: "#ffffff",
    buttonBorder: "rgba(255,255,255,0.20)",
    accent: "#d2e823",
    swatches: ["#2665d6", "#173f96", "#d2e823"],
    dark: true,
  },
  {
    id: "sunset",
    name: "Sunset",
    background: "linear-gradient(155deg,#ffb86b 0%,#ff7a59 55%,#f25278 100%)",
    text: "#2a1220",
    muted: "rgba(42,18,32,0.66)",
    buttonBg: "rgba(255,255,255,0.88)",
    buttonText: "#2a1220",
    buttonBorder: "rgba(42,18,32,0.08)",
    accent: "#780016",
    swatches: ["#ffb86b", "#ff7a59", "#f25278"],
    dark: false,
  },
  {
    id: "bubblegum",
    name: "Bubblegum",
    background: "#e9c0e9",
    text: "#1e2330",
    muted: "rgba(30,35,48,0.62)",
    buttonBg: "#ffffff",
    buttonText: "#1e2330",
    buttonBorder: "rgba(30,35,48,0.08)",
    accent: "#502274",
    swatches: ["#e9c0e9", "#ffffff", "#502274"],
    dark: false,
  },
  {
    id: "forest",
    name: "Forest",
    background: "linear-gradient(165deg,#254f1a 0%,#16330f 100%)",
    text: "#e8efd6",
    muted: "rgba(232,239,214,0.68)",
    buttonBg: "#d2e823",
    buttonText: "#254f1a",
    buttonBorder: "rgba(255,255,255,0.00)",
    accent: "#d2e823",
    swatches: ["#254f1a", "#16330f", "#d2e823"],
    dark: true,
  },
  {
    id: "lavender",
    name: "Lavender",
    background: "linear-gradient(170deg,#e4d8ff 0%,#c9b4ff 100%)",
    text: "#2b1a4a",
    muted: "rgba(43,26,74,0.64)",
    buttonBg: "#2b1a4a",
    buttonText: "#f6f1ff",
    buttonBorder: "rgba(43,26,74,0.08)",
    accent: "#7b2cbf",
    swatches: ["#e4d8ff", "#c9b4ff", "#2b1a4a"],
    dark: false,
  },
  {
    id: "chalk",
    name: "Chalk",
    background: "#f3f3f1",
    text: "#1e2330",
    muted: "rgba(30,35,48,0.60)",
    buttonBg: "#ffffff",
    buttonText: "#1e2330",
    buttonBorder: "rgba(30,35,48,0.10)",
    accent: "#780016",
    swatches: ["#f3f3f1", "#ffffff", "#780016"],
    dark: false,
  },
  {
    id: "cherry",
    name: "Cherry",
    background: "linear-gradient(165deg,#8f0022 0%,#5c0016 100%)",
    text: "#ffd9e4",
    muted: "rgba(255,217,228,0.70)",
    buttonBg: "#ffd9e4",
    buttonText: "#5c0016",
    buttonBorder: "rgba(255,255,255,0.00)",
    accent: "#d2e823",
    swatches: ["#8f0022", "#5c0016", "#ffd9e4"],
    dark: true,
  },
  {
    id: "paper",
    name: "Paper",
    background: "#fbf8f1",
    text: "#23201a",
    muted: "rgba(35,32,26,0.62)",
    buttonBg: "#23201a",
    buttonText: "#fbf8f1",
    buttonBorder: "rgba(35,32,26,0.06)",
    accent: "#b4462f",
    swatches: ["#fbf8f1", "#e8dfcc", "#b4462f"],
    dark: false,
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export const FONTS = [
  { id: "dm-sans", name: "DM Sans", family: "var(--font-dm-sans)", sample: "The quick brown fox" },
  { id: "space", name: "Space Grotesk", family: "var(--font-space)", sample: "The quick brown fox" },
  { id: "fraunces", name: "Fraunces", family: "var(--font-fraunces)", sample: "The quick brown fox" },
] as const;

export function fontFamily(id: string): string {
  return FONTS.find((f) => f.id === id)?.family ?? FONTS[0].family;
}

export const BUTTON_STYLES = [
  { id: "solid", name: "Solid", description: "Bold and clean" },
  { id: "outline", name: "Outline", description: "Light and airy" },
  { id: "glass", name: "Glass", description: "Frosted finish" },
] as const;

export const CORNER_STYLES = [
  { id: "rounded", name: "Rounded", radius: "14px" },
  { id: "pill", name: "Pill", radius: "999px" },
  { id: "square", name: "Square", radius: "4px" },
] as const;

export function cornerRadius(id: string): string {
  return CORNER_STYLES.find((c) => c.id === id)?.radius ?? "14px";
}

export const WALLPAPERS = [
  { id: "fill", name: "Fill" },
  { id: "gradient", name: "Gradient" },
  { id: "dots", name: "Dots" },
] as const;

export const PLANS: {
  id: "free" | "starter" | "pro" | "premium";
  name: string;
  /** Display price per month when billed annually. */
  price: string;
  /** Display price per month when billed monthly. */
  monthly: string;
  /** Amount charged for a year, in paise. */
  amount: number;
  /** Amount charged for a month, in paise. */
  monthlyAmount: number;
  tagline: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    monthly: "₹0",
    amount: 0,
    monthlyAmount: 0,
    tagline: "Free with restrictions",
    features: ["Unlimited basic links", "Email and phone sign-ups", "Linktree branding"],
    cta: "Get started",
  },
  {
    id: "starter",
    name: "Starter",
    price: "₹199",
    monthly: "₹299",
    amount: 238800,
    monthlyAmount: 29900,
    tagline: "Billed annually",
    features: ["Everything in Free, plus", "Personalized Linktree", "Unlimited featured links", "Basic analytics"],
    cta: "Get started",
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    monthly: "₹749",
    amount: 598800,
    monthlyAmount: 74900,
    tagline: "Billed annually",
    features: [
      "Everything in Starter, plus",
      "Remove Linktree branding",
      "Custom designs",
      "Sell and earn with 0% fees",
      "Mailing list integrations",
    ],
    cta: "Try free for 7 days",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹1,199",
    monthly: "₹1,799",
    amount: 1438800,
    monthlyAmount: 179900,
    tagline: "Billed annually",
    features: [
      "Everything in Pro, plus",
      "Link rules and routing",
      "AI integrations",
      "All-time analytics",
      "Data export",
      "Social media scheduling",
    ],
    cta: "Try free for 7 days",
  },
];

export function planName(id: string): string {
  return PLANS.find((p) => p.id === id)?.name ?? "Free";
}

export function getPlan(id: string) {
  return PLANS.find((p) => p.id === id);
}

/** Format an amount in paise as Indian rupees, e.g. 238800 → "₹2,388". */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
