-- ROLES ---------------------------------------------------------------
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Admins can view roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- shared updated_at trigger -------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- CATEGORIES ----------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  category_name text not null,
  slug text not null unique,
  icon text not null default '',
  description text not null default '',
  category_image text,
  card_image text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;

create policy "Categories are publicly viewable"
on public.categories for select to anon, authenticated using (true);

create policy "Admins manage categories"
on public.categories for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create trigger categories_updated_at before update on public.categories
for each row execute function public.update_updated_at_column();

-- PRODUCTS ------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  slug text not null unique,
  description text not null default '',
  specifications jsonb not null default '{}'::jsonb,
  price numeric(12,2) not null default 0,
  discount_price numeric(12,2),
  category_id uuid references public.categories(id) on delete set null,
  brand text not null default '',
  model text not null default '',
  stock integer not null default 0,
  image_url text,
  images text[] not null default '{}',
  processor text,
  ram text,
  storage text,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_new_arrival boolean not null default false,
  is_special_offer boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_brand_idx on public.products(brand);

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create policy "Products are publicly viewable"
on public.products for select to anon, authenticated using (true);

create policy "Admins manage products"
on public.products for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create trigger products_updated_at before update on public.products
for each row execute function public.update_updated_at_column();

-- ORDERS --------------------------------------------------------------
create sequence public.order_number_seq start 1;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default 'ICT' || lpad(nextval('public.order_number_seq')::text, 6, '0'),
  customer_name text not null,
  phone text not null,
  email text not null default '',
  address text not null,
  city text not null default '',
  notes text not null default '',
  products jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  delivery_charge numeric(12,2) not null default 500,
  total numeric(12,2) not null default 0,
  payment_method text not null default 'Cash on Delivery',
  order_status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant usage on sequence public.order_number_seq to anon, authenticated, service_role;
grant insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create policy "Anyone can place an order"
on public.orders for insert to anon, authenticated with check (true);

create policy "Admins can view orders"
on public.orders for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update orders"
on public.orders for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete orders"
on public.orders for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create trigger orders_updated_at before update on public.orders
for each row execute function public.update_updated_at_column();

-- SITE CONTENT --------------------------------------------------------
create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  content_type text not null default 'page',
  title text not null default '',
  body text not null default '',
  data jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.site_content to anon;
grant select, insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;
alter table public.site_content enable row level security;

create policy "Published content is publicly viewable"
on public.site_content for select to anon, authenticated
using (is_published = true);

create policy "Admins can view all content"
on public.site_content for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage content"
on public.site_content for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create trigger site_content_updated_at before update on public.site_content
for each row execute function public.update_updated_at_column();

-- SEED: categories ----------------------------------------------------
insert into public.categories (category_name, slug, icon, description, display_order) values
  ('Laptops & Computers', 'laptops-computers', '💻', 'Laptops, desktops and workstations', 1),
  ('Monitors', 'monitors', '🖥', 'Office, design and gaming displays', 2),
  ('Computer Accessories', 'accessories', '🖱', 'Keyboards, mice, cables and more', 3),
  ('Networking', 'networking', '🌐', 'Routers, switches and access points', 4),
  ('Printers', 'printers', '🖨', 'Inkjet, laser and all-in-one printers', 5),
  ('Gaming', 'gaming', '🎮', 'Gaming gear and performance parts', 6),
  ('Storage', 'storage', '💾', 'SSD, HDD, RAM and USB devices', 7),
  ('Mobile Accessories', 'mobile-accessories', '📱', 'Chargers, cases and power banks', 8),
  ('CCTV & Smart Devices', 'cctv-smart', '📹', 'Cameras, NVRs and smart home', 9),
  ('Office Solutions', 'office-solutions', '🏢', 'Office equipment and supplies', 10);

-- SEED: policies & settings -------------------------------------------
insert into public.site_content (content_key, content_type, title, body, display_order) values
  ('refund-policy', 'policy', 'Refund Policy', 'Refunds are issued only for damaged products, wrong products delivered, or confirmed manufacturing defects.

- You must contact us within the allowed return period from the delivery date.
- Every item must be inspected by our team before a refund is approved.
- Refund processing begins only after approval of the inspection.
- Customer misuse, physical damage, missing accessories and unauthorized repairs are not covered.', 1),
  ('return-policy', 'policy', 'Return Policy', 'Returns are accepted for damaged, incorrect or defective products.

- Contact us with your order number and photos of the item.
- The product must be returned in its original packaging with all accessories.
- Returns are approved after inspection by our technical team.
- Items damaged by misuse, liquid or unauthorized repair cannot be returned.', 2),
  ('warranty-policy', 'policy', 'Warranty Policy', 'Warranty is provided according to the manufacturer''s terms and conditions.

Not covered under warranty:
- Physical damage
- Liquid damage
- Power and electrical issues
- Unauthorized repairs
- Misuse or negligence
- Software problems', 3),
  ('delivery-policy', 'policy', 'Delivery Policy', 'A fixed delivery charge of LKR 500 applies to every order and is paid by the customer.

- Orders are confirmed by phone before dispatch.
- Delivery is normally completed within 2-4 working days.
- Payment method: Cash on Delivery.', 4),
  ('privacy-policy', 'policy', 'Privacy Policy', 'We collect only the details needed to process and deliver your order: name, phone number, email address and delivery address.

- Your details are never sold or shared for marketing.
- Information is used for order processing, delivery and support only.
- You may request removal of your details at any time.', 5),
  ('terms-conditions', 'policy', 'Terms & Conditions', 'By placing an order on this website you agree to the following:

- Prices, specifications and stock availability may change without notice.
- Orders are confirmed only after our team contacts you.
- A fixed delivery charge of LKR 500 applies to all orders.
- Warranty, return and refund terms as published on this site apply to every purchase.', 6);

insert into public.site_content (content_key, content_type, title, body, data) values
  ('store-settings', 'settings', 'Store Settings', '', jsonb_build_object(
    'whatsapp_number', '94710672207',
    'admin_email', 'ameerjezme@gmail.com',
    'delivery_charge', 500,
    'currency', 'LKR'
  )),
  ('hero', 'banner', 'Technology, beautifully delivered', 'Premium ICT products with island-wide delivery and cash on delivery.', jsonb_build_object('cta_label','Shop Now'));