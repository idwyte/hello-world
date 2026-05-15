import { _recomputeStreakForTest as recompute } from '@/stores/session';

function day(yyyyMMdd: string): number {
  // local midnight to keep deterministic across the day boundary
  const [y, m, d] = yyyyMMdd.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).getTime();
}

describe('recomputeStreak', () => {
  it('zero history → zero streak', () => {
    expect(recompute([])).toEqual({ current: 0, longest: 0 });
  });

  it('three consecutive days = 3-day streak', () => {
    const history = [
      {
        id: '1',
        startedAt: day('2024-01-01'),
        endedAt: day('2024-01-01'),
        mode: 'normal' as const,
        repsPlanned: 10,
        repsCompleted: 10,
        completed: true,
      },
      {
        id: '2',
        startedAt: day('2024-01-02'),
        endedAt: day('2024-01-02'),
        mode: 'normal' as const,
        repsPlanned: 10,
        repsCompleted: 10,
        completed: true,
      },
      {
        id: '3',
        startedAt: day('2024-01-03'),
        endedAt: day('2024-01-03'),
        mode: 'normal' as const,
        repsPlanned: 10,
        repsCompleted: 10,
        completed: true,
      },
    ];
    expect(recompute(history)).toMatchObject({
      current: 3,
      longest: 3,
      lastDate: '2024-01-03',
    });
  });

  it('gap day breaks current streak but preserves longest', () => {
    const history = [
      {
        id: '1',
        startedAt: day('2024-01-01'),
        endedAt: day('2024-01-01'),
        mode: 'normal' as const,
        repsPlanned: 10,
        repsCompleted: 10,
        completed: true,
      },
      {
        id: '2',
        startedAt: day('2024-01-02'),
        endedAt: day('2024-01-02'),
        mode: 'normal' as const,
        repsPlanned: 10,
        repsCompleted: 10,
        completed: true,
      },
      {
        id: '3',
        startedAt: day('2024-01-04'),
        endedAt: day('2024-01-04'),
        mode: 'normal' as const,
        repsPlanned: 10,
        repsCompleted: 10,
        completed: true,
      },
    ];
    expect(recompute(history)).toMatchObject({ current: 1, longest: 2 });
  });

  it('multiple sessions on the same day count as one streak day', () => {
    const history = [
      {
        id: '1',
        startedAt: day('2024-01-01'),
        endedAt: day('2024-01-01'),
        mode: 'normal' as const,
        repsPlanned: 10,
        repsCompleted: 10,
        completed: true,
      },
      {
        id: '2',
        startedAt: day('2024-01-01'),
        endedAt: day('2024-01-01'),
        mode: 'normal' as const,
        repsPlanned: 10,
        repsCompleted: 10,
        completed: true,
      },
    ];
    expect(recompute(history)).toMatchObject({ current: 1, longest: 1 });
  });
});
