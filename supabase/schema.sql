-- ============================================================
-- MediaHub — Complete Schema (Safe to re-run)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists admin_emails (
  email text primary key
);

create table if not exists movies (
  id            uuid primary key default uuid_generate_v4(),
  tmdb_id       integer unique,
  title         text not null,
  overview      text,
  release_date  date,
  backdrop_path text,
  poster_url    text,
  genres        text[] default '{}',
  created_at    timestamptz default now()
);

create table if not exists persons (
  id            uuid primary key default uuid_generate_v4(),
  tmdb_id       integer unique,
  name          text not null,
  profile_path  text,
  department    text default 'Acting',
  created_at    timestamptz default now()
);

create table if not exists movie_person (
  id         uuid primary key default uuid_generate_v4(),
  movie_id   uuid references movies(id) on delete cascade,
  person_id  uuid references persons(id) on delete cascade,
  role       text default 'cast',
  unique(movie_id, person_id)
);

create table if not exists movie_assets (
  id         uuid primary key default uuid_generate_v4(),
  movie_id   uuid references movies(id) on delete cascade,
  type       text check (type in ('poster','wallpaper','logo')) not null,
  image_url  text not null,
  created_at timestamptz default now()
);

create table if not exists person_assets (
  id         uuid primary key default uuid_generate_v4(),
  person_id  uuid references persons(id) on delete cascade,
  movie_id   uuid references movies(id) on delete set null,
  image_url  text not null,
  created_at timestamptz default now()
);

create table if not exists music_links (
  id         uuid primary key default uuid_generate_v4(),
  movie_id   uuid references movies(id) on delete cascade,
  platform   text not null,
  type       text check (type in ('OST','BGM')) not null,
  url        text not null,
  created_at timestamptz default now()
);

create table if not exists sections (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  is_active  boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists section_items (
  id         uuid primary key default uuid_generate_v4(),
  section_id uuid references sections(id) on delete cascade,
  ref_id     uuid not null,
  ref_type   text check (ref_type in ('movie','person')) not null,
  sort_order integer default 0
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_movies_tmdb_id       on movies(tmdb_id);
create index if not exists idx_persons_tmdb_id      on persons(tmdb_id);
create index if not exists idx_movie_assets_movie   on movie_assets(movie_id);
create index if not exists idx_movie_assets_type    on movie_assets(type);
create index if not exists idx_person_assets_person on person_assets(person_id);
create index if not exists idx_music_links_movie    on music_links(movie_id);
create index if not exists idx_section_items_sec    on section_items(section_id);

-- ============================================================
-- ENABLE RLS
-- ============================================================

alter table admin_emails  enable row level security;
alter table movies        enable row level security;
alter table persons       enable row level security;
alter table movie_person  enable row level security;
alter table movie_assets  enable row level security;
alter table person_assets enable row level security;
alter table music_links   enable row level security;
alter table sections      enable row level security;
alter table section_items enable row level security;

-- ============================================================
-- DROP ALL EXISTING POLICIES (safe re-run)
-- ============================================================

drop policy if exists "Admin read admin_emails"    on admin_emails;

drop policy if exists "Public read movies"         on movies;
drop policy if exists "Admin insert movies"        on movies;
drop policy if exists "Admin update movies"        on movies;
drop policy if exists "Admin delete movies"        on movies;

drop policy if exists "Public read persons"        on persons;
drop policy if exists "Admin insert persons"       on persons;
drop policy if exists "Admin update persons"       on persons;
drop policy if exists "Admin delete persons"       on persons;

drop policy if exists "Public read movie_person"   on movie_person;
drop policy if exists "Admin insert movie_person"  on movie_person;
drop policy if exists "Admin update movie_person"  on movie_person;
drop policy if exists "Admin delete movie_person"  on movie_person;

drop policy if exists "Public read movie_assets"   on movie_assets;
drop policy if exists "Admin insert movie_assets"  on movie_assets;
drop policy if exists "Admin delete movie_assets"  on movie_assets;

drop policy if exists "Public read person_assets"  on person_assets;
drop policy if exists "Admin insert person_assets" on person_assets;
drop policy if exists "Admin delete person_assets" on person_assets;

drop policy if exists "Public read music_links"    on music_links;
drop policy if exists "Admin insert music_links"   on music_links;
drop policy if exists "Admin update music_links"   on music_links;
drop policy if exists "Admin delete music_links"   on music_links;

drop policy if exists "Public read sections"       on sections;
drop policy if exists "Admin insert sections"      on sections;
drop policy if exists "Admin update sections"      on sections;
drop policy if exists "Admin delete sections"      on sections;

drop policy if exists "Public read section_items"  on section_items;
drop policy if exists "Admin insert section_items" on section_items;
drop policy if exists "Admin delete section_items" on section_items;

drop policy if exists "Public read movie-assets"   on storage.objects;
drop policy if exists "Admin upload movie-assets"  on storage.objects;
drop policy if exists "Admin delete movie-assets"  on storage.objects;
drop policy if exists "Public read person-assets"  on storage.objects;
drop policy if exists "Admin upload person-assets" on storage.objects;
drop policy if exists "Admin delete person-assets" on storage.objects;

-- ============================================================
-- is_admin() FUNCTION
-- ============================================================

drop function if exists is_admin();

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admin_emails
    where email = auth.jwt() ->> 'email'
  );
$$;

-- ============================================================
-- POLICIES — admin_emails
-- ============================================================

create policy "Admin read admin_emails"
  on admin_emails for select using (is_admin());

-- ============================================================
-- POLICIES — public read
-- ============================================================

create policy "Public read movies"
  on movies for select using (true);

create policy "Public read persons"
  on persons for select using (true);

create policy "Public read movie_person"
  on movie_person for select using (true);

create policy "Public read movie_assets"
  on movie_assets for select using (true);

create policy "Public read person_assets"
  on person_assets for select using (true);

create policy "Public read music_links"
  on music_links for select using (true);

create policy "Public read sections"
  on sections for select using (is_active = true or is_admin());

create policy "Public read section_items"
  on section_items for select using (true);

-- ============================================================
-- POLICIES — admin write
-- ============================================================

create policy "Admin insert movies" on movies for insert with check (is_admin());
create policy "Admin update movies" on movies for update using (is_admin());
create policy "Admin delete movies" on movies for delete using (is_admin());

create policy "Admin insert persons" on persons for insert with check (is_admin());
create policy "Admin update persons" on persons for update using (is_admin());
create policy "Admin delete persons" on persons for delete using (is_admin());

create policy "Admin insert movie_person" on movie_person for insert with check (is_admin());
create policy "Admin update movie_person" on movie_person for update using (is_admin());
create policy "Admin delete movie_person" on movie_person for delete using (is_admin());

create policy "Admin insert movie_assets" on movie_assets for insert with check (is_admin());
create policy "Admin delete movie_assets" on movie_assets for delete using (is_admin());

create policy "Admin insert person_assets" on person_assets for insert with check (is_admin());
create policy "Admin delete person_assets" on person_assets for delete using (is_admin());

create policy "Admin insert music_links" on music_links for insert with check (is_admin());
create policy "Admin update music_links" on music_links for update using (is_admin());
create policy "Admin delete music_links" on music_links for delete using (is_admin());

create policy "Admin insert sections" on sections for insert with check (is_admin());
create policy "Admin update sections" on sections for update using (is_admin());
create policy "Admin delete sections" on sections for delete using (is_admin());

create policy "Admin insert section_items" on section_items for insert with check (is_admin());
create policy "Admin delete section_items" on section_items for delete using (is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public)
values ('movie-assets', 'movie-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('person-assets', 'person-assets', true)
on conflict (id) do nothing;

create policy "Public read movie-assets"
  on storage.objects for select
  using (bucket_id = 'movie-assets');

create policy "Admin upload movie-assets"
  on storage.objects for insert
  with check (bucket_id = 'movie-assets' and is_admin());

create policy "Admin delete movie-assets"
  on storage.objects for delete
  using (bucket_id = 'movie-assets' and is_admin());

create policy "Public read person-assets"
  on storage.objects for select
  using (bucket_id = 'person-assets');

create policy "Admin upload person-assets"
  on storage.objects for insert
  with check (bucket_id = 'person-assets' and is_admin());

create policy "Admin delete person-assets"
  on storage.objects for delete
  using (bucket_id = 'person-assets' and is_admin());

-- ============================================================
-- ADMIN EMAIL
-- ============================================================

insert into admin_emails (email) values ('sathyaccn@gmail.com')
on conflict (email) do nothing;

-- ============================================================
-- VERIFY
-- ============================================================

select * from admin_emails;
select tablename from pg_tables where schemaname = 'public' order by tablename;
