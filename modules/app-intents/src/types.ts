export type AppIntentShortcut =
  | 'start_session'
  | 'start_3min_discreet'
  | 'mark_today_complete'
  | 'show_streak';

export type AppIntentSummary = {
  available: boolean;
  /** Shortcuts that have actually been registered with the system. */
  registered: AppIntentShortcut[];
};
