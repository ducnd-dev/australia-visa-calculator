export type OnboardingStepId =
  | "profile"
  | "client"
  | "assessment"
  | "deliver";

export type OnboardingStep = {
  id: OnboardingStepId;
  label: string;
  href: string;
  done: boolean;
};

export type OnboardingState = {
  steps: OnboardingStep[];
  allDone: boolean;
  dismissed: boolean;
};

export function buildOnboardingSteps(input: {
  hasProfile: boolean;
  clientCount: number;
  assessmentCount: number;
  hasDelivered: boolean;
  dismissed: boolean;
}): OnboardingState {
  const steps: OnboardingStep[] = [
    {
      id: "profile",
      label: "Complete practice profile (MARA, contact)",
      href: "/app/settings",
      done: input.hasProfile,
    },
    {
      id: "client",
      label: "Add your first client",
      href: "/app/clients/new",
      done: input.clientCount > 0,
    },
    {
      id: "assessment",
      label: "Run your first assessment",
      href: "/app/assessments/new",
      done: input.assessmentCount > 0,
    },
    {
      id: "deliver",
      label: "Send a report or share link",
      href: "/app/clients",
      done: input.hasDelivered,
    },
  ];

  const allDone = steps.every((s) => s.done);
  return { steps, allDone, dismissed: input.dismissed };
}
