-- Saheli AI memory + threads (Supabase / Postgres + pgvector)
-- Enable: create extension if not exists vector;

create table if not exists public.ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_threads (id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant')),
  content jsonb not null,
  tokens_in int,
  tokens_out int,
  model text,
  request_id text,
  created_at timestamptz not null default now()
);

create index if not exists ai_messages_thread_created_idx on public.ai_messages (thread_id, created_at desc);

create table if not exists public.memory_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.memory_embeddings (
  event_id uuid primary key references public.memory_events (id) on delete cascade,
  embedding vector(384) not null
);

-- IVFFLAT index: lists ~ sqrt(rows) is a common starting point; tune after you have row counts.
-- create index memory_embeddings_ivfflat on public.memory_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table public.ai_threads enable row level security;
alter table public.ai_messages enable row level security;
alter table public.memory_events enable row level security;
alter table public.memory_embeddings enable row level security;

create policy "threads_owner" on public.ai_threads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "messages_owner" on public.ai_messages
  for all using (
    exists (select 1 from public.ai_threads t where t.id = thread_id and t.user_id = auth.uid())
  );

create policy "memory_events_owner" on public.memory_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "memory_embeddings_owner" on public.memory_embeddings
  for all using (
    exists (select 1 from public.memory_events e where e.id = event_id and e.user_id = auth.uid())
  );
