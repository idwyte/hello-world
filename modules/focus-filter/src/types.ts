export type FocusAuthorization =
  | 'notDetermined'
  | 'authorized'
  | 'denied'
  | 'restricted';

export type FocusStatus = {
  isFocus: boolean;
  authorization: FocusAuthorization;
};
