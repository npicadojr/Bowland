create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table menu_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references menu_categories(id) on delete set null,
  price numeric(10,2),
  description text,
  image_url text,
  available boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table menu_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  type text not null check (type in ('discount', 'event')),
  starts_at date not null,
  expires_at date not null,
  active boolean default true,
  created_at timestamptz default now(),
  constraint promotions_valid_dates check (expires_at >= starts_at)
);

create or replace function is_menu_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from menu_admins
    where user_id = auth.uid()
  );
$$;

-- Row Level Security: lectura pública y escritura solo para admins
alter table menu_categories enable row level security;
alter table menu_products enable row level security;
alter table menu_admins enable row level security;
alter table promotions enable row level security;

create policy "public read categories"
  on menu_categories for select using (true);

create policy "public read products"
  on menu_products for select using (true);

drop policy if exists "public read promotions" on promotions;
drop policy if exists "menu admins manage promotions" on promotions;

create policy "public read promotions"
  on promotions for select using (true);

create policy "menu admins manage categories"
  on menu_categories for all
  to authenticated
  using (is_menu_admin())
  with check (is_menu_admin());

create policy "menu admins manage products"
  on menu_products for all
  to authenticated
  using (is_menu_admin())
  with check (is_menu_admin());

create policy "menu admins manage promotions"
  on promotions for all
  to authenticated
  using (is_menu_admin())
  with check (is_menu_admin());

create policy "menu admins read admin list"
  on menu_admins for select
  to authenticated
  using (is_menu_admin());

insert into storage.buckets (id, name, public)
values ('menu-product-images', 'menu-product-images', true)
on conflict (id) do update
set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('promotion-images', 'promotion-images', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "public read menu product images" on storage.objects;
drop policy if exists "menu admins upload product images" on storage.objects;
drop policy if exists "menu admins update product images" on storage.objects;
drop policy if exists "menu admins delete product images" on storage.objects;
drop policy if exists "public read promotion images" on storage.objects;
drop policy if exists "menu admins upload promotion images" on storage.objects;
drop policy if exists "menu admins update promotion images" on storage.objects;
drop policy if exists "menu admins delete promotion images" on storage.objects;

create policy "public read menu product images"
  on storage.objects for select
  using (bucket_id = 'menu-product-images');

create policy "menu admins upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-product-images' and public.is_menu_admin());

create policy "menu admins update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-product-images' and public.is_menu_admin())
  with check (bucket_id = 'menu-product-images' and public.is_menu_admin());

create policy "menu admins delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-product-images' and public.is_menu_admin());

create policy "public read promotion images"
  on storage.objects for select
  using (bucket_id = 'promotion-images');

create policy "menu admins upload promotion images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'promotion-images' and public.is_menu_admin());

create policy "menu admins update promotion images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'promotion-images' and public.is_menu_admin())
  with check (bucket_id = 'promotion-images' and public.is_menu_admin());

create policy "menu admins delete promotion images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'promotion-images' and public.is_menu_admin());
