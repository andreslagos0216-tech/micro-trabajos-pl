alter table public.sale_listings
  add column if not exists languages jsonb not null default '[]'::jsonb;

alter table public.rental_listings
  add column if not exists languages jsonb not null default '[]'::jsonb;