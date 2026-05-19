import { _recomputeStreakForTest as recompute } from '@/stores/session';
import { computeStreak } from '@/lib/streak';

function day(yyyyMMdd: string): number {
  // local noon to keep deterministic across DST / midnight rollovers
  const [y, m, d] = yyyyMMdd.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).getTime();
}

function sessionRow(date: string, completed = true) {
  return {
    id: date,
    startedAt: day(date),
    endedAt: day(date),
    mode: 'normal' as const,
    repsPlanned: 10,
    repsCompleted: 10,
    completed,
  };
}

describe('recomputeStreak (Zustand store delegate)', () => {
  it('zero history → zero streak', () => {
    expect(recompute([])).toMatchObject({ current: 0, longest: 0, freezes: 0 });
  });

  it('three consecutive days = 3-day streak', () => {
    expect(
      recompute([
        sessionRow('2024-01-01'),
        sessionRow('2024-01-02'),
        sessionRow('2024-01-03'),
      ]),
    ).toMatchObject({ current: 3, longest: 3, lastDate: '2024-01-03' });
  });

  it('gap of 2 days with no freeze breaks current streak but preserves longest', () => {
    expect(
      recompute([
        sessionRow('2024-01-01'),
        sessionRow('2024-01-02'),
        sessionRow('2024-01-04'),
      ]),
    ).toMatchObject({ current: 1, longest: 2 });
  });

  it('multiple sessions on the same day count as one streak day', () => {
    expect(
      recompute([sessionRow('2024-01-01'), sessionRow('2024-01-01')]),
    ).toMatchObject({ current: 1, longest: 1 });
  });
});

describe('computeStreak — freeze mechanics', () => {
  function endTimestamps(dates: string[]): number[] {
    return dates.map(day);
  }

  it('earns 1 freeze on day 7 of a clean run', () => {
    const dates = [
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
      '2024-01-04',
      '2024-01-05',
      '2024-01-06',
      '2024-01-07',
    ];
    const s = computeStreak(endTimestamps(dates));
    expect(s).toMatchObject({
      current: 7,
      longest: 7,
      freezes: 1,
      lastFreezeEarnedAt: '2024-01-07',
    });
  });

  it('earns a second freeze on day 14, capped at 2', () => {
    const dates = Array.from({ length: 21 }, (_, i) => {
      const d = new Date(2024, 0, 1 + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    });
    const s = computeStreak(endTimestamps(dates));
    expect(s.current).toBe(21);
    expect(s.longest).toBe(21);
    expect(s.freezes).toBe(2); // capped — would otherwise be 3
  });

  it('consumes a freeze to bridge a single missed day', () => {
    // 8 consecutive days → 1 freeze earned. Skip day 9. Session on day 10
    // consumes the freeze and the streak continues to 9.
    const s = computeStreak(
      endTimestamps([
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05',
        '2024-01-06',
        '2024-01-07', // earn freeze #1
        '2024-01-08',
        // skip 2024-01-09
        '2024-01-10', // bridge with freeze
      ]),
    );
    expect(s.current).toBe(9);
    expect(s.freezes).toBe(0); // freeze consumed
  });

  it('resets if the gap is +2 days and no freeze is available', () => {
    const s = computeStreak(
      endTimestamps([
        '2024-01-01',
        '2024-01-02',
        // skip 2024-01-03
        '2024-01-04',
      ]),
    );
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
    expect(s.freezes).toBe(0);
  });

  it('resets if the gap is +3 days even with freezes available', () => {
    // earn a freeze on day 7, then skip 2 days
    const s = computeStreak(
      endTimestamps([
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05',
        '2024-01-06',
        '2024-01-07', // freeze #1
        // skip 2024-01-08, 2024-01-09
        '2024-01-10', // +3 gap — freeze can't bridge
      ]),
    );
    expect(s.current).toBe(1);
    expect(s.freezes).toBe(1); // freeze preserved (not consumed)
  });

  it('preserves prior freezes through a fresh computation', () => {
    const s = computeStreak(endTimestamps(['2024-01-01']), 2, '2023-12-25');
    expect(s.freezes).toBe(2);
    expect(s.lastFreezeEarnedAt).toBe('2023-12-25');
  });

  it('after a freeze-bridged gap, run keeps climbing and freezes still balance', () => {
    // 7 clean days (earn freeze #1) → 1 clean day → skip → bridge with
    // freeze → keep going to day 13. Determinism contract: recomputing
    // from history gives the same answer whether the row was previously
    // populated or not.
    const s = computeStreak(
      endTimestamps([
        '2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04',
        '2024-01-05', '2024-01-06', '2024-01-07', // earn freeze #1 (run=7)
        '2024-01-08',
        // skip 2024-01-09 → bridge with freeze
        '2024-01-10', '2024-01-11', '2024-01-12', '2024-01-13',
      ]),
    );
    expect(s.current).toBe(12); // 12 effective run days after the bridge
    expect(s.freezes).toBe(0); // 1 earned, 1 consumed
  });

  it('clamps prior freezes to the 0-2 range', () => {
    const high = computeStreak(endTimestamps(['2024-01-01']), 99);
    expect(high.freezes).toBe(2);

    const low = computeStreak(endTimestamps(['2024-01-01']), -5);
    expect(low.freezes).toBe(0);
  });
});
