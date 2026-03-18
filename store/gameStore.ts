import { create } from 'zustand';
import { CustomerConfig } from '../types/CustomerTypes';
import { Station, StaffMember, Review, ActiveService, ServicePhase } from '../types/GameStateTypes';
import { ServiceId } from '../types/NailTypes';

interface GameState {
  // Economy
  money: number;
  reputation: number;
  level: number;
  day: number;
  gameTick: number;
  totalEarnings: number;
  dayEarnings: number;
  dayEarningsSnapshot: number;

  // Stations
  stations: Station[];

  // Staff
  staff: StaffMember[];

  // Customers
  waitingCustomers: CustomerConfig[];
  activeCustomers: CustomerConfig[];

  // Reviews
  reviews: Review[];

  // Unlocks
  unlockedServiceIds: ServiceId[];
  purchasedUpgradeIds: string[];

  // Day state
  isDayActive: boolean;
  tutorialComplete: boolean;
  servicesCompletedToday: number;
  showDayEndModal: boolean;
  startingBonusApplied: boolean;

  // Active service (player-controlled)
  activeService: ActiveService | null;
  servicePhase: ServicePhase;

  // Actions
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  addReputation: (amount: number) => void;
  tick: () => void;
  startDay: () => void;
  endDay: () => void;
  applyStartingBonus: (bonus: { money: number; reputation: number; staffPreHired: boolean }) => void;
  incrementServicesCompletedToday: () => void;
  setShowDayEndModal: (show: boolean) => void;

  addCustomerToQueue: (customer: CustomerConfig) => void;
  removeCustomerFromQueue: (customerId: string) => void;
  updateCustomer: (customerId: string, partial: Partial<CustomerConfig>) => void;

  assignCustomerToStation: (customerId: string, stationId: string) => void;
  completeService: (stationId: string, earnings: number, tip: number) => void;

  hireStaff: (member: StaffMember) => void;
  updateStaff: (staffId: string, partial: Partial<StaffMember>) => void;

  addReview: (review: Review) => void;
  pruneOldReviews: () => void;

  setActiveService: (service: ActiveService | null) => void;
  setServicePhase: (phase: ServicePhase) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  unlockService: (serviceId: ServiceId) => void;
  completeTutorial: () => void;
}

const INITIAL_STATIONS: Station[] = [
  { id: 'station_1', tier: 1, assignedStaffId: null, activeCustomerId: null, serviceProgress: 0 },
  { id: 'station_2', tier: 1, assignedStaffId: null, activeCustomerId: null, serviceProgress: 0 },
];

export const useGameStore = create<GameState>((set, get) => ({
  money: 500,
  reputation: 0,
  level: 1,
  day: 1,
  gameTick: 0,
  totalEarnings: 0,
  dayEarnings: 0,
  dayEarningsSnapshot: 0,

  stations: INITIAL_STATIONS,
  staff: [],
  waitingCustomers: [],
  activeCustomers: [],
  reviews: [],

  unlockedServiceIds: ['basic_manicure'],
  purchasedUpgradeIds: [],

  isDayActive: false,
  tutorialComplete: false,
  servicesCompletedToday: 0,
  showDayEndModal: false,
  startingBonusApplied: false,

  activeService: null,
  servicePhase: 'idle',

  addMoney: (amount) =>
    set((s) => ({
      money: s.money + amount,
      totalEarnings: s.totalEarnings + (amount > 0 ? amount : 0),
      dayEarnings: s.dayEarnings + (amount > 0 ? amount : 0),
    })),

  spendMoney: (amount) => {
    const { money } = get();
    if (money < amount) return false;
    set((s) => ({ money: s.money - amount }));
    return true;
  },

  addReputation: (amount) =>
    set((s) => ({
      reputation: Math.max(0, Math.min(100, s.reputation + amount)),
    })),

  tick: () => set((s) => ({ gameTick: s.gameTick + 1 })),

  startDay: () => set({ isDayActive: true, dayEarnings: 0, gameTick: 0, servicesCompletedToday: 0 }),

  endDay: () => {
    const { staff, dayEarnings } = get();
    const totalWages = staff.reduce((sum, m) => sum + m.wage, 0);
    set((s) => ({
      isDayActive: false,
      money: s.money - totalWages,
      day: s.day + 1,
      waitingCustomers: [],
      dayEarningsSnapshot: dayEarnings,
      showDayEndModal: true,
    }));
  },

  applyStartingBonus: (bonus) =>
    set((s) => {
      if (s.startingBonusApplied) return s;
      return {
        money: s.money - 500 + bonus.money, // replace default 500 with backstory amount
        reputation: Math.min(100, s.reputation + bonus.reputation),
        startingBonusApplied: true,
      };
    }),

  incrementServicesCompletedToday: () =>
    set((s) => ({ servicesCompletedToday: s.servicesCompletedToday + 1 })),

  setShowDayEndModal: (show) => set({ showDayEndModal: show }),

  addCustomerToQueue: (customer) =>
    set((s) => ({ waitingCustomers: [...s.waitingCustomers, customer] })),

  removeCustomerFromQueue: (customerId) =>
    set((s) => ({
      waitingCustomers: s.waitingCustomers.filter((c) => c.id !== customerId),
    })),

  updateCustomer: (customerId, partial) =>
    set((s) => ({
      waitingCustomers: s.waitingCustomers.map((c) =>
        c.id === customerId ? { ...c, ...partial } : c
      ),
      activeCustomers: s.activeCustomers.map((c) =>
        c.id === customerId ? { ...c, ...partial } : c
      ),
    })),

  assignCustomerToStation: (customerId, stationId) =>
    set((s) => {
      const customer = s.waitingCustomers.find((c) => c.id === customerId);
      if (!customer) return s;
      return {
        waitingCustomers: s.waitingCustomers.filter((c) => c.id !== customerId),
        activeCustomers: [...s.activeCustomers, { ...customer, stationId }],
        stations: s.stations.map((st) =>
          st.id === stationId
            ? { ...st, activeCustomerId: customerId, serviceProgress: 0 }
            : st
        ),
      };
    }),

  completeService: (stationId, earnings, tip) => {
    const { stations, activeCustomers } = get();
    const station = stations.find((s) => s.id === stationId);
    if (!station?.activeCustomerId) return;
    const customerId = station.activeCustomerId;
    set((s) => ({
      stations: s.stations.map((st) =>
        st.id === stationId
          ? { ...st, activeCustomerId: null, serviceProgress: 0 }
          : st
      ),
      activeCustomers: s.activeCustomers.filter((c) => c.id !== customerId),
      money: s.money + earnings + tip,
      totalEarnings: s.totalEarnings + earnings + tip,
      dayEarnings: s.dayEarnings + earnings + tip,
    }));
  },

  hireStaff: (member) =>
    set((s) => ({ staff: [...s.staff, member] })),

  updateStaff: (staffId, partial) =>
    set((s) => ({
      staff: s.staff.map((m) => (m.id === staffId ? { ...m, ...partial } : m)),
    })),

  addReview: (review) =>
    set((s) => ({ reviews: [review, ...s.reviews].slice(0, 3) })),

  pruneOldReviews: () =>
    set((s) => ({
      reviews: s.reviews.filter((r) => s.day - r.createdDay < 3),
    })),

  setActiveService: (service) => set({ activeService: service }),

  setServicePhase: (phase) => set({ servicePhase: phase }),

  purchaseUpgrade: (upgradeId) =>
    set((s) => ({
      purchasedUpgradeIds: [...s.purchasedUpgradeIds, upgradeId],
    })),

  unlockService: (serviceId) =>
    set((s) => ({
      unlockedServiceIds: [...s.unlockedServiceIds, serviceId],
    })),

  completeTutorial: () => set({ tutorialComplete: true }),
}));
