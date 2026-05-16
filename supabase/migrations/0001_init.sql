-- Hone — initial schema with RLS
-- All user-scoped tables enforce `auth.uid() = user_id`. Service role is used
-- only from Edge Functions, never from the client.

-- Extensions
create extension if not exists pgcrypto;

-- =========================================================================
-- profiles
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text,
  locale text default 'en',
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-insert profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- assessments
-- =========================================================================
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null,
  score int,
  recommended_level text check (recommended_level in ('beginner','intermediate','advanced')),
  created_at timestamptz not null default now()
);

create index on public.assessments(user_id, created_at desc);

alter table public.assessments enable row level security;

create policy "assessments_owner_all" on public.assessments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- exercises (read-only catalog)
-- =========================================================================
create table public.exercises (
  slug text primary key,
  name text not null,
  description text,
  difficulty int not null check (difficulty between 1 and 5),
  phase_template jsonb not null
);

alter table public.exercises enable row level security;

create policy "exercises_read_all_auth" on public.exercises
  for select to authenticated using (true);
-- writes are service-role only (no public policy)

-- =========================================================================
-- programs + program_days
-- =========================================================================
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  level text not null check (level in ('beginner','intermediate','advanced')),
  weeks int not null default 8 check (weeks > 0 and weeks <= 52),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index programs_one_active_per_user
  on public.programs(user_id) where active;

alter table public.programs enable row level security;

create policy "programs_owner_all" on public.programs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.program_days (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, -- denormalized for RLS perf
  day_index int not null check (day_index >= 0),
  exercises jsonb not null,
  target_duration_s int not null check (target_duration_s > 0),
  unique (program_id, day_index)
);

create index on public.program_days(user_id, day_index);

alter table public.program_days enable row level security;

create policy "program_days_owner_all" on public.program_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- sessions (workout logs)
-- =========================================================================
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_day_id uuid references public.program_days(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  completed boolean not null default false,
  mode text not null check (mode in ('normal','stealth')),
  reps_planned int,
  reps_completed int,
  perceived_effort int check (perceived_effort between 1 and 5),
  metrics jsonb,
  created_at timestamptz not null default now()
);

create index on public.sessions(user_id, started_at desc);

alter table public.sessions enable row level security;

create policy "sessions_owner_all" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- streaks (maintained by trigger on sessions)
-- =========================================================================
create table public.streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current int not null default 0,
  longest int not null default 0,
  last_session_date date
);

alter table public.streaks enable row level security;

create policy "streaks_owner_select" on public.streaks
  for select using (auth.uid() = user_id);
-- writes only via the SECURITY DEFINER trigger

-- =========================================================================
-- settings (server-synced subset)
-- =========================================================================
create table public.settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  reminder_time time,
  reminder_enabled boolean not null default true,
  analytics_opt_in boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "settings_owner_all" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
