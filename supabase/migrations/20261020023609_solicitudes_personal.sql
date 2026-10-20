create table if not exists public.staff_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  requester_name text not null check (char_length(requester_name) between 2 and 80),
  whatsapp text not null check (char_length(whatsapp) between 7 and 20),
  work_type text not null check (char_length(work_type) between 3 and 120),
  description text check (char_length(description) <= 1000),
  locality_id int references public.localities(id),
  when_needed text check (char_length(when_needed) <= 120),
  people_count int not null default 1 check (people_count between 1 and 50),
  pay_type text not null default 'hour' check (pay_type in ('hour', 'day', 'project', 'agreed')),
  pay_pln numeric,
  language text not null default 'es' check (language in ('pl', 'es', 'en')),
  status text not null default 'new' check (status in ('new', 'contacted', 'done', 'discarded'))
);

alter table public.staff_requests enable row level security;

create policy "Cualquiera puede enviar solicitud" on public.staff_requests
  for insert to anon, authenticated
  with check (true);

create index if not exists staff_requests_status_idx on public.staff_requests (status, created_at desc);