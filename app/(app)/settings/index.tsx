import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEntitlement } from '@/lib/revenuecat';
import { useSettingsStore } from '@/stores/settings';

type Row = {
  label: string;
  href:
    | '/settings/account'
    | '/settings/subscription'
    | '/settings/privacy'
    | '/settings/stealth'
    | '/settings/reminders';
  hint?: string;
};

export default function SettingsIndex() {
  const { entitlement } = useEntitlement();
  const { settings, hydrated } = useSettingsStore();
  const reminderHint = !hydrated
    ? 'Daily nudge'
    : settings.reminderEnabled
      ? `Daily · ${formatLabel(settings.reminderTime)}`
      : 'Off';

  const rows: Row[] = [
    {
      label: 'Account',
      href: '/settings/account',
      hint: 'Email, sign out, delete account',
    },
    {
      label: 'Subscription',
      href: '/settings/subscription',
      hint: entitlement.isPro
        ? entitlement.isInTrial
          ? 'Trial'
          : 'Active'
        : 'Free',
    },
    {
      label: 'Reminders',
      href: '/settings/reminders',
      hint: reminderHint,
    },
    {
      label: 'Privacy',
      href: '/settings/privacy',
      hint: 'Analytics, data export, deletion',
    },
    {
      label: 'Stealth Mode',
      href: '/settings/stealth',
      hint: 'Haptic intensity, AirPods cues, lockscreen cover',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="flex-1 px-6 pt-6" contentContainerClassName="pb-12">
        <Text className="text-muted text-sm">Settings</Text>
        <Text className="text-ink text-3xl font-semibold mt-1">Preferences</Text>

        <View className="mt-6 gap-2">
          {rows.map((r) => (
            <Link key={r.href} href={r.href} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${r.label}, ${r.hint ?? ''}`}
                className="bg-surface border border-border rounded-xl px-4 py-4 flex-row items-center justify-between active:opacity-80"
              >
                <View>
                  <Text className="text-ink text-base">{r.label}</Text>
                  {r.hint ? (
                    <Text className="text-muted text-xs mt-0.5">{r.hint}</Text>
                  ) : null}
                </View>
                <Text className="text-muted">›</Text>
              </Pressable>
            </Link>
          ))}
        </View>
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
