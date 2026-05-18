import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  cancelDailyReminder,
  ensureNotificationPermission,
  scheduleDailyReminder,
} from '@/lib/notifications';
import { useSettingsStore } from '@/stores/settings';

const PRESETS: { label: string; value: string }[] = [
  { label: '7:00 AM', value: '07:00' },
  { label: '8:30 AM', value: '08:30' },
  { label: '12:00 PM', value: '12:00' },
  { label: '7:00 PM', value: '19:00' },
];

function formatLabel(hhmm: string | null): string {
  if (!hhmm) return 'Not set';
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function RemindersScreen() {
  const router = useRouter();
  const { settings, hydrated, hydrate, update } = useSettingsStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  const currentTime = useMemo(
    () => settings.reminderTime ?? '08:30',
    [settings.reminderTime],
  );

  async function toggleEnabled(next: boolean) {
    setError(null);
    setBusy(true);
    try {
      if (next) {
        const granted = await ensureNotificationPermission();
        if (!granted) {
          setError(
            'Notifications are off for Hone. Enable them in Settings to schedule a reminder.',
          );
          setBusy(false);
          return;
        }
        const ok = await scheduleDailyReminder(currentTime);
        if (!ok) {
          setError("Couldn't schedule the reminder. Try a different time.");
          setBusy(false);
          return;
        }
        await update({ reminderEnabled: true, reminderTime: currentTime });
      } else {
        await cancelDailyReminder();
        await update({ reminderEnabled: false });
      }
    } finally {
      setBusy(false);
    }
  }

  async function pickPreset(hhmm: string) {
    setError(null);
    setBusy(true);
    try {
      if (settings.reminderEnabled) {
        const ok = await scheduleDailyReminder(hhmm);
        if (!ok) {
          setError("Couldn't reschedule. Try again or pick a different time.");
          setBusy(false);
          return;
        }
      }
      await update({ reminderTime: hhmm });
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerClassName="pb-12"
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          className="self-start py-3 px-3 -ml-3 active:opacity-60"
        >
          <Text className="text-muted">← Back</Text>
        </Pressable>

        <Text className="text-ink text-3xl font-semibold mt-4">Reminders</Text>
        <Text className="text-muted mt-2 leading-5">
          One quiet daily nudge. Hone never names itself in the notification —
          it reads as a focus session.
        </Text>

        <View className="bg-surface border border-border rounded-2xl mt-6 px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-ink text-base font-semibold">
                Daily reminder
              </Text>
              <Text className="text-muted text-xs mt-1">
                {settings.reminderEnabled
                  ? `On · ${formatLabel(settings.reminderTime)}`
                  : 'Off'}
              </Text>
            </View>
            <Switch
              value={settings.reminderEnabled}
              onValueChange={toggleEnabled}
              disabled={busy}
              accessibilityLabel="Daily reminder"
              trackColor={{ false: '#2A2A36', true: '#7C5CFF' }}
              thumbColor="#F5F5F7"
            />
          </View>
        </View>

        <Text className="text-muted text-xs uppercase tracking-wider mt-8 mb-3">
          Time
        </Text>
        <View className="gap-2">
          {PRESETS.map((p) => {
            const selected = currentTime === p.value;
            return (
              <Pressable
                key={p.value}
                onPress={() => pickPreset(p.value)}
                disabled={busy}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`Reminder at ${p.label}`}
                className={`rounded-xl px-4 py-4 border flex-row items-center justify-between active:opacity-80 ${
                  selected
                    ? 'bg-accent border-accent'
                    : 'bg-surface border-border'
                }`}
              >
                <Text
                  className={`text-base ${
                    selected ? 'text-ink font-semibold' : 'text-ink'
                  }`}
                >
                  {p.label}
                </Text>
                {selected ? (
                  <Text className="text-ink text-sm">Selected</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <View className="bg-surface2 border border-danger rounded-xl mt-6 px-4 py-3">
            <Text className="text-danger text-sm leading-5">{error}</Text>
          </View>
        ) : null}

        <Text className="text-muted text-xs leading-5 mt-8">
          The notification reads &ldquo;Focus Session — a quiet 3 minutes for
          yourself&rdquo;. No app branding, no health language.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
