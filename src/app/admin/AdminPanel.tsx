"use client";

import { useCallback, useEffect, useState } from "react";

type Stats = {
  uniqueSessions: number;
  totalPings: number;
  aiChats: number;
  aiPlans: number;
  planErrors: number;
  recentEvents: Array<{ ts: number; type: string; sessionId?: string; meta?: Record<string, unknown> }>;
  serverStartedAt: number;
  uptimeMs: number;
  openrouterConfigured: boolean;
  siteUrl: string;
  nodeEnv: string;
  note: string;
};

export function AdminPanel() {
  const [secret, setSecret] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.status === 401) {
        setStats(null);
        setErr(null);
        return;
      }
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        throw new Error(j?.error?.message ?? res.statusText);
      }
      setStats((await res.json()) as Stats);
    } catch (e) {
      setStats(null);
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const login = async () => {
    setErr(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ secret }),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { error?: { message?: string; code?: string } } | null;
      setErr(j?.error?.message ?? "Login failed");
      return;
    }
    setSecret("");
    await load();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setStats(null);
    setErr("Signed out");
  };

  const authed = Boolean(stats);

  return (
    <div className="mx-auto max-w-lg space-y-saheli-24 px-saheli-16 py-saheli-40 text-ink-body">
      <header>
        <h1 className="h-2 text-ink-strong">Saheli admin</h1>
        <p className="body-sm mt-saheli-8 text-ink-muted">Basic health and session counters (this server only).</p>
      </header>

      {!authed && (
        <div className="space-y-saheli-12 rounded-2xl border border-stroke-subtle bg-surface-raised p-saheli-20">
          <label className="label block text-ink-muted">Admin secret</label>
          <input
            type="password"
            autoComplete="off"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full rounded-xl border border-stroke-subtle bg-surface-canvas px-saheli-12 py-saheli-12 text-body outline-none focus-visible:ring-2 focus-visible:ring-[var(--saheli-focus-ring)]"
            placeholder="SAHELI_ADMIN_SECRET from Vercel"
          />
          <button
            type="button"
            onClick={() => void login()}
            className="rounded-full bg-champagne-600 px-saheli-20 py-saheli-12 text-body font-medium text-white"
          >
            Unlock dashboard
          </button>
          {err && <p className="body-sm text-rose-700">{err}</p>}
        </div>
      )}

      {authed && stats && (
        <div className="space-y-saheli-16">
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
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded-full border border-stroke-subtle px-saheli-16 py-saheli-10 text-body-sm"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-stroke-subtle px-saheli-16 py-saheli-10 text-body-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {loading && <p className="body-sm text-ink-muted">Loading…</p>}
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
