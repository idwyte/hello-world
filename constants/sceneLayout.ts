import { Dimensions } from 'react-native';

export const NPC_W = 56;
export const NPC_H = 72;
export const HUD_HEIGHT = 44;
export const TAB_HEIGHT = 50;
export const MAX_WAITING = 4;

export interface SceneLayout {
  SCENE_W: number;
  SCENE_H: number;
  ENTRANCE: { x: number; y: number };
  EXIT: { x: number; y: number };
  WAITING_ZONE: { x: number; baseY: number; slotSpacing: number };
  STATION_ZONE: { startX: number; endX: number; topY: number };
  DOOR_ZONE: { x: number; y: number; w: number; h: number };
  RECEPTION: { x: number; y: number; w: number; h: number };
}

export interface Insets {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export const buildLayout = (
  windowWidth: number,
  windowHeight: number,
  insets: Insets = {}
): SceneLayout => {
  const SCENE_W = windowWidth - (insets.left ?? 0) - (insets.right ?? 0);
  const SCENE_H = windowHeight - HUD_HEIGHT - TAB_HEIGHT;

  return Object.freeze({
    SCENE_W,
    SCENE_H,
    ENTRANCE: { x: -NPC_W, y: SCENE_H * 0.55 },
    EXIT:     { x: SCENE_W + NPC_W, y: SCENE_H * 0.55 },
    WAITING_ZONE: {
      x: 60,
      baseY: SCENE_H * 0.52,
      slotSpacing: 64,
    },
    STATION_ZONE: {
      startX: SCENE_W * 0.22,
      endX:   SCENE_W * 0.76,
      topY:   SCENE_H * 0.25,
    },
    DOOR_ZONE: {
      x: 0,
      y: SCENE_H * 0.18,
      w: 48,
      h: SCENE_H * 0.58,
    },
    RECEPTION: {
      x: SCENE_W * 0.80,
      y: SCENE_H * 0.15,
      w: SCENE_W * 0.19,
      h: SCENE_H * 0.50,
    },
  });
};

export const getStationPositions = (
  count: number,
  layout: SceneLayout
): Array<{ x: number; y: number; fixtureX: number; fixtureW: number }> => {
  const usable = layout.STATION_ZONE.endX - layout.STATION_ZONE.startX;
  const spacing = usable / Math.max(1, count);
  return Array.from({ length: count }, (_, i) => ({
    x: layout.STATION_ZONE.startX + spacing * i + spacing / 2 - NPC_W / 2,
    y: layout.STATION_ZONE.topY,
    fixtureX: layout.STATION_ZONE.startX + spacing * i,
    fixtureW: spacing - 8,
  }));
};

export const getWaitingSlotPosition = (
  slotIndex: number,
  layout: SceneLayout
): { x: number; y: number } => ({
  x: layout.WAITING_ZONE.x + slotIndex * layout.WAITING_ZONE.slotSpacing,
  y: layout.WAITING_ZONE.baseY,
});

/** Imperative version safe to call outside React components (e.g. in store actions) */
export const buildLayoutFromDimensions = (insets: Insets = {}): SceneLayout => {
  const { width, height } = Dimensions.get('window');
  return buildLayout(width, height, insets);
};
