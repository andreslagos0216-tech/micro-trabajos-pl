create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_kind text not null check (listing_kind in ('job', 'sale', 'rent')),
  listing_id uuid not null,
  constraint favorites_unique unique (user_id, listing_kind, listing_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

create policy "Cada usuario ve sus favoritos" on public.favorites for select to authenticated
  using (auth.uid() = user_id);

create policy "Cada usuario guarda sus favoritos" on public.favorites for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Cada usuario quita sus favoritos" on public.favorites for delete to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.favorites to authenticated;