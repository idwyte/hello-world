// Obsidian Kinetic: Settings · Reminders. No dedicated Figma frame —
// derived from the glass card + OptionRow patterns. Notification
// scheduling + settings-store wiring unchanged.
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/obsidian';
import {
  cancelDailyReminder,
  ensureNotificationPermission,
  scheduleDailyReminder,
} from '@/lib/notifications';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
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
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
        <ScreenHeader
          variant="back"
          title="Reminders"
          onPress={() => router.back()}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            Loading…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScreenHeader
        variant="back"
        title="Reminders"
        onPress={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackMd,
          paddingBottom: 40,
          gap: spacing.stackMd,
        }}
      >
        <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
          One quiet daily nudge. Hone never names itself in the notification —
          it reads as a focus session.
        </Text>

        <View
          style={{
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.gutter,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ ...type.bodyLg, color: color.onSurface }}>
              Daily reminder
            </Text>
            <Text
              style={{
                ...type.bodyMd,
                fontSize: 14,
                lineHeight: 20,
                color: color.onSurfaceVariant,
              }}
            >
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
            trackColor={{
              true: color.primaryContainer,
              false: color.surfaceContainerHigh,
            }}
            thumbColor="#fff"
          />
        </View>

        <Text
          style={{
            ...type.labelCaps,
            color: color.onSurfaceVariant,
            marginTop: spacing.stackSm,
          }}
        >
          Time
        </Text>
        <View style={{ gap: spacing.stackSm }}>
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
                style={({ pressed }) => ({
                  backgroundColor: color.surfaceContainerLow,
                  borderColor: selected ? color.primaryContainer : glass.border,
                  borderWidth: selected ? 2 : 1,
                  borderRadius: radius.xl,
                  padding: spacing.stackMd,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing.gutter,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    ...(selected ? type.labelButton : type.bodyLg),
                    color: selected ? color.primaryFixedDim : color.onSurface,
                  }}
                >
                  {p.label}
                </Text>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: radius.full,
                    borderWidth: selected ? 0 : 1.5,
                    borderColor: color.outline,
                    backgroundColor: selected
                      ? color.primaryContainer
                      : 'transparent',
                  }}
                />
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <View
            style={{
              backgroundColor: color.surfaceContainerLow,
              borderColor: color.error,
              borderWidth: 1,
              borderRadius: radius.xl,
              padding: spacing.stackMd,
            }}
          >
            <Text
              style={{
                ...type.bodyMd,
                fontSize: 14,
                lineHeight: 20,
                color: color.error,
              }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        <Text
          style={{
            ...type.bodyMd,
            fontSize: 14,
            lineHeight: 20,
            color: color.onSurfaceVariant,
            marginTop: spacing.stackSm,
          }}
        >
          The notification reads &ldquo;Focus Session — a quiet 3 minutes for
          yourself&rdquo;. No app branding, no health language.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
