import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameStore } from '../store/gameStore';
import { useOwnerStore } from '../store/ownerStore';

const GAME_KEY = '@nailshop_game';
const OWNER_KEY = '@nailshop_owner';

export const useSaveLoad = () => {
  // Load saved state on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [gameRaw, ownerRaw] = await Promise.all([
          AsyncStorage.getItem(GAME_KEY),
          AsyncStorage.getItem(OWNER_KEY),
        ]);

        if (ownerRaw) {
          const ownerData = JSON.parse(ownerRaw);
          useOwnerStore.setState({ profile: ownerData, isOnboarded: true, hydrated: true });
        } else {
          useOwnerStore.setState({ hydrated: true });
        }

        if (gameRaw) {
          const raw = JSON.parse(gameRaw);
          // Whitelist + clamp to prevent tampered saves from injecting unexpected fields
          const safe = {
            money:              Math.max(0, Number(raw.money)              || 0),
            reputation:         Math.min(100, Math.max(0, Number(raw.reputation) || 0)),
            level:              Math.max(1, Number(raw.level)              || 1),
            day:                Math.max(1, Number(raw.day)                || 1),
            totalEarnings:      Math.max(0, Number(raw.totalEarnings)      || 0),
            dayEarningsSnapshot:Math.max(0, Number(raw.dayEarningsSnapshot)|| 0),
            stations:           Array.isArray(raw.stations)           ? raw.stations           : undefined,
            staff:              Array.isArray(raw.staff)              ? raw.staff              : undefined,
            reviews:            Array.isArray(raw.reviews)            ? raw.reviews            : undefined,
            unlockedServiceIds: Array.isArray(raw.unlockedServiceIds) ? raw.unlockedServiceIds : undefined,
            purchasedUpgradeIds:Array.isArray(raw.purchasedUpgradeIds)? raw.purchasedUpgradeIds: undefined,
            tutorialComplete:   Boolean(raw.tutorialComplete),
            startingBonusApplied: Boolean(raw.startingBonusApplied),
            vipEverUnlocked:   Boolean(raw.vipEverUnlocked),
          };
          // Only apply defined fields
          useGameStore.setState(
            Object.fromEntries(Object.entries(safe).filter(([, v]) => v !== undefined))
          );
        }
      } catch (e) {
        console.warn('Failed to load saved game:', e);
        useOwnerStore.setState({ hydrated: true });
      }
    };

    load();
  }, []);

  // Save state whenever it changes (debounced by Zustand subscription)
  useEffect(() => {
    const unsubGame = useGameStore.subscribe((state) => {
      const toSave = {
        money: state.money,
        reputation: state.reputation,
        level: state.level,
        day: state.day,
        totalEarnings: state.totalEarnings,
        dayEarningsSnapshot: state.dayEarningsSnapshot,
        stations: state.stations,
        staff: state.staff,
        reviews: state.reviews,
        unlockedServiceIds: state.unlockedServiceIds,
        purchasedUpgradeIds: state.purchasedUpgradeIds,
        tutorialComplete: state.tutorialComplete,
        startingBonusApplied: state.startingBonusApplied,
        vipEverUnlocked: state.vipEverUnlocked,
      };
      AsyncStorage.setItem(GAME_KEY, JSON.stringify(toSave)).catch(() => null);
    });

    const unsubOwner = useOwnerStore.subscribe((state) => {
      if (state.profile) {
        AsyncStorage.setItem(OWNER_KEY, JSON.stringify(state.profile)).catch(() => null);
      }
    });

    return () => {
      unsubGame();
      unsubOwner();
    };
  }, []);
};
