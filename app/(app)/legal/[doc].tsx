// Figma: 17 · legal viewer — node 104:278
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=104-278
// Spec: docs/hone-roadmap-state.md line 95 (Figma-derived).
//
// ⚠️ DRAFT — PENDING LEGAL REVIEW ⚠️
// The Terms · Privacy · Medical Disclaimer bodies below are SUBSTANTIVE
// starter content authored by engineering. They are NOT legally reviewed
// and must be replaced (or signed off) by counsel before production.
// Apple App Review requires a real Privacy Policy that discloses every
// third-party processor — see PRIVACY.thirdParties for the current list
// (Supabase + Anthropic). Apple guideline 1.4.1 also expects an explicit
// medical-claim disclaimer for pelvic-floor / health apps; see MEDICAL.
//
// FIGMA-DIFF (stub):
//   - Body content is now substantive (was 4 sentences of lorem); the
//     route still serves the same three slugs (terms / privacy / licenses)
//     plus the new "medical" slug for the disclaimer surface.
//   - "Last updated" timestamp is hardcoded — move into a build-time
//     constant or to the migration-author header when the legal review
//     lands.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body } from '@/components/ui';
import { semantic } from '@/lib/theme';

type LegalSection = { heading: string; body: string };
type LegalDoc = { title: string; lastUpdated: string; sections: LegalSection[] };

// All copy below is DRAFT — pending legal review (see header comment).

const TERMS: LegalDoc = {
  title: 'Terms of Service',
  lastUpdated: '2026-05-21',
  sections: [
    {
      heading: '1. Acceptance',
      body:
        'By creating an account or using Hone, you agree to these Terms. ' +
        'If you do not agree, do not use the app.',
    },
    {
      heading: '2. Eligibility',
      body:
        'You must be at least 18 years old (or the age of majority in your ' +
        'jurisdiction). Hone is general wellness software intended for ' +
        'adults; it is not designed for use by minors.',
    },
    {
      heading: '3. Your account',
      body:
        'You are responsible for any activity under your account. Keep ' +
        'your sign-in credentials confidential. Notify us promptly if you ' +
        'suspect unauthorized access.',
    },
    {
      heading: '4. Subscriptions and purchases',
      body:
        'Some features require a paid subscription, managed through the ' +
        'Apple App Store or Google Play. Billing, renewal, refunds, and ' +
        'cancellation are handled by the platform on the terms shown at ' +
        'purchase. Lifetime purchases are non-refundable except where ' +
        'required by applicable consumer law.',
    },
    {
      heading: '5. Medical disclaimer',
      body:
        'Hone is a general-wellness training app. It is not a medical ' +
        'device, not a substitute for professional medical care, and not ' +
        'intended to diagnose, treat, cure, or prevent any condition. ' +
        'Consult a qualified clinician (e.g. a pelvic-floor physical ' +
        'therapist or your physician) before starting any new exercise ' +
        'program, especially if you are pregnant, postpartum, recovering ' +
        'from surgery, or experiencing pelvic pain, incontinence, or ' +
        'prolapse symptoms. Stop and seek medical advice if any exercise ' +
        'causes pain or worsens symptoms.',
    },
    {
      heading: '6. Acceptable use',
      body:
        'Do not reverse engineer, scrape, resell, or interfere with the ' +
        'app. Do not use Hone to harass others or upload content that ' +
        "violates someone else's rights.",
    },
    {
      heading: '7. Termination',
      body:
        'You can delete your account at any time from Settings → Account. ' +
        'We may suspend or terminate accounts that violate these Terms.',
    },
    {
      heading: '8. Disclaimers and limitation of liability',
      body:
        'Hone is provided "as is." To the maximum extent permitted by ' +
        'law, we disclaim all implied warranties (merchantability, ' +
        'fitness for a particular purpose, non-infringement) and are not ' +
        'liable for indirect, incidental, or consequential damages. Some ' +
        'jurisdictions do not allow these limitations, so they may not ' +
        'apply to you.',
    },
    {
      heading: '9. Changes',
      body:
        'We may update these Terms. Material changes will be surfaced ' +
        'in-app before they take effect.',
    },
    {
      heading: '10. Contact',
      body: 'Questions? Contact support — see the email shown in Settings.',
    },
  ],
};

const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  lastUpdated: '2026-05-21',
  sections: [
    {
      heading: '1. What we collect',
      body:
        'Account: email (or anonymous ID if you continued as guest), ' +
        'sign-in tokens. ' +
        'Assessment: your two physical measurements (30-second pulse ' +
        'count, max hold seconds) and four lifestyle answers (age band, ' +
        'strength days per week, cardio days per week, intimacy frequency ' +
        'per week). ' +
        'Training: completed sessions, streak data, and your generated ' +
        '8-week program. ' +
        'Device & app: app version, OS version, crash reports, and ' +
        'diagnostic logs (without unique device identifiers where ' +
        'avoidable). ' +
        'We do not collect contacts, photos, microphone audio, location, ' +
        'or advertising identifiers.',
    },
    {
      heading: '2. How we use it',
      body:
        'To run your training program, show your progress, and adjust ' +
        'the plan at retest. To diagnose crashes and improve the app. ' +
        'To process subscription payments via the App Store / Play Store ' +
        '(we never see your card details — those go to the platform).',
    },
    {
      heading: '3. Third-party processors',
      body:
        'Supabase (US/EU) — authentication, database, and Edge Function ' +
        'hosting. ' +
        'Anthropic (US) — generates your personalized 8-week program ' +
        'ONCE at onboarding from your assessment data, only after you ' +
        'explicitly consent on the AI consent screen. Retests use a ' +
        'local rule-based algorithm; no further data is sent to ' +
        'Anthropic. ' +
        'Apple / Google — sign-in (Apple ID / Google) and in-app ' +
        'purchases under their respective privacy policies. ' +
        'RevenueCat (US) — subscription receipt validation if applicable.',
    },
    {
      heading: '4. AI processing — your consent',
      body:
        'You will be asked once, before any data leaves your device, ' +
        'whether you consent to sending your assessment data to ' +
        "Anthropic for AI program generation. If you decline, we'll " +
        'build your plan with an on-device rule-based algorithm — you ' +
        'still get a program. You can revoke consent in Settings; ' +
        "future retests don't use AI either way.",
    },
    {
      heading: '5. Your rights',
      body:
        'Access — view your data in-app, or request an export. ' +
        'Correct — update any incorrect data in Settings. ' +
        'Delete — Settings → Account → Delete Account permanently ' +
        'removes your data within 30 days. ' +
        'Withdraw consent — Settings → Privacy → AI Consent. ' +
        'Object / Restrict — contact support. ' +
        "If you're in the EU/EEA, UK, or California you may also have " +
        'additional rights under GDPR, UK GDPR, and CCPA respectively. ' +
        'You can lodge a complaint with your local data-protection ' +
        'authority.',
    },
    {
      heading: '6. Retention',
      body:
        'Account and training data: kept while your account is active. ' +
        'On deletion: removed from our primary systems within 30 days; ' +
        'encrypted backups may persist for up to 90 days before ' +
        'expiring. ' +
        'AI prompt logs: Anthropic does not retain prompts for training ' +
        'under our API terms.',
    },
    {
      heading: '7. Security',
      body:
        'Data in transit is encrypted with TLS. Data at rest in our ' +
        'database is encrypted by Supabase. We use row-level security ' +
        'so that you can only access your own records. No system is ' +
        '100% secure — if a breach occurs, we will notify affected ' +
        'users as required by law.',
    },
    {
      heading: '8. Children',
      body:
        'Hone is not directed to anyone under 18. We do not knowingly ' +
        'collect data from minors. If you believe a minor has provided ' +
        "data, contact support and we'll delete it.",
    },
    {
      heading: '9. International transfers',
      body:
        'Your data may be processed in the United States by our ' +
        'processors above. Where required, we use Standard Contractual ' +
        'Clauses or equivalent safeguards.',
    },
    {
      heading: '10. Changes',
      body:
        'If we change this policy in a material way, we will surface ' +
        'the change in-app before it takes effect.',
    },
    {
      heading: '11. Contact',
      body:
        'Questions or requests? Email the support address shown in ' +
        'Settings.',
    },
  ],
};

const MEDICAL: LegalDoc = {
  title: 'Medical Disclaimer',
  lastUpdated: '2026-05-21',
  sections: [
    {
      heading: 'General wellness, not medical advice',
      body:
        'Hone is a general-wellness training app for pelvic-floor ' +
        'exercise. It is not a medical device. It is not a substitute ' +
        'for evaluation, diagnosis, or treatment by a licensed ' +
        'healthcare provider. Nothing in the app should be construed as ' +
        'medical advice for any specific person.',
    },
    {
      heading: 'Consult a clinician first',
      body:
        'Talk to a clinician — for pelvic-floor concerns, ideally a ' +
        'pelvic-floor physical therapist or your physician — before ' +
        'starting any new exercise program. This is especially ' +
        'important if you are pregnant, postpartum, recovering from ' +
        'pelvic or abdominal surgery, dealing with prolapse or chronic ' +
        'pelvic pain, experiencing urinary or fecal incontinence, or ' +
        'have any other condition that could be aggravated by pelvic ' +
        'or core exercise.',
    },
    {
      heading: 'Stop if it hurts',
      body:
        'If any exercise causes pain, worsens symptoms, or feels wrong, ' +
        'stop immediately and consult a clinician before continuing. ' +
        'Tightness and increased control are normal; sharp or new pain ' +
        'is not.',
    },
    {
      heading: 'Measurements are estimates',
      body:
        'The 30-second pulse count and max-hold measurements are ' +
        'self-reported estimates of pelvic-floor function — not clinical ' +
        'tests. They are useful for tracking your own progress over ' +
        'time, not for diagnosis.',
    },
    {
      heading: 'Emergencies',
      body:
        'Hone is not for emergencies. If you are experiencing a medical ' +
        'emergency, call your local emergency number.',
    },
  ],
};

const LICENSES: LegalDoc = {
  title: 'Open-source Licenses',
  lastUpdated: '2026-05-21',
  sections: [
    {
      heading: 'Open-source dependencies',
      body:
        'Hone is built on open-source software. A full list of ' +
        'dependencies and their licenses is generated from package.json ' +
        'and bundled with each release; tap "Export licenses" below ' +
        'when available, or contact support for a copy.',
    },
  ],
};

const DOCS: Record<string, LegalDoc> = {
  terms: TERMS,
  privacy: PRIVACY,
  medical: MEDICAL,
  licenses: LICENSES,
};

export default function Legal() {
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const slug = (doc ?? 'terms').toLowerCase();
  const content = DOCS[slug] ?? TERMS;

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="h-14 flex-row items-center px-4">
        <Body color="primary" style={{ fontSize: 20 }} onPress={() => router.back()}>
          ←
        </Body>
        <View className="flex-1 items-center -ml-5">
          <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
            {content.title}
          </Body>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-12">
        <Body size="xs" color="muted">
          Last updated {content.lastUpdated}
        </Body>
        <View
          className="mt-3 rounded-md px-3 py-2"
          style={{ backgroundColor: semantic.feedbackDanger + '20' }}
        >
          <Body
            color="muted"
            style={{ fontSize: 12, lineHeight: 16 }}
          >
            Draft — pending legal review before production.
          </Body>
        </View>
        <View className="mt-4 gap-6">
          {content.sections.map((s) => (
            <View key={s.heading}>
              <Body weight="semibold" color="primary" style={{ fontSize: 17, lineHeight: 24 }}>
                {s.heading}
              </Body>
              <Body color="primary" className="mt-2" style={{ fontSize: 14, lineHeight: 22 }}>
                {s.body}
              </Body>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
