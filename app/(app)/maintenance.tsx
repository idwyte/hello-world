// Figma: 21 · maintenance — node 104:551
//
// End-of-program celebration. Shows the user's actual before/after Pelvic
// Floor Index delta (first measurement vs latest), pulled from the
// `pelvic_floor_assessments` table via fetchIndexHistory. The medal +
// halo is rendered with lucide Award + a tinted disc instead of an emoji.
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Award } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Card, SectionLabel, Stat } from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
import { fetchIndexHistory } from '@/lib/sessions';
import { semantic } from '@/lib/theme';

export default function Maintenance() {
  const router = useRouter();
  const historyQuery = useQuery({
    queryKey: ['index', 'history'],
    enabled: hasSupabaseConfig(),
    queryFn: () => fetchIndexHistory(12),
  });

  const history = historyQuery.data ?? [];
  // fetchIndexHistory returns oldest-first, so [0] is the baseline and the
  // last entry is the most recent. Fall back to nominal numbers when
  // there's no real data — the screen is still meaningful as a preview.
  const before = history[0]?.composite ?? 50;
  const after = history.at(-1)?.composite ?? 78;
  const delta = Math.max(0, Math.round(after - before));

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-12">
        <View className="items-center mt-16">
          {/* Medal hero — 120 px halo + 80 px disc + Award glyph */}
          <View
            className="w-[120px] h-[120px] rounded-full items-center justify-center"
            style={{ backgroundColor: semantic.interactivePrimary + '33' }}
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: semantic.interactivePrimary }}
            >
              <Award
                size={44}
                color={semantic.textPrimary}
                strokeWidth={2.5}
              />
            </View>
          </View>
          <SectionLabel tracking="wide" className="mt-5">
            8 WEEKS COMPLETE
          </SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-2 text-center"
            style={{ fontSize: 26, lineHeight: 32 }}
          >
            You finished your program.
          </Body>
        </View>

        <View className="flex-row gap-3 mt-8 self-center">
          <Stat kicker="THEN" value={String(Math.round(before))} />
          <Stat
            kicker="NOW"
            value={String(Math.round(after))}
            sub={`+${delta} in 8 weeks`}
          />
        </View>

        <Card padding="lg" radius="card" className="mt-6">
          <SectionLabel tracking="wide">WHAT&rsquo;S NEXT</SectionLabel>
          <Body
            weight="semibold"
            color="primary"
            className="mt-2"
            style={{ fontSize: 18, lineHeight: 26 }}
          >
            Maintenance schedule (recommended)
          </Body>
          <Body size="sm" color="muted" className="mt-2">
            3 sessions / week instead of 7. Keeps strength without burnout.
          </Body>
        </Card>

        <Button
          label="Continue with maintenance"
          variant="primary"
          size="lg"
          radius="cta"
          className="mt-6"
          onPress={() => router.replace('/home')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
