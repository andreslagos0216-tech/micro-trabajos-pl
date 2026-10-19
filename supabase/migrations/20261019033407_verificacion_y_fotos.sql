alter table public.job_posts drop constraint if exists job_posts_status_check;
alter table public.job_posts add constraint job_posts_status_check
  check (status in ('active', 'paused', 'closed', 'pending_review'));

alter table public.sale_listings drop constraint if exists sale_listings_status_check;
alter table public.sale_listings add constraint sale_listings_status_check
  check (status in ('active', 'paused', 'closed', 'sold', 'pending_review'));

alter table public.rental_listings drop constraint if exists rental_listings_status_check;
alter table public.rental_listings add constraint rental_listings_status_check
  check (status in ('active', 'paused', 'closed', 'rented', 'pending_review'));

alter table public.job_posts alter column languages drop default;
alter table public.job_posts alter column languages type jsonb using to_jsonb(languages);
alter table public.job_posts alter column languages set default '[]'::jsonb;

alter table public.job_posts
  add column if not exists review_note text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

alter table public.sale_listings
  add column if not exists review_note text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

alter table public.rental_listings
  add column if not exists review_note text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

create index if not exists job_posts_status_idx on public.job_posts (status);
create index if not exists sale_listings_status_idx on public.sale_listings (status);
create index if not exists rental_listings_status_idx on public.rental_listings (status);