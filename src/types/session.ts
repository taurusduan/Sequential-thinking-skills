export const SESSION_MODES = ['explore', 'branch', 'audit'] as const;

export const TOTAL_STEPS_OPTIONS = [5, 8] as const;

export type SessionMode = (typeof SESSION_MODES)[number];
export type TotalSteps = (typeof TOTAL_STEPS_OPTIONS)[number];

export type SessionStatus = 'active' | 'completed';

export interface StartInput {
  name: string;
  goal: string;
  mode: SessionMode;
  totalSteps: TotalSteps;
}

export interface StepInput {
  content: string;
}

export interface StepPolicy {
  phaseHint: string;
  shouldConverge: boolean;
  mustConclude: boolean;
}

export interface StepRecord {
  stepNumber: number;
  content: string;
  mode: SessionMode;
  phaseHint: string;
  shouldConverge: boolean;
  mustConclude: boolean;
  savedAt: string;
}

export interface SessionState {
  name: string;
  goal: string;
  mode: SessionMode;
  totalSteps: TotalSteps;
  currentStep: number;
  shouldConverge: boolean;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  storagePath: string;
  steps: StepRecord[];
}
