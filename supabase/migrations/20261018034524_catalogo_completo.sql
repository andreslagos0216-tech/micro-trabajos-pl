-- ============================================================
-- 1. CATEGORÍAS EN ÁRBOL, POR SECCIÓN
-- ============================================================
alter table public.categories
  add column if not exists parent_id int references public.categories(id) on delete cascade,
  add column if not exists section text not null default 'jobs' check (section in ('jobs', 'sale', 'rent')),
  add column if not exists name_es text,
  add column if not exists name_en text;

update public.categories set name_es = 'Limpieza', name_en = 'Cleaning' where slug = 'limpieza';
update public.categories set name_es = 'Mudanzas', name_en = 'Removals' where slug = 'mudanzas';
update public.categories set name_es = 'Conducción', name_en = 'Driving' where slug = 'conduccion';
update public.categories set name_es = 'Eventos', name_en = 'Events' where slug = 'eventos';
update public.categories set name_es = 'Reformas', name_en = 'Renovation' where slug = 'reformas';
update public.categories set name_es = 'Hostelería', name_en = 'Hospitality' where slug = 'hosteleria';
update public.categories set name_es = 'Traducción', name_en = 'Translation' where slug = 'tlumaczenia';
update public.categories set name_es = 'Belleza', name_en = 'Beauty' where slug = 'uroda';
update public.categories set name_es = 'Trabajo virtual', name_en = 'Remote work' where slug = 'praca-zdalna';
update public.categories set name_es = 'Educación', name_en = 'Education' where slug = 'edukacja';

-- Raíces de compraventa y alquiler
insert into public.categories (name, slug, section, name_es, name_en) values
  ('Motoryzacja', 'motoryzacja', 'sale', 'Motor', 'Motors'),
  ('Elektronika', 'elektronika', 'sale', 'Electrónica', 'Electronics'),
  ('Dom i ogród', 'dom-i-ogrod', 'sale', 'Hogar y jardín', 'Home and garden'),
  ('Moda', 'moda', 'sale', 'Moda', 'Fashion'),
  ('Dzieci', 'dzieci', 'sale', 'Niños', 'Kids'),
  ('Sport i hobby', 'sport-i-hobby', 'sale', 'Deporte y ocio', 'Sport and hobbies'),
  ('Zwierzęta', 'zwierzeta', 'sale', 'Animales', 'Animals'),
  ('Nieruchomości na sprzedaż', 'nieruchomosci-sprzedaz', 'sale', 'Inmuebles en venta', 'Real estate for sale'),
  ('Nieruchomości do wynajęcia', 'nieruchomosci-wynajem', 'rent', 'Alquiler', 'Rentals')
on conflict (slug) do nothing;

-- Subcategorías
insert into public.categories (name, slug, section, parent_id, name_es, name_en)
select v.name, v.slug, v.section, p.id, v.name_es, v.name_en
from (values
  ('Samochody osobowe', 'samochody', 'sale', 'motoryzacja', 'Coches', 'Cars'),
  ('Motocykle', 'motocykle', 'sale', 'motoryzacja', 'Motos', 'Motorcycles'),
  ('Części samochodowe', 'czesci-samochodowe', 'sale', 'motoryzacja', 'Recambios', 'Car parts'),
  ('Dostawcze i ciężarowe', 'dostawcze', 'sale', 'motoryzacja', 'Furgonetas y camiones', 'Vans and trucks'),
  ('Telefony', 'telefony', 'sale', 'elektronika', 'Teléfonos', 'Phones'),
  ('Komputery i laptopy', 'komputery', 'sale', 'elektronika', 'Ordenadores y portátiles', 'Computers and laptops'),
  ('Telewizory i audio', 'telewizory-audio', 'sale', 'elektronika', 'TV y audio', 'TV and audio'),
  ('Konsole i gry', 'konsole', 'sale', 'elektronika', 'Consolas y juegos', 'Consoles and games'),
  ('Aparaty i foto', 'aparaty', 'sale', 'elektronika', 'Cámaras y foto', 'Cameras and photo'),
  ('Meble', 'meble', 'sale', 'dom-i-ogrod', 'Muebles', 'Furniture'),
  ('AGD', 'agd', 'sale', 'dom-i-ogrod', 'Electrodomésticos', 'Appliances'),
  ('Ogród', 'ogrod', 'sale', 'dom-i-ogrod', 'Jardín', 'Garden'),
  ('Ubrania damskie', 'ubrania-damskie', 'sale', 'moda', 'Ropa de mujer', 'Women''s clothing'),
  ('Ubrania męskie', 'ubrania-meskie', 'sale', 'moda', 'Ropa de hombre', 'Men''s clothing'),
  ('Obuwie', 'obuwie', 'sale', 'moda', 'Calzado', 'Shoes'),
  ('Ubrania dziecięce', 'ubrania-dzieciece', 'sale', 'dzieci', 'Ropa infantil', 'Children''s clothing'),
  ('Wózki i foteliki', 'wozki', 'sale', 'dzieci', 'Carritos y sillas', 'Strollers and car seats'),
  ('Zabawki', 'zabawki', 'sale', 'dzieci', 'Juguetes', 'Toys'),
  ('Rowery', 'rowery', 'sale', 'sport-i-hobby', 'Bicicletas', 'Bicycles'),
  ('Fitness', 'fitness', 'sale', 'sport-i-hobby', 'Fitness', 'Fitness'),
  ('Instrumenty muzyczne', 'instrumenty', 'sale', 'sport-i-hobby', 'Instrumentos', 'Musical instruments'),
  ('Zwierzęta domowe', 'zwierzeta-domowe', 'sale', 'zwierzeta', 'Mascotas', 'Pets'),
  ('Akcesoria dla zwierząt', 'akcesoria-zwierzeta', 'sale', 'zwierzeta', 'Accesorios para mascotas', 'Pet accessories'),
  ('Mieszkania na sprzedaż', 'mieszkania-sprzedaz', 'sale', 'nieruchomosci-sprzedaz', 'Pisos en venta', 'Flats for sale'),
  ('Domy na sprzedaż', 'domy-sprzedaz', 'sale', 'nieruchomosci-sprzedaz', 'Casas en venta', 'Houses for sale'),
  ('Działki', 'dzialki', 'sale', 'nieruchomosci-sprzedaz', 'Terrenos', 'Plots of land'),
  ('Lokale użytkowe na sprzedaż', 'lokale-sprzedaz', 'sale', 'nieruchomosci-sprzedaz', 'Locales comerciales en venta', 'Commercial premises for sale'),
  ('Mieszkania do wynajęcia', 'mieszkania-wynajem', 'rent', 'nieruchomosci-wynajem', 'Pisos en alquiler', 'Flats to rent'),
  ('Domy do wynajęcia', 'domy-wynajem', 'rent', 'nieruchomosci-wynajem', 'Casas en alquiler', 'Houses to rent'),
  ('Pokoje do wynajęcia', 'pokoje-wynajem', 'rent', 'nieruchomosci-wynajem', 'Habitaciones en alquiler', 'Rooms to rent'),
  ('Lokale użytkowe do wynajęcia', 'lokale-wynajem', 'rent', 'nieruchomosci-wynajem', 'Locales en alquiler', 'Commercial premises to rent'),
  ('Garaże i miejsca parkingowe', 'garaze-wynajem', 'rent', 'nieruchomosci-wynajem', 'Garajes y plazas de parking', 'Garages and parking spaces')
) as v(name, slug, section, parent_slug, name_es, name_en)
join public.categories p on p.slug = v.parent_slug
on conflict (slug) do nothing;

-- ============================================================
-- 2. LOCALIDADES DE POLONIA (GeoNames)
-- ============================================================
create table public.localities (
  id int primary key,
  name text not null,
  name_norm text not null,
  voivodeship text,
  lat double precision not null,
  lng double precision not null,
  population int not null default 0
);

create index localities_name_norm_idx on public.localities (name_norm text_pattern_ops);

alter table public.localities enable row level security;
create policy "Localidades visibles" on public.localities for select using (true);

-- ============================================================
-- 3. ANUNCIOS DE COMPRAVENTA
-- ============================================================
create table public.sale_listings (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category_id int not null references public.categories(id),
  locality_id int references public.localities(id),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) <= 5000),
  price_pln numeric(12,2) not null check (price_pln >= 0),
  price_negotiable boolean not null default false,
  condition text check (condition in ('new', 'used', 'for_parts')),
  attributes jsonb not null default '{}'::jsonb,
  original_lang text not null default 'pl' check (original_lang in ('pl', 'es', 'en')),
  lat double precision,
  lng double precision,
  status text not null default 'active' check (status in ('active', 'paused', 'closed', 'sold')),
  featured_until timestamptz,
  bumped_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index sale_listings_geo_idx on public.sale_listings (lat, lng);
create index sale_listings_category_idx on public.sale_listings (category_id);

alter table public.sale_listings enable row level security;
create policy "Ver anuncios de venta" on public.sale_listings for select
  using (status = 'active' or auth.uid() = author_id);
create policy "Crear anuncios de venta" on public.sale_listings for insert
  with check (auth.uid() = author_id);
create policy "Editar mis anuncios de venta" on public.sale_listings for update
  using (auth.uid() = author_id);
create policy "Borrar mis anuncios de venta" on public.sale_listings for delete
  using (auth.uid() = author_id);

revoke update on public.sale_listings from authenticated;
grant update (title, description, category_id, locality_id, price_pln, price_negotiable, condition, attributes, status, bumped_at)
  on public.sale_listings to authenticated;

-- ============================================================
-- 4. ANUNCIOS DE ALQUILER
-- ============================================================
create table public.rental_listings (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category_id int not null references public.categories(id),
  locality_id int references public.localities(id),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) <= 5000),
  rent_pln numeric(10,2) not null check (rent_pln > 0),
  deposit_pln numeric(10,2) check (deposit_pln >= 0),
  rooms smallint check (rooms >= 0),
  area_m2 smallint check (area_m2 > 0),
  furnished boolean,
  bills_included boolean,
  attributes jsonb not null default '{}'::jsonb,
  original_lang text not null default 'pl' check (original_lang in ('pl', 'es', 'en')),
  lat double precision,
  lng double precision,
  status text not null default 'active' check (status in ('active', 'paused', 'closed', 'rented')),
  featured_until timestamptz,
  bumped_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index rental_listings_geo_idx on public.rental_listings (lat, lng);
create index rental_listings_category_idx on public.rental_listings (category_id);

alter table public.rental_listings enable row level security;
create policy "Ver anuncios de alquiler" on public.rental_listings for select
  using (status = 'active' or auth.uid() = author_id);
create policy "Crear anuncios de alquiler" on public.rental_listings for insert
  with check (auth.uid() = author_id);
create policy "Editar mis anuncios de alquiler" on public.rental_listings for update
  using (auth.uid() = author_id);
create policy "Borrar mis anuncios de alquiler" on public.rental_listings for delete
  using (auth.uid() = author_id);

revoke update on public.rental_listings from authenticated;
grant update (title, description, category_id, locality_id, rent_pln, deposit_pln, rooms, area_m2, furnished, bills_included, attributes, status, bumped_at)
  on public.rental_listings to authenticated;

-- ============================================================
-- 5. FOTOS PARA LOS TRES TIPOS DE ANUNCIO
-- ============================================================
create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  job_post_id uuid references public.job_posts(id) on delete cascade,
  sale_listing_id uuid references public.sale_listings(id) on delete cascade,
  rental_listing_id uuid references public.rental_listings(id) on delete cascade,
  storage_path text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  check (num_nonnulls(job_post_id, sale_listing_id, rental_listing_id) = 1)
);

alter table public.listing_photos enable row level security;
create policy "Ver fotos" on public.listing_photos for select using (true);
create policy "Añadir mis fotos" on public.listing_photos for insert with check (auth.uid() = author_id);
create policy "Borrar mis fotos" on public.listing_photos for delete using (auth.uid() = author_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Leer fotos de anuncios" on storage.objects for select
  using (bucket_id = 'listing-photos');
create policy "Subir mis fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Borrar mis fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
