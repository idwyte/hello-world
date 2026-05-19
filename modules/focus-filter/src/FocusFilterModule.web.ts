import type { FocusAuthorization, FocusStatus } from './types';

const FocusFilterModule = {
  isAvailable(): boolean {
    return false;
  },
  async requestAuthorization(): Promise<FocusAuthorization> {
    return 'denied';
  },
  async getStatus(): Promise<FocusStatus> {
    return { isFocus: false, authorization: 'denied' };
  },
  async startListening(): Promise<void> {},
  async stopListening(): Promise<void> {},
  addListener(_eventName: string) {},
  removeListeners(_count: number) {},
};

export default FocusFilterModule;
