import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AiThreadRow = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type AiMessageRow = {
  id: string;
  thread_id: string;
  role: string;
  content: unknown;
  tokens_in: number | null;
  tokens_out: number | null;
  model: string | null;
  request_id: string | null;
  created_at: string;
};

function client(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function createThread(userId: string, title: string): Promise<string | null> {
  const sb = client();
  if (!sb) return null;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const { error } = await sb.from("ai_threads").insert({
    id,
    user_id: userId,
    title,
    created_at: now,
    updated_at: now,
  });
  if (error) return null;
  return id;
}

export async function appendMessage(input: Omit<AiMessageRow, "created_at"> & { created_at?: string }): Promise<boolean> {
  const sb = client();
  if (!sb) return false;
  const { error } = await sb.from("ai_messages").insert({
    ...input,
    created_at: input.created_at ?? new Date().toISOString(),
  });
  return !error;
}

export async function getThreadMessages(threadId: string, limit = 30): Promise<AiMessageRow[]> {
  const sb = client();
  if (!sb) return [];
  const { data, error } = await sb
    .from("ai_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as AiMessageRow[]).reverse();
}

export async function recordEvent(input: {
  id: string;
  user_id: string;
  kind: string;
  payload: unknown;
}): Promise<boolean> {
  const sb = client();
  if (!sb) return false;
  const { error } = await sb.from("memory_events").insert({
    id: input.id,
    user_id: input.user_id,
    kind: input.kind,
    payload: input.payload,
    created_at: new Date().toISOString(),
  });
  return !error;
}

export async function recallTopK(_userId: string, _queryVec: number[], _k: number): Promise<Array<{ id: string; payload: unknown }>> {
  void _userId;
  void _queryVec;
  void _k;
  return [];
}
