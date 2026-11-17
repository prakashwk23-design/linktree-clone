import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Globe2,
  Link2,
  Mail,
  MousePointerClick,
  Palette,
  Plus,
  QrCode,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { MarketingHeader } from "@/components/site/MarketingHeader";
import { MarketingFooter } from "@/components/site/MarketingFooter";
import { Phone, PhoneGlow } from "@/components/site/Phone";
import { ProfileBody, type ProfileUser } from "@/components/profile/ProfileBody";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { PlatformBadge } from "@/components/ui/PlatformIcon";
import { StarMark } from "@/components/ui/Logo";
import { PLANS } from "@/lib/themes";
import type { Link as LinkRow, Social } from "@/lib/types";

const heroUser: ProfileUser = {
  username: "mayachen",
  name: "Maya Chen",
  bio: "Product designer drawing interfaces and tiny worlds. ✨",
  avatar: "",
  theme: "bubblegum",
  button_style: "solid",
  corner_style: "pill",
  font: "space",
  wallpaper: "dots",
  show_footer: 1,
};

const heroLinks = [
  { id: "hero-1", title: "My portfolio", thumbnail: "🎨" },
  { id: "hero-2", title: "New icon set — 40% off", thumbnail: "✨" },
  { id: "hero-3", title: "Design notes newsletter", thumbnail: "💌" },
  { id: "hero-4", title: "Book a portfolio review", thumbnail: "📅" },
].map(
  (link, index): LinkRow => ({
    ...link,
    user_id: "hero",
    url: "#",
    type: "featured",
    position: index,
    visible: 1,
    collection_id: null,
    created_at: "",
  }),
);

const heroSocials: Social[] = ["instagram", "dribbble", "linkedin"].map((platform, index) => ({
  id: `hero-social-${index}`,
  user_id: "hero",
  platform,
  url: "#",
  position: index,
}));

const showcaseUser: ProfileUser = {
  username: "jordanbeats",
  name: "Jordan Lee",
  bio: "Producer / DJ. New pack every Friday. 🎛️",
  avatar: "",
  theme: "midnight",
  button_style: "glass",
  corner_style: "rounded",
  font: "space",
  wallpaper: "fill",
  show_footer: 0,
};

const showcaseLinks = [
  { id: "show-1", title: "Stream my new EP", thumbnail: "🔊" },
  { id: "show-2", title: "Download the free drum kit", thumbnail: "🥁" },
  { id: "show-3", title: "Book me for a show", thumbnail: "🎟️" },
  { id: "show-4", title: "Join the Discord", thumbnail: "💬" },
].map(
  (link, index): LinkRow => ({
    ...link,
    user_id: "showcase",
    url: "#",
    type: "featured",
    position: index,
    visible: 1,
    collection_id: null,
    created_at: "",
  }),
);

const showcaseSocials: Social[] = ["spotify", "instagram", "tiktok"].map((platform, index) => ({
  id: `show-social-${index}`,
  user_id: "showcase",
  platform,
  url: "#",
  position: index,
}));

const CREATORS = [
  { name: "Maya Chen", handle: "@mayachen", tag: "Design" },
  { name: "Jordan Lee", handle: "@jordanbeats", tag: "Music" },
  { name: "Nova Reyes", handle: "@nova", tag: "Illustration" },
  { name: "Sam Rivera", handle: "@eatwithsam", tag: "Food" },
  { name: "Studio Nine", handle: "@studionine", tag: "Studio" },
  { name: "The Film Club", handle: "@filmclub", tag: "Film" },
  { name: "Aisha Patel", handle: "@aishamakes", tag: "Craft" },
  { name: "Leo Martins", handle: "@leomartins", tag: "Fitness" },
];

const BENTO = [
  {
    icon: BarChart3,
    title: "Know what works",
    body: "See every click, visitor and referrer in one clean dashboard.",
    tone: "bg-white",
  },
  {
    icon: ShoppingBag,
    title: "Sell without a store",
    body: "Drop products, digital downloads and tips right into your link.",
    tone: "bg-chartreuse",
  },
  {
    icon: Mail,
    title: "Own your audience",
    body: "Collect emails and sync them to the tools you already use.",
    tone: "bg-white",
  },
  {
    icon: QrCode,
    title: "One scan away",
    body: "Generate a QR code for your profile, packaging or next event.",
    tone: "bg-blush",
  },
  {
    icon: CalendarDays,
    title: "Plan your content",
    body: "Schedule posts, save ideas and keep your calendar moving.",
    tone: "bg-white",
  },
  {
    icon: Link2,
    title: "Short links that track",
    body: "Turn long URLs into branded links with click analytics built in.",
    tone: "bg-sage",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Linktree is the one link I put everywhere. It finally feels like my whole creative life fits in one place.",
    name: "Maya Chen",
    role: "Product designer · 84k followers",
  },
  {
    quote:
      "I dropped a new sample pack on Friday and woke up to sales from a link in my bio. It just works.",
    name: "Jordan Lee",
    role: "Producer & DJ · 210k followers",
  },
  {
    quote:
      "The analytics changed how I plan content. I can see exactly which link my audience actually taps.",
    name: "Sam Rivera",
    role: "Food creator · 129k followers",
  },
];

const FAQS = [
  {
    q: "What is Linktree?",
    a: "Linktree is a link in bio tool that gives you one simple link to share everything you create, curate and sell. Add links to your latest video, shop, newsletter, playlist and social profiles, then put that one link in every bio.",
  },
  {
    q: "How do I create a Linktree?",
    a: "Sign up for free with your email, choose a username, and add your first links. Your profile is live instantly at linktr.ee/yourname. You can customize your design and add social icons in minutes.",
  },
  {
    q: "Is Linktree free?",
    a: "Yes. The Free plan includes unlimited basic links, email and phone sign-ups, and Linktree branding. Starter, Pro and Premium unlock customization, analytics, commerce and more.",
  },
  {
    q: "Can I customize my Linktree?",
    a: "Absolutely. Pick a theme, wallpaper, button style, corner shape and font. Pro and Premium plans unlock advanced customization, custom colors and branding removal.",
  },
  {
    q: "What can I use Linktree for?",
    a: "Creators use it to share content, sell products, collect emails, book clients, promote events and grow their audience. It works for individuals, businesses, restaurants, artists and teams.",
  },
  {
    q: "Does Linktree work with Instagram?",
    a: "Yes. Add your Linktree URL to your Instagram bio and every visitor gets one clean page with all your links, social icons and latest offers.",
  },
  {
    q: "Can I sell products on Linktree?",
    a: "Yes. Add products, digital downloads and services directly to your profile. Pro and Premium plans include 0% selling fees, and payouts are supported in supported regions.",
  },
  {
    q: "Can I see how many people click my links?",
    a: "Yes. Insights shows profile views, link clicks, click-through rate, top links and traffic sources. Pro and Premium unlock longer date ranges and deeper analytics.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-chalk">
      <MarketingHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-chartreuse">
          <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-forest/15 blur-3xl" />
          <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-shade/20 bg-white/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-shade/70">
                <Sparkles className="h-3.5 w-3.5" /> The original link in bio
              </span>
              <h1 className="mt-6 font-display text-[52px] font-extrabold leading-[0.92] tracking-[-0.045em] text-shade sm:text-[68px] lg:text-[84px]">
                A link in bio
                <br />
                built for you.
              </h1>
              <p className="mt-6 max-w-[500px] text-[17px] leading-relaxed text-shade/75">
                Join 70M+ people using Linktree for their link in bio. One link to help you share everything you
                create, curate and sell from your Instagram, TikTok, Twitter, YouTube and other social profiles.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/register" variant="dark" size="lg" className="group">
                  Get started for free
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </ButtonLink>
                <ButtonLink href="/pricing" variant="outline" size="lg" className="border-shade/30">
                  Find your plan
                </ButtonLink>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-medium text-shade/65">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Free forever
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> No credit card required
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Set up in minutes
                </span>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <PhoneGlow className="-left-6 top-6 h-44 w-44 bg-blush/70" />
              <PhoneGlow className="-right-4 bottom-8 h-52 w-52 bg-white/60" />

              <div className="relative rotate-[-3deg]">
                <Phone size="lg">
                  <ProfileBody
                    user={heroUser}
                    links={heroLinks}
                    socials={heroSocials}
                    preview
                    compact
                    footer={false}
                  />
                </Phone>
              </div>

              <div className="absolute -left-2 top-16 hidden animate-float sm:block" style={{ "--float-rotate": "-8deg" } as CSSProperties}>
                <PlatformBadge platform="instagram" size={48} className="shadow-xl" />
              </div>
              <div className="absolute -right-2 top-40 hidden animate-float-delayed sm:block" style={{ "--float-rotate": "7deg" } as CSSProperties}>
                <PlatformBadge platform="tiktok" size={44} className="shadow-xl" />
              </div>
              <div className="absolute -left-6 bottom-24 hidden animate-float-delayed sm:block">
                <div className="flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-3 shadow-xl">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-forest/10 text-forest">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-medium text-shade/50">Clicks this week</span>
                    <span className="block text-[15px] font-bold text-shade">12,408</span>
                  </span>
                </div>
              </div>
              <div className="absolute -right-4 bottom-16 hidden animate-float sm:block">
                <div className="flex items-center gap-2 rounded-full bg-grape px-4 py-2.5 text-[12px] font-semibold text-white shadow-xl">
                  <MousePointerClick className="h-4 w-4" /> +38% this month
                </div>
              </div>
              <StarMark className="absolute right-8 top-2 h-7 w-7 text-shade/80" />
              <StarMark className="absolute left-6 bottom-2 h-4 w-4 text-shade/60" />
            </div>
          </div>
        </section>

        {/* Logo cloud */}
        <section className="border-b border-shade/10 bg-white">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center gap-6 px-5 py-10 sm:px-8 lg:flex-row lg:justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-shade/60">
              Trusted by 70M+ creators & brands
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-shade/60">
              {["Instagram", "TikTok", "YouTube", "Spotify", "Shopify", "Substack"].map((name) => (
                <span key={name} className="font-display text-[15px] font-bold tracking-tight">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* One link */}
        <section className="bg-cobalt text-white">
          <div className="mx-auto grid w-full max-w-[1240px] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">One link. Everything.</p>
              <h2 className="mt-4 max-w-[520px] font-display text-[38px] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-[52px]">
                Everything you are. In one simple link.
              </h2>
              <p className="mt-5 max-w-[470px] text-[16px] leading-relaxed text-white/70">
                Your latest drop, your newsletter, your shop, your socials. Put it all behind one link you can share
                everywhere — and update in seconds.
              </p>
              <ul className="mt-8 space-y-3.5">
                {[
                  "Unlimited links and social icons",
                  "Music, video, forms and product embeds",
                  "Custom domains and branded short links",
                  "Works with Instagram, TikTok, YouTube and more",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-white/85">
                    <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-chartreuse text-shade">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/register" variant="chartreuse" size="lg" className="mt-9">
                Create your Linktree
              </ButtonLink>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute -left-6 top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="rotate-[2deg]">
                <Phone size="md">
                  <ProfileBody
                    user={showcaseUser}
                    links={showcaseLinks}
                    socials={showcaseSocials}
                    preview
                    compact
                    footer={false}
                  />
                </Phone>
              </div>
              <div className="absolute -right-2 bottom-12 hidden animate-float rounded-2xl bg-white p-3.5 text-shade shadow-xl sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-shade/60">Links</p>
                <p className="mt-1 flex items-baseline gap-1.5 font-display text-[26px] font-extrabold leading-none">
                  4 <span className="text-[11px] font-semibold text-forest">all live</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Monetize */}
        <section className="bg-oxblood text-[#ffe9ec]">
          <div className="mx-auto w-full max-w-[1240px] px-5 py-20 sm:px-8 lg:py-28">
            <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ffb3c0]/70">Grow & earn</p>
                <h2 className="mt-4 max-w-[460px] font-display text-[38px] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-[52px]">
                  Turn your followers into your people.
                </h2>
                <p className="mt-5 max-w-[440px] text-[16px] leading-relaxed text-[#ffe9ec]/65">
                  Collect emails, sell products, take bookings and get paid — without building a store or wiring up a
                  funnel.
                </p>
                <ButtonLink href="/pricing" variant="white" size="lg" className="mt-9">
                  Explore Pro
                </ButtonLink>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: ShoppingBag, title: "Sell anything", body: "Digital downloads, presets, tickets, services." },
                  { icon: Mail, title: "Collect emails", body: "Turn visitors into subscribers you can reach again." },
                  { icon: MousePointerClick, title: "Track every click", body: "Know which link earns its place in your bio." },
                  { icon: Users, title: "Build your audience", body: "Keep fans, customers and collaborators in one place." },
                ].map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition hover:bg-white/[0.09]"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ffb3c0]/15 text-[#ffb3c0]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 font-display text-[17px] font-bold">{title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#ffe9ec]/65">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-[#5f0011]/60 p-6 sm:grid-cols-3">
              {[
                { label: "Revenue this month", value: "$4,820", note: "+24% vs last month" },
                { label: "Products sold", value: "187", note: "0% platform fees" },
                { label: "New subscribers", value: "1,204", note: "Synced to your email tool" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/[0.06] px-5 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#ffe9ec]/45">{stat.label}</p>
                  <p className="mt-2 font-display text-[26px] font-extrabold text-white">{stat.value}</p>
                  <p className="mt-1 text-[11.5px] text-[#ffb3c0]/80">{stat.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Design */}
        <section className="bg-sage text-shade">
          <div className="mx-auto grid w-full max-w-[1240px] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { bg: "#d2e823", text: "#1e2330", label: "Chartreuse", btn: "#fff" },
                  { bg: "#1e2330", text: "#fff", label: "Midnight", btn: "#d2e823" },
                  { bg: "#e9c0e9", text: "#1e2330", label: "Bubblegum", btn: "#fff" },
                  { bg: "linear-gradient(160deg,#2665d6,#173f96)", text: "#fff", label: "Ocean", btn: "rgba(255,255,255,.2)" },
                ].map((theme) => (
                  <div
                    key={theme.label}
                    className="aspect-[4/3] overflow-hidden rounded-3xl border border-shade/10 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: theme.bg, color: theme.text }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-white/50" />
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{theme.label}</span>
                    </div>
                    <div className="mt-5 space-y-1.5">
                      {[1, 2, 3].map((row) => (
                        <div key={row} className="h-5 rounded-full" style={{ background: theme.btn, opacity: 0.9 }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 lg:pl-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-forest/60">Make it yours</p>
              <h2 className="mt-4 max-w-[460px] font-display text-[38px] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-[52px]">
                Your link. Your look. Your rules.
              </h2>
              <p className="mt-5 max-w-[450px] text-[16px] leading-relaxed text-forest/75">
                Pick from ready-made themes or fine-tune every color, button, corner and font. Your page should feel
                like you — not a template.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Palette, label: "10+ designer themes" },
                  { icon: Zap, label: "Instant live preview" },
                  { icon: Globe2, label: "Custom fonts & colors" },
                  { icon: Sparkles, label: "Stickers & wallpapers" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 text-[14px] font-semibold text-forest">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/70">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/register" variant="dark" size="lg" className="mt-9">
                Design your page
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Creators marquee */}
        <section id="creators" className="overflow-hidden bg-white py-16">
          <div className="mx-auto mb-8 w-full max-w-[1240px] px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <h2 className="font-display text-[30px] font-extrabold tracking-[-0.03em] text-shade sm:text-[38px]">
                For every kind of creator.
              </h2>
              <Link href="/discover" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-grape">
                Explore profiles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
            <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
              {[...CREATORS, ...CREATORS].map((creator, index) => (
                <div
                  key={`${creator.handle}-${index}`}
                  className="flex w-[240px] items-center gap-3 rounded-2xl border border-shade/10 bg-chalk p-3.5"
                >
                  <Avatar name={creator.name} size={44} />
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold text-shade">{creator.name}</p>
                    <p className="truncate text-[12px] text-shade/50">
                      {creator.handle} · {creator.tag}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento features */}
        <section id="features" className="bg-chalk py-20 lg:py-24">
          <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
            <div className="max-w-[620px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-grape">Built for the whole link</p>
              <h2 className="mt-4 font-display text-[38px] font-extrabold leading-[1.02] tracking-[-0.035em] text-shade sm:text-[52px]">
                More than a list of links.
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-shade/60">
                Everything you need to share, grow and earn — designed to work together and set up in minutes.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BENTO.map(({ icon: Icon, title, body, tone }) => (
                <div
                  key={title}
                  className={`group rounded-[28px] border border-shade/10 p-7 transition hover:-translate-y-1 hover:shadow-lg ${tone}`}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-shade text-white transition group-hover:bg-grape">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 font-display text-[20px] font-bold tracking-tight text-shade">{title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-shade/60">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="plans" className="bg-white py-20 lg:py-24">
          <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-grape">Plans</p>
                <h2 className="mt-3 font-display text-[36px] font-extrabold tracking-[-0.035em] text-shade sm:text-[48px]">
                  Start free. Upgrade when you grow.
                </h2>
              </div>
              <ButtonLink href="/pricing" variant="outline" size="md">
                Compare all plans <ArrowRight className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl border p-6 ${
                    plan.highlight
                      ? "border-grape bg-grape text-white shadow-xl"
                      : "border-shade/12 bg-chalk text-shade"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute -top-3 left-6 rounded-full bg-chartreuse px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-shade">
                      Most popular
                    </span>
                  ) : null}
                  <h3 className="font-display text-[18px] font-bold">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-[34px] font-extrabold tracking-tight">{plan.price}</span>
                    <span className={`text-[12px] ${plan.highlight ? "text-white/55" : "text-shade/60"}`}>/mo</span>
                  </div>
                  <p className={`mt-1 text-[11.5px] ${plan.highlight ? "text-white/55" : "text-shade/60"}`}>{plan.tagline}</p>
                  <ul className="mt-5 flex-1 space-y-2">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className={`flex items-start gap-2 text-[12.5px] ${plan.highlight ? "text-white/80" : "text-shade/65"}`}>
                        <Check className={`mt-0.5 h-3.5 w-3.5 flex-none ${plan.highlight ? "text-chartreuse" : "text-forest"}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <ButtonLink
                    href="/pricing"
                    variant={plan.highlight ? "chartreuse" : "outline"}
                    size="sm"
                    className="mt-6 w-full"
                  >
                    {plan.cta}
                  </ButtonLink>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-chalk py-20 lg:py-24">
          <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8">
            <h2 className="max-w-[680px] font-display text-[36px] font-extrabold leading-[1.02] tracking-[-0.035em] text-shade sm:text-[48px]">
              Loved by creators who live on the internet.
            </h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {TESTIMONIALS.map((testimonial) => (
                <figure key={testimonial.name} className="flex flex-col rounded-3xl border border-shade/10 bg-white p-6">
                  <div className="flex gap-0.5 text-chartreuse" aria-label="5 out of 5 stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarMark key={star} className="h-3.5 w-3.5" />
                    ))}
                  </div>
                  <blockquote className="mt-5 flex-1 text-[16px] leading-relaxed text-shade/80">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-shade/10 pt-5">
                    <Avatar name={testimonial.name} size={38} />
                    <div>
                      <p className="text-[13px] font-bold text-shade">{testimonial.name}</p>
                      <p className="text-[11.5px] text-shade/60">{testimonial.role}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white py-20 lg:py-24">
          <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-grape">FAQ</p>
              <h2 className="mt-3 max-w-[380px] font-display text-[38px] font-extrabold leading-[1.02] tracking-[-0.035em] text-shade sm:text-[48px]">
                Questions? We have answers.
              </h2>
              <p className="mt-5 max-w-[340px] text-[14px] leading-relaxed text-shade/55">
                Everything you need to know about Linktree, from your first link to your first sale.
              </p>
              <ButtonLink href="/register" variant="dark" size="md" className="mt-7">
                Get started free
              </ButtonLink>
            </div>

            <div className="divide-y divide-shade/10 border-y border-shade/10">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[16px] font-semibold text-shade marker:hidden">
                    {faq.q}
                    <span className="grid h-7 w-7 flex-none place-items-center rounded-full border border-shade/15 transition group-open:rotate-45 group-open:bg-shade group-open:text-white">
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[650px] pr-10 text-[14px] leading-relaxed text-shade/60">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-grape text-white">
          <div className="relative mx-auto w-full max-w-[1240px] overflow-hidden px-5 py-20 text-center sm:px-8 lg:py-24">
            <div className="pointer-events-none absolute -left-10 top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-chartreuse/20 blur-3xl" />
            <StarMark className="mx-auto h-9 w-9 text-chartreuse" />
            <h2 className="mx-auto mt-6 max-w-[720px] font-display text-[42px] font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-[64px]">
              One link. Everything you are.
            </h2>
            <p className="mx-auto mt-5 max-w-[460px] text-[16px] leading-relaxed text-white/65">
              Join 70M+ creators using Linktree to share, grow and earn from one simple link.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/register" variant="chartreuse" size="lg">
                Claim your Linktree
              </ButtonLink>
              <ButtonLink href="/login" variant="white" size="lg">
                Sign up free
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
