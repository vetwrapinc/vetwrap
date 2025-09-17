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

-- Portal authentication tables
create table if not exists public.portal_users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text not null unique,
  role text not null check (role in ('admin', 'employee', 'client')),
  password_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_users_role_idx on public.portal_users (role);
create index if not exists portal_users_email_idx on public.portal_users (lower(email));

create table if not exists public.portal_assignments (
  client_id uuid primary key references public.portal_users(id) on delete cascade,
  employee_id uuid references public.portal_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_assignments_employee_idx on public.portal_assignments (employee_id);

