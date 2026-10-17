-- Ciudades
create table public.cities (
  id serial primary key,
  name text not null unique,
  slug text not null unique
);

-- Categorías de trabajo
create table public.categories (
  id serial primary key,
  name text not null,
  slug text not null unique
);

-- Perfiles (vinculados a auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city_id int references public.cities(id),
  bio text,
  languages text[] not null default '{}',
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ofertas (featured_until controla los destacados)
create table public.job_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  city_id int not null references public.cities(id),
  category_id int not null references public.categories(id),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) <= 5000),
  pay_type text not null check (pay_type in ('hour', 'project')),
  pay_pln numeric(10,2) not null check (pay_pln > 0),
  status text not null default 'active' check (status in ('active', 'paused', 'closed')),
  featured_until timestamptz,
  bumped_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index job_posts_featured_idx on public.job_posts (featured_until);

-- Postulaciones
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_posts(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);

-- Reseñas
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.job_posts(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  check (reviewer_id <> reviewed_id)
);

-- Pedidos de pago (solo los escribe el servidor con service_role)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.job_posts(id) on delete set null,
  type text not null check (type in ('featured')),
  amount int,
  currency text,
  created_at timestamptz not null default now()
);

-- Crear perfil automáticamente al registrarse
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.job_posts enable row level security;
alter table public.applications enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;

-- Lectura pública
create policy "Ciudades visibles" on public.cities for select using (true);
create policy "Categorías visibles" on public.categories for select using (true);
create policy "Perfiles visibles" on public.profiles for select using (true);
create policy "Ofertas activas visibles" on public.job_posts
  for select using (status = 'active' or auth.uid() = author_id);
create policy "Reseñas visibles" on public.reviews for select using (true);

-- Perfiles: cada usuario edita solo el suyo
create policy "Editar mi perfil" on public.profiles for update using (auth.uid() = id);

-- Ofertas: solo el autor crea, edita y borra
create policy "Crear ofertas" on public.job_posts for insert with check (auth.uid() = author_id);
create policy "Editar mis ofertas" on public.job_posts for update using (auth.uid() = author_id);
create policy "Borrar mis ofertas" on public.job_posts for delete using (auth.uid() = author_id);

-- Postulaciones: el solicitante crea; él y el autor de la oferta ven
create policy "Postularme" on public.applications for insert with check (auth.uid() = applicant_id);
create policy "Ver postulaciones relacionadas" on public.applications for select using (
  auth.uid() = applicant_id
  or auth.uid() in (select author_id from public.job_posts where id = job_id)
);

-- Reseñas: solo como uno mismo
create policy "Escribir reseñas" on public.reviews for insert with check (auth.uid() = reviewer_id);

-- Cada usuario ve solo sus pedidos
create policy "Ver mis pedidos" on public.orders for select using (auth.uid() = user_id);

-- Protección: el autor NO puede tocar featured_until
revoke update on public.job_posts from authenticated;
grant update (title, description, city_id, category_id, pay_type, pay_pln, status, bumped_at)
  on public.job_posts to authenticated;

-- Protección: el usuario NO puede marcarse como verificado
revoke update on public.profiles from authenticated;
grant update (full_name, phone, city_id, bio, languages)
  on public.profiles to authenticated;

-- Datos iniciales
insert into public.cities (name, slug) values
  ('Varsovia', 'varsovia'),
  ('Cracovia', 'cracovia'),
  ('Wrocław', 'wroclaw'),
  ('Poznań', 'poznan'),
  ('Gdańsk', 'gdansk'),
  ('Katowice', 'katowice');

insert into public.categories (name, slug) values
  ('Limpieza', 'limpieza'),
  ('Mudanzas', 'mudanzas'),
  ('Conducción', 'conduccion'),
  ('Eventos', 'eventos'),
  ('Reformas', 'reformas'),
  ('Hostelería', 'hosteleria');
