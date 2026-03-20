import { CustomerConfig, BodyArchetype, SkinToneId, HairStyleId, CustomerType } from '../types/CustomerTypes';
import { NailShape, ColorFamily, ServiceId } from '../types/NailTypes';
import { randomCustomerName } from '../data/staffNames';
import { SERVICES } from '../data/services';

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
const FALLBACK_SERVICES: ServiceId[] = ['basic_manicure'];

// VIP customers have pickier preferences and higher tips
const VIP_NAIL_SHAPES: NailShape[] = ['oval', 'almond', 'coffin', 'stiletto', 'ballerina'];
const VIP_COLOR_FAMILIES: ColorFamily[] = ['pinks', 'reds', 'purples', 'metallics', 'darks'];
const VIP_MIN_SERVICE_PRICE = 25;

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const spawnCustomer = (
  availableServices: ServiceId[],
  reputation: number,
  isTutorial = false
): CustomerConfig => {
  const id = `customer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const isVip = !isTutorial && reputation >= 50 && Math.random() < 0.15;
  const type: CustomerType = isTutorial ? 'tutorial' : isVip ? 'vip' : 'regular';

  const maxPatience = isTutorial ? 999 : isVip ? randInt(40, 80) : randInt(60, 180);
  const tip = isTutorial ? 20 : isVip ? randInt(20, 40) : randInt(0, 15);

  const clothingTopColor = pick(CLOTHING_COLORS);

  // VIPs have narrower, premium hidden preferences — harder to match but more rewarding
  const preferredNailShape = isVip ? pick(VIP_NAIL_SHAPES) : pick(NAIL_SHAPES);
  const preferredColorFamily = isVip ? pick(VIP_COLOR_FAMILIES) : deriveColorFamily(clothingTopColor);

  // VIPs prefer pricier services when available
  const vipEligibleServices = isVip
    ? availableServices.filter((sid) => (SERVICES[sid]?.basePrice ?? 0) >= VIP_MIN_SERVICE_PRICE)
    : [];
  const servicePool =
    vipEligibleServices.length > 0 ? vipEligibleServices :
    availableServices.length > 0   ? availableServices :
    FALLBACK_SERVICES;

  return {
    id,
    name: isTutorial ? 'Maya' : randomCustomerName(),
    type,
    bodyArchetype: pick(BODY_ARCHETYPES),
    skinTone: pick(SKIN_TONE_IDS),
    hairStyle: pick(HAIR_STYLE_IDS),
    hairColor: pick(HAIR_COLORS),
    clothingTopStyle: randInt(1, 12),
    clothingTopColor,
    clothingBottomStyle: randInt(1, 10),
    clothingBottomColor: pick(CLOTHING_COLORS),
    accessories: Math.random() < 0.4 ? [pick(['glasses', 'studs', 'hoops'])] : [],
    preferredNailShape,
    preferredColorFamily,
    requestedServiceId: pick(servicePool),
    patience: maxPatience,
    maxPatience,
    tip,
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
