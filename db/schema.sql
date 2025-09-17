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

