-- Hone v1.1 — Pelvic Floor Index
-- A measured 3-test composite (reaction-time tap, endurance hold,
-- rapid-rep count) that replaces the survey-derived level recommender
-- and powers the weekly retest trend in app/(app)/progress.tsx.
--
-- Kept as a dedicated table (not extending public.assessments) because:
--   1. Index runs at weekly cadence; assessments are onboarding-only.
--   2. assessments.answers is now a narrow 3-key jsonb; mixing
--      measurement fields would blur the contract.
--   3. Trend queries become one table scan, not a jsonb projection.

create table public.pelvic_floor_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_ms int not null check (reaction_ms >= 0 and reaction_ms <= 5000),
  endurance_s numeric(5,2) not null check (endurance_s >= 0 and endurance_s <= 60),
  rapid_reps_10s int not null check (rapid_reps_10s >= 0 and rapid_reps_10s <= 60),
  composite numeric(5,2) not null check (composite >= 0 and composite <= 100),
  level text not null check (level in ('beginner','intermediate','advanced')),
  created_at timestamptz not null default now()
);

create index on public.pelvic_floor_assessments(user_id, created_at desc);

alter table public.pelvic_floor_assessments enable row level security;

create policy "pelvic_floor_assessments_owner_all" on public.pelvic_floor_assessments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
