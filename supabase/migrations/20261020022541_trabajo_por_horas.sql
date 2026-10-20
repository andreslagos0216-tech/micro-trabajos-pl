alter table public.job_posts drop constraint if exists job_posts_pay_type_check;
alter table public.job_posts add constraint job_posts_pay_type_check
  check (pay_type in ('hour', 'day', 'project'));

insert into public.categories (name, slug, section, name_es, name_en) values
  ('Sprzątanie domów i biur', 'sprzatanie-domow', 'jobs', 'Limpieza de casas y oficinas', 'House and office cleaning'),
  ('Odśnieżanie i ogrody', 'odsniezanie-ogrody', 'jobs', 'Quitar nieve y jardinería', 'Snow removal and gardening'),
  ('Przeprowadzki i transport', 'przeprowadzki', 'jobs', 'Mudanzas y cargas', 'Moving and loading'),
  ('Opieka nad dziećmi i seniorami', 'opieka-dzieci-seniorzy', 'jobs', 'Cuidado de niños y personas mayores', 'Childcare and elderly care'),
  ('Masaże i pielęgnacja', 'masaze-pielegnacja', 'jobs', 'Masajes y cuidado personal', 'Massage and personal care'),
  ('Drobne naprawy', 'drobne-naprawy', 'jobs', 'Reparaciones pequeñas', 'Small repairs'),
  ('Pomoc ogólna', 'pomoc-ogolna', 'jobs', 'Ayuda general', 'General help')
on conflict (slug) do nothing;