alter table public.cities
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table public.job_posts
  add column if not exists lat double precision,
  add column if not exists lng double precision;

create index if not exists job_posts_geo_idx on public.job_posts (lat, lng);

-- Ciudades ya existentes
update public.cities set lat = 52.2297, lng = 21.0122 where slug = 'varsovia';
update public.cities set lat = 50.0647, lng = 19.9450 where slug = 'cracovia';
update public.cities set lat = 51.1079, lng = 17.0385 where slug = 'wroclaw';
update public.cities set lat = 52.4064, lng = 16.9252 where slug = 'poznan';
update public.cities set lat = 54.3520, lng = 18.6466 where slug = 'gdansk';
update public.cities set lat = 50.2649, lng = 19.0238 where slug = 'katowice';

-- Más ciudades para cubrir Polonia
insert into public.cities (name, slug, lat, lng) values
  ('Łódź', 'lodz', 51.7592, 19.4560),
  ('Lublin', 'lublin', 51.2465, 22.5684),
  ('Białystok', 'bialystok', 53.1325, 23.1688),
  ('Szczecin', 'szczecin', 53.4285, 14.5528),
  ('Bydgoszcz', 'bydgoszcz', 53.1235, 18.0084),
  ('Toruń', 'torun', 53.0138, 18.5984),
  ('Rzeszów', 'rzeszow', 50.0412, 21.9991),
  ('Olsztyn', 'olsztyn', 53.7784, 20.4801),
  ('Kielce', 'kielce', 50.8661, 20.6286),
  ('Opole', 'opole', 50.6751, 17.9213),
  ('Gorzów Wielkopolski', 'gorzow-wielkopolski', 52.7368, 15.2288),
  ('Zielona Góra', 'zielona-gora', 51.9356, 15.5062),
  ('Gdynia', 'gdynia', 54.5189, 18.5305),
  ('Sopot', 'sopot', 54.4418, 18.5601),
  ('Częstochowa', 'czestochowa', 50.8118, 19.1203),
  ('Radom', 'radom', 51.4027, 21.1471),
  ('Sosnowiec', 'sosnowiec', 50.2863, 19.1041),
  ('Gliwice', 'gliwice', 50.2945, 18.6714),
  ('Zabrze', 'zabrze', 50.3249, 18.7857),
  ('Bielsko-Biała', 'bielsko-biala', 49.8224, 19.0444),
  ('Tychy', 'tychy', 50.1369, 18.9637),
  ('Legnica', 'legnica', 51.2070, 16.1619),
  ('Wałbrzych', 'walbrzych', 50.7714, 16.2843),
  ('Płock', 'plock', 52.5468, 19.7064),
  ('Elbląg', 'elblag', 54.1561, 19.4044),
  ('Koszalin', 'koszalin', 54.1943, 16.1714),
  ('Słupsk', 'slupsk', 54.4641, 17.0287),
  ('Piła', 'pila', 53.1511, 16.7383),
  ('Kalisz', 'kalisz', 51.7611, 18.0910),
  ('Konin', 'konin', 52.2230, 18.2514),
  ('Ostrów Wielkopolski', 'ostrow-wielkopolski', 51.6536, 17.8089),
  ('Jelenia Góra', 'jelenia-gora', 50.9044, 15.7194)
on conflict (slug) do update set lat = excluded.lat, lng = excluded.lng;

-- Anuncios antiguos: se les asigna el centro de su ciudad
update public.job_posts j set lat = c.lat, lng = c.lng
from public.cities c
where c.id = j.city_id and j.lat is null;
