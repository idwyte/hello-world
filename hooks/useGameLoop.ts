import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { tickCustomerPatience, maybeSpawnCustomer } from '../engine/customerEngine';
import { tickServiceProgress } from '../engine/serviceEngine';

const DAY_LENGTH_TICKS = 240;
const TICK_INTERVAL_MS = 1000;

export const useGameLoop = () => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isDayActive, gameTick, reputation, tick, endDay, pruneOldReviews } = useGameStore();

  useEffect(() => {
    if (!isDayActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      tick();
      tickCustomerPatience();
      maybeSpawnCustomer(gameTick + 1, reputation);
      tickServiceProgress();

      if (gameTick + 1 >= DAY_LENGTH_TICKS) {
        endDay();
        pruneOldReviews();
      }
    }, TICK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isDayActive]);
};
