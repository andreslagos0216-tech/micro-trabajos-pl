create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rater_id uuid not null references public.profiles(id) on delete cascade,
  rated_profile_id uuid not null references public.profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  job_id uuid references public.job_posts(id) on delete cascade,
  sale_listing_id uuid references public.sale_listings(id) on delete cascade,
  rental_listing_id uuid references public.rental_listings(id) on delete cascade,
  constraint ratings_not_self check (rater_id <> rated_profile_id),
  constraint ratings_one_target check (
    (job_id is not null)::int + (sale_listing_id is not null)::int + (rental_listing_id is not null)::int = 1
  )
);

create unique index if not exists ratings_one_per_job on public.ratings (rater_id, job_id) where job_id is not null;
create unique index if not exists ratings_one_per_sale on public.ratings (rater_id, sale_listing_id) where sale_listing_id is not null;
create unique index if not exists ratings_one_per_rent on public.ratings (rater_id, rental_listing_id) where rental_listing_id is not null;

alter table public.ratings enable row level security;

create policy "Todos ven valoraciones" on public.ratings for select to anon, authenticated using (true);
create policy "Solo otros usuarios valoran" on public.ratings for insert to authenticated
  with check (auth.uid() = rater_id and rater_id <> rated_profile_id);

grant select on public.ratings to anon, authenticated;
grant insert on public.ratings to authenticated;