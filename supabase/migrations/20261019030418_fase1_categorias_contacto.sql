alter table public.job_posts
  add column if not exists custom_category text check (char_length(custom_category) <= 80),
  add column if not exists contact_method text not null default 'chat' check (contact_method in ('chat', 'whatsapp', 'both'));

alter table public.sale_listings
  add column if not exists custom_category text check (char_length(custom_category) <= 80),
  add column if not exists contact_method text not null default 'chat' check (contact_method in ('chat', 'whatsapp', 'both'));

alter table public.rental_listings
  add column if not exists custom_category text check (char_length(custom_category) <= 80),
  add column if not exists contact_method text not null default 'chat' check (contact_method in ('chat', 'whatsapp', 'both'));

insert into public.categories (name, slug, section, name_es, name_en) values
  ('Opieka nad dziećmi', 'opieka-dzieci', 'jobs', 'Cuidado de niños', 'Childcare'),
  ('Opieka nad seniorami', 'opieka-seniorow', 'jobs', 'Cuidado de personas mayores', 'Elderly care'),
  ('Opieka nad zwierzętami', 'opieka-zwierzat', 'jobs', 'Cuidado de mascotas', 'Pet care'),
  ('Prace ogólne i pomoc', 'prace-ogolne', 'jobs', 'Trabajos generales y ayuda', 'General labour'),
  ('Magazyn i produkcja', 'magazyn-produkcja', 'jobs', 'Almacén y producción', 'Warehouse and production'),
  ('Administracja i biuro', 'administracja-biuro', 'jobs', 'Administración y oficina', 'Administration and office'),
  ('Obsługa klienta i sprzedaż', 'obsluga-klienta', 'jobs', 'Atención al cliente y ventas', 'Customer service and sales'),
  ('Informatyka i programowanie', 'informatyka', 'jobs', 'Informática y programación', 'IT and programming'),
  ('Grafika i marketing', 'grafika-marketing', 'jobs', 'Diseño y marketing', 'Design and marketing'),
  ('Fotografia i wideo', 'fotografia-wideo', 'jobs', 'Fotografía y vídeo', 'Photo and video'),
  ('Muzyka i rozrywka', 'muzyka-rozrywka', 'jobs', 'Música y entretenimiento', 'Music and entertainment'),
  ('Fryzjerstwo i barber', 'fryzjer-barber', 'jobs', 'Peluquería y barbería', 'Hairdressing and barbering'),
  ('Manicure i kosmetyka', 'manicure-kosmetyka', 'jobs', 'Manicura y estética', 'Manicure and cosmetics'),
  ('Masaże i zdrowie', 'masaze-zdrowie', 'jobs', 'Masajes y salud', 'Massage and health'),
  ('Ogrodnictwo', 'ogrodnictwo', 'jobs', 'Jardinería', 'Gardening'),
  ('Ochrona i bezpieczeństwo', 'ochrona', 'jobs', 'Seguridad', 'Security'),
  ('Transport i kurierzy', 'transport-kurierzy', 'jobs', 'Transporte y mensajería', 'Transport and couriers'),
  ('Inne', 'otro-empleo', 'jobs', 'Otro', 'Other')
on conflict (slug) do nothing;

insert into public.categories (name, slug, section, parent_id, name_es, name_en)
select 'Inne', 'otro-' || p.slug, p.section, p.id, 'Otro', 'Other'
from public.categories p
where p.parent_id is null and p.section in ('sale', 'rent')
on conflict (slug) do nothing;