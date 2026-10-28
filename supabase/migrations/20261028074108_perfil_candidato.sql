alter table public.profiles
  add column if not exists headline text check (char_length(headline) <= 120),
  add column if not exists experience text check (char_length(experience) <= 2000),
  add column if not exists availability text check (char_length(availability) <= 120),
  add column if not exists is_candidate boolean not null default false;