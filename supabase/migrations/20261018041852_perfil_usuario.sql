alter table public.profiles add column if not exists locality_id int references public.localities(id);

grant update (full_name, phone, city_id, bio, languages, locality_id) on public.profiles to authenticated;