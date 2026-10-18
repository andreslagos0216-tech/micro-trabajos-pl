-- Denuncias para los tres tipos de anuncio
alter table public.reports
  alter column job_id drop not null,
  add column if not exists sale_listing_id uuid references public.sale_listings(id) on delete cascade,
  add column if not exists rental_listing_id uuid references public.rental_listings(id) on delete cascade;

alter table public.reports add constraint reports_one_target
  check (num_nonnulls(job_id, sale_listing_id, rental_listing_id) = 1);
alter table public.reports add constraint reports_sale_reporter unique (sale_listing_id, reporter_id);
alter table public.reports add constraint reports_rent_reporter unique (rental_listing_id, reporter_id);

-- Pedidos de destacado para cualquier tipo de anuncio
alter table public.orders
  add column if not exists listing_table text not null default 'job_posts'
    check (listing_table in ('job_posts', 'sale_listings', 'rental_listings')),
  add column if not exists listing_id uuid;

-- Traducciones de compraventa y alquiler
create table public.listing_translations (
  id uuid primary key default gen_random_uuid(),
  listing_table text not null check (listing_table in ('sale_listings', 'rental_listings')),
  listing_id uuid not null,
  lang text not null check (lang in ('pl', 'es', 'en')),
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  unique (listing_table, listing_id, lang)
);

alter table public.listing_translations enable row level security;
create policy "Traducciones de anuncios visibles" on public.listing_translations
  for select using (true);