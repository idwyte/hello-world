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

-- Pre-existing rows reference measurements (reaction_ms / endurance_s /
-- rapid_reps_10s) that are about to be dropped, so their composite +
-- level become orphaned. Truncate the table rather than leave zombie
-- rows. This is explicit data loss — see commit message for rationale.
-- Safe at v1.2 stage: no production retest cadence has been running
-- long enough that we'd be discarding user progress that can't be
-- recreated by a fresh retest.
truncate table public.pelvic_floor_assessments;

-- Drop the old measurement columns.
alter table public.pelvic_floor_assessments
  drop column if exists reaction_ms,
  drop column if exists endurance_s,
  drop column if exists rapid_reps_10s;

-- New measurement columns. Table is empty post-truncate, so NOT NULL
-- without defaults is safe.
alter table public.pelvic_floor_assessments
  add column pulses_in_30s int not null
    check (pulses_in_30s >= 0 and pulses_in_30s <= 200),
  add column max_hold_s numeric(5, 2) not null
    check (max_hold_s >= 0 and max_hold_s <= 120);

-- The (user_id, created_at desc) index from 0003 still exists and is
-- unaffected. RLS policy is unchanged.

comment on column public.pelvic_floor_assessments.pulses_in_30s is
  'Count of contract-release cycles in the 30 s pulse test. Figma node 199:387.';
comment on column public.pelvic_floor_assessments.max_hold_s is
  'Max sustained contraction in seconds (cap 120). Figma node 199:415.';
