export type CalendarAuthorization =
  | 'notDetermined'
  | 'authorized'
  | 'denied'
  | 'restricted';

export type CalendarGap = {
  /** ISO-8601 timestamp when the free interval starts. */
  startsAt: string;
  /** Minutes available before the next event. Capped by the `within` window. */
  durationMin: number;
};

export type FindGapOptions = {
  /** Minimum gap length the user wants (default 3 minutes). */
  minMinutes?: number;
  /** Look-ahead window in seconds (default 2 hours). */
  withinSeconds?: number;
};
