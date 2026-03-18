import { useGameStore } from '../store/gameStore';
import { Review } from '../types/GameStateTypes';
import { satisfactionToReview, satisfactionToRepChange } from './serviceEngine';

export const postReview = (
  customerId: string,
  customerName: string,
  satisfactionScore: number
) => {
  const { addReview, addReputation, day } = useGameStore.getState();

  const { text, stars } = satisfactionToReview(satisfactionScore, customerName);
  const repChange = satisfactionToRepChange(satisfactionScore);

  const review: Review = {
    id: `review_${Date.now()}`,
    customerId,
    customerName,
    text,
    stars,
    createdDay: day,
  };

  addReview(review);
  addReputation(repChange);
};
