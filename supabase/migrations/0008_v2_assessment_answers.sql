-- Persist the v2 assessment vector alongside the legacy pelvic floor
-- index, so retests don't throw away the new five-axis answers and
-- so the Streaks radar (and any future hypertonic re-routing) can read
-- real axis values instead of approximating from the legacy 2-test
-- shim.
--
-- The column is nullable for backward compatibility — existing v1 rows
-- and any future v1 client still write `null` here. New v2-aware clients
-- (lib/persistence.ts saveAssessmentAndProgram + saveIndexRetest) write
-- the full AssessmentProfileV2 vector.

alter table public.pelvic_floor_assessments
  add column if not exists v2_answers jsonb;

comment on column public.pelvic_floor_assessments.v2_answers is
  'Assessment v2 answers (lib/assessment-v2.ts AssessmentV2Answers shape). NULL for legacy v1 rows. Drives the Streaks radar axes and the bi-weekly hypertonic re-screen.';
