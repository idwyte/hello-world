import { useGameStore } from '../store/gameStore';
import { useOwnerStore } from '../store/ownerStore';
import { SERVICES } from '../data/services';
import { NailShape, ColorFamily, NailColorSelection } from '../types/NailTypes';
import { getColorsByCollection } from '../data/nailColors';
import { computeModifiers } from './traitEngine';
import { postReview } from './reviewEngine';

// Tick all active stations forward
export const tickServiceProgress = () => {
  const { stations, staff, completeService, activeCustomers, activeService,
    servicesCompletedToday, incrementServicesCompletedToday } =
    useGameStore.getState();
  const ownerProfile = useOwnerStore.getState().profile;
  const mods = computeModifiers(ownerProfile?.traits ?? []);

  stations.forEach((station) => {
    if (!station.activeCustomerId) return;
    // Player-controlled stations are managed by the service mini-game screen
    if (activeService?.isPlayerControlled && activeService.stationId === station.id) return;

    const customer = activeCustomers.find((c) => c.id === station.activeCustomerId);
    if (!customer) return;

    const service = SERVICES[customer.requestedServiceId];
    const assignedStaff = staff.find((m) => m.assignedStationId === station.id);

    const speedMultiplier = assignedStaff
      ? 1 + (assignedStaff.skillLevel - 1) * 0.15 + (station.tier - 1) * 0.2
      : 0.4; // Player not assigned = slower auto progress

    const effectiveDuration = service.durationTicks * mods.serviceDurationMultiplier;
    const progressPerTick = (100 / effectiveDuration) * speedMultiplier;
    const newProgress = station.serviceProgress + progressPerTick;

    if (newProgress >= 100) {
      let earnings = calculateEarnings(customer.requestedServiceId, assignedStaff?.skillLevel ?? 1);
      if (servicesCompletedToday === 0) earnings += mods.firstServiceBonusPerDay;
      const tip = Math.round(customer.tip * mods.tipMultiplier);

      completeService(station.id, earnings, tip);
      incrementServicesCompletedToday();

      // Auto satisfaction: staff-served, no explicit shape/color chosen by player
      const satisfaction = calculateSatisfaction(
        customer.preferredNailShape,
        null,
        customer.preferredColorFamily,
        null,
        false
      );
      postReview(customer.id, customer.name, satisfaction, mods.repGainPerInteraction);
    } else {
      useGameStore.setState((s) => ({
        stations: s.stations.map((st) =>
          st.id === station.id ? { ...st, serviceProgress: newProgress } : st
        ),
      }));
    }
  });
};

export const calculateEarnings = (serviceId: string, skillLevel = 1): number => {
  const service = SERVICES[serviceId as keyof typeof SERVICES];
  if (!service) return 0;
  return Math.round(service.basePrice * (1 + (skillLevel - 1) * 0.1));
};

export const calculateSatisfaction = (
  preferredShape: NailShape,
  selectedShape: NailShape | null,
  preferredFamily: ColorFamily,
  selectedColor: NailColorSelection | null,
  isPlayerControlled: boolean
): number => {
  let score = 50;

  if (selectedShape) {
    score += selectedShape === preferredShape ? 30 : 0;
  }

  if (selectedColor) {
    const colors = getColorsByCollection(selectedColor.collectionId);
    const color = colors[selectedColor.colorIndex];
    if (color && color.family === preferredFamily) score += 15;
  }

  if (isPlayerControlled) score += 5; // Bonus for personal touch

  return Math.min(100, score);
};

export const satisfactionToReview = (
  score: number,
  customerName: string
): { text: string; stars: number } => {
  if (score >= 90)
    return { text: `Perfect nails! ${customerName} loved it 💅`, stars: 5 };
  if (score >= 75)
    return { text: `${customerName} was really happy with the result!`, stars: 4 };
  if (score >= 55)
    return { text: `Good work, ${customerName} was satisfied 😊`, stars: 3 };
  if (score >= 35)
    return { text: `${customerName} expected something different...`, stars: 2 };
  return { text: `${customerName} was disappointed 😞`, stars: 1 };
};

export const satisfactionToRepChange = (score: number): number => {
  if (score >= 90) return 3;
  if (score >= 75) return 2;
  if (score >= 55) return 1;
  if (score >= 35) return -1;
  return -2;
};
