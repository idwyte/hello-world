# Hone — Pelvic-floor training for men

A React Native / Expo clone of the SQZ Kegel Men Exercises app (App Store id
6754498100), rebranded as **Hone**, with one headline differentiator:
**Stealth Haptic Mode** — run a full session via AirPods cues + phone
haptics behind a podcast-style lockscreen, no visible UI.

## Quick start

```sh
npm install            # legacy-peer-deps is set in .npmrc
cp .env.example .env   # fill in your Supabase + RC + Google credentials
npx expo prebuild      # required: we ship a custom native module
npx expo start --dev-client
```

The dev-client build is required from milestone M2 onward (custom Swift /
Kotlin native module + react-native-track-player). For a one-shot M1
walking-skeleton demo, Expo Go works.

## Tooling

| Command | Purpose |
|---|---|
| `npm run start` | Metro dev server (dev-client) |
| `npm run ios` | Open in iOS simulator (requires Xcode) |
| `npm run android` | Open in Android emulator |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint flat config |
| `npm run test` | Jest unit tests |

## Environment

`app.config.ts` reads these from `process.env` and forwards them to runtime
via `Constants.expoConfig.extra`. All keys are public-safe (anon Supabase
key, RC public SDK keys, Google OAuth client IDs).

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `EXPO_PUBLIC_RC_IOS_KEY` | RevenueCat iOS SDK key |
| `EXPO_PUBLIC_RC_ANDROID_KEY` | RevenueCat Android SDK key |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth web client id |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS client id |

With none of these set, the app falls back to a local M1-style demo that
skips auth, paywall, and Supabase reads — useful for local UI iteration.

## Architecture

Where to look:

- `lib/session-engine.ts` — exercise timeline + pause/resume runner
- `lib/program.ts` — assessment → program rules
- `lib/persistence.ts` — assessment + program writes to Supabase
- `lib/sessions.ts` — completed-session writes + dashboards reads
- `lib/revenuecat.ts` — entitlement gating
- `lib/haptics/{index,native,expo-fallback}.ts` — backend-switching haptic API
- `lib/audio/{routing,decoy-track,cues}.ts` — Stealth Mode audio
- `modules/stealth-haptics/` — custom Expo native module (Swift + Kotlin)
  for Core Haptics / VibrationEffect patterns and audio-route inspection

Screens are file-based under `app/`:

```
app/
├── _layout.tsx                  # providers + error boundary + auth/entitlement gate
├── index.tsx                    # router redirect based on auth/onboarded/entitled
├── (auth)/sign-in.tsx           # Apple + Google + email magic link
├── (onboarding)/                # welcome → assessment → generating → plan-preview → paywall
├── (app)/                       # tabs: home / progress / settings; session/* hidden
└── plugins/withStealthAudioBackground.ts  # config plugin: UIBackgroundModes:audio
```

## Supabase

- Schema: `supabase/migrations/0001_init.sql` (RLS on every owner-scoped table)
- Streak trigger: `supabase/migrations/0002_streaks_fn.sql`
- Catalog seed: `supabase/seed.sql`
- RLS tests: `supabase/tests/rls.test.sql` (run via `supabase test db`)
- Edge Function: `supabase/functions/delete-account/index.ts` (account deletion;
  deploy via `supabase functions deploy delete-account`)

Enable Apple, Google, and Email auth providers in the Supabase dashboard.

## RevenueCat

- App Store Connect / Play Console products: `hone_weekly` ($5.99/wk, 3-day
  trial) and `hone_yearly` ($24.99/yr)
- Single entitlement: `pro`
- RC dashboard offering: `default` with both packages
- Client wiring: `lib/revenuecat.ts` + `(onboarding)/paywall.tsx` (uses RC
  hosted Paywall UI)

## Privacy & App Store positioning

- Sensitive health-adjacent content — position as **pelvic-floor / bladder
  health**, not sexual performance. Screenshots, metadata, and review notes
  must reflect this. Age rating 17+.
- No third-party analytics by default. Opt-in via Settings → Privacy.
- Sign in with Apple is required because we offer Google SSO (guideline 4.8).
- Account deletion is implemented end-to-end (guideline 5.1.1(v)).
- Stealth Mode prefs (haptic intensity, cue style, decoy cover) are stored
  in `expo-secure-store` and **never** synced.

See the App Store submission notes in this README's sibling docs (TODO).

## Milestones

| # | Scope | Status |
|---|---|---|
| M1 | Walking skeleton: pacer + haptics + hardcoded program | ✓ |
| M2 | Supabase schema + auth (Apple/Google/email) + onboarding | ✓ |
| M3 | RevenueCat paywall + session persistence + progress/settings | ✓ |
| M4 | Stealth Haptic Mode (native Core Haptics, decoy player, AirPods routing) | ✓ |
| M5 | Polish, error boundary, account deletion, submission readiness | in progress |
| M6 | Apple Watch companion, localizations, M5+ audio assets | post-launch |

## Known follow-ups

- `assets/audio/focus-session.m4a` — bundle a real ambient track (≈ -40 dBFS,
  30 min loop) before shipping. The placeholder URL in `lib/audio/decoy-track.ts`
  will fail gracefully but the lockscreen disguise won't appear.
- `assets/audio/cues/` — short tone and whispered-cue clips for the AirPods
  audio cue feature.
- Apple Watch companion app (separate native iOS target, not Expo).
