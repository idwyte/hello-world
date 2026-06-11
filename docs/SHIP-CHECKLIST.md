# Hone — Ship Checklist (Android + iOS)

Status of `claude/app-clone-with-usp-9qV0N` after the full code-side ship
pass. Every code stub flagged in the original audit is now wired. The
items below are the **external-side** steps you (the human) must complete
before `eas build --platform all` produces a Play Store / App Store
binary.

Each item is grouped by where it lives and tagged with what blocks
without it. Treat as a punch list: tick top to bottom.

---

## Common (both platforms)

These hit both stores.

- [ ] **Supabase project + env**
  - Run all migrations in order: `0001_init.sql` → `0007_rpe_1_10.sql`
    (the latest one, added this pass, widens `sessions.perceived_effort`
    from 1–5 to 1–10 to match the new RPE slider).
  - Deploy the two Edge Functions:
    `supabase functions deploy generate-program`
    `supabase functions deploy delete-account`
  - `supabase secrets set ANTHROPIC_API_KEY=...` for the program
    generator.
  - Populate `.env` (gitignored; mirror `.env.example`):
    `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  - **Without this**: the app runs in dev mode (no real data; everything
    falls back to local Zustand + hardcoded preview content).

- [ ] **Anthropic / AI program generation**
  - The `generate-program` Edge Function uses `ANTHROPIC_API_KEY` to call
    Claude. The AI-consent screen blocks the call until the user
    explicitly opts in (server-side check on `profiles.ai_consent_at`).
  - **Without this**: every program comes from the rule-based local
    generator — still functional, just less personalised.

- [ ] **Legal copy sign-off (BLOCKER for both stores)**
  - `app/(app)/legal/[doc].tsx` ships an amber "Draft — pending legal
    review" banner. The Terms / Privacy / Medical Disclaimer copy is a
    substantive engineering draft, not legally reviewed.
  - Counsel must sign off (or replace) the copy. Once approved, remove
    the banner.
  - Apple guideline 5.1.1 / Play Data Safety require accurate disclosure
    of every third-party processor (currently: Supabase, Anthropic,
    Apple/Google, RevenueCat) — the Privacy Policy already lists these.

- [ ] **Production app icons + splash**
  - Current assets (`assets/icon.png`, `adaptive-icon.png`,
    `splash-icon.png`) are placeholders.
  - Replace with production artwork in the required sizes (Expo handles
    most variants automatically from a 1024×1024 source).

---

## Android

- [ ] **Firebase Cloud Messaging (BLOCKER if notifications are on)**
  - Create a Firebase project, add an Android app with package
    `com.honeapp.mobile`, download `google-services.json`.
  - Place it in the repo (e.g. `./google-services.json`) and set
    `GOOGLE_SERVICES_JSON_PATH=./google-services.json` in `.env`.
  - `app.config.ts` already wires this conditionally; the file is read
    at `expo prebuild` time.
  - **Without this**: push notifications won't deliver on Android.

- [ ] **Google OAuth Android client (BLOCKER for Google sign-in)**
  - In Google Cloud Console, register an **Android** OAuth client (in
    addition to the Web client you already use for token exchange).
  - Package name: `com.honeapp.mobile`. SHA-1 fingerprint: run
    `eas credentials --platform android` and copy the EAS-issued
    keystore's SHA-1.
  - No new env var needed — the Android client just has to exist in
    Google Cloud; the runtime keeps using `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

- [ ] **RevenueCat Android key (BLOCKER for paywall on Android)**
  - In RevenueCat dashboard, add a new Android app, copy the public SDK
    key.
  - Set `EXPO_PUBLIC_RC_ANDROID_KEY` in `.env`.
  - **Without this**: the paywall renders the "continue without
    subscription" placeholder; restore-purchase resolves to "nothing
    found".

- [ ] **Play Console listing**
  - Create the app on Play Console, internal testing track (matches
    `eas.json` `submit.production.android.track: "internal"`).
  - Privacy policy URL (link to the in-app Privacy doc or a marketing
    site), data safety questionnaire, content rating, store listing
    (screenshots, descriptions).

---

## iOS

- [ ] **Apple Developer account + provisioning**
  - Enroll in the Apple Developer Program (if you haven't already).
  - Create an App ID for `com.honeapp.mobile` with these capabilities
    enabled in the developer portal:
    - Sign in with Apple
    - Push Notifications (APNs)
  - Run `eas credentials --platform ios` to provision distribution cert
    + provisioning profile (EAS can manage this for you).

- [ ] **App Store Connect record**
  - Create a new app in App Store Connect with bundle id
    `com.honeapp.mobile` so TestFlight + App Store submission work.
  - Privacy nutrition label answers — same disclosure as the Privacy
    Policy: Supabase (account, training data, crash logs), Anthropic
    (assessment data with explicit consent), Apple/Google sign-in
    providers, RevenueCat (purchase receipt).

- [ ] **Google OAuth iOS client (BLOCKER for Google sign-in on iOS)**
  - In Google Cloud Console, register an **iOS** OAuth client.
  - Bundle id: `com.honeapp.mobile`.
  - Set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` in `.env`.

- [ ] **RevenueCat iOS key (BLOCKER for paywall on iOS)**
  - In RevenueCat, add an iOS app linked to the App Store Connect
    record, copy the public SDK key.
  - Set `EXPO_PUBLIC_RC_IOS_KEY` in `.env`.

- [ ] **App Store screenshots + listing**
  - 6.7" + 6.5" + 5.5" screenshots, privacy policy URL, support URL,
    marketing URL, what's-new text, age rating.

---

## What was wired in this code pass (FYI)

If you're reviewing the diff to plan QA:

| Area | What changed |
|---|---|
| Mobile config | iOS `usesAppleSignIn`, FaceID permission via `expo-local-authentication` plugin, Android `POST_NOTIFICATIONS` / biometric perms, conditional FCM `googleServicesFile`, HealthKit screen iOS-gated |
| Program data | `program/day/[id]`, `/day/[id]/review`, `/exercise/[id]`, `/program/intro/[slug]` all read from Supabase + EXERCISES catalog; week-completion % computed; user display name read from auth metadata |
| Actions | App Store / Play in-app review via `expo-store-review`; RPE persistence via new `updateSessionRpe()` + migration `0007_rpe_1_10.sql`; type-to-confirm delete-account calling the existing `delete-account` Edge Function; real RevenueCat restore-purchase state machine |
| Content | Education article catalog (`lib/education.ts`) with read-time computation; check-email resend countdown + `mailto:` open; resume-onboarding state derivation from the Zustand store |
| New helpers | `fetchProgramDay`, `fetchLastSessionForDay`, `fetchCompletedDayIds`, `fetchUserDisplayName`, `updateSessionRpe`, `getArticle`, `readTimeMinutes` |
| New migration | `0007_rpe_1_10.sql` (RPE range Likert → Borg CR10) |

## Known deferred items (intentional, not blockers)

- Audio assets (`lib/audio/cues.ts`, `lib/audio/decoy-track.ts`) reference
  files that don't exist yet — the runtime falls back to silence + bare
  haptic patterns. Drop in real `.m4a` files when produced and replace
  the `null`s with `require()` calls.
- Coachmark spotlight cut-out (Figma 35) — current build renders a
  dimmed modal-card instead of measuring the target element and cutting
  a hole around it. Functional; cosmetic upgrade later.
- Per-set status dots on `/program/day/[id]/review` — requires a
  `session_exercises` join table that isn't in the schema yet.
- Alternate app icons on Android — `plugins/withAlternateIcons.js`
  deferred to v1.2 (iOS works today).
- Live Activity / App Intents — iOS-only by design.

## Build commands (once the above is done)

```sh
# Sanity
npm run typecheck && npm run lint && npm test

# One-time, after .env is populated
npx expo prebuild --clean

# Builds
eas build --platform android --profile preview     # internal Play track
eas build --platform ios --profile preview         # TestFlight
eas build --platform all --profile production      # store-ready
```
