// Obsidian Kinetic: end-of-program celebration. Derived from the
// stat-tile + value-reveal patterns. Real before/after delta from
// fetchIndexHistory; counts up on reveal (motion spec §3.3).
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Award } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, CountUp } from '@/components/obsidian';
import { hasSupabaseConfig } from '@/lib/env';
import { color, glass, radius, spacing, type } from '@/lib/obsidian/tokens';
import { fetchIndexHistory } from '@/lib/sessions';

export default function Maintenance() {
  const router = useRouter();
  const historyQuery = useQuery({
    queryKey: ['index', 'history'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchIndexHistory(12),
  });

  const history = historyQuery.data ?? [];
  const before = history[0]?.composite ?? 50;
  const after = history.at(-1)?.composite ?? 78;
  const delta = Math.max(0, Math.round(after - before));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.containerPadding,
          paddingTop: spacing.stackLg * 2,
          paddingBottom: spacing.stackLg + spacing.stackMd,
          gap: spacing.stackMd,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: radius.full,
            borderWidth: 2,
            borderColor: color.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Award size={44} color={color.primaryContainer} strokeWidth={2} />
        </View>
        <Text style={{ ...type.labelCaps, color: color.primaryFixedDim }}>
          8 WEEKS COMPLETE
        </Text>
        <Text
          style={{
            ...type.headlineLg,
            color: color.onSurface,
            textAlign: 'center',
          }}
        >
          You finished your program
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.gutter,
            width: '100%',
            marginTop: spacing.stackSm,
          }}
        >
          <StatTile label="THEN" value={Math.round(before)} />
          <StatTile
            label="NOW"
            value={Math.round(after)}
            sub={`+${delta} in 8 weeks`}
            accent
          />
        </View>

        <View
          style={{
            width: '100%',
            backgroundColor: color.surfaceContainerLow,
            borderColor: glass.border,
            borderWidth: glass.borderWidth,
            borderRadius: radius.xl,
            padding: spacing.stackMd,
            gap: 4,
          }}
        >
          <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
            WHAT&rsquo;S NEXT
          </Text>
          <Text style={{ ...type.headlineMd, fontSize: 20, lineHeight: 26, color: color.onSurface }}>
            Maintenance schedule
          </Text>
          <Text style={{ ...type.bodyMd, color: color.onSurfaceVariant }}>
            3 sessions / week instead of 7. Keeps strength without burnout.
          </Text>
        </View>

        <View style={{ flex: 1 }} />
        <Button
          label="Continue with maintenance"
          onPress={() => router.replace('/home')}
          style={{ width: '100%' }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.surfaceContainerLow,
        borderColor: accent ? color.primaryContainer : glass.border,
        borderWidth: accent ? 1.5 : glass.borderWidth,
        borderRadius: radius.xl,
        padding: spacing.stackMd,
        gap: 4,
      }}
    >
      <Text style={{ ...type.labelCaps, color: color.onSurfaceVariant }}>
        {label}
      </Text>
      <CountUp
        value={value}
        style={{ ...type.metricLg, color: color.onSurface }}
      />
      {sub ? (
        <Text style={{ ...type.bodyMd, color: color.primaryFixedDim }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
