import type { ReactNode } from "react";
import { AppBar } from "@/components/patterns/AppBar";
import { BottomNav } from "@/components/patterns/BottomNav";
import { PageShell } from "@/components/patterns/PageShell";
import { SideRail } from "@/components/patterns/SideRail";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-surface-canvas text-ink-body">
      <SideRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppBar />
        <main id="main-content" className="flex-1">
          <PageShell>{children}</PageShell>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
