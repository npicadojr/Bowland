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

create policy "public read categories"
  on menu_categories for select using (true);

create policy "public read products"
  on menu_products for select using (true);

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

create policy "menu admins read admin list"
  on menu_admins for select
  to authenticated
  using (is_menu_admin());
