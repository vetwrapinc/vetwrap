-- Supabase schema for VetWraps quotes
create extension if not exists "uuid-ossp";

create table if not exists public.quotes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  "projectType" text not null,
  notes text,
  rush boolean default false,
  "amountRush" integer default 0,
  ip text,
  "userAgent" text,
  "createdAt" timestamptz not null default now()
);

-- RLS optional; service role bypasses RLS. Enable if you plan row-level rules.
alter table public.quotes enable row level security;

-- For admin reads via service role, no special policy needed.
-- If you later allow client reads, add policies carefully.

-- Helpful index for time sorting
create index if not exists quotes_created_idx on public.quotes ("createdAt" desc);

-- Enhancements for admin workflow
alter table public.quotes add column if not exists status text default 'new'; -- new | in_progress | processed
alter table public.quotes add column if not exists "processedAt" timestamptz;
alter table public.quotes add column if not exists assignee text;
create index if not exists quotes_status_idx on public.quotes (status);

-- Employees directory for internal operations
create table if not exists public.employees (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  email text not null,
  role text not null,
  phone text,
  start_date date,
  status text not null default 'active', -- active | on_leave | former
  hourly_rate numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employees enable row level security;

create index if not exists employees_status_idx on public.employees (status);
create index if not exists employees_last_name_idx on public.employees (last_name);

-- Access control for Identity accounts (admins, employees, clients)
create table if not exists public.access_grants (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  name text,
  role text not null default 'client', -- admin | employee | client
  status text not null default 'active', -- active | suspended
  notes text,
  allow_password boolean default false,
  password_salt text,
  password_hash text,
  password_updated_at timestamptz,
  last_seen_at timestamptz,
  last_seen_ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.access_grants enable row level security;

create index if not exists access_grants_email_idx on public.access_grants (email);
create index if not exists access_grants_role_idx on public.access_grants (role);
create index if not exists access_grants_status_idx on public.access_grants (status);

-- Seed required access accounts
insert into public.access_grants (email, name, role, status, notes, allow_password, password_salt, password_hash, password_updated_at)
values
  (
    'vetwrapinc@gmail.com',
    'VetWrap Inc Owner',
    'admin',
    'active',
    'Primary administrator account',
    true,
    '0984451d4c8db88e69c525919215d027',
    'af48a4ab75c6f1ecd6788436c2e07b0eda9648c3eef66029640249df33a126963ed9e04db4cf861cb4a7ad39b0bae08af565a00d07aa8b92b983696aa264003f',
    now()
  ),
  (
    'cabletomusic@gmail.com',
    'Cableto Music',
    'employee',
    'active',
    'Team member access',
    true,
    'afeaf998c813d53b15047b9da6212e79',
    '507dd73fab2e91e517ec6c32f96678147a543b1c96175e84d072674478d69d6f22299147208d89b050efea2c1a93fac1ad100991855843a4e3e38cfccd5e64cf',
    now()
  )
on conflict (email) do update
set
  name = excluded.name,
  role = excluded.role,
  status = excluded.status,
  notes = excluded.notes,
  allow_password = excluded.allow_password,
  password_salt = excluded.password_salt,
  password_hash = excluded.password_hash,
  password_updated_at = excluded.password_updated_at,
  updated_at = now();

-- Ensure employee directory entry exists for Cableto Music
insert into public.employees (first_name, last_name, email, role, status, start_date, notes)
select 'Cableto', 'Music', 'cabletomusic@gmail.com', 'Employee', 'active', current_date, 'Imported from access grants'
where not exists (
  select 1 from public.employees where lower(email) = lower('cabletomusic@gmail.com')
);

