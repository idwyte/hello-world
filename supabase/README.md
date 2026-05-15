# Supabase

Schema, migrations and seed for the SQZ clone backend.

## First-time setup

1. Install the Supabase CLI: `brew install supabase/tap/supabase`
2. From repo root: `supabase init` then `supabase link --project-ref <your-project-ref>`
3. `supabase db push` — applies migrations 0001 and 0002
4. `supabase db seed` — loads the exercise catalog

## Auth providers

Enable in Supabase dashboard → Authentication → Providers:

- Email (magic link) — enabled by default
- Apple — paste your Services ID, Team ID, Key ID, and the .p8 private key
- Google — paste the Web client ID + secret from Google Cloud Console

The mobile client uses native flows (`expo-apple-authentication`,
`@react-native-google-signin/google-signin`) and exchanges the ID token via
`supabase.auth.signInWithIdToken({ provider, token })`.

## Tables

| Table | Purpose | RLS |
|---|---|---|
| `profiles` | One row per auth user, auto-inserted via trigger | owner select/update |
| `assessments` | Onboarding quiz answers + derived level | owner all |
| `exercises` | Read-only exercise catalog | authenticated read |
| `programs` | One active program per user (partial unique index) | owner all |
| `program_days` | 8 weeks × 7 days per program | owner all (denormalized user_id) |
| `sessions` | Completed workout logs | owner all |
| `streaks` | Maintained by trigger on sessions | owner select only |
| `settings` | Reminder + analytics prefs | owner all |

## Streak computation

`public.recompute_streak(uuid)` rebuilds the streak from `sessions.ended_at`
dates. Called by trigger `trg_sessions_after_complete` on insert and on
`completed` flips.

## Privacy notes

- Sensitive prefs (haptic intensity, stealth cue style, decoy cover) live
  on-device via `expo-secure-store`, **not** in `settings`.
- `assessments.answers` is jsonb and includes symptom selections; treat as
  health-adjacent PII. Never log to analytics.
- No analytics SDK in the client. PostHog (if enabled) goes through an Edge
  Function for scrubbing.
