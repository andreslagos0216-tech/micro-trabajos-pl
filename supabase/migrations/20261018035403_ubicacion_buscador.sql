alter table public.job_posts
  add column if not exists locality_id int references public.localities(id),
  alter column city_id drop not null;

create index if not exists job_posts_locality_idx on public.job_posts (locality_id);
create index if not exists job_posts_kind_idx on public.job_posts (kind);