# App Store submission notes

Paste / adapt these into App Store Connect when submitting.

## App information

- **Name**: SQZ — Pelvic Floor Health
- **Subtitle**: Train control, strength, and confidence
- **Category**: Health & Fitness (Primary), Lifestyle (Secondary)
- **Age rating**: 17+ (frequent/intense mature/suggestive themes, even though
  our copy is clinical — answer the rating questionnaire honestly about
  pelvic-floor content)

## App Privacy

Answer the privacy questionnaire as:

- **Data Not Collected** (default state with analytics opt-in OFF)
- If analytics opt-in is shipped: **Data Not Linked to You** → Diagnostics
  (Crash data, Performance data) and Usage Data (Product Interaction); none
  used for tracking; none linked to identity.

Specifically declare **no collection** of:
- Health & Fitness data
- Sensitive Info
- User Content
- Contacts
- Browsing History
- Search History
- Identifiers (Device ID, Advertising Data)
- Purchases (RevenueCat manages this server-side; the client never sees it
  as PII)
- Location

## Sign in with Apple

Required because we offer Google SSO. Already implemented via
`expo-apple-authentication` exchanging the identity token through
Supabase `signInWithIdToken({ provider: 'apple' })`.

## Subscription metadata

- Group: `SQZ Pro`
- `sqz_weekly`: $5.99/week with 3-day Introductory Offer (free trial)
- `sqz_yearly`: $24.99/year, no trial

The paywall surfaces prices directly via RevenueCat's hosted Paywall UI;
review the localized strings in App Store Connect → Subscriptions →
Localizations.

## Review notes (paste into "App Review Information → Notes")

> SQZ is a discreet pelvic-floor training app for men. The "Stealth Haptic
> Mode" plays a low-volume ambient audio track (visible on the lockscreen
> as "Focus Session — Episode 12") so the system audio session stays alive
> while a user trains via haptic feedback alone, without showing in-app
> UI. This pattern is used because:
>
> 1. Pelvic-floor training is most effective when done multiple short
>    sessions per day, including in environments where the user wouldn't
>    want a visible UI (commute, workplace).
> 2. iOS audio background mode is the standard mechanism to keep
>    background JavaScript alive on Expo / React Native apps so we can
>    fire timely haptics. The audio is real (low-volume ambient brown
>    noise), not silence; it serves the user's discretion goal directly.
>
> The app collects no health data, has no third-party analytics, no
> tracking SDKs, and no ATT prompt. Account deletion is fully implemented
> in Settings → Account → Delete Account.
>
> Test accounts: see attached.

## Demo flow for review

1. Open app → Sign in with Apple (demo account in submission notes)
2. Complete the 10-question pelvic-floor assessment → personalized plan
3. Tap "Start training" → paywall → start sandbox subscription with trial
4. Tap "Start session" → choose Normal mode → see pacer ring + haptics
5. Tap "Start session" → choose Stealth → see Focus Session player, feel
   haptics on phase boundaries
6. Settings → Account → Delete account → confirm full cleanup
7. Settings → Privacy → toggle analytics (default off)

## Screenshots

Keep screenshots clinical:

1. Home with streak + Today card
2. Onboarding question (e.g., goal selection)
3. Plan preview (Week 1 day-by-day)
4. Normal-mode session player (pacer ring on a phase)
5. Settings → Stealth Mode (showing the controls, NOT a session)
6. Progress (heatmap + streaks)

Avoid:
- Anatomy illustrations
- The word "Kegel" prominently in screenshots / metadata (use
  "pelvic-floor")
- Stealth-mode session in a way that emphasizes the disguise rather than
  the discretion benefit

## Localizations

Ship US English at launch. Plan additional locales for M6.
