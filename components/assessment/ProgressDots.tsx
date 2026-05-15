import { View } from 'react-native';

export function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <View
      className="flex-row gap-1.5"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}
      accessibilityLabel={`Question ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`h-1 rounded-full ${
            i < current ? 'bg-accent w-6' : i === current ? 'bg-ink w-8' : 'bg-border w-4'
          }`}
        />
      ))}
    </View>
  );
}
