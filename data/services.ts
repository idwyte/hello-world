import { Service, ServiceId } from '../types/NailTypes';

export const SERVICES: Record<ServiceId, Service> = {
  basic_manicure: {
    id: 'basic_manicure',
    name: 'Basic Manicure',
    durationTicks: 20,
    basePrice: 15,
    requiresUnlock: false,
  },
  gel_nails: {
    id: 'gel_nails',
    name: 'Gel Nails',
    durationTicks: 35,
    basePrice: 35,
    requiresUnlock: true,
    unlockReputation: 25,
  },
  nail_art: {
    id: 'nail_art',
    name: 'Nail Art',
    durationTicks: 45,
    basePrice: 50,
    requiresUnlock: true,
    unlockReputation: 15,
  },
  pedicure: {
    id: 'pedicure',
    name: 'Pedicure',
    durationTicks: 30,
    basePrice: 25,
    requiresUnlock: true,
    unlockReputation: 10,
  },
  full_set: {
    id: 'full_set',
    name: 'Full Set Acrylics',
    durationTicks: 60,
    basePrice: 65,
    requiresUnlock: true,
    unlockReputation: 40,
  },
};

export const SERVICE_LIST = Object.values(SERVICES);
