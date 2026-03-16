import { StartInputSchema } from '../protocol/schema.js';
import { getStepPolicy } from '../protocol/mode-policy.js';
import { createSessionDirectory, writeSessionState } from '../storage/session-store.js';
import { getDefaultRuntimeRoot } from '../storage/runtime-path.js';
import type { SessionState, StartInput, StepPolicy } from '../types/session.js';

export interface StartSessionResult {
  session: SessionState;
  nextStepPolicy: StepPolicy;
}

export async function startSession(input: StartInput, runtimeRoot = getDefaultRuntimeRoot()): Promise<StartSessionResult> {
  const parsed = StartInputSchema.parse(input);
  const now = new Date().toISOString();
  const storagePath = await createSessionDirectory(parsed.name, runtimeRoot);
  const nextStepPolicy = getStepPolicy(parsed.mode, 1, parsed.totalSteps);

  const session: SessionState = {
    name: parsed.name,
    goal: parsed.goal,
    mode: parsed.mode,
    totalSteps: parsed.totalSteps,
    currentStep: 0,
    shouldConverge: false,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    storagePath,
    steps: []
  };

  await writeSessionState(session);

  return {
    session,
    nextStepPolicy
  };
}
