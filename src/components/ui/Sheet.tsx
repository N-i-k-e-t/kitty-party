"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { softSpring } from "@/lib/motion";

export function Sheet({
  open,
  onClose,
  children,
  side = "bottom",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "bottom" | "right";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button
            type="button"
            className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
            aria-label="Close sheet"
            onClick={onClose}
          />
          <motion.div
            initial={side === "bottom" ? { y: "100%" } : { x: "100%" }}
            animate={side === "bottom" ? { y: 0 } : { x: 0 }}
            exit={side === "bottom" ? { y: "100%" } : { x: "100%" }}
            transition={softSpring}
            className={cn(
              "relative z-10 ml-auto flex max-h-[90dvh] flex-col overflow-hidden border border-champagne/30 bg-ivory/95 shadow-lift backdrop-blur-xl",
              side === "bottom" && "mt-auto w-full rounded-t-3xl",
              side === "right" && "h-full w-full max-w-md rounded-l-3xl",
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
