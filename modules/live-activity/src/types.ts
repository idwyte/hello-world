export type LiveActivityStart = {
  /** Total session length in seconds — used to scale the progress bar. */
  totalSeconds: number;
};

export type LiveActivityUpdate = {
  elapsedS: number;
  isPaused?: boolean;
};

export type LiveActivityHandle = {
  /** Opaque token returned by ActivityKit; pass back to update / end. */
  activityId: string;
};
