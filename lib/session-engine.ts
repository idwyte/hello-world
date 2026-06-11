import type { ExerciseTemplate, Phase, ProgramDay } from './types';

export function buildTimeline(day: ProgramDay): Phase[] {
  const phases: Phase[] = [];
  phases.push({
    kind: 'prep',
    durationMs: 3000,
    repIndex: 0,
    setIndex: 0,
    exerciseIndex: 0,
  });
  day.exercises.forEach((ex: ExerciseTemplate, exerciseIndex) => {
    for (let s = 0; s < ex.sets; s++) {
      for (let r = 0; r < ex.reps; r++) {
        for (const p of ex.phases) {
          phases.push({
            kind: p.kind,
            durationMs: p.durationMs,
            repIndex: r,
            setIndex: s,
            exerciseIndex,
          });
        }
      }
      const isLastSet = s === ex.sets - 1;
      if (!isLastSet && ex.restBetweenSetsMs > 0) {
        phases.push({
          kind: 'rest',
          durationMs: ex.restBetweenSetsMs,
          repIndex: ex.reps - 1,
          setIndex: s,
          exerciseIndex,
        });
      }
    }
  });
  phases.push({
    kind: 'done',
    durationMs: 0,
    repIndex: 0,
    setIndex: 0,
    exerciseIndex: Math.max(0, day.exercises.length - 1),
  });
  return phases;
}

export type SessionState = {
  status: 'idle' | 'running' | 'paused' | 'done';
  phaseIndex: number;
  phase: Phase;
  phaseElapsedMs: number;
  totalElapsedMs: number;
  totalDurationMs: number;
};

export type PhaseCallback = (phase: Phase, index: number, total: number) => void;

export type SessionCallbacks = {
  onPhaseStart?: PhaseCallback;
  onPhaseEnd?: PhaseCallback;
  onTick?: (state: SessionState) => void;
  /** Fired exactly once when the timeline reaches its `done` phase naturally. */
  onComplete?: (state: SessionState) => void;
  /** Fired when `stop()` is called before natural completion. */
  onAbort?: (state: SessionState) => void;
};

type TimeFn = () => number;

export type SessionRunner = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  /** User-driven fast-forward of the current phase (Figma 11 "Skip phase"). */
  skip: () => void;
  getState: () => SessionState;
  /** Advance internal clock — used by tests; in production driver, `tick()` is called from setInterval. */
  tick: (now: number) => void;
};

export function createSessionRunner(
  timeline: Phase[],
  callbacks: SessionCallbacks = {},
  options: { now?: TimeFn } = {},
): SessionRunner {
  if (timeline.length === 0) {
    throw new Error('Timeline cannot be empty');
  }
  const now = options.now ?? (() => Date.now());
  const totalDurationMs = timeline.reduce((acc, p) => acc + p.durationMs, 0);

  let status: SessionState['status'] = 'idle';
  let phaseIndex = 0;
  let phaseStartedAt = 0;
  let pausedAt = 0;
  let totalPausedMs = 0;
  let sessionStartedAt = 0;
  let completionFired = false;

  function state(): SessionState {
    const phase = timeline[phaseIndex];
    const nowMs = now();
    const phaseElapsed =
      status === 'running'
        ? nowMs - phaseStartedAt
        : status === 'paused'
          ? pausedAt - phaseStartedAt
          : 0;
    const totalElapsed =
      status === 'running'
        ? nowMs - sessionStartedAt - totalPausedMs
        : status === 'paused'
          ? pausedAt - sessionStartedAt - totalPausedMs
          : 0;
    return {
      status,
      phaseIndex,
      phase,
      phaseElapsedMs: Math.max(0, phaseElapsed),
      totalElapsedMs: Math.max(0, totalElapsed),
      totalDurationMs,
    };
  }

  function advance(targetTime: number) {
    while (
      status === 'running' &&
      phaseIndex < timeline.length - 1 &&
      (timeline[phaseIndex].durationMs === 0 ||
        targetTime - phaseStartedAt >= timeline[phaseIndex].durationMs)
    ) {
      const finished = timeline[phaseIndex];
      callbacks.onPhaseEnd?.(finished, phaseIndex, timeline.length);
      const elapsedInPhase = timeline[phaseIndex].durationMs;
      phaseStartedAt += elapsedInPhase;
      phaseIndex += 1;
      const next = timeline[phaseIndex];
      callbacks.onPhaseStart?.(next, phaseIndex, timeline.length);
      if (next.kind === 'done') {
        status = 'done';
        if (!completionFired) {
          completionFired = true;
          callbacks.onComplete?.(state());
        }
        return;
      }
    }
  }

  return {
    start() {
      if (status !== 'idle') return;
      status = 'running';
      sessionStartedAt = now();
      phaseStartedAt = sessionStartedAt;
      phaseIndex = 0;
      callbacks.onPhaseStart?.(timeline[0], 0, timeline.length);
    },
    pause() {
      if (status !== 'running') return;
      status = 'paused';
      pausedAt = now();
    },
    resume() {
      if (status !== 'paused') return;
      const pauseDuration = now() - pausedAt;
      totalPausedMs += pauseDuration;
      phaseStartedAt += pauseDuration;
      status = 'running';
    },
    stop() {
      if (status === 'done') return;
      const wasRunning = status === 'running' || status === 'paused';
      status = 'done';
      if (wasRunning) {
        callbacks.onAbort?.(state());
      }
    },
    /**
     * Skip the current phase — fast-forwards phaseStartedAt so the next
     * advance() (or the very next tick) treats this phase as elapsed.
     * Powers the "Skip phase" affordance on /session/player (Figma 11).
     */
    skip() {
      if (status !== 'running') return;
      // Force the current phase to look fully elapsed; advance() fires
      // onPhaseEnd + onPhaseStart and either lands on the next phase or
      // marks the session done.
      phaseStartedAt = now() - timeline[phaseIndex].durationMs;
      advance(now());
    },
    getState: state,
    tick(time: number) {
      if (status !== 'running') return;
      advance(time);
      callbacks.onTick?.(state());
    },
  };
}
