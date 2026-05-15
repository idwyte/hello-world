import { Text, View } from 'react-native';

const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const TOTAL_DAYS = WEEKS * DAYS_PER_WEEK;

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Square-cell heatmap inspired by GitHub's contribution graph. Pure View-based
 * rendering — no canvas/svg — to keep the bundle small and avoid layout shifts.
 */
export function StreakHeatmap({ dates }: { dates: string[] }) {
  const completed = new Set(dates.map((s) => dateKey(new Date(s))));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: Array<{ key: string; filled: boolean }> = [];
  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    cells.push({ key, filled: completed.has(key) });
  }

  // Arrange into columns of 7 days, oldest to newest
  const columns: typeof cells[] = [];
  for (let c = 0; c < WEEKS; c++) {
    columns.push(cells.slice(c * DAYS_PER_WEEK, (c + 1) * DAYS_PER_WEEK));
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Heatmap of completed sessions over the last ${WEEKS} weeks`}
    >
      <View className="flex-row gap-1">
        {columns.map((col, ci) => (
          <View key={ci} className="gap-1">
            {col.map((cell) => (
              <View
                key={cell.key}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  backgroundColor: cell.filled ? '#7C5CFF' : '#1E1E27',
                }}
              />
            ))}
          </View>
        ))}
      </View>
      <View className="flex-row items-center gap-2 mt-3">
        <Text className="text-muted text-xs">Less</Text>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: '#1E1E27',
          }}
        />
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: '#7C5CFF',
          }}
        />
        <Text className="text-muted text-xs">More</Text>
      </View>
    </View>
  );
}
