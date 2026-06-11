-- 0006_ai_consent.sql
--
-- AI program generation forwards lifestyle answers (age band, strength
-- days/week, cardio days/week, intimacy per week) and the two physical
-- measurements (pulses in 30s, max hold s) to Anthropic for processing
-- by the generate-program Edge Function. This is sensitive PII — record
-- explicit user consent before any data leaves the device, and enforce
-- the gate server-side so a tampered client can't bypass it.
--
-- Column is nullable: NULL = no consent yet, timestamptz = consented at
-- that instant. Revoking consent SETs to NULL.

alter table public.profiles
  add column if not exists ai_consent_at timestamptz;

comment on column public.profiles.ai_consent_at is
  'When the user consented to sending lifestyle + measurement data to '
  'Anthropic for AI program generation. NULL = no consent. The '
  'generate-program Edge Function refuses requests when this is NULL.';
