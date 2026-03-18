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
          useOwnerStore.setState({ profile: ownerData, isOnboarded: true });
        }

        if (gameRaw) {
          const gameData = JSON.parse(gameRaw);
          useGameStore.setState(gameData);
        }
      } catch (e) {
        console.warn('Failed to load saved game:', e);
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
        stations: state.stations,
        staff: state.staff,
        reviews: state.reviews,
        unlockedServiceIds: state.unlockedServiceIds,
        purchasedUpgradeIds: state.purchasedUpgradeIds,
        tutorialComplete: state.tutorialComplete,
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
