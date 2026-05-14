"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AdminStatsDTO } from "@/lib/analytics/adminStatsTypes";

async function fetchAdminStats(): Promise<AdminStatsDTO> {
  const res = await fetch("/api/admin/stats", { credentials: "include" });
  if (res.status === 401) {
    throw new Error("Session expired. Sign in again.");
  }
  if (!res.ok) {
    const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(j?.error?.message ?? res.statusText);
  }
  return (await res.json()) as AdminStatsDTO;
}

export function AdminPanel({ initialStats }: { initialStats: AdminStatsDTO | null }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(Boolean(initialStats));
  const [secret, setSecret] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  /** SSR stats are fresh at hydration; avoids an immediate refetch + “Refreshing…” flash. */
  const [initialStatsHydratedAt] = useState<number | undefined>(() => (initialStats ? Date.now() : undefined));

  const { data: stats, isFetching, error, refetch } = useQuery({
    queryKey: ["admin", "stats"] as const,
    queryFn: fetchAdminStats,
    initialData: initialStats ?? undefined,
    initialDataUpdatedAt: initialStatsHydratedAt,
    enabled: session,
    staleTime: 15_000,
  });

  const login = async () => {
    setLoginErr(null);
    setBanner(null);
    setLoginPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: { message?: string; code?: string } } | null;
        setLoginErr(j?.error?.message ?? "Login failed");
        return;
      }
      setSecret("");
      setSession(true);
      await queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    } finally {
      setLoginPending(false);
    }
  };

  const logout = async () => {
    setLogoutPending(true);
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
      setSession(false);
      queryClient.removeQueries({ queryKey: ["admin", "stats"] });
      setBanner("Signed out");
    } finally {
      setLogoutPending(false);
    }
  };

  const authed = Boolean(session && stats);
  const queryError = error instanceof Error ? error.message : null;
  const booting = Boolean(session && !stats && isFetching);
  const refreshing = Boolean(session && stats && isFetching);

  return (
    <div className="mx-auto max-w-lg space-y-saheli-24 px-saheli-16 py-saheli-40 text-ink-body">
      <header>
        <h1 className="h-2 text-ink-strong">Saheli admin</h1>
        <p className="body-sm mt-saheli-8 text-ink-muted">Basic health and session counters (this server only).</p>
      </header>

      {!session && (
        <div
          className="space-y-saheli-12 rounded-2xl border border-stroke-subtle bg-surface-raised p-saheli-20"
          aria-busy={loginPending}
        >
          <label className="label block text-ink-muted" htmlFor="admin-secret">
            Admin secret
          </label>
          <input
            id="admin-secret"
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            disabled={loginPending}
            className="w-full rounded-xl border border-stroke-subtle bg-surface-canvas px-saheli-12 py-saheli-12 text-body outline-none focus-visible:ring-2 focus-visible:ring-[var(--saheli-focus-ring)] disabled:opacity-60"
            placeholder="SAHELI_ADMIN_SECRET from Vercel"
          />
          <Button
            type="button"
            size="md"
            className="w-full rounded-full"
            disabled={loginPending || !secret.trim()}
            onClick={() => void login()}
          >
            {loginPending ? "Unlocking…" : "Unlock dashboard"}
          </Button>
          {loginErr && <p className="body-sm text-rose-700">{loginErr}</p>}
          {banner && <p className="body-sm text-ink-muted">{banner}</p>}
        </div>
      )}

      {booting && (
        <section className="space-y-saheli-12" aria-live="polite" aria-busy="true">
          <p className="body-sm text-ink-muted">Loading your dashboard…</p>
          <div className="grid grid-cols-2 gap-saheli-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="space-y-saheli-8 rounded-2xl border border-stroke-subtle bg-surface-raised p-saheli-16"
              >
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
        </section>
      )}

      {authed && stats && (
        <div className="space-y-saheli-16">
          {refreshing && (
            <p className="body-sm text-ink-muted" aria-live="polite">
              Refreshing latest numbers…
            </p>
          )}
          <div className="grid grid-cols-2 gap-saheli-12">
            <StatBox label="Unique sessions" value={stats.uniqueSessions} />
            <StatBox label="Tab loads (pings)" value={stats.totalPings} />
            <StatBox label="AI chats" value={stats.aiChats} />
            <StatBox label="AI plans" value={stats.aiPlans} />
            <StatBox label="Plan errors" value={stats.planErrors} />
            <StatBox label="Uptime (ms)" value={stats.uptimeMs} />
          </div>
          <div className="rounded-2xl border border-stroke-subtle bg-surface-raised p-saheli-16 text-body-sm">
            <p>
              <span className="text-ink-muted">OpenRouter:</span> {stats.openrouterConfigured ? "configured" : "missing key"}
            </p>
            <p className="mt-saheli-4">
              <span className="text-ink-muted">Site URL:</span> {stats.siteUrl || "(unset)"}
            </p>
            <p className="mt-saheli-4">
              <span className="text-ink-muted">NODE_ENV:</span> {stats.nodeEnv}
            </p>
          </div>
          <p className="body-sm text-ink-muted">{stats.note}</p>
          <div>
            <p className="label mb-saheli-8 text-ink-muted">Recent events</p>
            <ul className="max-h-64 space-y-saheli-6 overflow-y-auto rounded-xl border border-stroke-subtle bg-surface-canvas p-saheli-12 font-mono text-caption text-ink-body">
              {stats.recentEvents.length === 0 ? (
                <li className="text-ink-muted">No events yet.</li>
              ) : (
                stats.recentEvents.map((e) => (
                  <li key={`${e.ts}-${e.type}`}>
                    {new Date(e.ts).toISOString().slice(11, 19)} {e.type}
                    {e.sessionId ? ` sid=${e.sessionId.slice(0, 8)}…` : ""}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="flex flex-wrap gap-saheli-12">
            <Button
              type="button"
              variant="glass"
              size="sm"
              className="rounded-full"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Refreshing…" : "Refresh"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full border border-stroke-subtle"
              onClick={() => void logout()}
              disabled={logoutPending}
            >
              {logoutPending ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </div>
      )}

      {session && !stats && !isFetching && queryError && (
        <div className="space-y-saheli-12 rounded-2xl border border-stroke-subtle bg-surface-raised p-saheli-16">
          <p className="body-sm text-rose-700" role="alert">
            {queryError}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full border border-stroke-subtle"
            onClick={() => {
              setSession(false);
              queryClient.removeQueries({ queryKey: ["admin", "stats"] });
            }}
          >
            Back to sign in
          </Button>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-stroke-subtle bg-surface-raised p-saheli-16">
      <p className="caption text-ink-muted">{label}</p>
      <p className="mt-saheli-4 text-title text-ink-strong">{value}</p>
    </div>
  );
}
