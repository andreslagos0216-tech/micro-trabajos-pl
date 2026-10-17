create table public.reports (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_posts(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('illegal', 'discrimination', 'scam', 'spam', 'other')),
  details text check (char_length(details) <= 500),
  status text not null default 'open' check (status in ('open', 'reviewed', 'removed', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (job_id, reporter_id)
);

alter table public.reports enable row level security;

-- Cualquier usuario con sesión puede denunciar
create policy "Denunciar anuncios" on public.reports
  for insert with check (auth.uid() = reporter_id);

-- Cada usuario solo ve sus propias denuncias
create policy "Ver mis denuncias" on public.reports
  for select using (auth.uid() = reporter_id);
