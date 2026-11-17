"use client";

import { useEffect } from "react";

export function ProfileTracker({ userId }: { userId: string }) {
  useEffect(() => {
    const payload = JSON.stringify({
      userId,
      referrer: document.referrer || "direct",
    });

    const send = () => {
      void fetch("/api/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => undefined);
    };

    const timer = window.setTimeout(send, 400);
    return () => window.clearTimeout(timer);
  }, [userId]);

  return null;
}
