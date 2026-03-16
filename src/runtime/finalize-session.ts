import type { SessionState } from '../types/session.js';

export interface FinalSessionSummary {
  name: string;
  goal: string;
  mode: SessionState['mode'];
  totalSteps: SessionState['totalSteps'];
  completedSteps: number;
  finalStepContent: string;
}

export function finalizeSession(session: SessionState): FinalSessionSummary {
  if (session.currentStep !== session.totalSteps) {
    throw new Error('Session cannot be finalized before the final step');
  }

  const finalStep = session.steps.at(-1);

  if (!finalStep) {
    throw new Error('Session has no steps to finalize');
  }

  return {
    name: session.name,
    goal: session.goal,
    mode: session.mode,
    totalSteps: session.totalSteps,
    completedSteps: session.steps.length,
    finalStepContent: finalStep.content
  };
}
