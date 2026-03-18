export type TutorialStep =
  | 'welcome'
  | 'customer_arrives'
  | 'assign_customer'
  | 'shape_selection'
  | 'color_selection'
  | 'start_service'
  | 'nail_art'
  | 'service_complete'
  | 'collect_tip'
  | 'done';

export interface TutorialState {
  currentStep: TutorialStep;
  isActive: boolean;
}

export const TUTORIAL_TOOLTIPS: Record<TutorialStep, string> = {
  welcome:         "Welcome to your salon! Let's walk through your first client together 💅",
  customer_arrives:"Your first customer, Maya, has arrived! She's waiting patiently.",
  assign_customer: "Tap Maya in the queue to assign her to a nail station.",
  shape_selection: "Maya wants a new shape! Pick one from the nail shape selector below.",
  color_selection: "Now choose a color she'll love. Look at her outfit for a hint 👀",
  start_service:   "Tap 'Start Service' to do the nails yourself and earn a bigger tip!",
  nail_art:        "Want to add some flair? Tap the nail art button to add a design.",
  service_complete:"Amazing work! Maya's nails look incredible.",
  collect_tip:     "She loved it! Collect your tip and check the review board 💰",
  done:            "",
};

export const nextStep = (current: TutorialStep): TutorialStep => {
  const steps: TutorialStep[] = [
    'welcome','customer_arrives','assign_customer','shape_selection',
    'color_selection','start_service','nail_art','service_complete','collect_tip','done',
  ];
  const idx = steps.indexOf(current);
  return steps[Math.min(idx + 1, steps.length - 1)];
};
