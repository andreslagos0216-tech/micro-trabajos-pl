create table if not exists public.sale_translations (
  sale_listing_id uuid not null references public.sale_listings(id) on delete cascade,
  lang text not null check (lang in ('pl', 'es', 'en')),
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  primary key (sale_listing_id, lang)
);

create table if not exists public.rental_translations (
  rental_listing_id uuid not null references public.rental_listings(id) on delete cascade,
  lang text not null check (lang in ('pl', 'es', 'en')),
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  primary key (rental_listing_id, lang)
);

alter table public.sale_translations enable row level security;
alter table public.rental_translations enable row level security;

create policy "Lectura pública de traducciones de venta" on public.sale_translations for select to anon, authenticated using (true);
create policy "Lectura pública de traducciones de alquiler" on public.rental_translations for select to anon, authenticated using (true);

grant select on public.sale_translations to anon, authenticated;
grant select on public.rental_translations to anon, authenticated;