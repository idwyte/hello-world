// Obsidian Kinetic: Settings tab. No dedicated Figma frame ("still to
// design") — derived from ListRow/ListSection. Adds the AI
// personalisation row (consent withdraw/grant per the consent screen's
// "Your control" promise). Navigation + data wiring unchanged.
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ListRow, ListSection } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { hasAiConsent } from '@/lib/persistence';
import { useEntitlement } from '@/lib/revenuecat';
import { color, spacing, type } from '@/lib/obsidian/tokens';
import { useSettingsStore } from '@/stores/settings';

export default function SettingsIndex() {
  const router = useRouter();
  const { entitlement } = useEntitlement();
  const { settings, hydrated } = useSettingsStore();
  const aiConsentQuery = useQuery({
    queryKey: ['ai-consent'],
    enabled: hasSupabaseConfig(),
    queryFn: hasAiConsent,
  });
  const reminderHint = !hydrated
    ? 'Daily nudge'
    : settings.reminderEnabled
      ? `Daily · ${formatLabel(settings.reminderTime)}`
      : 'Off';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg,
          paddingBottom: 24,
          gap: spacing.stackLg,
        }}
      >
        <Text style={{ ...type.headlineMd, color: color.onSurface }}>
          Settings
        </Text>

        <ListSection title="ACCOUNT">
          <ListRow
            label="Account"
            sub="Email, sign out, delete account"
            onPress={() => router.push('/settings/account')}
          />
        </ListSection>

        <ListSection title="TRAINING">
          <ListRow
            label="Reminders"
            sub={reminderHint}
            onPress={() => router.push('/settings/reminders')}
          />
          <Hairline />
          <ListRow
            label="Stealth Mode"
            sub="Haptic intensity, AirPods cues"
            onPress={() => router.push('/settings/stealth')}
          />
          <Hairline />
          <ListRow
            label="App icon"
            sub={
              settings.appIconVariant === 'default'
                ? 'Default'
                : settings.appIconVariant.charAt(0).toUpperCase() +
                  settings.appIconVariant.slice(1)
            }
            onPress={() => router.push('/settings/app-icon')}
          />
        </ListSection>

        <ListSection title="SUBSCRIPTION">
          <ListRow
            label="Subscription"
            sub={
              entitlement.isPro
                ? entitlement.isInTrial
                  ? 'Trial'
                  : 'Active'
                : 'Free'
            }
            onPress={() => router.push('/settings/subscription')}
          />
        </ListSection>

        <ListSection title="PRIVACY & SECURITY">
          <ListRow
            label="AI personalisation"
            sub={
              aiConsentQuery.data === undefined
                ? 'Plan generation consent'
                : aiConsentQuery.data
                  ? 'On — withdraw anytime'
                  : 'Off — rule-based plans'
            }
            onPress={() => router.push('/settings/privacy')}
          />
          <Hairline />
          <ListRow
            label="Privacy"
            sub="Analytics, data export, deletion"
            onPress={() => router.push('/settings/privacy')}
          />
          <Hairline />
          <ListRow
            label="Security"
            sub={settings.biometricLocked ? 'Biometric lock on' : 'Biometric lock'}
            onPress={() => router.push('/settings/security')}
          />
        </ListSection>

        <Text
          style={{
            ...type.labelCaps,
            color: color.onSurfaceVariant,
            textAlign: 'center',
            marginTop: spacing.stackSm,
          }}
        >
          HONE V0.1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Hairline() {
  return (
    <View style={{ height: 1, backgroundColor: color.outlineVariant, opacity: 0.5 }} />
  );
}

function formatLabel(hhmm: string | null): string {
  if (!hhmm) return 'Set a time';
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}
