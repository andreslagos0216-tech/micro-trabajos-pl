alter table public.job_posts
  add column if not exists pay_agreed boolean not null default false;

alter table public.job_posts alter column pay_pln drop not null;

alter table public.job_posts
  add constraint job_posts_pay_present check (pay_agreed or pay_pln is not null);

create table if not exists public.profile_contacts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  phone text,
  updated_at timestamptz not null default now()
);

alter table public.profile_contacts enable row level security;

create policy "Mi contacto" on public.profile_contacts for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

grant select, insert, update on public.profile_contacts to authenticated;

insert into public.profile_contacts (profile_id, phone)
select id, phone from public.profiles where phone is not null
on conflict (profile_id) do nothing;

alter table public.profiles drop column phone;