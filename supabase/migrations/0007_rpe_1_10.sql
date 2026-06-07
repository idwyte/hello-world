-- Expand the RPE (perceived effort) range from the original 1-5 Likert
-- to the 1-10 Borg scale used by the new /session/rpe slider (Figma 34 ·
-- node 131:363). Existing rows clamped to 1-5 stay valid under the wider
-- constraint; no data backfill needed.
--
-- The Borg CR10 is the standard sports-medicine effort scale; it gives
-- finer granularity around the high-effort end where pelvic-floor
-- failure modes (incomplete release, breath-holding) cluster.

alter table public.sessions
  drop constraint if exists sessions_perceived_effort_check;

alter table public.sessions
  add constraint sessions_perceived_effort_check
  check (perceived_effort is null or perceived_effort between 1 and 10);
