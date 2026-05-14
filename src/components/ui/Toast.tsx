"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { cn } from "@/lib/cn";

export function Toaster() {
  const { toasts, dismissToast } = useUiStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-3 sm:bottom-8">
      <div className="flex w-full max-w-md flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="pointer-events-auto glass-panel rounded-2xl p-3 text-sm text-ink shadow-lift"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold">{t.title}</p>
                  {t.description ? (
                    <p className={cn("mt-0.5 text-xs text-ink-muted")}>{t.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="rounded-full p-1 text-ink-muted hover:bg-white/60"
                  onClick={() => dismissToast(t.id)}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
