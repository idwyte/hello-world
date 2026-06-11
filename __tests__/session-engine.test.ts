import { getExercise } from '@/lib/exercises';
import { buildTimeline, createSessionRunner } from '@/lib/session-engine';
import type { Phase, ProgramDay } from '@/lib/types';

function simpleDay(): ProgramDay {
  return {
    dayIndex: 0,
    exercises: [getExercise('short_holds')], // 2 sets, 8 reps, squeeze/hold/release
    targetDurationS: 120,
  };
}

describe('buildTimeline', () => {
  it('starts with prep and ends with done', () => {
    const t = buildTimeline(simpleDay());
    expect(t[0].kind).toBe('prep');
    expect(t[t.length - 1].kind).toBe('done');
  });

  it('emits a rest phase between sets but not after the last set', () => {
    const t = buildTimeline(simpleDay());
    const rests = t.filter((p) => p.kind === 'rest');
    // short_holds has 2 sets → 1 inter-set rest
    expect(rests).toHaveLength(1);
  });

  it('emits the expected number of squeeze phases', () => {
    const t = buildTimeline(simpleDay());
    const ex = getExercise('short_holds');
    const expected = ex.sets * ex.reps; // 16
    expect(t.filter((p: Phase) => p.kind === 'squeeze')).toHaveLength(expected);
  });

  it('totals to the expected duration', () => {
    const t = buildTimeline(simpleDay());
    const ex = getExercise('short_holds');
    const perRep = ex.phases.reduce((a, p) => a + p.durationMs, 0);
    const expected =
      3000 + ex.sets * ex.reps * perRep + (ex.sets - 1) * ex.restBetweenSetsMs;
    const total = t.reduce((a, p) => a + p.durationMs, 0);
    expect(total).toBe(expected);
  });
});

describe('createSessionRunner', () => {
  it('advances phases over time and fires callbacks in order', () => {
    let now = 1_000_000;
    const t = buildTimeline(simpleDay());
    const started: string[] = [];
    const ended: string[] = [];
    let completed = false;

    const runner = createSessionRunner(
      t,
      {
        onPhaseStart: (p) => started.push(p.kind),
        onPhaseEnd: (p) => ended.push(p.kind),
        onComplete: () => {
          completed = true;
        },
      },
      { now: () => now },
    );

    runner.start();
    expect(started[0]).toBe('prep');

    // tick forward through the whole session in big chunks
    const total = t.reduce((a, p) => a + p.durationMs, 0);
    for (let elapsed = 0; elapsed <= total + 100; elapsed += 50) {
      now = 1_000_000 + elapsed;
      runner.tick(now);
    }

    expect(completed).toBe(true);
    // First phase to end is prep; first onPhaseEnd should reflect that.
    expect(ended[0]).toBe('prep');
    // Both arrays should contain at least one of each meaningful kind.
    expect(started).toContain('squeeze');
    expect(started).toContain('hold');
    expect(started).toContain('release');
    expect(started).toContain('done');
  });

  it('pause/resume preserves phase progress', () => {
    let now = 0;
    const t = buildTimeline(simpleDay());
    const runner = createSessionRunner(t, {}, { now: () => now });

    runner.start(); // at prep, durationMs=3000
    now = 1000;
    runner.tick(now);
    expect(runner.getState().phase.kind).toBe('prep');
    expect(runner.getState().phaseElapsedMs).toBe(1000);

    runner.pause();
    now = 5000; // long pause
    runner.tick(now);
    expect(runner.getState().status).toBe('paused');
    expect(runner.getState().phaseElapsedMs).toBe(1000);

    runner.resume();
    now = 5500;
    runner.tick(now);
    expect(runner.getState().phaseElapsedMs).toBe(1500);
    // still in prep (3000ms total)
    expect(runner.getState().phase.kind).toBe('prep');

    now = 7000;
    runner.tick(now);
    // prep should now be complete; next phase should have started
    expect(runner.getState().phase.kind).not.toBe('prep');
  });

  it('stops cleanly even if start was never called and does NOT fire onAbort', () => {
    const t = buildTimeline(simpleDay());
    let aborted = false;
    const runner = createSessionRunner(t, {
      onAbort: () => {
        aborted = true;
      },
    });
    runner.stop();
    expect(runner.getState().status).toBe('done');
    expect(aborted).toBe(false);
  });

  it('stop() while running fires onAbort but NOT onComplete', () => {
    let now = 0;
    const t = buildTimeline(simpleDay());
    let completed = false;
    let aborted = false;
    const runner = createSessionRunner(
      t,
      {
        onComplete: () => {
          completed = true;
        },
        onAbort: () => {
          aborted = true;
        },
      },
      { now: () => now },
    );
    runner.start();
    now = 1000;
    runner.tick(now);
    runner.stop();
    expect(completed).toBe(false);
    expect(aborted).toBe(true);
    expect(runner.getState().status).toBe('done');
  });

  it('natural completion fires onComplete exactly once even with extra stop() after', () => {
    let now = 0;
    const t = buildTimeline(simpleDay());
    let completeCount = 0;
    let abortCount = 0;
    const runner = createSessionRunner(
      t,
      {
        onComplete: () => {
          completeCount += 1;
        },
        onAbort: () => {
          abortCount += 1;
        },
      },
      { now: () => now },
    );
    runner.start();
    const total = t.reduce((a, p) => a + p.durationMs, 0);
    for (let elapsed = 0; elapsed <= total + 100; elapsed += 50) {
      now = elapsed;
      runner.tick(now);
    }
    expect(completeCount).toBe(1);
    expect(abortCount).toBe(0);
    // simulate the unmount-after-natural-completion path
    runner.stop();
    expect(completeCount).toBe(1);
    expect(abortCount).toBe(0);
  });
});
