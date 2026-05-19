import type {
  LiveActivityHandle,
  LiveActivityStart,
  LiveActivityUpdate,
} from './types';

const LiveActivityModule = {
  isAvailable(): boolean {
    return false;
  },
  async startActivity(_input: LiveActivityStart): Promise<LiveActivityHandle | null> {
    return null;
  },
  async updateActivity(_id: string, _u: LiveActivityUpdate): Promise<void> {},
  async endActivity(_id: string): Promise<void> {},
};

export default LiveActivityModule;
