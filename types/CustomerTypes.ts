import { NailShape, NailColorSelection, ColorFamily, ServiceId } from './NailTypes';

export type SkinToneId =
  | 'tone01' | 'tone02' | 'tone03' | 'tone04'
  | 'tone05' | 'tone06' | 'tone07' | 'tone08'
  | 'tone09' | 'tone10' | 'tone11' | 'tone12';

export type HairStyleId =
  | 'style01' | 'style02' | 'style03' | 'style04'
  | 'style05' | 'style06' | 'style07' | 'style08';

export type BodyArchetype = 'A' | 'B' | 'C' | 'D';

export type ExpressionType =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'impatient'
  | 'disappointed'
  | 'delighted'
  | 'thinking';

export type CustomerAnimationState =
  | 'WALK_IN'
  | 'IDLE_WAITING'
  | 'WALK_TO_SEAT'
  | 'SEATED_IDLE'
  | 'HAND_EXTENDED'
  | 'REACTION_HAPPY'
  | 'REACTION_UNHAPPY'
  | 'WALK_OUT';

export type CustomerType = 'regular' | 'vip' | 'difficult' | 'tutorial';

export interface CustomerConfig {
  id: string;
  name: string;
  type: CustomerType;
  // Visual
  bodyArchetype: BodyArchetype;
  skinTone: SkinToneId;
  hairStyle: HairStyleId;
  hairColor: string;
  clothingTopStyle: number;
  clothingTopColor: string;
  clothingBottomStyle: number;
  clothingBottomColor: string;
  accessories: string[];
  // Hidden preferences (player learns to read visual cues)
  preferredNailShape: NailShape;
  preferredColorFamily: ColorFamily;
  // Service
  requestedServiceId: ServiceId;
  patience: number;
  maxPatience: number;
  tip: number;
  // State
  expression: ExpressionType;
  animationState: CustomerAnimationState;
  stationId: string | null;
  // Scene position (computed at runtime, used by NpcSprite)
  sceneX: number;
  sceneY: number;
  waitingSlot: number;
}
