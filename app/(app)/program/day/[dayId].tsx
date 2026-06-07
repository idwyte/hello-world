// Figma: 24 · day detail — node 109:345
// https://www.figma.com/design/qgY3Qcf7gP7w5V5A6uQTL4/?node-id=109-345
//
// Detail of a single program day. Reached by tapping a day cell on /program.
// Hero (kicker + title + meta chips) + exercise list + state-aware CTA.
//
// State variants come from `fetchProgramDay` (lib/sessions.ts):
//   - today      → "Start session" CTA
//   - completed  → "Review" CTA → /program/day/[id]/review
//   - upcoming   → CTA disabled with muted "Available on Day N" caption
//   - rest       → no exercise list, "Rest day" copy, no CTA
import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, Play } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Body, Button, Pill, ScreenHeader, SectionLabel } from '@/components/ui';
import { hasSupabaseConfig } from '@/lib/env';
import { fetchProgramDay } from '@/lib/sessions';
import { semantic } from '@/lib/theme';
import type { ExerciseTemplate } from '@/lib/types';

function dayThemeName(exercises: ExerciseTemplate[]): string {
  if (exercises.length === 0) return 'Rest';
  // First two exercise names joined by "+" — same pattern as the home card.
  return exercises.slice(0, 2).map((e) => e.name).join(' + ');
}

function exerciseDescriptor(ex: ExerciseTemplate): string {
  const holdPhase = ex.phases.find((p) => p.kind === 'hold');
  if (holdPhase) {
    return `${ex.sets} × ${Math.round(holdPhase.durationMs / 1000)} s`;
  }
  return `${ex.sets} × ${ex.reps} reps`;
}

export default function DayDetail() {
  const router = useRouter();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();

  const dayQuery = useQuery({
    queryKey: ['program-day', dayId],
    enabled: !!dayId && hasSupabaseConfig(),
    queryFn: () => fetchProgramDay(dayId as string),
  });

  const day = dayQuery.data ?? null;
  const exercises = day?.exercises ?? [];
  const status = day?.status ?? 'today';
  const minutes = day ? Math.round(day.targetDurationS / 60) : 0;
  const totalReps = exercises.reduce((acc, ex) => acc + ex.sets * ex.reps, 0);

  // Kicker varies by status. Figma uses the accent for today, success for
  // completed, muted for the others.
  let kicker: string;
  let kickerClassName: string;
  if (status === 'completed') {
    kicker = `COMPLETED · WEEK ${day?.weekNumber ?? 1}`;
    kickerClassName = 'text-feedback-success';
  } else if (status === 'upcoming') {
    kicker = `DAY ${day?.dayNumber ?? '?'} · WEEK ${day?.weekNumber ?? 1}`;
    kickerClassName = 'text-text-muted';
  } else if (status === 'rest') {
    kicker = `REST · WEEK ${day?.weekNumber ?? 1}`;
    kickerClassName = 'text-text-muted';
  } else {
    kicker = `TODAY · WEEK ${day?.weekNumber ?? 1}`;
    kickerClassName = 'text-interactive-primary';
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScreenHeader
        kind="detail"
        title={day ? `Day ${day.dayNumber}` : 'Day'}
        onBack={() => router.back()}
      />

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-32">
        {!hasSupabaseConfig() ? (
          <Body color="muted" className="mt-4">
            Sign in to see your program.
          </Body>
        ) : dayQuery.isLoading ? (
          <Body color="muted" className="mt-4">
            Loading…
          </Body>
        ) : !day ? (
          <Body color="muted" className="mt-4">
            We couldn&rsquo;t find this day. It may have been replaced when your
            program regenerated.
          </Body>
        ) : (
          <>
            <SectionLabel tracking="wide" className={kickerClassName}>
              {kicker}
            </SectionLabel>
            <Body
              weight="semibold"
              color="primary"
              className="mt-3"
              style={{ fontSize: 30, lineHeight: 38 }}
            >
              {dayThemeName(exercises)}
            </Body>
            {status === 'rest' ? (
              <Body color="muted" size="sm" className="mt-3">
                Recovery day. No exercises scheduled — your tissues adapt
                between sessions, not during them.
              </Body>
            ) : (
              <Body color="muted" size="sm" className="mt-3">
                {exercises.length} exercise{exercises.length === 1 ? '' : 's'},
                {' '}
                {minutes} min total. Best done seated.
              </Body>
            )}

            {status !== 'rest' && (
              <View className="flex-row gap-2 mt-4">
                <Pill
                  label={`${minutes} min`}
                  tone="surface"
                  size="sm"
                  bordered
                  textColor="primary"
                />
                <Pill
                  label={`${exercises.length} exercises`}
                  tone="surface"
                  size="sm"
                  bordered
                  textColor="primary"
                />
                <Pill
                  label={`${totalReps} reps total`}
                  tone="surface"
                  size="sm"
                  bordered
                  textColor="primary"
                />
              </View>
            )}

            {status !== 'rest' && (
              <>
                <SectionLabel tracking="wide" className="mt-8">
                  {status === 'completed' ? 'WHAT YOU DID' : "TODAY’S EXERCISES"}
                </SectionLabel>
                <View className="gap-2.5 mt-3">
                  {exercises.map((ex) => (
                    <Link
                      key={ex.slug}
                      href={`/program/exercise/${ex.slug}`}
                      asChild
                    >
                      <Pressable
                        className="flex-row items-center bg-surface-raised rounded-[14px] px-3.5 py-3.5 active:opacity-80"
                        accessibilityLabel={`${ex.name}, ${exerciseDescriptor(ex)}`}
                      >
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center"
                          style={{
                            backgroundColor: semantic.interactivePrimaryPressed,
                          }}
                        >
                          <View
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: semantic.interactivePrimary,
                            }}
                          />
                        </View>
                        <View className="ml-3.5 flex-1">
                          <Body
                            weight="semibold"
                            color="primary"
                            style={{ fontSize: 15, lineHeight: 22 }}
                          >
                            {ex.name}
                          </Body>
                          <Body
                            color="muted"
                            style={{ fontSize: 13, lineHeight: 18 }}
                          >
                            {ex.description.split('.')[0]}.
                          </Body>
                        </View>
                        <Body
                          color="muted"
                          style={{ fontSize: 13, lineHeight: 18 }}
                          className="mr-2"
                        >
                          {exerciseDescriptor(ex)}
                        </Body>
                        <ChevronRight size={16} color={semantic.textMuted} />
                      </Pressable>
                    </Link>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {day && status !== 'rest' && (
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          {status === 'today' && (
            <Button
              label="Start session"
              variant="primary"
              size="lg"
              radius="cta"
              leadingIcon={
                <Play
                  size={14}
                  color={semantic.textPrimary}
                  fill={semantic.textPrimary}
                />
              }
              onPress={() => router.push('/session/today')}
            />
          )}
          {status === 'completed' && (
            <Button
              label="Review session"
              variant="primary"
              size="lg"
              radius="cta"
              onPress={() =>
                router.push(`/program/day/${day.programDayId}/review`)
              }
            />
          )}
          {status === 'upcoming' && (
            <>
              <Button
                label={`Available on Day ${day.dayNumber}`}
                variant="primary"
                size="lg"
                radius="cta"
                disabled
                onPress={() => undefined}
              />
              <Body
                color="muted"
                size="sm"
                className="text-center mt-2"
              >
                Days unlock as you reach them.
              </Body>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
