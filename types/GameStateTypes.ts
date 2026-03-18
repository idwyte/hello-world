import { ServiceId, NailColorSelection, NailShape } from './NailTypes';

export type StationTier = 1 | 2 | 3;

export interface Station {
  id: string;
  tier: StationTier;
  assignedStaffId: string | null;
  activeCustomerId: string | null;
  serviceProgress: number;
}

export interface StaffMember {
  id: string;
  name: string;
  skillLevel: number;
  mood: number;
  assignedStationId: string | null;
  wage: number;
  isOnBreak: boolean;
  breakTicksRemaining: number;
}

export type UpgradeId = string;

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  text: string;
  stars: number;
  createdDay: number;
}

export interface ActiveService {
  customerId: string;
  stationId: string;
  selectedShape: NailShape | null;
  selectedColor: NailColorSelection | null;
  nailArtDesignId: string | null;
  satisfactionScore: number;
  isPlayerControlled: boolean;
}

export type ServicePhase =
  | 'idle'
  | 'shape_selection'
  | 'color_selection'
  | 'nail_art'
  | 'applying'
  | 'complete';
