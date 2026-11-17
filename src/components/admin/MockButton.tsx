"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function MockButton({
  children,
  title,
  message,
  variant = "outline",
  size = "sm",
  className = "",
}: {
  children: ReactNode;
  title: string;
  message: ReactNode;
  variant?: "primary" | "dark" | "outline" | "ghost" | "chartreuse" | "white" | "cobalt";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title} size="sm">
        <div className="text-[12.5px] leading-relaxed text-shade/65">{message}</div>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="primary" size="sm" onClick={() => setOpen(false)}>
            Got it
          </Button>
        </div>
      </Modal>
    </>
  );
}
