import { CustomerConfig, BodyArchetype, SkinToneId, HairStyleId, CustomerType } from '../types/CustomerTypes';
import { NailShape, ColorFamily, ServiceId } from '../types/NailTypes';
import { randomCustomerName } from '../data/staffNames';

const SKIN_TONE_IDS: SkinToneId[] = [
  'tone01','tone02','tone03','tone04','tone05','tone06',
  'tone07','tone08','tone09','tone10','tone11','tone12',
];

const HAIR_STYLE_IDS: HairStyleId[] = [
  'style01','style02','style03','style04','style05','style06','style07','style08',
];

const HAIR_COLORS = [
  '#1A1A1A','#3B1F0D','#8B4513','#A0522D','#DAA520',
  '#F5DEB3','#FFB347','#CC2200','#FF69B4','#C0C0C0',
];

const CLOTHING_COLORS = [
  '#E8748A','#7CB9E8','#90EE90','#FFD700','#DDA0DD',
  '#F4A460','#87CEEB','#FF8C69','#B0C4DE','#F08080',
];

const NAIL_SHAPES: NailShape[] = ['square','round','oval','almond','coffin','stiletto','ballerina','flare'];
const COLOR_FAMILIES: ColorFamily[] = ['nudes','pinks','reds','corals','purples','blues','greens','darks','brights','metallics'];
const BODY_ARCHETYPES: BodyArchetype[] = ['A','B','C','D'];
const SERVICE_IDS: ServiceId[] = ['basic_manicure'];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const spawnCustomer = (
  availableServices: ServiceId[],
  reputation: number,
  isTutorial = false
): CustomerConfig => {
  const id = `customer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const maxPatience = isTutorial ? 999 : randInt(60, 180);

  const clothingTopColor = pick(CLOTHING_COLORS);
  const preferredColorFamily = deriveColorFamily(clothingTopColor);

  return {
    id,
    name: isTutorial ? 'Maya' : randomCustomerName(),
    type: isTutorial ? 'tutorial' : reputation >= 50 && Math.random() < 0.15 ? 'vip' : 'regular',
    bodyArchetype: pick(BODY_ARCHETYPES),
    skinTone: pick(SKIN_TONE_IDS),
    hairStyle: pick(HAIR_STYLE_IDS),
    hairColor: pick(HAIR_COLORS),
    clothingTopStyle: randInt(1, 12),
    clothingTopColor,
    clothingBottomStyle: randInt(1, 10),
    clothingBottomColor: pick(CLOTHING_COLORS),
    accessories: Math.random() < 0.4 ? [pick(['glasses', 'studs', 'hoops'])] : [],
    preferredNailShape: pick(NAIL_SHAPES),
    preferredColorFamily,
    requestedServiceId: pick(availableServices),
    patience: maxPatience,
    maxPatience,
    tip: isTutorial ? 20 : randInt(0, 15),
    expression: 'neutral',
    animationState: 'WALK_IN',
    stationId: null,
  };
};

const deriveColorFamily = (hex: string): ColorFamily => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (r > 200 && g < 150 && b < 150) return 'reds';
  if (r > 200 && g < 180 && b > 150) return 'pinks';
  if (r < 150 && g < 150 && b > 180) return 'blues';
  if (r < 150 && g > 160 && b < 150) return 'greens';
  if (r > 150 && g > 100 && b > 180) return 'purples';
  if (r > 200 && g > 150 && b < 100) return 'corals';
  if (r > 180 && g > 160 && b > 140) return 'nudes';
  return 'brights';
};
