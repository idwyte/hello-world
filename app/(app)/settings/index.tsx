import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Body,
  Card,
  Heading,
  ListRow,
  SectionLabel,
} from '@/components/ui';
import { semantic } from '@/lib/theme';
import { useEntitlement } from '@/lib/revenuecat';
import { useSettingsStore } from '@/stores/settings';

type Group = {
  label: string;
  rows: Array<{
    label: string;
    href: string;
    sublabel?: string;
    destructive?: boolean;
  }>;
};

export default function SettingsIndex() {
  const router = useRouter();
  const { entitlement } = useEntitlement();
  const { settings, hydrated } = useSettingsStore();
  const reminderHint = !hydrated
    ? 'Daily nudge'
    : settings.reminderEnabled
      ? `Daily · ${formatLabel(settings.reminderTime)}`
      : 'Off';

  const groups: Group[] = [
    {
      label: 'Account',
      rows: [
        {
          label: 'Account',
          href: '/settings/account',
          sublabel: 'Email, sign out, delete account',
        },
      ],
    },
    {
      label: 'Training',
      rows: [
        { label: 'Reminders', href: '/settings/reminders', sublabel: reminderHint },
        {
          label: 'Stealth Mode',
          href: '/settings/stealth',
          sublabel: 'Haptic intensity, AirPods cues',
        },
        {
          label: 'App icon',
          href: '/settings/app-icon',
          sublabel:
            settings.appIconVariant === 'default'
              ? 'Default'
              : settings.appIconVariant.charAt(0).toUpperCase() +
                settings.appIconVariant.slice(1),
        },
      ],
    },
    {
      label: 'Subscription',
      rows: [
        {
          label: 'Subscription',
          href: '/settings/subscription',
          sublabel: entitlement.isPro
            ? entitlement.isInTrial
              ? 'Trial'
              : 'Active'
            : 'Free',
        },
      ],
    },
    {
      label: 'About',
      rows: [
        {
          label: 'Privacy',
          href: '/settings/privacy',
          sublabel: 'Analytics, data export, deletion',
        },
        {
          label: 'Security',
          href: '/settings/security',
          sublabel: settings.biometricLocked ? 'Face ID lock on' : 'Face ID lock',
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1 px-4 pt-3" contentContainerClassName="pb-12">
        <View>
          <SectionLabel>Settings</SectionLabel>
          <Heading level="heading-lg" className="mt-1">
            Preferences
          </Heading>
        </View>

        <View className="mt-6 gap-6">
          {groups.map((g) => (
            <View key={g.label} className="gap-2">
              <SectionLabel className="px-1">{g.label}</SectionLabel>
              <Card padding="none" radius="xl" bordered>
                {g.rows.map((r, i) => (
                  <View key={r.href}>
                    <ListRow
                      label={r.label}
                      sublabel={r.sublabel}
                      destructive={r.destructive}
                      showChevron
                      onPress={() => router.push(r.href as never)}
                    />
                    {i < g.rows.length - 1 ? (
                      <View
                        className="h-px ml-4"
                        style={{ backgroundColor: semantic.borderDefault }}
                      />
                    ) : null}
                  </View>
                ))}
              </Card>
            </View>
          ))}
        </View>

        <Body size="xs" color="muted" className="mt-8 text-center">
          Hone v0.1.0
        </Body>
      </ScrollView>
    </SafeAreaView>
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
