"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export function ProfileShare({
  name,
  username,
  dark = false,
}: {
  name: string;
  username: string;
  dark?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/${username}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch {
        // Fall through to clipboard.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={`grid h-9 w-9 place-items-center rounded-full backdrop-blur transition ${
        dark ? "bg-white/15 text-white hover:bg-white/25" : "bg-black/10 text-shade hover:bg-black/20"
      }`}
      aria-label={copied ? "Link copied" : "Share this page"}
      title={copied ? "Link copied" : "Share this page"}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </button>
  );
}
