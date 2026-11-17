import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

export const instant = false;

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Link in bio tool: Everything you are, in one simple link | Linktree",
    template: "%s | Linktree",
  },
  description:
    "Join 70M+ people using Linktree for their link in bio. One link to help you share everything you create, curate and sell from your Instagram, TikTok, Twitter, YouTube and other social media profiles.",
  applicationName: "Linktree",
  keywords: ["link in bio", "Linktree", "Instagram link", "creator tools"],
  openGraph: {
    type: "website",
    siteName: "Linktree",
    title: "Link in bio tool: Everything you are, in one simple link",
    description: "One link to help you share everything you create, curate and sell.",
  },
};

export const viewport: Viewport = {
  themeColor: "#d2e823",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
