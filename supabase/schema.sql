-- Optional opt-in, approximate login-location events.
-- Paste into Supabase SQL Editor after creating a Supabase project.
create table if not exists public.login_locations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  latitude_approx numeric(4,1) not null check (latitude_approx between -90 and 90),
  longitude_approx numeric(4,1) not null check (longitude_approx between -180 and 180),
  created_at timestamptz not null default now()
);
create index if not exists login_locations_user_time_idx on public.login_locations(user_id,created_at desc);
alter table public.login_locations enable row level security;
-- Users may create and read their OWN opt-in location records.
create policy "create own approximate location" on public.login_locations for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "read own approximate locations" on public.login_locations for select to authenticated
  using ((select auth.uid()) = user_id);
-- Administrator role must be placed into auth.users.raw_app_meta_data by a trusted
-- server-side admin tool. NEVER allow a user to set their own app_metadata role.
create policy "admins read opt-in locations" on public.login_locations for select to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'admin');
-- Important: only approximate coordinates are written. No IP or precise address.
-- Implement retention/deletion and a privacy notice before using this with real users.
