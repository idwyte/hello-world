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

---

## Phase F proposals — Assessment + AI pivot (pending user approval)

Drafted 2026-05-20 below the existing 41 screens on the Screens page
(canvas `2:4`). These supersede screens 03 / 04 / 05 / 10 / 11 from
the table above, and add 06 / 07 / 08 / 09 as new lifestyle-question
screens. See `/root/.claude/plans/relay-the-plan-for-stateless-gadget.md`
for the full pivot plan.

| # | Node ID | New screen | Replaces / new | Code target |
|---|---|---|---|---|
| 03 | `199:341` | assessment intro (6-step timeline) | replaces old 03 (3-Q quiz) | `app/(onboarding)/assessment.tsx` |
| 04 | `199:387` | Test 1 · quick pulse, 30 s | replaces old 04 (reaction tap) | `app/(onboarding)/index-test.tsx` (stage 1) |
| 05 | `199:415` | Test 2 · max hold | replaces old 05 (endurance hold) | `app/(onboarding)/index-test.tsx` (stage 2) |
| 06 | `197:341` | Question · age band | NEW | `app/(onboarding)/assessment.tsx` |
| 07 | `199:443` | Question · strength days/week | NEW | `app/(onboarding)/assessment.tsx` |
| 08 | `199:481` | Question · cardio days/week | NEW | `app/(onboarding)/assessment.tsx` |
| 09 | `199:519` | Question · intimacy frequency | NEW | `app/(onboarding)/assessment.tsx` |
| 09b | `247:2` | AI consent gate (PII forwarding) | NEW v1.2 — added 2026-05-22 | `app/(onboarding)/ai-consent.tsx` |
| 10 | `199:551` | generating (AI plan call) | replaces old 10 generating | `app/(onboarding)/generating.tsx` |
| 11 | `199:584` | plan-preview (new framing) | replaces old 11 plan-preview | `app/(onboarding)/plan-preview.tsx` |

Once the user approves these (or iterates), the table above gets the
new IDs and the originals (62:26, 66:42, 67:47, 68:60, 69:86) are
archived in the file with a `-v1` suffix in their frame name.

### Audit pass (2026-05-20, after approval)

Two cross-cutting fixes landed in Figma after the initial draft:

1. **Tab bar icon alignment** — the `tabBar` component-set (`77:851`) had
   16 icon vectors all positioned at (8, 4) inside their 40×32 container.
   That position only centers a 24×24 icon; the actual lucide-shaped
   icons (18×18 / 16×18 / 18×10 / 16×12) ended up top-left-shifted,
   making the Progress active-pill look like a misshapen blob. Each
   icon re-centered to `((40-w)/2, (32-h)/2)`. Fix propagates to every
   instance on the Screens page (4 of them — one per tab destination).
2. **Variable rebinding on new screens** — the 9 newly drafted Phase F
   screens were initially built with hardcoded RGB values rather than
   the variable bindings used across the existing 41 screens. Walked
   330 nodes across the new boards; rebound 304 fills + 63 strokes to
   the `brand/*` variables (id 2:7-2:16). Visually identical, but the
   new screens now respect Foundations updates the same way existing
   ones do.

---
