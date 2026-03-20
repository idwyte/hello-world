import { useGameStore } from '../store/gameStore';
import { useOwnerStore } from '../store/ownerStore';
import { spawnCustomer } from './customerSpawner';
import { computeModifiers } from './traitEngine';
import { soundManager } from '../hooks/useSound';

const MAX_WAITING = 4;

// Called every tick to decrement patience for waiting customers
export const tickCustomerPatience = () => {
  const { waitingCustomers, removeCustomerFromQueue, addReputation, purchasedUpgradeIds } = useGameStore.getState();
  const ownerProfile = useOwnerStore.getState().profile;
  const mods = computeModifiers(ownerProfile?.traits ?? []);
  // reading_corner upgrade adds +20% patience multiplier on top of trait modifiers
  const upgradeBoost = purchasedUpgradeIds.includes('reading_corner') ? 1.2 : 1;
  // Higher multiplier = customer stays longer = smaller patience decrement per tick
  const decrement = 1 / Math.max(0.1, mods.customerPatienceMultiplier * upgradeBoost);

  waitingCustomers.forEach((customer) => {
    const patiencePctBefore = (customer.patience / customer.maxPatience) * 100;
    if (customer.patience <= decrement) {
      // Customer walks out
      removeCustomerFromQueue(customer.id);
      addReputation(-2);
      soundManager.play('customer_leave');
    } else {
      const newPatience = customer.patience - decrement;
      const patiencePctAfter = (newPatience / customer.maxPatience) * 100;
      // Play warning once as patience crosses below 25%
      if (patiencePctBefore >= 25 && patiencePctAfter < 25) {
        soundManager.play('patience_warning');
      }
      useGameStore.setState((s) => ({
        waitingCustomers: s.waitingCustomers.map((c) =>
          c.id === customer.id ? { ...c, patience: newPatience } : c
        ),
      }));
    }
  });
};

// Decides whether to spawn a new customer this tick
export const maybeSpawnCustomer = (tick: number, reputation: number) => {
  const { waitingCustomers, unlockedServiceIds, tutorialComplete, addCustomerToQueue } =
    useGameStore.getState();

  if (waitingCustomers.length >= MAX_WAITING) return;

  // Tutorial: spawn Maya on tick 5 if not yet done
  if (!tutorialComplete && tick === 5) {
    const maya = spawnCustomer(unlockedServiceIds, reputation, true);
    addCustomerToQueue(maya);
    soundManager.play('customer_arrive');
    return;
  }

  if (!tutorialComplete) return;

  // Base arrival probability scales with reputation and tick cadence
  const baseProbability = 0.04 + reputation * 0.001;
  const tickInterval = Math.max(15, 40 - Math.floor(reputation / 10) * 3);

  if (tick % tickInterval === 0 && Math.random() < baseProbability + 0.3) {
    const customer = spawnCustomer(unlockedServiceIds, reputation);
    addCustomerToQueue(customer);
    soundManager.play('customer_arrive');
  }
};
