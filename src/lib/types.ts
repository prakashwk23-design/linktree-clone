export type Plan = "free" | "starter" | "pro" | "premium";

export type BillingPeriod = "monthly" | "annual";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "demo";

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  plan: Plan;
  theme: string;
  button_style: string;
  corner_style: string;
  font: string;
  layout: string;
  title_style: string;
  wallpaper: string;
  show_footer: number;
  created_at: string;
};

export type Link = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  type: string;
  position: number;
  visible: number;
  thumbnail: string;
  collection_id: string | null;
  created_at: string;
};

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  position: number;
  created_at: string;
};

/** A collection with its public slug and visible links, ready for the profile renderer. */
export type CollectionGroup = Collection & {
  slug: string;
  links: Link[];
};

export type Social = {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  position: number;
};

export type SessionRow = {
  token: string;
  user_id: string;
  expires_at: string;
};

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  source: string;
  created_at: string;
};

export type Product = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover: string;
  price_cents: number;
  sales: number;
  created_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  plan: Plan;
  billing: BillingPeriod;
  /** Amount charged, in the smallest currency unit (paise). */
  amount: number;
  currency: string;
  status: PaymentStatus;
  cf_order_id: string;
  payment_session_id: string;
  cf_payment_id: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

export type ShortLink = {
  id: string;
  user_id: string;
  code: string;
  target: string;
  clicks: number;
  created_at: string;
};

export type SocialConnection = {
  id: string;
  user_id: string;
  provider: string;
  account_name: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
};

export type ActionState = {
  error?: string;
  ok?: boolean;
  message?: string;
};

export type AnalyticsPoint = {
  date: string;
  label: string;
  views: number;
  clicks: number;
};

export type TopLink = {
  id: string;
  title: string;
  clicks: number;
};

export type CollectionStat = {
  id: string;
  name: string;
  /** Taps on this collection's links within the range. */
  clicks: number;
  /** Links currently grouped in this collection. */
  links: number;
};
