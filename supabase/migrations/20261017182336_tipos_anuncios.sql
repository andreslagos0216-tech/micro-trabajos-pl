alter table public.job_posts
  add column kind text not null default 'job' check (kind in ('job', 'candidate', 'service')),
  add column original_lang text not null default 'pl' check (original_lang in ('pl', 'es', 'en')),
  add column availability text,
  add column languages text[] not null default '{}';

create table public.job_translations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_posts(id) on delete cascade,
  lang text not null check (lang in ('pl', 'es', 'en')),
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique (job_id, lang)
);

alter table public.job_translations enable row level security;
create policy "Traducciones visibles" on public.job_translations for select using (true);

insert into public.categories (name, slug) values
  ('Tłumaczenia · Traducción', 'tlumaczenia'),
  ('Uroda · Belleza', 'uroda'),
  ('Praca zdalna · Trabajo virtual', 'praca-zdalna'),
  ('Edukacja · Educación', 'edukacja')
on conflict (slug) do nothing;
