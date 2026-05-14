/** Shared shape for GET /api/admin/stats and the RSC admin page (no server-only imports). */
export type AdminStatsDTO = {
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
