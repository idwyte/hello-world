-- Hone v1.2 — Assessment pivot
-- Phase A of the assessment + AI plan rewrite. The v1.1 reaction-time /
-- endurance-hold / rapid-rep schema is replaced with two real
-- measurements that involve the muscle group being trained:
--
--   pulses_in_30s — count of contract-release cycles in a 30 s window
--   max_hold_s    — sustained-contraction time in seconds (cap 120)
--
-- The composite formula (lib/pelvic-floor-index.ts) now weights these
-- 40 % pulse / 60 % hold per Bø & Sherburn 2005. Level thresholds and
-- table location are unchanged.

-- Drop the old measurement columns. Existing rows are sacrificed —
-- there's no meaningful conversion from reaction-time to pulse count.
-- See docs/assessment-pivot-migration-2026-05-20.md for the rationale.
alter table public.pelvic_floor_assessments
  drop column if exists reaction_ms,
  drop column if exists endurance_s,
  drop column if exists rapid_reps_10s;

-- New measurement columns.
alter table public.pelvic_floor_assessments
  add column pulses_in_30s int not null default 0
    check (pulses_in_30s >= 0 and pulses_in_30s <= 200),
  add column max_hold_s numeric(5, 2) not null default 0
    check (max_hold_s >= 0 and max_hold_s <= 120);

-- Drop the defaults — they were only there to satisfy the NOT NULL
-- constraint during the schema change. New rows must supply values.
alter table public.pelvic_floor_assessments
  alter column pulses_in_30s drop default,
  alter column max_hold_s drop default;

-- The (user_id, created_at desc) index from 0003 still exists and is
-- unaffected. RLS policy is unchanged.

comment on column public.pelvic_floor_assessments.pulses_in_30s is
  'Count of contract-release cycles in the 30 s pulse test. Figma node 199:387.';
comment on column public.pelvic_floor_assessments.max_hold_s is
  'Max sustained contraction in seconds (cap 120). Figma node 199:415.';
