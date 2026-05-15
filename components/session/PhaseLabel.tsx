import { Text, View } from 'react-native';

import type { PhaseKind } from '@/lib/types';

const labels: Record<PhaseKind, string> = {
  prep: 'Get ready',
  squeeze: 'Squeeze',
  hold: 'Hold',
  release: 'Release',
  rest: 'Rest',
  done: 'Done',
};

const colors: Record<PhaseKind, string> = {
  prep: '#8A8A95',
  squeeze: '#7C5CFF',
  hold: '#3FB984',
  release: '#5B45C4',
  rest: '#8A8A95',
  done: '#3FB984',
};

export function PhaseLabel({ kind }: { kind: PhaseKind }) {
  return (
    <View className="items-center">
      <Text style={{ color: colors[kind] }} className="text-4xl font-semibold">
        {labels[kind]}
      </Text>
    </View>
  );
}

export function colorForPhase(kind: PhaseKind): string {
  return colors[kind];
}
