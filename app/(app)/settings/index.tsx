import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Body,
  Card,
  ListRow,
  ScreenHeader,
  SectionLabel,
} from '@/components/ui';
import { useEntitlement } from '@/lib/revenuecat';
import { semantic } from '@/lib/theme';
import { useSettingsStore } from '@/stores/settings';

type Row = {
  label: string;
  sublabel?: string;
  href?: string;
  destructive?: boolean;
  showChevron?: boolean;
  trailing?: React.ReactNode;
};

type Group = {
  label: string | null;
  rows: Row[];
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
      label: 'ACCOUNT',
      rows: [
        {
          label: 'Account',
          sublabel: 'Email, sign out, delete account',
          href: '/settings/account',
          showChevron: true,
        },
      ],
    },
    {
      label: 'TRAINING',
      rows: [
        {
          label: 'Reminders',
          sublabel: reminderHint,
          href: '/settings/reminders',
          showChevron: true,
        },
        {
          label: 'Stealth Mode',
          sublabel: 'Haptic intensity, AirPods cues',
          href: '/settings/stealth',
          showChevron: true,
        },
        {
          label: 'App icon',
          sublabel:
            settings.appIconVariant === 'default'
              ? 'Default'
              : settings.appIconVariant.charAt(0).toUpperCase() +
                settings.appIconVariant.slice(1),
          href: '/settings/app-icon',
          showChevron: true,
        },
      ],
    },
    {
      label: 'SUBSCRIPTION',
      rows: [
        {
          label: 'Subscription',
          sublabel: entitlement.isPro
            ? entitlement.isInTrial
              ? 'Trial'
              : 'Active'
            : 'Free',
          href: '/settings/subscription',
          showChevron: true,
        },
      ],
    },
    {
      label: 'ABOUT',
      rows: [
        {
          label: 'Privacy',
          sublabel: 'Analytics, data export, deletion',
          href: '/settings/privacy',
          showChevron: true,
        },
        {
          label: 'Security',
          sublabel: settings.biometricLocked ? 'Face ID lock on' : 'Face ID lock',
          href: '/settings/security',
          showChevron: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader kind="large-title" title="Settings" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12 px-4"
      >
        <View className="gap-6">
          {groups.map((g) => (
            <View key={g.label ?? Math.random()}>
              {g.label ? (
                <SectionLabel tracking="tight" className="mb-2 px-0.5">
                  {g.label}
                </SectionLabel>
              ) : null}
              <Card padding="none" radius="card-tight" className="w-[358px] self-center">
                {g.rows.map((r, i) => (
                  <View key={r.label}>
                    {i > 0 ? (
                      <View
                        className="h-px w-full"
                        style={{ backgroundColor: semantic.borderDefault }}
                      />
                    ) : null}
                    <ListRow
                      label={r.label}
                      sublabel={r.sublabel}
                      destructive={r.destructive}
                      showChevron={r.showChevron}
                      trailing={r.trailing}
                      onPress={
                        r.href ? () => router.push(r.href as never) : undefined
                      }
                    />
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
