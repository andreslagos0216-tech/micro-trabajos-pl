create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  listing_kind text not null check (listing_kind in ('job', 'sale', 'rent')),
  listing_id uuid not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  owner_read_at timestamptz,
  buyer_read_at timestamptz,
  constraint conversations_not_self check (owner_id <> buyer_id),
  constraint conversations_unique unique (listing_kind, listing_id, buyer_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  original_lang text not null default 'es' check (original_lang in ('pl', 'es', 'en'))
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists conversations_owner_idx on public.conversations (owner_id, last_message_at desc);
create index if not exists conversations_buyer_idx on public.conversations (buyer_id, last_message_at desc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Participantes ven su conversación" on public.conversations for select to authenticated
  using (auth.uid() = owner_id or auth.uid() = buyer_id);

create policy "Comprador abre conversación" on public.conversations for insert to authenticated
  with check (auth.uid() = buyer_id and buyer_id <> owner_id);

create policy "Participantes actualizan lectura" on public.conversations for update to authenticated
  using (auth.uid() = owner_id or auth.uid() = buyer_id)
  with check (auth.uid() = owner_id or auth.uid() = buyer_id);

create policy "Participantes ven mensajes" on public.messages for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id and (c.owner_id = auth.uid() or c.buyer_id = auth.uid())
  ));

create policy "Participantes escriben mensajes" on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid() and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.owner_id = auth.uid() or c.buyer_id = auth.uid())
    )
  );

grant select, insert, update on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;