# Figma node-ID map

Source-of-truth lookup for `Hone — Design System v1`.

- **File key:** `qgY3Qcf7gP7w5V5A6uQTL4`
- **Screens page canvas:** `2:4`
- **Foundations page canvas:** `0:1`
- Extracted from `get_metadata` on 2026-05-20.

To pull design context for any screen:
```
mcp__figma__get_design_context({ fileKey: 'qgY3Qcf7gP7w5V5A6uQTL4', nodeId: '<id>' })
```

| # | Node ID | Screen | Code file |
|---|---|---|---|
| 01 | `62:26` | welcome | `app/(onboarding)/welcome.tsx` |
| 02 | `65:39` | sign-in | `app/(auth)/sign-in.tsx` |
| 03 | `66:42` | assessment | `app/(onboarding)/assessment.tsx` |
| 04 | `67:47` | index-test | `app/(onboarding)/index-test.tsx` |
| 05 | `68:60` | generating | `app/(onboarding)/generating.tsx` |
| 06 | `69:86` | plan-preview | `app/(onboarding)/plan-preview.tsx` |
| 07 | `70:76` | paywall | `app/(onboarding)/paywall.tsx` |
| 08 | `72:88` | home | `app/(app)/home.tsx` |
| 09 | `91:258` | program | `app/(app)/program.tsx` |
| 10 | `92:245` | progress | `app/(app)/progress.tsx` |
| 11 | `94:314` | settings | `app/(app)/settings/index.tsx` |
| 12 | `98:279` | index-retest | `app/(app)/index-retest.tsx` |
| 13 | `99:270` | session/active | `app/(app)/session/player.tsx` |
| 14 | `100:273` | session/complete | (not yet built) |
| 15 | `102:290` | session/stealth | `app/(app)/session/stealth.tsx` |
| 16 | `103:294` | sign-up | (not yet built) |
| 17 | `104:278` | legal viewer | (not yet built) |
| 18 | `104:327` | error state | `components/ErrorBoundary.tsx` |
| 19 | `104:379` | healthkit connect | (not yet built) |
| 20 | `104:479` | restore purchase | (not yet built) |
| 21 | `104:551` | maintenance | (not yet built) |
| 22 | `104:624` | voice picker | (not yet built) |
| 23 | `106:342` | onboarding bail-out | (not yet built) |
| 24 | `109:345` | day detail | (not yet built) |
| 25 | `110:348` | exercise detail | (not yet built) |
| 26 | `115:382` | reminders | `app/(app)/settings/reminders.tsx` |
| 27 | `117:354` | edit profile | `app/(app)/settings/account.tsx` |
| 28 | `112:318` | check email | (not yet built) |
| 29 | `113:348` | delete account | (not yet built — inside account.tsx?) |
| 30 | `114:336` | session pause | (not yet built) |
| 31 | `124:378` | session review | (not yet built) |
| 32 | `126:363` | reverse-Kegel intro | (not yet built) |
| 33 | `129:347` | education | (not yet built) |
| 34 | `131:363` | RPE slider | (not yet built) |
| 35 | `134:353` | coachmark overlay | (not yet built) |
| 36 | `136:368` | reminder time wheel | (sheet inside reminders.tsx?) |
| 37 | `139:379` | streak-freeze | (not yet built) |
| 38 | `142:378` | anonymous sign-up | (not yet built) |
| 39 | `154:364` | biometric lock | `lib/biometric-gate.tsx` |
| 40 | `155:394` | app icon picker | `app/(app)/settings/app-icon.tsx` |
| 41 | `162:394` | Live Activity widget | (native iOS; deferred) |

## Workflow rule

**Before writing or modifying any code that touches a screen, pull its
Figma node via `get_design_context` and use that as the source of truth
for component choice, tokens, spacing, typography, and layout.** The
roadmap text descriptions in `docs/hone-roadmap-state.md` are a
checklist, not a spec.
