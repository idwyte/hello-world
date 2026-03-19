import { useGameStore } from '../store/gameStore';
import { useOwnerStore } from '../store/ownerStore';
import { computeModifiers } from './traitEngine';

const DECAY_WORKING = 1;    // mood points lost per tick while actively serving a customer
const DECAY_IDLE    = 0.5;  // mood points lost per tick while assigned but station is empty
const RESTORE_BREAK = 2;    // mood points restored per tick while on break

export const tickStaffMood = (): void => {
  const { staff, stations, updateStaff } = useGameStore.getState();
  const ownerProfile = useOwnerStore.getState().profile;
  const mods = computeModifiers(ownerProfile?.traits ?? []);

  staff.forEach((member) => {
    // Break: restore mood, count down timer
    if (member.isOnBreak) {
      const newBreakTicks = member.breakTicksRemaining - 1;
      const newMood = Math.min(100, member.mood + RESTORE_BREAK);
      if (newBreakTicks <= 0) {
        updateStaff(member.id, { mood: newMood, isOnBreak: false, breakTicksRemaining: 0 });
      } else {
        updateStaff(member.id, { mood: newMood, breakTicksRemaining: newBreakTicks });
      }
      return;
    }

    // Unassigned staff: no decay
    if (member.assignedStationId === null) return;

    const station = stations.find((st) => st.id === member.assignedStationId);
    const isWorking = !!station?.activeCustomerId;

    const baseDecay = isWorking ? DECAY_WORKING : DECAY_IDLE;
    const effectiveDecay = baseDecay * mods.staffMoodDecayMultiplier;
    const newMood = Math.max(0, member.mood - effectiveDecay);

    updateStaff(member.id, { mood: newMood });
  });
};

// Returns a speed factor [0.5, 1.0] based on staff mood.
// Called by serviceEngine.tickServiceProgress.
export const moodSpeedFactor = (mood: number): number => {
  if (mood >= 60) return 1.0;
  if (mood >= 30) return 0.8;
  return 0.5;
};
