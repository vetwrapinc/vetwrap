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

